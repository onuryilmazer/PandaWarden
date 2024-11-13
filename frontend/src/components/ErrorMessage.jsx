import "./ErrorMessage.css";

function ErrorMessage({text}) {
    return (
        <div className="error-message-container">
            <div className="error-message-icon">⚠</div>
            <div className="error-message-text">{text}</div>
        </div>
    )
}

export default ErrorMessage;