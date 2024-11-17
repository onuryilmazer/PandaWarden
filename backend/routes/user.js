import express from "express";
import { body, param, validationResult } from "express-validator";
import userService from "../services/userService.js";
import { monitoringService } from "../services/monitoringService.js";
import { userDetailsLimiter } from "../middleware/rateLimiter.js";
import { checkExistingValidators } from "../middleware/customValidators.js";


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
});

router.get("/monitoringRequests", async (req, res, next) => {
    try {
        const monitoringRequests = await userService.getMonitoringRequestsOfUser(req.token.id);
        return res.status(200).json(monitoringRequests);
    }
    catch (e) {
        return next(e);
    }
});

router.post("/monitoringRequests", 
    body("repeatIntervalSeconds").trim().notEmpty().isInt().toInt(),
    body("keywords").isArray().notEmpty().custom((value) => value.every((keyword) => typeof keyword === "string")),
    body("sourceIds").isArray().notEmpty().custom((value) => value.every((sourceId) => typeof sourceId === "number")),
    checkExistingValidators,
    async (req, res, next) => {
        try {
            const result = await monitoringService.createMonitoringRequest({ owner: req.token.id, repeatIntervalSeconds: req.body.repeatIntervalSeconds, keywords: req.body.keywords, sourceIds: req.body.sourceIds });
            return res.status(201).json(result);
        }
        catch (e) {
            return next(e);
        }
    }
);

router.get("/monitoringRequests/:id", 
    param("id").trim().notEmpty().isInt().toInt(),
    checkExistingValidators,    
    async (req, res, next) => {
    try {
        const monitoringRequest = await userService.getMonitoringRequestOfUser(req.token.id, req.params.id);
        return res.status(200).json(monitoringRequest);
    }
    catch (e) {
        return next(e);
    }
});

router.patch("/monitoringRequests/:id/toggleActiveness",
    param("id").trim().notEmpty().isInt().toInt(),
    checkExistingValidators,    
    async (req, res, next) => {
    try {
        const result = await userService.toggleMonitoringRequestActive(req.token.id, req.params.id);
        return res.status(200).json(result);
    }
    catch (e) {
        return next(e);
    }
});

router.delete("/monitoringRequests/:id", 
    param("id").trim().notEmpty().isInt().toInt(),
    checkExistingValidators,    
    async (req, res, next) => {
    try {
        await userService.deleteMonitoringRequest(req.token.id, req.params.id);
        return res.status(204).end();
    }
    catch (e) {
        return next(e);
    }
});

router.get('/ip', (request, response) => response.send(request.ip));

export default router;