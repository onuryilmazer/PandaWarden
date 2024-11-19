import { AuthenticationError, ConnectionError, HttpError, RateLimitingError } from "./ErrorClasses";

const BASE_URL = "/auth";
//const BASE_URL = "http://localhost:3001/auth";

async function getToken({username, password}) {
    const header = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password})
    }).catch(() => new ConnectionError());

    if (header instanceof ConnectionError) throw header;

    const body = await header.json().catch(() => null);
    
    if (header.status == 401) throw new AuthenticationError(body);
    else if (header.status === 429) throw new RateLimitingError();
    else if (!header.ok) throw new HttpError(body?.message ?? `Login failed. \n ${header.statusText}`, header.status);

    return body;
}

export { getToken };