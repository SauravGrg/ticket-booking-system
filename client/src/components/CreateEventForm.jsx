import { useState } from "react";
import { API_BASE_URL } from "../config";

// "Create New Event" form (Organizer only)
function CreateEventForm({ setMessage, fetchOrganizerEvents }) {
    const [eventTitle, setEventTitle] = useState("");
    const [eventDescription, setEventDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventTime, setEventTime] = useState("");
    const [eventLocation, setEventLocation] = useState("");
    const [eventCapacity, setEventCapacity] = useState("");

    // Open the date/time picker when the field is clicked (typing still works)
    function openPicker(e) {
        try {
            e.target.showPicker();
        } catch (err) {
            // Older browsers without showPicker() just keep the normal field
        }
    }

    // Create a new event
    async function createEvent(event) {
        event.preventDefault();

        const response = await fetch(`${API_BASE_URL}/api/events`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: eventTitle,
                description: eventDescription,
                date: eventDate,
                time: eventTime,
                location: eventLocation,
                capacity: eventCapacity
            })
        });

        const data = await response.json();

        setMessage(data.message);

            if (response.ok) {
                setEventTitle("");
                setEventDescription("");
                setEventDate("");
                setEventTime("");
                setEventLocation("");
                setEventCapacity("");
                fetchOrganizerEvents();
            }
    }

    return (
        <div className="content-card">
            <h3>+ Create New Event</h3>
            <form onSubmit={createEvent}>
                <div className="two-column-grid">
                <div>
                    <div className="form-group">
                    <label>Event Title</label>
                    <input
                        type="text"
                        required
                        maxLength="200"
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                    />
                    </div>
                    <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        required
                        min={new Date().toLocaleDateString("en-CA")}
                        max="9999-12-31"
                        value={eventDate}
                        onClick={openPicker}
                        onChange={(e) => setEventDate(e.target.value)}
                    />
                    </div>
                    <div className="form-group">
                    <label>Location</label>
                    <input
                        type="text"
                        required
                        maxLength="1000"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                    />
                    </div>
                </div>
                <div>
                    <div className="form-group">
                    <label>Description</label>
                    <textarea
                        rows="3"
                        required
                        maxLength="5000"
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                    />
                    </div>
                    <div className="form-group">
                    <label>Time</label>
                    <input
                        type="time"
                        required
                        value={eventTime}
                        onClick={openPicker}
                        onChange={(e) => setEventTime(e.target.value)}
                    />
                    </div>
                    <div className="form-group">
                    <label>Capacity</label>
                    <input
                        type="number"
                        required
                        min="1"
                        max="100000"
                        value={eventCapacity}
                        onChange={(e) => setEventCapacity(e.target.value)}
                    />
                    </div>
                </div>
                </div>
                <button type="submit" className="btn-primary" style={{ maxWidth: "250px", display: "block", margin: "10px auto 0" }}>
                Submit Event
                </button>
            </form>
        </div>
  );
}

export default CreateEventForm;