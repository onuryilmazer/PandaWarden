import express from "express";
import { body, validationResult } from "express-validator";
import userService from "../services/userService.js";


const router = express.Router();

router.get("/listUsers", 
    async (req, res, next) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) return next(new Error(validationErrors.array()));

        try {
            const result = await userService.listUsers();
            return res.status(201).json(result);
        }
        catch (e) {
            return next(e);
        }
    }
);

export default router;