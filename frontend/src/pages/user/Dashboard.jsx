import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getArticles } from "../../services/ArticleService";
import "./Dashboard.css";

function Dashboard() {
    return(
        <div className="dashboard-container">
            <div className="header">
                <h1>My Scans</h1> <button>+</button>
            </div>
            <RecurringScans />
            <AllArticles />
        </div>
    )

}

function RecurringScans() {
    return(
        <div className="scan-container">
            <h2>Monitoring requests</h2>
            <Scan />
            <Scan />
            <Scan />
        </div>
    )
}

function AllArticles() {
    const auth = useAuth();
    const [articles, setArticles] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        getArticles({offset: 0, token: auth.token}).then(result => {
            if (result.ok) {
                setArticles(result.articles);
            }
            else {
                setErrorMessage(result.error);
            }
        });
    }, [auth.token]);

    return(
        <div className="scan-container">
            <h2>All articles</h2>
            {
                articles.map(article => <Article key={article.id} article={article} />)
            }
        </div>
    )
}

function Scan() {
    return(
        <div className="scan-entry">
            <span>Name</span>
            <span>Date: 01.01.24</span>
            <span>Results: 0 New / 0 Total</span>
        </div>
    )
}

function Article({article}) {
    return(
        <div className="article">
            <img src={article.catalog_screenshot_path}></img>
            <span className="article-title">{article.catalog_title}</span>
            <span className="article-details">{article.catalog_description}</span>
            <span className="article-time">{article.catalog_time}</span>
        </div>
    )
}

export default Dashboard;