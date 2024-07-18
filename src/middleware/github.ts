import { Request, Response, NextFunction } from "express";
import { octokit } from "../apis/github";

const checkRateLimit = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { data } = await octokit.rateLimit.get();
        const rateLimit = data.resources.core;

        if (rateLimit.remaining > 0) {
            next();
        } else {
            const resetTime = new Date(rateLimit.reset * 1000);
            res.status(429).json({
                message: "API rate limit exceeded. Try again after some time.",
                resetTime,
            });
        }
    } catch (error) {
        console.error("Error checking rate limit:", error);
        res.status(500).json({ error: "Failed to check rate limit" });
    }
};

export default checkRateLimit;
