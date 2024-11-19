import "./Dashboard.css";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getArticles } from "../../../services/ArticleService";
import ErrorMessage from "../../../components/ErrorMessage";
import PageSwitcher from "../../../components/PageSwitcher";
import { LoginExpiredError } from "../../../services/ErrorClasses";
import { ArticleTeaser } from "../../../components/ArticleTeaser";
import ScrapeTimer from "./ScrapeTimer";
import MonitoringRequests from "./MonitoringRequests";

function Dashboard() {
    return(
        <div className="page-container">
            <div className="page-title"> <h1>Dashboard</h1> </div>
            <MonitoringRequests />
            <ScrapeTimer />
            <RecentArticles />
        </div>
    )
}

function RecentArticles() {
    if (!sessionStorage.getItem("recentArticlesPage")) sessionStorage.setItem("recentArticlesPage", 1);

    const auth = useAuth();
    const [articles, setArticles] = useState([]);
    const [page, setPage] = useState(parseInt(sessionStorage.getItem("recentArticlesPage")));

    const setPageWrapper = (page) => {
        setPage(page);
        sessionStorage.setItem("recentArticlesPage", page);
    }

    const [numberOfPages, setNumberOfPages] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const recentArticlesRef = useRef(null);

    const [thrownError, setThrownError] = useState(null);  //set from async function and thrown again, so the error boundary can catch it.
    if (thrownError) throw thrownError;

    useEffect(() => {
        let discard = false;
        const limit = 5;
        let offset = (page - 1) * limit;

        getArticles({offset: offset, limit: limit, token: auth.token}).then(result => {
            if (discard) return;

            setArticles(result.articles);
            setNumberOfPages(result.numberOfPages);
            setErrorMessage("");
        }).catch(e => {         
            setErrorMessage(e.message);
            setArticles([]);

            //TODO rethrow if login expired error (real expired error, not just 401)
        });

        return () => discard = true;
    }, [auth, page]);

    return(
        <div className="block-container" ref={recentArticlesRef}>
            <div className="block-header"> <h2>Recent articles</h2> </div>
            <PageSwitcher currentPage={page} setCurrentPage={setPageWrapper} numberOfPages={numberOfPages} scrollOnSwitchRef={recentArticlesRef}/>
            { errorMessage && <ErrorMessage text={errorMessage} /> }
            { articles.map(article => <ArticleTeaser key={article.id} article={article} />) }
            <PageSwitcher currentPage={page} setCurrentPage={setPageWrapper} numberOfPages={numberOfPages} scrollOnSwitchRef={recentArticlesRef}/>
        </div>
    )
}


export default Dashboard;