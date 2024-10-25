import express from "express";
import {} from "./utils/config.js";
import * as db from "./utils/db.js";
const app = express();

//global middleware
app.use(express.json());

//import routers
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";

app.use("/auth", authRouter);
app.use("/user", userRouter);

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));