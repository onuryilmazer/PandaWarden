import "./Dashboard.css";

function Dashboard() {
    return(
        <div className="dashboard-container">
            <div className="header">
                <h1>My Scans</h1> <button>+</button>
            </div>
            <RecurringScans />
            <OneTimeScans />
        </div>
    )

}

function RecurringScans() {
    return(
        <div className="scan-container">
            <h2>Recurring scans</h2>
            <Scan />
            <Scan />
            <Scan />
        </div>
    )
}

function OneTimeScans() {
    return(
        <div className="scan-container">
            <h2>One-time scans</h2>
            <Scan />
            <Scan />
            <Scan />
        </div>
    )
}

function Scan() {
    return(
        <div className="scan-entry">
            <span>Name</span>
            <span>Date: 01.01.24</span>
            <span>Results: 0 New / 0 Total</span>
        </div>
    )
}

export default Dashboard;