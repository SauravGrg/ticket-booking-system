import EventCard from "./EventCard";

// "My Events" tab (Organizer only)
function MyEventsTab({ myEvents }) {
    return (
        <div>
        <h3 style={{ marginBottom: "20px" }}>My Created Events</h3>
        <div className="event-grid">
            {myEvents.map((ev) => (
                <EventCard key={ev.event_id} ev={ev} />
            ))}
        </div>
        </div>
    );
}

export default MyEventsTab;
