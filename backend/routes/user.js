import express from "express";
import { body, validationResult } from "express-validator";
import userService from "../services/userService.js";
import { userDetailsLimiter } from "../middleware/rateLimiter.js";


const router = express.Router();

router.get("/details", 
    userDetailsLimiter,    
    async (req, res, next) => {

    try {
        const userDetails = await userService.getUserDetails(req.token.username);
        return res.status(200).json(userDetails);
    }
    catch (e) {
        return next(e);
    }
})

router.get('/ip', (request, response) => response.send(request.ip));

export default router;