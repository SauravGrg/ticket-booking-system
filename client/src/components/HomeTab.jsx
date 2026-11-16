import CreateEventForm from "./CreateEventForm";
import EventCard from "./EventCard";
import EventBrowser from "./EventBrowser"

// HOME tab: create-event form (Organizer) + event listings
function HomeTab({ role, myEvents, setMessage, fetchOrganizerEvents }) {
    if (role === "Regular User" || role === "Administrator") {
        return (
            <div>
                <h3 style={{ marginBottom: "15px" }}>Upcoming Events</h3>
                <EventBrowser />
            </div>
        );
    }
    return (
        <div>
            {role === "Organizer" && (
                <CreateEventForm
                    setMessage={setMessage}
                    fetchOrganizerEvents={fetchOrganizerEvents}
                />
            )}

            <div>
                <h3 style={{ marginBottom: "15px" }}>Your Current Listings</h3>
                {myEvents.length === 0 ? (
                    <p style={{ color: "#aaa" }}>No events created yet.</p>
                ) : (
                    <div className="event-grid">
                        {myEvents.map((ev) => (
                        <EventCard key={ev.event_id} ev={ev} />
                    ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default HomeTab;
