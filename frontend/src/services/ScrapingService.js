import { ConnectionError, HttpError, LoginExpiredError, LoginRequiredError, RateLimitingError } from "./ErrorClasses";

const BASE_URL = "/scrape";

async function triggerScraping(token) {
    const header = await fetch(`${BASE_URL}/source/all`, {
        method: "POST",
        headers: {"Authorization": `Bearer ${token}`},
    }).catch(() => new ConnectionError());

    if (header instanceof ConnectionError) throw header;

    const body = await header.json().catch(() => null);

    if (header.status == 401 && body?.name === "TokenExpiredError") throw new LoginExpiredError();
    else if (header.status == 401) throw new LoginRequiredError();
    else if (header.status === 429) throw new RateLimitingError();
    else if (!header.ok) throw new HttpError(body?.message ?? `Could not trigger scraping. \n ${header.statusText}`, header.status);

    return body;
}

export { triggerScraping };