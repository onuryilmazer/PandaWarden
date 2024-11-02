const BASE_URL = "/articles";

async function getArticles({offset = 0, token}) {
    const header = await fetch(`${BASE_URL}/latest/${offset}`, {
        method: "GET",
        headers: {"Authorization": `Bearer ${token}`}
    });

    let returnValue = {
        ok: header.ok
    };

    if (header.ok) {
        const body = await header.json();
        returnValue.articles = body.articles;
        returnValue.error = body.error;
    }

    return returnValue;
}

export { getArticles };