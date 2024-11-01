import express from "express";
import * as db from "../utils/db.js";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { sign_promisified } from "../utils/jwt-promisify.js";

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
            return res.status(400).json({errors: validationErrors.array()});
        }

        try {
            const userQuery = await db.query("SELECT username, email, password FROM users WHERE username = $1", [req.body.username]);
            
            let hashComparisonResult;

            if (userQuery.rows.length > 0) {
                hashComparisonResult = await bcrypt.compare(req.body.password, userQuery.rows[0].password);
            }
            
            //Don't give potential hackers unnecessary information (pass or username, which one is wrong?)
            if (userQuery.rows.length === 0 || !hashComparisonResult) return res.status(401).json({error: "Wrong username and/or password."});

            //Create token
            const claim = {
                username: userQuery.rows[0].username,
                email: userQuery.rows[0].email
            };
            const signedToken = await sign_promisified(claim, process.env.JWT_KEY, {expiresIn: +process.env.JWT_EXPIRATION});

            return res.status(200).json({token: signedToken});
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({error: error.message});
        }
});

export default router;