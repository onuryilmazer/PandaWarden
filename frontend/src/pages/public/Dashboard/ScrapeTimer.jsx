import "./ScrapeTimer.css";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import ErrorMessage from "../../../components/ErrorMessage";
import { getNextScrapeTime } from "../../../services/ArticleService";
import SuccessMessage from "../../../components/SuccessMessage";
import { triggerScraping } from "../../../services/ScrapingService";
import LoadingMessage from "../../../components/LoadingMessage";

function ScrapeTimer() {
    const auth = useAuth();
    const loggedIn = !!auth.token;
    
    const [triggerRequest, setTriggerRequest] = useState(1);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [collectionRunning, setCollectionRunning] = useState(false);

    const timerRef = useRef(null);
    const secondsDisplayRef = useRef(null);

    const handleManualScraping = () => {
        if (!loggedIn) return setErrorMessage("Only registered users can trigger manual article collection.");

        setCollectionRunning(true);
        setErrorMessage("");
        setSuccessMessage("");

        triggerScraping(auth.token)
            .then(response => {
                setErrorMessage("");
                setSuccessMessage(response);
            })
            .catch(error => {
                setSuccessMessage("");
                setErrorMessage(error.message)
            })
            .finally(() => setCollectionRunning(false));
    }

    useEffect(() => {
        let discard = false;
        
        getNextScrapeTime()
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
            <div className="timer-trigger"> 
                <p>Next scheduled collection in: <span ref={secondsDisplayRef}>{errorMessage ? " - " : "Loading..."}</span> </p> 
                <button onClick={handleManualScraping} disabled={collectionRunning} >Start collection now</button>
            </div>
            {errorMessage && <ErrorMessage text={errorMessage} />}
            {successMessage && <SuccessMessage text={successMessage} />}
            {collectionRunning && <LoadingMessage text={"Collecting articles..."} />}
        </div>
    )
}

export default ScrapeTimer;