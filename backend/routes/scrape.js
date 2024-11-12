import express from "express";
import { body, param, validationResult } from "express-validator";
import scrapingService from "../services/scrapingService.js";

const router = express.Router();

router.post("/source/:sourceId", 
    param("sourceId").trim().notEmpty().isInt().withMessage("Invalid source ID."),
    async (req, res, next) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) return next(new Error(validationErrors.array().map(e => e.msg).join("\n") ));

        try {
            const updateResult = await scrapingService.scrapeHomepage(req.params.sourceId);
            return res.status(201).json(updateResult);
        }
        catch (e) {
            return next(e);
        }
});

router.post("/source/:sourceId/missingArticleDetails",
    param("sourceId").trim().notEmpty().isInt().withMessage("Invalid source ID."),    
    async (req, res, next) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) return next(new Error(validationErrors.array().map(e => e.msg).join("\n") ));

        try {
            const updateResult = await scrapingService.scrapeAllMissingArticleDetails(req.params.sourceId);
            return res.status(201).json(updateResult);
        }
        catch (e) {
            return next(e);
        }
        
});

router.post("/article/:id", 
    param("id").trim().notEmpty().isInt().withMessage("Invalid article ID."),    
    async (req, res, next) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) return next(new Error(validationErrors.array().map(e => e.msg).join("\n") ));

        try {
            const updateResult = await scrapingService.scrapeArticleDetails(req.params.id);
            return res.status(updateResult ? 201 : 400).json(updateResult);
        }
        catch (e) {
            return next(e);
        }  
});

export default router;