import express from "express";
import { body, param, validationResult } from "express-validator";
import articlesService from "../services/articlesService.js";

const router = express.Router();

router.get("/latest/:offset/:limit", 
    param("offset").trim().notEmpty().isInt({min: 0}).withMessage("Invalid offset"),
    param("limit").trim().notEmpty().isInt({min: 1, max: 100}).withMessage("Invalid limit"),
    async (req, res, next) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) return next(new Error(validationErrors.array().map(e => e.msg).join("\n") ));

        try {
            const articles = await articlesService.getAllArticles(req.params.offset, req.params.limit, true);
            const numberOfArticles = await articlesService.getNumberOfArticles();
            const numberOfPages = Math.ceil(numberOfArticles / req.params.limit);
            res.status(200).json({ 
                articles: articles,
                numberOfPages: numberOfPages,
            });
        }
        catch (e) {
            return next(e);
        }
    }
)

router.get("/:id",
    param("id").trim().notEmpty().isInt({min: 1}).withMessage("Invalid ID"),
    async (req, res, next) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) return next(new Error(validationErrors.array().map(e => e.msg).join("\n") ));

        try {
            const article = await articlesService.getArticle(req.params.id);
            if (!article) throw new Error("Article not found");
            res.status(200).json(article);
        }
        catch (e) {
            return next(e);
        }
    }
)

export default router;