import * as db from "./databaseService.js";
import { ScraperPool } from "../../scrapers/ScraperPool.js";
import { rm, rmdir } from "node:fs/promises";

class ScrapingService {
    scraperPoolInstance;

    constructor() {
        this.scraperPoolInstance = new ScraperPool();
    }

    /**
     * Updates the database by finding new articles from the given source. Initially all articles are scraped, already existing ones are subsequently deleted.
     * @param {number} sourceId 
     * @returns {Promise<{ok: boolean, numberOfNewArticles: number | undefined, error: error | undefined}>}
     */
    async updateSource(sourceId) {
        let result = {};
        try {
            let scrapedData = await this._scrapeSource(sourceId);

            let newArticleCounter = 0;
            for(let article of scrapedData.data) {
                try {
                    if (await this._articleIsAlreadyInDatabase(article, sourceId)) {
                        await this._deleteArticleScreenshot(article);
                        continue;
                    }

                    await this._saveArticleIntoDatabase(article, sourceId);
                    newArticleCounter++;
                }
                catch (e) {
                    console.log(e);
                }                
            }

            if (newArticleCounter === 0) await this._deleteEmptyScreenshotsFolder(scrapedData.dataFolder);
            result.ok = true;
            result.numberOfNewArticles = newArticleCounter;
        }
        catch (e) {
            result.ok = false;
            result.error = e.toString();
        }

        return result;
    }

    /**
     * 
     * @param {number} sourceId A number, e.g. 16
     * @returns {Promise<string>} The name of the source, e.g. "DW".
     */
    async _findSourceNameById(sourceId) {
        const sourceNameQuery = await db.query(
            "SELECT source_name FROM sources WHERE id = $1", 
            [sourceId]
        );

        if (sourceNameQuery.rows.length === 0) {
            throw new Error(`Source ID ${sourceId} is not found.`);
        }
        else if (sourceNameQuery.rows.length > 1) {
            throw new Error(`There are duplicate entries for Source ID ${sourceId} in the system.`);
        }

        const sourceName = sourceNameQuery.rows[0]["source_name"];
        
        return sourceName;
    }

    /**
     * Scrape a source for all the articles
     * @param {number} sourceId 
     * @returns {Promise<{}[]>} Array of objects with article title, description, and screenshot path.
     */
    async _scrapeSource(sourceId) {
        const sourceName = await this._findSourceNameById(sourceId);
        const result = await this.scraperPoolInstance.scrape(sourceName);

        if (!result.ok) throw result.error;

        return result;
    }

    /**
     * Checks if the article with the given title was scraped and persisted to database in the past.
     * @param {{title: string}} article The article object with the title of the article.
     * @param {number} sourceId ID of the source from which the article was scraped.
     * @returns {Promise<boolean>} true if the article was found in DB.
     */
    async _articleIsAlreadyInDatabase(article, sourceId) {
        const sameArticleQuery = await db.query(
            "SELECT * FROM articles where source_id = $1 AND catalog_title LIKE $2", 
            [sourceId, `%${article.title}%`]
        );

        return sameArticleQuery.rows.length !== 0;
    }

    /**
     * Saves an article into the database.
     * @param {{title: string, description: string, time: string, screenshotPath: string, url: string}} article 
     * @param {number} sourceId 
     * @returns {Promise<boolean>} Resolves to true if row was inserted (can still throw).
     */
    async _saveArticleIntoDatabase(article, sourceId) {
        const insertionQuery = await db.query(
            "INSERT INTO articles (source_id, catalog_title, catalog_description, catalog_time, catalog_screenshot_path, details_url) VALUES ($1, $2, $3, $4, $5, $6)",
            [sourceId, article.title, article.description, article.time, article.screenshotPath, article.url]
        );
        
        return insertionQuery.rowCount > 0;
    }

    /**
     * Deletes the screenshot of an article from the disk. (Can be used after you determined the scraped article is already in the database.)
     * @param {{screenshotPath: string}} article The article whose screenshot is going to be deleted
     * @returns {Promise<boolean>} true if ss is deleted
     */
    async _deleteArticleScreenshot(article) {
        try {
            await rm(article.screenshotPath);
            return true;
        }
        catch (e) {
            return false;
        }
    }

    /**
     * Deletes empty folders. It should avoid deleting non-empty folders, but don't depend on that.
     * @param {string} path 
     * @returns {Promise<boolean>} true if folder is deleted.
     */
    async _deleteEmptyScreenshotsFolder(path) {
        try {
            await rmdir(path);
            return true;
        }
        catch (e) {
            return false;
        }
    }
}

const scrapingService = new ScrapingService();

export default scrapingService;