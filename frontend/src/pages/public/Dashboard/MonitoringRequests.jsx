import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { deleteMonitoringRequest, getMonitoringRequestsOfUser, toggleMonitoringRequestActive } from "../../../services/UserService";
import { Link } from "react-router-dom";
import ErrorMessage from "../../../components/ErrorMessage";
import ScanTeaser from "./ScanTeaser";

function MonitoringRequests() {
    const auth = useAuth();
    const [monitoringRequests, setMonitoringRequests] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [editing, setEditing] = useState(false);

    const loggedIn = !!auth.token;

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
            setErrorMessage("");
        }).catch(e => {
            setErrorMessage(e.message);
        });

        return () => discard = true;
    }, [auth.token]);

    return(
        <div className="block-container">
            <div className="block-header">
                <h2>Monitoring requests</h2>
                {
                    loggedIn && 
                    <div className="options">
                        <Link to={"/createScan"}><button>➕</button></Link>
                        <button onClick={() => setEditing(s => !s)} >🖊️</button>
                    </div>
                }
                
            </div>

            { !loggedIn 
                ? <p style={{textAlign: "center"}}>Log in to create monitoring requests.</p> 
                : <>
                    { errorMessage && <ErrorMessage text={errorMessage} /> }
                    { loggedIn && monitoringRequests.length === 0 && <div className="block-row"> <p>No monitoring requests found.</p> </div> }
                    { monitoringRequests.map(request => <ScanTeaser key={request.id} {...request} editing={editing} toggleRequest={toggleRequestHandler} deleteRequest={deleteRequestHandler} />) }
                </>        
            }

        </div>
    )
}

export default MonitoringRequests;