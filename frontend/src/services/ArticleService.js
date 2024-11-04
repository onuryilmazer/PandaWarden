const BASE_URL = "/articles";

async function getArticles({offset = 0, limit = 30, token}) {
    const header = await fetch(`${BASE_URL}/latest/${offset}/${limit}`, {
        method: "GET",
        headers: {"Authorization": `Bearer ${token}`}
    });

    let returnValue = {
        ok: header.ok,
        status: header.status
    };

    
    const body = await header.json();
    returnValue.articles = body.articles;
    returnValue.numberOfPages = body.numberOfPages;
    returnValue.error = body.error;
    

    return returnValue;
}

export { getArticles };