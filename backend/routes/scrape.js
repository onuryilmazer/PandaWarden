import express from "express";
import { body, param, validationResult } from "express-validator";
import scrapingService from "../services/scrapingService.js";

const router = express.Router();

router.get("/denemeAuthReq", (req, res) => {
    console.log("here!");
    res.json(req.token);
})

router.get("/:sourceId", 
    param("sourceId").trim().notEmpty().isInt().withMessage("Invalid source ID."),    
    async (req, res) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                error: validationErrors.array()
            });
        }

        const updateResult = await scrapingService.updateSource(req.params.sourceId);
        
        return res.status(updateResult.ok ? 201 : 400).json(updateResult);
});

export default router;