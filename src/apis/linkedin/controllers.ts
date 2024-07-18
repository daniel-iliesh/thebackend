import { Request, Response } from "express";
import { getProfile } from "./methods";
import { AxiosError } from "axios";

export const getProfileController = async (req: Request, res: Response) => {
    try {
        const profile = await getProfile();
        return res.json(profile);
    } catch (error: any) {
        console.log("Failed to fetch linkedin profile", error);
        res.status(500).json({
            error: "Failed to fetch linkedin profile",
            data: error,
        });
    }
};
