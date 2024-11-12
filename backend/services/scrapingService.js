import * as db from "./databaseService.js";
import { ScraperPool } from "../../scrapers/ScraperPool.js";
import { rm } from "node:fs/promises";

class ScrapingService {
    scraperPoolInstance;

    constructor() {
        this.scraperPoolInstance = new ScraperPool();
    }

    async availableSources() {
        const sourceQuery = await db.query("SELECT distinct id FROM sources");
        return sourceQuery.rows.map(row => row.id);
    }

    /**
     * Updates the database by finding new articles from the given source. Initially all articles are scraped, already existing ones are subsequently deleted.
     * @param {number} sourceId 
     * @returns {Promise<number>} Number of new articles
     */
    async scrapeHomepage(sourceId) {        
        if (!await this._sourceExists(sourceId)) throw new Error("Invalid source id.");

        const scrapeResults = await this._scrapeHomepage(sourceId);

        let newArticleCounter = 0;
        for(let article of scrapeResults.articles) {
            if (await this._articleIsAlreadyInDatabase(article, sourceId)) {
                await this._deleteArticleScreenshot(article);
                continue;
            }

            await this._saveArticleIntoDatabase(article, sourceId);
            newArticleCounter++;
        }

        return newArticleCounter;
    }

    async scrapeArticleDetails(articleId) {
        let articleQuery = await db.query("SELECT source_id, details_url FROM articles WHERE id = $1", [articleId]);
        const detailedArticle = await this._scrapeArticle(articleQuery.rows[0]["source_id"], {url: articleQuery.rows[0]["details_url"]});

        await this._updateArticleDetails(detailedArticle);

        return true;
    }

    async scrapeAllMissingArticleDetails(sourceId) {
        if (!await this._sourceExists(sourceId)) throw new Error("Invalid source id.");

        const urls = await db.query("SELECT details_url FROM articles WHERE details_description IS NULL AND source_id = $1",
            [sourceId]
        );

        let promises = urls.rows.map(async row => {
            const detailedArticle = await this._scrapeArticle(sourceId, {url: row.details_url});
            await this._updateArticleDetails(detailedArticle);
            return true;
        });

        promises = await Promise.allSettled(promises);

        promises.forEach(p => {if (p.status === "rejected") console.log(p.reason)} );

        const updatedArticleCount = promises.filter(p => p.status === "fulfilled").length;
        return updatedArticleCount;
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

    async _sourceExists(sourceId) {
        const sourceQuery = await db.query("SELECT * FROM sources WHERE id = $1", [sourceId]);
        return sourceQuery.rows.length > 0;
    }

    /**
     * Scrape a source for all the articles
     * @param {number} sourceId 
     * @returns {Promise<{}[]>} Array of objects with article title, description, and screenshot path.
     */
    async _scrapeHomepage(sourceId) {
        const sourceName = await this._findSourceNameById(sourceId);
        const result = await this.scraperPoolInstance.scrapeHomepage(sourceName);

        return result;
    }

    async _scrapeArticle(sourceId, article) {
        const sourceName = await this._findSourceNameById(sourceId);
        const result = await this.scraperPoolInstance.scrapeArticle(sourceName, article);

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
            "INSERT INTO articles (source_id, catalog_title, catalog_description, catalog_screenshot_path, details_title, details_description, details_aisummary, details_screenshot_path, details_url) " + 
            "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9 )",
            [sourceId, article.title, article.description, article.screenshotPath, article.detailsTitle, article.detailsDescription, article.aiSummary, article.detailsScreenshotPath, article.url]
        );
        
        return insertionQuery.rowCount > 0;
    }

    async _updateArticleDetails(article) {
        await db.query("UPDATE articles SET details_title = $1, details_description = $2, details_screenshot_path = $3 WHERE details_url = $4",
            [article.detailsTitle, article.detailsDescription, article.detailsScreenshotPath, article.url]
        );
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
}

const scrapingService = new ScrapingService();

export default scrapingService;