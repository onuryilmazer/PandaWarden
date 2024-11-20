import "./CreateScan.css";

import { useState } from "react";
import { Link } from "react-router-dom";
import { createMonitoringRequest } from "../../../services/UserService";
import { useAuth } from "../../../context/AuthContext";
import ErrorMessage from "../../../components/ErrorMessage";
import { LoginExpiredError } from "../../../services/ErrorClasses";
import SuccessMessage from "../../../components/SuccessMessage";
import Tooltip from "../../../components/Tooltip";

const TOOLTIP_TEXT = {
    searchParams: "The parameters you choose will be normalized before the search to give you better results. This means that you do not have to worry about capitalization, punctuation, or word conjugations. For example, if your search term is 'wolf', you will also get results for 'wolves'."
}

function CreateScan() {
    const auth = useAuth();
    const [sources, setSources] = useState([{id: 1, name: "DW"}]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [thrownError, setThrownError] = useState(null);  //set from async function and thrown again, so the error boundary can catch it.
    if (thrownError) throw thrownError;

    const handleSubmit = async (event) => {
        event.preventDefault();
        const elements = event.currentTarget.elements;
        console.log("Form submitted with values: ", elements);

        await createMonitoringRequest(
            auth.token,
            {   keywords: elements.keywords.value.split(",").map(keyword => keyword.trim()),
                repeatIntervalSeconds: parseInt(elements.notificationFreq.value),
                sourceIds: sources.map(source => source.id)
                /* notificationType: elements.notificationType.value, */ }
        )
        .then(() => {
            setSuccess("Monitoring request created successfully.");
            setError("");
        })
        .catch(e => {
            if (e instanceof LoginExpiredError) {
                setThrownError(e);
                return;
            }
            setError(e.message)
        });
    }

    return (
        <div className="page-container">
            <div className="page-title"> <h1>Create monitoring request</h1> </div>
            <Link to={-1}>&lt;- Go Back</Link>
            <form style={{width: "100%"}} onSubmit={handleSubmit}>
            <div className="block-container">
                <div className="block-row" ><p>Topics (comma-separated): <Tooltip message={TOOLTIP_TEXT.searchParams} /></p> <input type="text" name="keywords" placeholder="NVIDIA, Amazon, Lithium mines, Military coup..."></input></div>
                
                <div className="block-row" >    
                    <p>Notification type:</p>
                        <select name="notificationType" defaultValue={"email"} required>
                            <option value={"email"}>E-Mail</option>
                            <option disabled>SMS (Coming soon)</option>
                            <option disabled>Whatsapp message (Coming soon)</option>
                        </select>
                </div>

                <div className="block-row" >    
                    <p>Notification frequency:</p>
                        <select name="notificationFreq" defaultValue={ 24*60*60 } required>
                            <option value={15*60}>Every 15 Minutes</option>
                            <option value={60*60}>Every Hour</option>
                            <option value={ 12*60*60 }>Twice a day</option>
                            <option value={ 24*60*60 }>Daily</option>
                        </select>
                </div>

                <div className="block-row">
                    <p>Search sources:</p>
                    <div className="sources-checkbox-group-container">
                        <div className="sources-checkbox-container">
                            <input type="checkbox" checked></input> All
                        </div>
                            {/* {sources.map((source) => {
                                return (
                                    <div className="sources-checkbox-container" key={source.id}>
                                        <input type="checkbox" name={source.id} value={"on"} disabled></input> {source.name}
                                    </div>
                                )
                            })} */}
                    </div>
                </div>

                {/* <div className="block-row"><input type="checkbox" disabled></input> <p>Use local languages when searching non-english websites (coming soon)</p></div> */}
                
                <div className="block-row"><button type="submit">Create scan</button></div>
            </div>
            </form>
            {success && <SuccessMessage text={success}/>}
            {error && <ErrorMessage text={error} />}
        </div>
    )
}

export default CreateScan;