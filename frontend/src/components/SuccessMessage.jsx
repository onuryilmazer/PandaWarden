import "./SuccessMessage.css";

function SuccessMessage({text}) {
    return (
        <div className="success-message-container">
            <span className="success-message-text">{text}</span>
        </div>
    )
}

export default SuccessMessage;