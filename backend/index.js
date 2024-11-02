import "./utils/config.js";
import express from "express";
const app = express();

//global middleware
app.use(express.json());

//import middleware
import checkAuthToken from "./middleware/authMiddleware.js";

//import routers
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import scrapeRouter from "./routes/scrape.js";
import articlesRouter from "./routes/articles.js";


app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/scrape", checkAuthToken, scrapeRouter);
app.use("/articles", checkAuthToken, articlesRouter);

//serve static files
app.use("/scraper_data", express.static("scraper_data"));

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));