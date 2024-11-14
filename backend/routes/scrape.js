import express from "express";
import { body, param, validationResult } from "express-validator";
import scrapingService from "../services/scrapingService.js";
import taskScheduler from "../services/taskScheduler.js";
import { checkExistingValidators } from "../middleware/customValidators.js";
import { scrapingLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

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

router.get("/nextInvocation", async (req, res) => {
    return res.json(taskScheduler.getNextInvocation());
});

export default router;