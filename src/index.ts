import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Octokit } from "@octokit/rest";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const octokit = new Octokit({
    auth: process.env.GITHUB_KEY,
});

// Controller for getting user data
async function getUserController(req: Request, res: Response) {
    try {
        const userData = await octokit.request("GET /users/daniel-iliesh", {
            username: "daniel-iliesh",
            headers: {
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });
        res.json(userData.data);
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: "Failed to fetch user data" });
    }
}

// Controller for getting user README
async function getUserReadmeController(req: Request, res: Response) {
    try {
        const readmeData = await octokit.request(
            "GET /repos/daniel-iliesh/daniel-iliesh/readme",
            {
                username: "daniel-iliesh",
                headers: {
                    "X-GitHub-Api-Version": "2022-11-28",
                    accept: "application/vnd.github.html+json",
                },
            }
        );
        res.json(readmeData.data);
    } catch (error) {
        console.error("Error fetching user README:", error);
        res.status(500).json({ error: "Failed to fetch user README" });
    }
}

// Controller for getting projects
async function getProjectsController(req: Request, res: Response) {
    try {
        const { data: repos } = await octokit.request(
            "GET /users/daniel-iliesh/repos",
            {
                username: "daniel-iliesh",
                headers: {
                    "X-GitHub-Api-Version": "2022-11-28",
                },
            }
        );

        async function getFavimage(repo: string) {
            try {
                const response = await octokit.request(
                    `GET /repos/daniel-iliesh/${repo}/contents/favimage.png`,
                    {
                        owner: "daniel-iliesh",
                        repo,
                        headers: {
                            "X-GitHub-Api-Version": "2022-11-28",
                        },
                    }
                );

                if (response.status !== 200) {
                    console.error(
                        `Failed to fetch favimage for ${repo}: ${response.status}`
                    );
                    return;
                }
                return response.data.download_url;
            } catch (error) {
                console.error(`Error fetching favimage for ${repo}:`, error);
            }
        }

        async function getMetadata(repo: string) {
            try {
                const response = await octokit.request(
                    `GET /repos/daniel-iliesh/${repo}/readme`,
                    {
                        owner: "daniel-iliesh",
                        repo,
                        headers: {
                            "X-GitHub-Api-Version": "2022-11-28",
                        },
                    }
                );

                if (response.status !== 200) {
                    console.error(
                        `Failed to fetch metadata for ${repo}: ${response.status}`
                    );
                    return;
                }

                const content = Buffer.from(
                    response.data.content,
                    "base64"
                ).toString("utf-8");

                // Extract metadata from HTML comments
                const metadataMatch = content.match(/<!--([\s\S]*?)-->/);
                if (metadataMatch) {
                    try {
                        const metadata = JSON.parse(metadataMatch[1].trim());
                        return metadata;
                    } catch (error) {
                        console.error("Error parsing metadata:", error);
                    }
                } else {
                    console.log("No metadata found.");
                }
            } catch (error) {
                console.error(`Error fetching metadata for ${repo}:`, error);
            }
        }

        async function filterVisibleRepos(repos: any[]) {
            try {
                const visibilityChecks = await Promise.all(
                    repos.map(async (r) => {
                        try {
                            const metadata = await getMetadata(r.name);
                            const favimage = await getFavimage(r.name);
                            return {
                                repo: r,
                                visible: metadata?.visible === "true",
                                favimage,
                            };
                        } catch (error) {
                            console.error(
                                `Error checking visibility for ${r.name}:`,
                                error
                            );
                            return { repo: r, visible: false };
                        }
                    })
                );

                const visibleRepos = visibilityChecks
                    .filter((check) => check.visible)
                    .map((check) => ({
                        ...check.repo,
                        favimage: check.favimage,
                    }));

                return visibleRepos;
            } catch (e: any) {
                console.error("Error filtering visible repos:", e);
            }
        }

        const visibleRepos = await filterVisibleRepos(repos);
        res.json(visibleRepos);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
}

app.get("/user", getUserController);
app.get("/user/readme", getUserReadmeController);
app.get("/projects", getProjectsController);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
