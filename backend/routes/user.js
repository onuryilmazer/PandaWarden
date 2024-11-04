import express from "express";
import { body, validationResult } from "express-validator";
import userService from "../services/userService.js";


const router = express.Router();

router.post("/register", 
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

    async (req, res, next) => {
        const validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                error: validationErrors.array()
            });
        }

        const result = await userService.persistUserIntoDatabase({username: req.body.username, password: req.body.password, email: req.body.email});
        return res.status( result.ok ? 201 : 400 ).json(result);
    }
);

export default router;