import * as db from "./databaseService.js";

class ArticlesService {
    async getAllArticles(offset = 0, descending = true) {
        offset = parseInt(offset);
        if (!Number.isInteger(offset) || offset < 0) throw new Error("Invalid offset.");

        //The query string is indeed constructed dynamically, but the user input is NEVER directly included in it.
        const queryString = `SELECT * FROM articles ORDER BY id ${(descending ? "DESC" : "ASC")} LIMIT 50 OFFSET $1`;

        const articleQuery = await db.query(
            queryString,
            [offset]
        );

        return articleQuery.rows;
    }
}

const articlesService = new ArticlesService();

export default articlesService;