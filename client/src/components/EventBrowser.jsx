import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import EventCard from "./EventCard";

// List of upcoming events (Regular User / Administrator)
function EventBrowser() {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState("");

    // Load the events when the screen first appears
    useEffect(() => {
        async function loadEvents() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/events`, {
                credentials: "include"
            });
            const data = await response.json();

            if (response.ok) {
                setEvents(data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error("Event list error:", err);
            setError("Failed to load events.");
        }
        }

        loadEvents();
    }, []);

    return (
        <div>
        {error && <p style={{ color: "#c53030", marginBottom: "15px" }}>{error}</p>}

        {events.length === 0 && !error ? (
            <p style={{ color: "#aaa" }}>No events found.</p>
        ) : (
            <div className="event-grid">
                {events.map((ev) => (
                    <EventCard key={ev.event_id} ev={ev} />
                ))}
            </div>
        )}
        </div>
    );
}

export default EventBrowser;
