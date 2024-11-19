import "./utils/config.js";
import express from "express";
import morgan from "morgan";
const app = express();

//express is running behind nginx - setting needed for rate limiting
app.set("trust proxy", 1);

//global middleware
app.use(express.json());
app.use(morgan('combined'));

//import middleware
import {checkAuthToken, checkAdminRights } from "./middleware/authMiddleware.js";

//import routers
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import scrapeRouter from "./routes/scrape.js";
import articlesRouter from "./routes/articles.js";
import adminRouter from "./routes/admin.js";
import { DatabaseError } from "./services/customErrors.js";
import { honeypotLimiter } from "./middleware/rateLimiter.js";

app.use("/admin", checkAdminRights, adminRouter);

app.use("/auth", authRouter);
app.use("/user", checkAuthToken, userRouter);
app.use("/scrape", checkAuthToken, scrapeRouter);
app.use("/articles", articlesRouter);

//serve static files
app.use("/scraper_data", express.static("scraper_data"));
app.use("/", express.static("public"));

app.use("/php*", honeypotLimiter);
app.use("/admin*", honeypotLimiter);
app.use("/wp*", honeypotLimiter);
app.use("/vendor*", honeypotLimiter);


//error handler
app.use((err, req, res, next) => {
    if (!res.statusCode || res.statusCode == 200) res.status(400);
    else if (err instanceof DatabaseError) res.status(500);

    if (err instanceof AggregateError) {
        err.message = err.errors.map(e => e.message).join("\n");
    }

    res.json(err);
});


app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));