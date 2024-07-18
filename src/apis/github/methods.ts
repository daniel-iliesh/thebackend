import { octokit } from "./index";

export const getUserData = async (username: string) => {
    const { data } = await octokit.users.getByUsername({ username });
    return data;
};

export const getUserReadme = async (username: string) => {
    const { data } = await octokit.repos.getReadme({
        owner: username,
        repo: username,
        mediaType: {
            format: "html",
        },
    });
    return data;
};

export const getProjects = async (username: string) => {
    const { data: repos } = await octokit.repos.listForUser({ username });

    const visibleRepos = await Promise.all(
        repos.map(async (repo: any) => {
            const readme = await getRepoReadme(repo.name);
            const metadataMatch = readme.match(/<!--([\s\S]*?)-->/);

            if (metadataMatch) {
                const metadata = JSON.parse(metadataMatch[1].trim());
                console.log("metadata", metadata);

                if (metadata.visible === "true") {
                    const favimage = await getFavimage(username, repo.name);
                    return {
                        ...repo,
                        favimage,
                    };
                }
            }
            return null;
        })
    );

    console.log(visibleRepos);

    return visibleRepos.filter((repo) => repo !== null);
};

export const getRepoReadme = async (repoName: string) => {
    const { data } = await octokit.repos.getReadme({
        owner: process.env.GITHUB_USERNAME!,
        repo: repoName,
        mediaType: {
            format: "markdown",
        },
    });

    return Buffer.from(data.content, "base64").toString("utf-8");
};

const getFavimage = async (username: string, repoName: string) => {
    try {
        const { data } = await octokit.repos.getContent({
            owner: username,
            repo: repoName,
            path: "favimage.png",
        });

        if (Array.isArray(data)) {
            throw new Error("Unexpected response format");
        }

        return data.download_url;
    } catch (error) {
        console.error(`Error fetching favimage for ${repoName}:`, error);
        return null;
    }
};

export const getCategories = async (username: string, repoName: string) => {
    const { data: categories } = await octokit.repos.getContent({
        owner: username,
        repo: repoName,
        path: "blog",
    });

    if (!Array.isArray(categories)) {
        throw new Error("Unexpected response format");
    }

    const categoriesData = await Promise.all(
        categories.map(async (category) => {
            if (category.type === "dir") {
                const { data: articles } = await octokit.repos.getContent({
                    owner: username,
                    repo: repoName,
                    path: `blog/${category.name}`,
                });

                if (!Array.isArray(articles)) {
                    return undefined;
                }

                const articlesData = await Promise.all(
                    articles.map(async (article) => {
                        if (
                            article.type === "file" &&
                            article.name.endsWith(".md")
                        ) {
                            const htmlContent = await getMarkdownAsHtml(
                                username,
                                repoName,
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
                        (article) => article !== undefined
                    ),
                };
            }
            return undefined;
        })
    );

    return categoriesData.filter((category) => category !== undefined);
};

const getMarkdownAsHtml = async (owner: string, repo: string, path: string) => {
    const { data: fileData } = await octokit.repos.getContent({
        owner,
        repo,
        path,
    });

    if ("content" in fileData) {
        const fileContent = Buffer.from(fileData.content, "base64").toString(
            "utf-8"
        );

        const { data: htmlContent } = await octokit.markdown.render({
            text: fileContent,
            mode: "gfm",
        });

        return htmlContent;
    }

    throw new Error("Unexpected response format");
};
