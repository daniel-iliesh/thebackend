import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes";
import setupSwagger from "../swagger";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST || "0.0.0.0";

app.use(
    cors({
        origin: process.env.FRONT_ORIGIN,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
    })
);

app.get("/", (req, res) => {
    res.send("Server up and running!");
});

app.use("/", router);

setupSwagger(app);

app.listen(port as number, host, () => {
    console.log(`[server]: Server is running at http://${host}:${port}`);
});
