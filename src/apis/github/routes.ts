import { Router } from "express";
import {
    getUserController,
    getUserReadmeController,
    getProjectsController,
    getCategoriesController,
    getRepoReadmeController,
} from "./controllers";
import checkRateLimit from "../../middleware/github";

const router = Router();

router.use(checkRateLimit);

router.get("/user", getUserController);
router.get("/user/readme", getUserReadmeController);
router.get("/projects", getProjectsController);
router.get("/categories", getCategoriesController);
router.get("/repos/:name/readme", getRepoReadmeController);

export default router;
