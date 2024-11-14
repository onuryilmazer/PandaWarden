import express from "express";
import { body, validationResult } from "express-validator";
import userService from "../services/userService.js";
import { checkExistingValidators } from "../middleware/customValidators.js";
import { loginLimiter, registrationLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/login", 
    loginLimiter,
    body("username").trim().notEmpty().withMessage("Username can't be empty."),
    body("password").trim().notEmpty().withMessage("Password can't be empty."),
    checkExistingValidators,
    async (req, res, next) => {
        try {
            const token = await userService.createAuthToken({
                username: req.body.username, 
                password: req.body.password
            });
            
            return res.status(200).json(token);        
        }
        catch (e) {
            res.status(401);
            return next(e);
        }
});

router.post("/register", 
    registrationLimiter,
    body("username", "Invalid username")
        .trim()
        .notEmpty().withMessage("Username can't be empty")
        .isLength({min: 4, max: 30}).withMessage("Username needs to be between 4-30 characters"),
    body("email", "Invalid e-mail")
        .trim()
        .notEmpty().withMessage("E-mail can't be empty")
        .isLength({max: 100}).withMessage("E-mails must be shorter than 100 characters")
        .isEmail(),
    body("password", "Invalid password")
        .trim()
        .notEmpty().withMessage("Password can't be empty")
        .isLength({min: 6, max: 100}).withMessage("Passwords must be at least 6 and at most 100 characters long"),
    checkExistingValidators,

    async (req, res, next) => {
        try {
            const result = await userService.registerUser({username: req.body.username, password: req.body.password, email: req.body.email});
            return res.status(201).json(result);
        }
        catch (e) {
            return next(e);
        }
    }
);

export default router;