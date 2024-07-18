import { Request, Response } from "express";
import {
    getUserData,
    getUserReadme,
    getProjects,
    getCategories,
    getRepoReadme,
} from "./methods";

export const getUserController = async (req: Request, res: Response) => {
    try {
        const userData = await getUserData(process.env.GITHUB_USERNAME!);
        res.json(userData);
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: "Failed to fetch user data" });
    }
};

export const getUserReadmeController = async (req: Request, res: Response) => {
    try {
        const readmeData = await getUserReadme(process.env.GITHUB_USERNAME!);
        res.json(readmeData);
    } catch (error) {
        console.error("Error fetching user README:", error);
        res.status(500).json({ error: "Failed to fetch user README" });
    }
};

export const getProjectsController = async (req: Request, res: Response) => {
    try {
        const projects = await getProjects(process.env.GITHUB_USERNAME!);
        res.json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
};

export const getCategoriesController = async (req: Request, res: Response) => {
    try {
        const categories = await getCategories(
            process.env.GITHUB_USERNAME!,
            process.env.GITHUB_USERNAME!
        );
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};

export const getRepoReadmeController = async (req: Request, res: Response) => {
    const repoName = req.params.name;
    try {
        const readmeData = await getRepoReadme(repoName);
        res.json(readmeData);
    } catch (error) {
        console.error(`Error fetching README for repo ${repoName}:`, error);
        res.status(500).json({
            error: `Failed to fetch README for repo ${repoName}`,
        });
    }
};
