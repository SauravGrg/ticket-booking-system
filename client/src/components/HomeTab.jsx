import CreateEventForm from "./CreateEventForm";
import EventCard from "./EventCard";

// HOME tab: create-event form (Organizer) + event listings
function HomeTab({ role, myEvents, setMessage, fetchOrganizerEvents }) {
    return (
        <div>
            {role === "Organizer" && (
                <CreateEventForm
                    setMessage={setMessage}
                    fetchOrganizerEvents={fetchOrganizerEvents}
                />
            )}

            <div>
                <h3 style={{ marginBottom: "15px" }}>
                    {role === "Organizer" ? "Your Current Listings" : "Upcoming Events"}
                </h3>
                {role === "Organizer" && myEvents.length === 0 ? (
                    <p style={{ color: "#aaa" }}>No events created yet.</p>
                ) : (
                <div className="event-grid">
                    {myEvents.map((ev) => (
                        <EventCard key={ev.event_id} ev={ev} />
                    ))}
                </div>
                )}
                {role !== "Organizer" && (
                    <div className="content-card">

                    </div>
                )}
            </div>
        </div>
    );
}

export default HomeTab;
