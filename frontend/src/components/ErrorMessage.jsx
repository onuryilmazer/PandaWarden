import "./ErrorMessage.css";

function ErrorMessage({text}) {
    return (
        <div className="error-message-container">
            <span className="error-message-text">{text}</span>
        </div>
    )
}

export default ErrorMessage;