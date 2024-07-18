import { Octokit } from "@octokit/rest";
import { Request, Response } from "express";

const octokit = new Octokit({
    auth: process.env.GITHUB_KEY,
});

// Controller for getting user data
export async function getUserController(req: Request, res: Response) {
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
export async function getUserReadmeController(req: Request, res: Response) {
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
export async function getProjectsController(req: Request, res: Response) {
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

// Controller for getting a specific repo README
export async function getRepoReadmeController(req: Request, res: Response) {
    const repoName = req.params.name;
    try {
        const { data } = await octokit.request(
            `GET /repos/daniel-iliesh/${repoName}/readme`,
            {
                username: "daniel-iliesh",
                headers: {
                    "X-GitHub-Api-Version": "2022-11-28",
                    accept: "application/vnd.github.html+json",
                },
            }
        );
        res.json(data);
    } catch (error) {
        console.error(`Error fetching README for repo ${repoName}:`, error);
        res.status(500).json({
            error: `Failed to fetch README for repo ${repoName}`,
        });
    }
}

// Helper function to fetch and convert Markdown to HTML
export async function getMarkdownAsHtml(
    owner: string,
    repo: string,
    path: string
): Promise<string> {
    const { data: fileData } = await octokit.repos.getContent({
        owner,
        repo,
        path,
    });

    const fileContent = Buffer.from(
        (fileData as any).content,
        "base64"
    ).toString("utf-8");

    const { data: htmlContent } = await octokit.markdown.render({
        text: fileContent,
        mode: "gfm",
    });

    return htmlContent;
}

// Type guard to check if content is an array
function isContentArray(content: any): content is ContentItem[] {
    return Array.isArray(content);
}

// Controller for getting categories and their articles
export async function getCategoriesController(req: Request, res: Response) {
    try {
        // Get the list of categories (subfolders in 'blog' folder)
        const { data: categories } = await octokit.repos.getContent({
            owner: "daniel-iliesh",
            repo: "your-repo-name", // Replace with your repository name
            path: "blog",
        });

        if (!isContentArray(categories)) {
            return res
                .status(500)
                .json({ error: "Unexpected response format" });
        }

        const categoriesData: (Category | undefined)[] = await Promise.all(
            categories.map(async (category) => {
                if (category.type === "dir") {
                    // Get the list of articles in the category (subfolders in category folder)
                    const { data: articles } = await octokit.repos.getContent({
                        owner: "daniel-iliesh",
                        repo: "your-repo-name", // Replace with your repository name
                        path: `blog/${category.name}`,
                    });

                    if (!isContentArray(articles)) {
                        return undefined;
                    }

                    const articlesData: (Article | undefined)[] =
                        await Promise.all(
                            articles.map(async (article) => {
                                if (
                                    article.type === "file" &&
                                    article.name.endsWith(".md")
                                ) {
                                    const htmlContent = await getMarkdownAsHtml(
                                        "daniel-iliesh",
                                        "your-repo-name",
                                        article.path
                                    );
                                    return {
                                        name: article.name,
                                        content: htmlContent,
                                    };
                                }
                                return undefined;
                            })
                        );

                    return {
                        category: category.name,
                        articles: articlesData.filter(
                            (article): article is Article =>
                                article !== undefined
                        ),
                    };
                }
                return undefined;
            })
        );

        const filteredCategoriesData: Category[] = categoriesData.filter(
            (category): category is Category => category !== undefined
        );

        res.json(filteredCategoriesData);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
}
