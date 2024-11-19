import "./Account.css";

import { useEffect, useState } from "react";
import { getDetails } from "../../../services/UserService";
import { useAuth } from "../../../context/AuthContext";

function Account() {
    const [details, setDetails] = useState(null);
    const auth = useAuth();

    const [thrownError, setThrownError] = useState(null);  //set from async function and thrown again, so the error boundary can catch it.
    if (thrownError) throw thrownError;

    useEffect(() => {
        let ignore = false;

        getDetails(auth.token)
            .then(response => {if (!ignore) setDetails(response)})
            .catch((e) => {if (!ignore) setThrownError(e)});

        return () => ignore = true;
    }, [auth.token]);

    return(
        <div className="page-container">
            <div className="page-title"> <h1>User Details</h1> </div>
            <div className="block-container">
                <div className="user-details-container">
                    <div className="row zebra-lines">
                        <p>User ID:</p> <p>{details?.id}</p>
                    </div>
                    <div className="row zebra-lines">
                        <p>Username:</p> <p>{details?.username}</p>
                    </div>
                    <div className="row zebra-lines">
                        <p>E-mail:</p> <p>{details?.email}</p>
                    </div>
                    <div className="row zebra-lines">
                        <p>Registration date:</p> <p>{details && new Date(details?.created_at).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default Account;