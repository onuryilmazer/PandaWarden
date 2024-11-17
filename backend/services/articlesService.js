import * as db from "./databaseService.js";

class ArticlesService {
    async getAllArticles(offset = 0, limit = 30, descending = true) {
        offset = parseInt(offset);
        if (!Number.isInteger(offset) || offset < 0) throw new Error("Invalid offset.");
        limit = parseInt(limit);
        if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error("Invalid limit.");

        //The query string is indeed constructed dynamically, but the user input is NEVER directly included in it.
        const queryString = `
            SELECT articles.id, catalog_title, catalog_description, catalog_screenshot_path, details_url, articles.created_at, source_name 
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

    async getArticle(id) {
        id = parseInt(id);
        if (!Number.isInteger(id) || id < 1) throw new Error("Invalid ID.");

        const articleQuery = await db.query(
            "SELECT articles.id, details_title, details_description, details_aisummary, details_screenshot_path, details_url, articles.created_at, source_name " +
            "FROM articles LEFT JOIN sources ON articles.source_id = sources.id " + 
            "WHERE articles.id = $1", 
            [id]
        );

        if (articleQuery.rows.length === 0) throw new Error("Article not found.");

        return articleQuery.rows[0];
    }

    /**
     * Note: untested.
     * @param {Array<number>} articles 
     */
    async getArticles(articles) {
        if (!Array.isArray(articles)) throw new Error("Invalid input.");

        const articleQuery = await db.query(
            "SELECT articles.id, catalog_title, catalog_description, catalog_screenshot_path, details_url, articles.created_at, source_name " +
            "FROM articles LEFT JOIN sources ON articles.source_id = sources.id " + 
            "WHERE articles.id = ANY($1::int[])", 
            [articles]
        );

        return articleQuery.rows;
    }
}

const articlesService = new ArticlesService();

export default articlesService;