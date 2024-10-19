
function Dashboard() {
    return(
        <>
            <div>
                <h1>My Scans</h1>
                <button>+</button>
            </div>
            <RecurringScans />
            <OneTimeScans />
        </>
    )

}

function RecurringScans() {
    return(
        <div>
            <h2>Recurring scans</h2>
            <Scan />
            <Scan />
            <Scan />
        </div>
    )
}

function OneTimeScans() {
    return(
        <div>
            <h2>One-time scans</h2>
            <Scan />
            <Scan />
            <Scan />
        </div>
    )
}

function Scan() {
    return(
        <div>
            <span>Name</span>
            <span>Date: 01.01.24</span>
            <span>Results: 0 New / 0 Total</span>
        </div>
    )
}

export default Dashboard;