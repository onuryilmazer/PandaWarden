const BASE_URL = "/authenticate";

async function getToken({username, password}) {
    const response = await fetch(`${BASE_URL}/getToken`, {
        method: "POST",
        body: JSON.stringify({username, password})
    });

    if (!response.ok) return null;

    const reply = await response.json();

    return reply;
}

async function mockGetToken({username, password}) {
    if (username == "asd" && password == "123") return "ok";
    else return null;
}

export {mockGetToken as getToken};