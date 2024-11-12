import { ConnectionError, HttpError, RateLimitingError } from "./ErrorClasses";

const BASE_URL = "/auth";

async function registerUser({username, email, password}) {
    const header = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, email, password})
    }).catch(() => new ConnectionError());

    if (header instanceof ConnectionError) throw header;

    const body = await header.json().catch(() => null);

    if (!header.ok) {
        if (header.status === 429) throw new RateLimitingError();
        else throw new HttpError(body ?? `Signup failed. \n (${header.statusText})`, header.status);
    }

    return body;
}

//delete user

//password recovery

export { registerUser };