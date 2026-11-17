import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import EventCard from "./EventCard";
import EventDetails from "./EventDetails";

// List of upcoming events with search, date filter and sort (Regular User / Administrator)
function EventBrowser() {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [date, setDate] = useState("");
    const [sort, setSort] = useState("date_desc");
    const [error, setError] = useState("");
    const [selectedEventId, setSelectedEventId] = useState(null);

    // Reload the list when the search, date or sort changes (short delay while typing)
    useEffect(() => {
        const controller = new AbortController();

        const timer = setTimeout(async () => {
            const params = new URLSearchParams();
            if (search.trim() !== "") params.set("search", search.trim());
            if (date !== "") params.set("date", date);
            params.set("sort", sort);

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
    }, [search, date, sort]);

    // Open the date picker when the field is clicked
    function openPicker(e) {
        try {
            e.target.showPicker();
        } catch (err) {
            // Older browser without showPicker()
        }
    }

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
                <div className="two-column-grid">
                    <div className="form-group">
                        <label>Filter by date</label>
                        <input 
                            type="date"
                            max="9999-12-31"
                            value={date}
                            onClick={openPicker}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Sort by date</label>
                        <select value={sort} onChange={(e) => setSort(e.target.value)}>
                            <option value="date_asc">Oldest to Newest</option>
                            <option value="date_desc">Newest to Oldest</option>
                        </select>
                    </div>
                </div>
                {(search !== "" || date !== "") && (
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => { setSearch(""); setDate(""); }}
                    >
                        Clear filter
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
