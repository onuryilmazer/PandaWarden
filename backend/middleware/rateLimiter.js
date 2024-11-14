import { rateLimit } from 'express-rate-limit';

const registrationLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: "Too many requests from this IP, please try again after 15 minutes"
});

const loginLimiter = rateLimit({
	windowMs: 10 * 1000, // 10 secs
	limit: 10, // Limit each IP to 100 requests per `window`
    message: "Too many requests from this IP, please try again in a short while"
});

const scrapingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: "Too many requests from this IP, please try again after 15 minutes"
});

const articleLimiter = rateLimit({
    windowMs: 10 * 1000, // 1 minute
    max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: "Too many requests from this IP, please try again after a short while"
});

const userDetailsLimiter = rateLimit({
    windowMs: 10 * 1000, // 1 minute
    max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: "Too many requests from this IP, please try again after a short while"
})

export {registrationLimiter, loginLimiter, scrapingLimiter, articleLimiter, userDetailsLimiter}