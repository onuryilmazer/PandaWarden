import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getArticles } from "../../services/ArticleService";
import "./Dashboard.css";
import ErrorMessage from "../../components/ErrorMessage";
import PageSwitcher from "../../components/PageSwitcher";

function Dashboard() {
    return(
        <div className="page-container">
            <div className="page-title"> <h1>Dashboard</h1> </div>
            <RecurringScans />
            <RecentArticles />
        </div>
    )
}

function RecurringScans() {
    return(
        <div className="block-container">
            <div className="block-header">
                <h2>Monitoring requests</h2>
                <div className="options">
                    <button>➕</button>
                    <button>🖊️</button>
                </div>
                
            </div>
            <Scan />
            <Scan />
            <Scan />
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

function RecentArticles() {
    const auth = useAuth();
    const [articles, setArticles] = useState([]);
    const [page, setPage] = useState(1);
    const [numberOfPages, setNumberOfPages] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [thrownError, setThrownError] = useState(null);  //set from async function and thrown again, so the error boundary can catch it.
    const recentArticlesRef = useRef(null);

    if (thrownError) throw thrownError;

    useEffect(() => {
        let discard = false;
        const limit = 5;
        let offset = (page - 1) * limit;

        getArticles({offset: offset, limit: limit, token: auth.token}).then(result => {
            if (discard) return;

            if (result.ok) {
                setArticles(result.articles);
                setNumberOfPages(result.numberOfPages);
            }
            else {
                if (result.status == 401) {
                    setThrownError(auth.expiredLoginErrorGenerator(result.error));
                    return;
                }

                setErrorMessage(result.error);
            }
        });

        return () => discard = true;
    }, [auth, page]);

    return(
        <div className="block-container" ref={recentArticlesRef}>
            <div className="block-header"> <h2>Recent articles</h2> </div>
            <PageSwitcher currentPage={page} setCurrentPage={setPage} numberOfPages={numberOfPages} scrollOnSwitchRef={recentArticlesRef}/>
            { errorMessage && <ErrorMessage text={errorMessage} /> }
            { articles.map(article => <Article key={article.id} article={article} />) }
            <PageSwitcher currentPage={page} setCurrentPage={setPage} numberOfPages={numberOfPages} scrollOnSwitchRef={recentArticlesRef}/>
        </div>
    )
}


function Article({article}) {
    return(
        <div className="article">
            <div className="thumbnail">
                <img src={article.catalog_screenshot_path}></img>
            </div>
            <div className="info">
                <div className="article-title">{article.catalog_title}</div>
                <div className="article-details">{article.catalog_description}</div>
                <div className="article-created-at">Collected at: {new Date(article.created_at).toLocaleString()}</div>
                <div className="article-source">From: {article.source_name}</div>
            </div>
        </div>
    )
}

export default Dashboard;