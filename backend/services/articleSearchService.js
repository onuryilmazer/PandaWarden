import * as db from "./databaseService.js";

class ArticleSearcher {
    constructor(db) {
        this.db = db;
    }


    /**
     * 
     * @param {string} searchPhrase Phrase that will be searched for in the articles. E.g. "covid-19 vaccine" or "climate"
     * @param {*} cutoffDate Optional parameter. If provided, only articles collected after this date will be returned.
     * @returns {Promise<Array<number>>} Array of article IDs that match the search phrase and are collected after the cutoff date.
     */
    async query(searchPhrase, cutoffDate, sources) {
        if (!searchPhrase) { throw new Error("searchPhrase is required"); }

        //If there are multiple keywords, split them into an array and join them with "<->" to make them searchable as a phrase
        let keywordsArray = searchPhrase.split(" ");
        searchPhrase = keywordsArray.join(" <-> ");

        let query = "SELECT id FROM articles WHERE query_document @@ plainto_tsquery('english', $1)";
        let queryParameters = [searchPhrase];

        let parameterIndex = 2;

        //If a cutoff date is provided, add it to the query
        if (cutoffDate) {
            query += ` AND created_at >= $${parameterIndex}`;
            queryParameters.push(cutoffDate);
            parameterIndex++;
        }

        if (sources) {
            query += ` AND source_id = ANY($${parameterIndex})`;
            queryParameters.push(sources);
            parameterIndex++;
        }

        //Execute the query
        const result = await this.db.query(query, queryParameters);

        return result.rows.map(row => row.id);
    }
}

const articleSearcher = new ArticleSearcher(db);

export { articleSearcher };