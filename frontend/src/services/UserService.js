import { ConnectionError, HttpError, LoginExpiredError, RateLimitingError } from "./ErrorClasses";

const BASE_URL = "/user";

async function getDetails(token) {
    const header = await fetch(`${BASE_URL}/details`, {
        method: "GET",
        headers: {"Authorization": `Bearer ${token}`},
    }).catch(() => new ConnectionError());

    if (header instanceof ConnectionError) throw header;

    const body = await header.json().catch(() => null);
    
    if (header.status == 401) throw new LoginExpiredError();
    else if (header.status === 429) throw new RateLimitingError();
    else if (!header.ok) throw new HttpError(body ?? `Could not retrieve user details. \n ${header.statusText}`, header.status);

    return body;
}

export { getDetails };