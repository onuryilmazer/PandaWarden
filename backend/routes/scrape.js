import express from "express";
import { body, param, validationResult } from "express-validator";
import scrapingService from "../services/scrapingService.js";
import { checkExistingValidators } from "../middleware/customValidators.js";
import { scrapingLimiter } from "../middleware/rateLimiter.js";
import { acquireScrapingLock, checkScrapingLock, releaseScrapingLock } from "../middleware/scrapingLockMiddleware.js";
import { aiService } from "../services/aiService.js";

const router = express.Router();

router.post("/source/all", 
    scrapingLimiter,
    checkScrapingLock,
    async (req, res, next) => {
    try {
        console.log("Manually triggered scraping task started.");
        acquireScrapingLock();
    
        let count = 0;
        const sourceIds = await scrapingService.availableSources();
        for (let sourceId of sourceIds) {
            try {
                count += await scrapingService.scrapeHomepage(sourceId);
                await scrapingService.scrapeAllMissingArticleDetails(sourceId);
                if (process.env.NODE_ENV == "production") await aiService.generateAndSaveArticleSummariesForAllArticles();
            } catch (e) {
                console.error(`Error while scraping ${sourceId}: ${e.message}`);
            }
        }

        return res.status(201).json(`Scraping task finished. Found ${count} new articles.`);
    }
    catch (e) {
        return next(e);
    }
    finally {
        //finally gets executed before the return happens in try/catch blocks.
        releaseScrapingLock();
    }
})

router.post("/source/:sourceId", 
    scrapingLimiter,
    param("sourceId").trim().notEmpty().isInt().withMessage("Invalid source ID."),
    checkExistingValidators,
    async (req, res, next) => {
        try {
            const updateResult = await scrapingService.scrapeHomepage(req.params.sourceId);
            return res.status(201).json(updateResult);
        }
        catch (e) {
            return next(e);
        }
});

router.post("/source/:sourceId/missingArticleDetails",
    scrapingLimiter,
    param("sourceId").trim().notEmpty().isInt().withMessage("Invalid source ID."),    
    checkExistingValidators,
    async (req, res, next) => {
        try {
            const updateResult = await scrapingService.scrapeAllMissingArticleDetails(req.params.sourceId);
            return res.status(201).json(updateResult);
        }
        catch (e) {
            return next(e);
        }
        
});

router.post("/article/:id", 
    scrapingLimiter,
    param("id").trim().notEmpty().isInt().withMessage("Invalid article ID."),    
    checkExistingValidators,
    async (req, res, next) => {
        try {
            const updateResult = await scrapingService.scrapeArticleDetails(req.params.id);
            return res.status(updateResult ? 201 : 400).json(updateResult);
        }
        catch (e) {
            return next(e);
        }  
});


export default router;