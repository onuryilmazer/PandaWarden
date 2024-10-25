import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./404.css";

function NotFound404() {
    const navigate = useNavigate();
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
        <div className="notfound-container">
            <h1>Page not found</h1>
            <p>You will be redirected to the previous page in {remainingSeconds} seconds.</p>
        </div>
    );
}

export default NotFound404;