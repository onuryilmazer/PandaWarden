import * as db from "./databaseService.js";

class ArticlesService {
    async getAllArticles(offset = 0, limit = 30, descending = true) {
        offset = parseInt(offset);
        if (!Number.isInteger(offset) || offset < 0) throw new Error("Invalid offset.");
        limit = parseInt(limit);
        if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("Invalid limit.");

        //The query string is indeed constructed dynamically, but the user input is NEVER directly included in it.
        const queryString = `
            SELECT articles.id, catalog_title, catalog_description, catalog_time, catalog_screenshot_path, details_url, articles.created_at, source_name 
            FROM articles 
            LEFT JOIN sources ON articles.source_id = sources.id
            ORDER BY articles.id ${(descending ? "DESC" : "ASC")} 
            LIMIT $1 OFFSET $2`;

        const articleQuery = await db.query(
            queryString,
            [limit, offset]
        );

        return articleQuery.rows;
    }

    async getNumberOfArticles() {
        const countQuery = await db.query(
            "SELECT count(*) as number_of_articles FROM articles"
        );

        return countQuery.rows[0]["number_of_articles"];
    }
}

const articlesService = new ArticlesService();

export default articlesService;