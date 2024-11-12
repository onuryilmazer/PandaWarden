import { ConnectionError, HttpError, LoginExpiredError, ResourceNotFoundError } from "./ErrorClasses";

const BASE_URL = "/articles";

async function getArticles({offset = 0, limit = 30, token}) {
    const header = await fetch(`${BASE_URL}/latest/${offset}/${limit}`, {
        method: "GET",
        headers: {"Authorization": `Bearer ${token}`}
    }).catch(() => new ConnectionError());

    if (header instanceof ConnectionError) throw header;

    const body = await header.json().catch(() => null);
    
    if (!header.ok) {
        if (header.status === 401) throw new LoginExpiredError();
        else if (header.status === 404) throw new ResourceNotFoundError();
        else throw new HttpError(body ?? `Could not fetch articles. \n (${header.statusText})`, header.status);
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
        if (header.status === 401) throw new LoginExpiredError();
        else if (header.status === 404) throw new ResourceNotFoundError();
        else throw new HttpError(body ?? `Could not fetch article. \n (${header.statusText})`, header.status);
    }

    return body;
}

export { getArticles, getArticle };