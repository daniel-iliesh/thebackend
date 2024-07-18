import { Router } from "express";
import githubRouter from "../apis/github/routes";
import linkedinRouter from "../apis/linkedin/routes";

const router = Router();

router.use("/github", githubRouter);
router.use("/linkedin", linkedinRouter);

export default router;
