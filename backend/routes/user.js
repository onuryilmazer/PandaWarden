import express from "express";
import { body, validationResult } from "express-validator";
import userService from "../services/userService.js";


const router = express.Router();

router.get("/details", async (req, res, next) => {

    try {
        const userDetails = await userService.getUserDetails(req.token.username);
        return res.status(200).json(userDetails);
    }
    catch (e) {
        return next(e);
    }
})

export default router;