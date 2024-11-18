import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { getMonitoringRequestOfUser } from "../../services/UserService";
import { ArticleTeaser } from "./ArticleTeaser";

function Scan() {
    const auth = useAuth();
    const { id } = useParams();
    const [scanResults, setScanResults] = useState(null);

    const [thrownError, setThrownError] = useState(null);  //set from async function and thrown again, so the error boundary can catch it.
    if (thrownError) throw thrownError;

    useEffect(() => {
        let discard = false;

        getMonitoringRequestOfUser(auth.token, id)
            .then(scanResults => {
                if (discard) return;

                setScanResults(scanResults);
            })
            .catch(e => {setThrownError(e);});

        return () => {discard = true};
    }, [id, auth.token]);

    return (
        <div className="page-container">
            <div className="page-title"> <h1>Scan {scanResults?.id}</h1> </div>
            <Link to={-1}>Return to dashboard</Link>

            <div className="block-container">
                <div>
                    <p>Active: {scanResults?.active}</p>
                    <p>Execution count: {scanResults?.execution_count}</p>
                    <p>Last execution: {scanResults?.last_execution}</p>
                    <span>Repeats every: {scanResults?.repeat_interval?.hours ? scanResults?.repeat_interval?.hours + " hours" : ""} {scanResults?.repeat_interval?.minutes ? scanResults?.repeat_interval?.minutes + " minutes" : ""} {scanResults?.repeat_interval?.seconds ? scanResults?.repeat_interval?.seconds + " seconds" : ""} </span>
                    <p>Keywords: {scanResults?.keywords?.join(", ")}</p>
                    <p>Last execution: {scanResults?.last_execution}</p>
                    <p>Sources: {scanResults?.sources?.join(", ")}</p>
                    <p>Number of results: {scanResults?.resultCount}</p>
                </div>

            </div>

            <div className="block-container">
                {scanResults?.results?.length === 0 && <p>No results yet.</p>}
                {scanResults?.results?.map(result => <ArticleTeaser key={result.id} article={result} />)}
            </div>
        </div>
    )
}

export default Scan;