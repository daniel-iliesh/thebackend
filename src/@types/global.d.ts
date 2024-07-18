declare interface ContentItem {
    name: string;
    path: string;
    type: string;
    content?: string;
}

declare interface Article {
    name: string;
    content: string;
}

declare interface Category {
    category: string;
    articles: Article[];
}
