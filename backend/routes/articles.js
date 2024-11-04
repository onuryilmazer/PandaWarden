import express from "express";
import { body, param, validationResult } from "express-validator";
import articlesService from "../services/articlesService.js";

const router = express.Router();

router.get("/latest/:offset/:limit", 
    param("offset").trim().notEmpty().isInt({min: 0}).withMessage("Invalid offset"),
    param("limit").trim().notEmpty().isInt({min: 1, max: 100}).withMessage("Invalid limit"),
    async (req, res) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                error: validationErrors.array()
            });
        }

        try {
            const articles = await articlesService.getAllArticles(req.params.offset, req.params.limit, true);
            const numberOfArticles = await articlesService.getNumberOfArticles();
            const numberOfPages = Math.ceil(numberOfArticles / req.params.limit);
            res.status(200).json({
                ok: true,
                articles: articles,
                numberOfPages: numberOfPages,
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