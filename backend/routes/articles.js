import express from "express";
import { body, param, validationResult } from "express-validator";
import articlesService from "../services/articlesService.js";

const router = express.Router();

router.get("/latest/:offset", 
    param("offset").trim().notEmpty().isInt().withMessage("Invalid offset"),
    async (req, res) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                error: validationErrors.array()
            });
        }

        try {
            let articles = await articlesService.getAllArticles(req.params.offset, true);
            res.status(200).json({
                ok: true,
                articles: articles
            });
        }
        catch (e) {
            return res.status(400).json({
                ok: false,
                error: e.toString()
            });
        }
    }
)

export default router;