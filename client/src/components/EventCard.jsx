// A single event card
// Optional: onViewDetails shows a "View Details" button,
// and remaining_capacity (when the server sends it) shows the seats left.
function EventCard({ ev, onViewDetails }) {
    return (
        <div className="event-card">
            <div>
                <h4>{ev.title}</h4>
                <p>{ev.description}</p>
                <p><strong>Date:</strong> {ev.date ? ev.date.substring(0, 10) : ""} at {ev.time}</p>
                <p><strong>Location:</strong> {ev.location}</p>
            </div>
        <div>
            <span className="badge">Capacity: {ev.capacity}</span>
            {ev.remaining_capacity !== undefined && (
            <span className="badge" style={{ marginLeft: "8px" }}>
                Remaining Seats: {ev.remaining_capacity}
            </span>
            )}
            <span className="badge" style={{ marginLeft: "8px", backgroundColor: "#c6f6d5", color: "#22543d" }}>
                {ev.status}
            </span>
            {onViewDetails && (
            <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: "10px" }}
                onClick={() => onViewDetails(ev.event_id)}
            >
                View Details
            </button>
            )}
        </div>
        </div>
    );
}

export default EventCard;
