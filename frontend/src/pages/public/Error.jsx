import { useEffect, useState } from "react";
import { useNavigate, useRouteError } from "react-router-dom";

import "./Error.css";

function Error() {
    const navigate = useNavigate();
    const error = useRouteError();
    const [remainingSeconds, setRemainingSeconds] = useState(5);
    

    useEffect(() => {
        let cancel = false;

        setTimeout(() => {
            if (cancel) return;
            
            if (remainingSeconds > 1) setRemainingSeconds(s => s - 1);
            else navigate(-1);

        }, 1000);

        return () => {cancel = true;}
    }, [remainingSeconds]);

    return (
        <div className="error-container">
            <h1>Error</h1>
            <p>{error.statusText || error.message}</p>
            <p>You will be redirected to the previous page in {remainingSeconds} seconds.</p>
        </div>
    );
}

export default Error;