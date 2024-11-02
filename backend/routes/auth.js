import express from "express";
import { body, validationResult } from "express-validator";
import userService from "../services/userService.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).json({hello: "world"});
});

router.post("/login", 
    body("username").trim().notEmpty().withMessage("Username can't be empty."),
    body("password").trim().notEmpty().withMessage("Password can't be empty."),
    async (req, res, next) => {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                error: validationErrors.array()
            });
        }

        const authResult = await userService.createAuthToken({
            username: req.body.username, 
            password: req.body.password
        });

        return res.status(authResult.ok ? 200 : 401).json(authResult);        
});

export default router;