import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import EventCard from "./EventCard";
import EventDetails from "./EventDetails";

// List of upcoming events (Regular User / Administrator)
function EventBrowser() {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [selectedEventId, setSelectedEventId] = useState(null);

    // Load the events when the screen first appears
    useEffect(() => {
        const controller = new AbortController();

        const timer = setTimeout(async () => {
        const params = new URLSearchParams();
            if (search.trim() !== "") params.set("search", search.trim());

            try {
                const response = await fetch(`${API_BASE_URL}/api/events?${params.toString()}`, {
                    credentials: "include",
                    signal: controller.signal
                });
                const data = await response.json();

                if (response.ok) {
                    setEvents(data);
                    setError("");
                } else {
                    setError(data.message);
                }
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Event list error:", err);
                    setError("Failed to load events.");
                }
            }
            }, 300);

            // Cancel the old request if a newer one starts
            return () => {
                clearTimeout(timer);
                controller.abort();
            };
        }, [search]);

    // Show one event's details instead of the list
    if (selectedEventId !== null) {
        return (
            <EventDetails 
                eventId={selectedEventId}
                onBack={() => setSelectedEventId(null)}
            />
        )
    }

    return (
        <div>
            <div className="content-card">
                <div className="form-group">
                    <label>Search (title or location)</label>
                    <input 
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {search !== "" && (
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setSearch("")}
                    >
                        Clear search
                    </button>
                )}
            </div>

        {error && <p style={{ color: "#c53030", marginBottom: "15px" }}>{error}</p>}

        {events.length === 0 && !error ? (
            <p style={{ color: "#aaa" }}>No events found.</p>
        ) : (
            <div className="event-grid">
                {events.map((ev) => (
                    <EventCard 
                        key={ev.event_id} 
                        ev={ev} 
                        onViewDetails={setSelectedEventId}
                    />
                ))}
            </div>
        )}
        </div>
    );
}

export default EventBrowser;
