import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getArticles, getNextScrapeTime } from "../../services/ArticleService";
import "./Dashboard.css";
import ErrorMessage from "../../components/ErrorMessage";
import PageSwitcher from "../../components/PageSwitcher";
import { Link } from "react-router-dom";
import { LoginExpiredError } from "../../services/ErrorClasses";
import { getMonitoringRequestsOfUser, toggleMonitoringRequestActive, deleteMonitoringRequest } from "../../services/UserService";
import { ArticleTeaser } from "./ArticleTeaser";

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

function ScrapeTimer() {
    const auth = useAuth();
    
    const [triggerRequest, setTriggerRequest] = useState(1);
    const [errorMessage, setErrorMessage] = useState("");

    const timerRef = useRef(null);
    const secondsDisplayRef = useRef(null);

    useEffect(() => {
        let discard = false;
        
        getNextScrapeTime({token: auth.token})
            .then(result => { 
                if(discard) return;
                timerRef.current = setInterval( () => {
                    console.log("timer running");
                    if (!secondsDisplayRef.current) return;

                    let seconds = Math.floor((new Date(result) - new Date()) / 1000);
                    
                    if (seconds <= 0) {
                        seconds = 0;
                        clearInterval(timerRef.current);
                        setTriggerRequest(s => s + 1);
                    }

                    secondsDisplayRef.current.innerText = `${Math.floor(seconds / 60)}m ${seconds%60}s`;
                }, 1000);
            })
            .catch(e => { setErrorMessage(e.message); });

        return () => {discard = true; clearInterval(timerRef.current);};
    }, [auth.token, triggerRequest]);

    return(
        <div className="block-container">
            <div className="block-header"> <h2>Collection timer</h2> </div>
            <div className="block-row">
                {
                    errorMessage ? <ErrorMessage text={errorMessage} /> :
                    <p>Next collection in: <span ref={secondsDisplayRef}>Loading...</span> </p>
                }
            </div>
        </div>
    )
}

function MonitoringRequests() {
    const auth = useAuth();
    const [monitoringRequests, setMonitoringRequests] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [editing, setEditing] = useState(false);

    const toggleRequestHandler = async (e, id) => {
        e.preventDefault();

        toggleMonitoringRequestActive(auth.token, id).then( (activeness) => {
            setMonitoringRequests(requests => requests.map(request => request.id === id ? {...request, active: activeness} : request));
        }).catch(e =>  setErrorMessage(e.message));
    }

    const deleteRequestHandler = async (e, id) => {
        e.preventDefault();

        deleteMonitoringRequest(auth.token, id).then( () => {
            setMonitoringRequests(requests => requests.filter(request => request.id !== id));
        }).catch(e =>  setErrorMessage(e.message));
    }

    useState(() => {
        let discard = false;

        getMonitoringRequestsOfUser(auth.token).then(result => {
            if (discard) return;
            setMonitoringRequests(result);
        }).catch(e => {
            console.error(e);
        });

        return () => discard = true;
    }, [auth.token]);

    return(
        <div className="block-container">
            <div className="block-header">
                <h2>Monitoring requests</h2>
                <div className="options">
                    <Link to={"/createScan"}><button>➕</button></Link>
                    <button onClick={() => setEditing(s => !s)} >🖊️</button>
                </div>
                
            </div>
            { errorMessage && <ErrorMessage text={errorMessage} /> }
            { monitoringRequests.length === 0 && <div className="block-row"> <p>No monitoring requests found.</p> </div> }
            { monitoringRequests.map(request => <Scan key={request.id} {...request} editing={editing} toggleRequest={toggleRequestHandler} deleteRequest={deleteRequestHandler} />) }
        </div>
    )
}

function Scan({id, active, execution_count, last_execution, repeat_interval, keywords, sources, resultCount, editing, toggleRequest, deleteRequest}) {
    return(
        <Link to={`/scan/${id}`} className="wrapper-link">
        <div className="scan-entry zebra-lines box-highlight-on-hover">
            <div className="info">
                <div className="id">
                    <div className="value">{id}</div>
                    <div className="description">ID</div>
                </div>
                <div className="status">
                    <div className="value">{active ? "▶️" : "⏸️"}</div>
                    <div className="description">{active ? "Active" : "Paused"}</div>
                </div>
                <div className="results">
                    <div className="value">{resultCount}</div>
                    <div className="description">Articles found</div>
                </div>
                <div className="keywords">
                    <div className="value">{keywords.length > 0 ? keywords.join(", ") : "N/A"} </div>
                    <div className="description">Keywords</div>
                </div>
                <div className="details">
                    <span>Last execution: {new Date(last_execution).toLocaleString()}</span>
                    <span>Repeats every: {repeat_interval?.hours ? repeat_interval.hours + " hours" : ""} {repeat_interval?.minutes ? repeat_interval.minutes + " minutes" : ""} {repeat_interval?.seconds ? repeat_interval.seconds + " seconds" : ""} </span>
                    <span>Executed: {execution_count} times</span>
                    <span>Collection sources: {sources.join(", ")}</span>
                </div>
            </div>
            { editing && 
                <div className="options"> 
                    <button onClick={(e) => toggleRequest(e, id)}>⏯️</button> 
                    <button onClick={(e) => deleteRequest(e, id)} >🗑️</button> 
                </div> 
            }
        </div>
        </Link>
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

    /* if (recentArticlesRef.current && sessionStorage.getItem("recentArticlesPage")) { 
            setTimeout(() => {
                recentArticlesRef.current.scrollIntoView({behavior: "smooth"});
            }, 250);
    } */

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
            setThrownError(null);
            setErrorMessage("");
        }).catch(e => {         
            setErrorMessage(e.message);
            setArticles([]);

            if (e instanceof LoginExpiredError) setThrownError(e);  //rethrow
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