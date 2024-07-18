import { Router } from "express";
import { getProfileController } from "./controllers";

const router = Router();

router.get("/profile", getProfileController);

export default router;
