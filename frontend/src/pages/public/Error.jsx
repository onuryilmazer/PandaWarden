import { useEffect, useState } from "react";
import { useNavigate, useRouteError } from "react-router-dom";

import "./Error.css";
import ErrorMessage from "../../components/ErrorMessage";

function Error() {
    const navigate = useNavigate();
    const error = useRouteError();
    const [remainingSeconds, setRemainingSeconds] = useState(10);
    

    useEffect(() => {
        let cancel = false;
        const redirectTo = error.redirectTo ? error.redirectTo : -1;

        setTimeout(() => {
            if (cancel) return;
            
            if (remainingSeconds > 1) setRemainingSeconds(s => s - 1);
            else {
                if (error.action) error.action();
                navigate(redirectTo);
            }

        }, 1000);

        return () => {cancel = true;}
    }, [remainingSeconds, error, navigate]);

    return (
        <div className="page-container">
            <div className="page-title"> <h1>Error</h1> </div>
            <ErrorMessage text={error.statusText || error.message} />
            <p>You will be redirected to {error.redirectToDescription ? error.redirectToDescription : "the previous page"} in {remainingSeconds} seconds.</p>
        </div>
    );
}

export default Error;