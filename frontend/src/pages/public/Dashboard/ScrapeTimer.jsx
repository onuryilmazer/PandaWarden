import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import ErrorMessage from "../../../components/ErrorMessage";
import { getNextScrapeTime } from "../../../services/ArticleService";

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
            {
                errorMessage ? <ErrorMessage text={errorMessage} /> :
                <p>Next collection in: <span ref={secondsDisplayRef}>Loading...</span> </p>
            }
        </div>
    )
}

export default ScrapeTimer;