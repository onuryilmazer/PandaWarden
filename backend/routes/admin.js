import express from "express";
import { body, validationResult } from "express-validator";
import userService from "../services/userService.js";
import { checkExistingValidators } from "../middleware/customValidators.js";


const router = express.Router();

router.get("/listUsers", 
    checkExistingValidators,
    async (req, res, next) => {
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