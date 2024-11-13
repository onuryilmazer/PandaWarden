import "./CreateScan.css";

import { useState } from "react";
import { Link } from "react-router-dom";

function CreateScan() {
    const [sources, setSources] = useState([{id: 1, name: "DW"}, {id: 2, name: "BBC"}, {id: 3, name: "NYT"}, {id: 4, name: "Al Jazeera"}, {id: 5, name: "Reuters"}]);

    

    return (
        <div className="page-container">
            <div className="page-title"> <h1>Create monitoring request</h1> </div>
            <Link to={-1}><a>&lt;- Go Back</a></Link>
            <form style={{width: "100%"}}>
            <div className="block-container">
                <div className="block-row" ><p>Topics (comma-separated):</p> <input type="text" placeholder="NVIDIA, Amazon, Lithium mines, Military coup..."></input></div>
                
                <div className="block-row" >    
                    <p>Alert type:</p>
                        <select>
                            <option>E-Mail</option>
                            <option disabled>SMS (Coming soon)</option>
                            <option disabled>Whatsapp message (Coming soon)</option>
                        </select>
                </div>

                <div className="block-row">
                    <p>Search sources:</p>
                    <div className="sources-checkbox-group-container">
                            {sources.map((source) => {
                                return (
                                    <div className="sources-checkbox-container" key={source.id}>
                                        <input type="checkbox" ></input> {source.name}
                                    </div>
                                )
                            })}
                    </div>
                </div>

                <div className="block-row"><input type="checkbox"></input> <p>Use local languages when searching non-english websites</p></div>
                
                <div className="block-row"><button type="submit">Create scan</button></div>
            </div>
            </form>
        </div>
    )
}

export default CreateScan;