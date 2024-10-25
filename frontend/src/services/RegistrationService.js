const BASE_URL = "/user";

async function registerUser({username, email, password}) {
    const header = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, email, password})
    });

    const body = await header.json();

    return {
        ok: header.ok,
        errors: body.errors,
        info: body.info,
        details: body.details
    };
}

//delete user

//password recovery

export { registerUser };