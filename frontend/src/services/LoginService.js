const BASE_URL = "/auth";

async function getToken({username, password}) {
    const header = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password})
    });

    let returnValue = {
        ok: header.ok
    };

    if (header.ok) {
        const body = await header.json();
        returnValue.token = body.token;
        returnValue.errors = body.errors;
    }

    return returnValue;
}

export { getToken };