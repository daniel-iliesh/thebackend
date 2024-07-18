import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import {
    getCategoriesController,
    getRepoReadmeController,
    getUserController,
    getUserReadmeController,
    getProjectsController,
} from "./controllers";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST || "0.0.0.0";

app.use(
    cors({
        origin: process.env.FRONT_ORIGIN, // Replace with your frontend URL
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
    })
);

app.get("/", (req, res) => {
    res.send("Server up and running!");
});

app.get("/categories", getCategoriesController);
app.get("/repos/:name/readme", getRepoReadmeController);
app.get("/user", getUserController);
app.get("/user/readme", getUserReadmeController);
app.get("/projects", getProjectsController);

app.listen(port as number, host, () => {
    console.log(`[server]: Server is running at http://${host}:${port}`);
});
