import "./LoadingMessage.css";

function LoadingMessage({text}) {
    return (
        <div className="loading-message-container">
            <div className="loader"></div>
            <div className="loading-message-text">{text}</div>
        </div>
    )
}

export default LoadingMessage;