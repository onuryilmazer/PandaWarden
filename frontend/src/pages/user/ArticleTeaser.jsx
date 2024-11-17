import { Link } from "react-router-dom";

export function ArticleTeaser({ article }) {
    return (
        <Link to={`/dashboard/article/${article.id}`} className="wrapper-link zebra-lines">
            <div className="article box-highlight-on-hover">
                <div className="thumbnail">
                    <img src={article.catalog_screenshot_path}></img>
                </div>
                <div className="info">
                    <div className="article-title">{article.catalog_title}</div>
                    <div className="article-details">{article.catalog_description}</div>
                    <div className="article-created-at">Collected at: {new Date(article.created_at).toLocaleString()}</div>
                    <div className="article-source">From: {article.source_name}</div>
                    {article.keywords && <div className="article-keywords">Matching Keywords: {article.keywords}</div>}
                </div>
            </div>
        </Link>
    );
}
