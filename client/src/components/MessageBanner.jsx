// Success / error notification box
function MessageBanner({ message, style }) {
    if (!message) return null;

    return (
        <div
            style={{
                ...style,
                padding: "10px 14px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "600",
                backgroundColor: message.toLowerCase().includes("success") ? "#e6fffa" : "#fff5f5",
                color: message.toLowerCase().includes("success") ? "#234e52" : "#c53030",
                border: message.toLowerCase().includes("success") ? "1px solid #b2f5ea" : "1px solid #fed7d7"
            }}
        >
            {message}
        </div>
    );
}

export default MessageBanner;
