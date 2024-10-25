import express from "express";
import bcrypt, { hash } from "bcrypt";
import { body, validationResult } from "express-validator";
import { query } from "../utils/db.js";

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
            return res.status(400).json({errors: validationErrors.array()});
        }

        //check if username / email is in db
        try {
            const usernameQuery = await query("SELECT * FROM users WHERE username = $1", [req.body.username]);
            if (usernameQuery.rows.length !== 0) return res.status(400).json({errors: [`Username ${req.body.username} is not available.`] });

            const emailQuery = await query("SELECT * FROM users WHERE email = $1", [req.body.email]);
            if (emailQuery.rows.length !== 0) return res.status(400).json({errors: [`Email ${req.body.email} is already registered.`] });
        }
        catch (e) {return next(e);}

        //hash pw
        let hashedPw;
        try {
            hashedPw = await bcrypt.hash(req.body.password, +process.env.BCRYPT_SALT_ROUNDS);
        }
        catch (e) {return next(e);}

        //save into db
        try {
            const registrationQuery = await query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *", 
                [req.body.username, req.body.email, hashedPw]);
            
            if (registrationQuery.rowCount !== 0) {
                return res.status(201).json(
                    {
                        info: `Registration successful.`,
                        details: {username: registrationQuery.rows[0].username, email: registrationQuery.rows[0].email}
                    }
                );
            }
        }
        catch (e) {next(e);}    
});

export default router;