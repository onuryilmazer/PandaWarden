import "./SuccessMessage.css";

function SuccessMessage({text}) {
    return (
        <div className="success-message-container">
            <div className="success-message-icon">✔</div>
            <span className="success-message-text">{text}</span>
        </div>
    )
}

export default SuccessMessage;