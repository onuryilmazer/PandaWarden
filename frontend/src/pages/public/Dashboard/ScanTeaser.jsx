import { Link } from "react-router-dom";

function ScanTeaser({id, active, execution_count, last_execution, repeat_interval, keywords, sources, resultCount, auto_generated, editing, toggleRequest, deleteRequest}) {
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
            {auto_generated && <div className="placeholder">This is an automatically generated placeholder. Feel free to delete it after you are done exploring!</div>}
        </div>
        </Link>
    )
}

export default ScanTeaser;