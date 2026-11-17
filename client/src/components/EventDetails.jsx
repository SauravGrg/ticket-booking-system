import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { formatTime } from "../utils/formatTime";

// Full details of one event
function EventDetails({ eventId, onBack }) {
    const [event, setEvent] = useState(null);
    const [error, setError] = useState("");

    // Load the event whenever a different one is selected
    useEffect(() => {
        async function loadEvent() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
                credentials: "include"
            });
            const data = await response.json();

            if (response.ok) {
                setEvent(data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error("Event details error:", err);
            setError("Failed to load the event.");
        }
        }

        loadEvent();
    }, [eventId]);

    return (
        <div>
        <button type="button" className="btn-secondary" onClick={onBack}>
            &larr; Back to events
        </button>

        {error && <p style={{ marginTop: "15px", color: "#c53030" }}>{error}</p>}

        {event && (
            <div className="content-card" style={{ marginTop: "15px" }}>
            <h3>{event.title}</h3>
            <p><strong>Description:</strong> {event.description}</p>
            <p>
                <strong>Date &amp; Time:</strong> {event.date ? event.date.substring(0, 10) : ""} at {formatTime(event.time)}
            </p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Seats Left:</strong> {event.remaining_capacity}</p>
            {event.remaining_capacity <= 0 && (
                <p style={{ color: "#c53030", fontWeight: "600" }}>This event is fully booked</p>
            )}
            </div>
        )}
        </div>
    );
}

export default EventDetails;
