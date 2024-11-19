import express from "express";
import { body, param, validationResult } from "express-validator";
import articlesService from "../services/articlesService.js";
import { checkExistingValidators } from "../middleware/customValidators.js";
import { articleLimiter } from "../middleware/rateLimiter.js";
import taskScheduler from "../services/taskScheduler.js";

const router = express.Router();

router.get("/latest/:offset/:limit", 
    articleLimiter,
    param("offset").trim().notEmpty().isInt({min: 0}).withMessage("Invalid offset"),
    param("limit").trim().notEmpty().isInt({min: 1, max: 100}).withMessage("Invalid limit"),
    checkExistingValidators,
    async (req, res, next) => {
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

router.get("/nextInvocation", async (req, res) => {
    return res.json(taskScheduler.getNextInvocation());
});

router.get("/:id",
    articleLimiter,
    param("id").trim().notEmpty().isInt({min: 1}).withMessage("Invalid ID"),
    checkExistingValidators,
    async (req, res, next) => {
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