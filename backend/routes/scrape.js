import express from "express";
import * as db from "../utils/db.js";
import { body, param, validationResult } from "express-validator";
import { scraperPool } from "../../scrapers/ScraperPool.js";
import { rm, rmdir } from "node:fs/promises";

const router = express.Router();

router.get("/:sourceId", 
    param("sourceId").trim().notEmpty().isInt().withMessage("Invalid source ID."),    
    async (req, res) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({errors: validationErrors.array()});
        }

        //check if the source ID is valid, and retrieve its name:
        let sourceName;
        try {
            const sourceNameQuery = await db.query("SELECT source_name FROM sources WHERE id = $1", [req.params.sourceId]);
            if (sourceNameQuery.rows.length !== 1) throw new Error(`Source ID is not found, or there are duplicate entries for the same source in DB (${req.params.sourceId}).`);
            sourceName = sourceNameQuery.rows[0]["source_name"];
        }
        catch (e) {
            return res.status(400).json(e.toString());
        }

        let scrapeResults;
        try {
            scrapeResults = await scraperPool.scrape("DW");
            if (!scrapeResults.ok) throw new Error(scrapeResults.error);
        }
        catch (e) {
            return res.status(400).json(e.toString());
        }

        //for every scraped article, check db to see if the same article (based on title + source) is already in db before saving
        let insertionCounter = 0;
        for (let article of scrapeResults.data) {
            try {
                const sameArticleQuery = await db.query("SELECT * FROM articles where source_id = $1 AND catalog_title LIKE $2", [req.params.sourceId, `%${article.title}%`]);
                if (sameArticleQuery.rows.length !== 0) {
                    console.log(`Article already exists: ${article.title}. Deleting SS and not saving article to DB`);
                    await rm(article.screenshotPath);
                    continue;
                }

                const insertionQuery = await db.query(
                    "INSERT INTO articles (source_id, scraped_for, catalog_title, catalog_description, catalog_time, catalog_screenshot_path, details_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
                    [req.params.sourceId, 1, article.title, article.description, article.time, article.screenshotPath, article.url]
                );
                console.log(`Inserted article into DB: ${insertionQuery.rows[0].catalog_title}`);
                insertionCounter++;
            }
            catch (e) {
                return res.status(400).json(e.toString());
            }
        }

        //no new articles: delete the folder.
        if (insertionCounter == 0) {
            try {
                await rmdir(scrapeResults.dataFolder);
            }
            catch (e) {
                console.log(`couldn't delete empty data folder: ${e.toString()}`);
            }
        }
        
        return res.status(201).json(`Inserted ${insertionCounter} articles into database.`);
});

export default router;