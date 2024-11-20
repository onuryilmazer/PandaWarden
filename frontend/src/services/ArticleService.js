import { ConnectionError, HttpError, RateLimitingError, ResourceNotFoundError } from "./ErrorClasses";

const BASE_URL = "/articles";

async function getArticles({offset = 0, limit = 30, token}) {
    const header = await fetch(`${BASE_URL}/latest/${offset}/${limit}`, {
        method: "GET",
        headers: {"Authorization": `Bearer ${token}`}
    }).catch(() => new ConnectionError());

    if (header instanceof ConnectionError) throw header;

    const body = await header.json().catch(() => null);
    
    if (!header.ok) {
        if (header.status === 404) throw new ResourceNotFoundError();
        else if (header.status === 429) throw new RateLimitingError();
        else throw new HttpError(body?.message ?? `Could not fetch articles. \n (${header.statusText})`, header.status);
    }
    
    return body;
}

async function getArticle({id, token}) {
    const header = await fetch(`${BASE_URL}/${id}`, {
        method: "GET",
        headers: {"Authorization": `Bearer ${token}`}
    }).catch(() => new ConnectionError());

    if (header instanceof ConnectionError) throw header;
    
    const body = await header.json().catch(() => null);

    if (!header.ok) {
        if (header.status === 404) throw new ResourceNotFoundError();
        else if (header.status === 429) throw new RateLimitingError();
        else throw new HttpError(body?.message ?? `Could not fetch article. \n (${header.statusText})`, header.status);
    }

    return body;
}

async function getNextScrapeTime() {
    const header = await fetch(`${BASE_URL}/nextInvocation`, {
        method: "GET",
    }).catch(() => new ConnectionError());

    if (header instanceof ConnectionError) throw header;

    const body = await header.json().catch(() => null);

    if (!header.ok) {
        if (header.status === 429) throw new RateLimitingError();
        else throw new HttpError(body?.message ?? `Could not fetch time to next scraping. \n (${header.statusText})`, header.status);
    }

    return body;
}
export { getArticles, getArticle, getNextScrapeTime };