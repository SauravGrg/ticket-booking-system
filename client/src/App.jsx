import { useState, useEffect } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Store the values entered into the registration form
function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Store messages received from the server
  const [message, setMessage] = useState("");
  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileLastName, setProfileLastName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [role, setRole] = useState("");


  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventCapacity, setEventCapacity] = useState("");

  // Organizer events list state
  const [myEvents, setMyEvents] = useState([]);

  // Check the session when the app first loads
  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/session`, {
          credentials: "include"
        });
        const data = await response.json();

        if (data.user_id) {
          setIsLoggedIn(true);
          getProfile();
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
    }

    loadSession();
  }, []);

  // Fetch organizer events if logged in as an Organizer
  useEffect(() => {
    if (isLoggedIn && role === "Organizer") {
      fetchOrganizerEvents();
    }
  }, [isLoggedIn, role]);
  
  // Send the registration information to the backend
  async function registerUser(event) {
    // Prevent the page from refreshing when the form is submitted
    event.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }, 
        // Convert the registration information into JSON
        body: JSON.stringify({
          first_name: first_name,
          last_name: last_name,
          email: email,
          password: password
        })
      });
    
      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setEmail("");
        setPassword("");
        setShowRegister(false);
      }
    } catch (err) {
        console.error(err);
        setMessage("Failed to connect to the server.")
    }
  }

  // Send the login information to the backend
  async function loginUser(event) {
    event.preventDefault();

    // Send a POST request to the login route
    const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            email: email,
            password: password
        })
    });
    
    // Get the response from the server as JSON
    const data = await response.json();

    setMessage(data.message);

    if (response.ok) {
      setIsLoggedIn(true);
      getProfile();
    }
  }

  // Get the profile information of the logged-in user
  async function getProfile() {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      credentials: "include"
    });

    const data = await response.json();

    // Display the profile information
    if (response.ok) {
      setProfileFirstName(data.first_name);
      setProfileLastName(data.last_name);
      setEmail(data.email);
      setRole(data.role);
    } else {
      setMessage(data.message);
    }
  }

  // Update the user's profile
  async function updateProfile() {
    const payload = {
      first_name: profileFirstName,
      last_name: profileLastName,
      email: email
    };

    if (newPassword.trim() !== "") {
      payload.password = newPassword;
    }

    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Display the result
    setMessage(data.message);
    if (response.ok) {
      setNewPassword("");
    }
  }

  // Fetch all events created by the logged-in organizer
  async function fetchOrganizerEvents() {
    const response = await fetch(`${API_BASE_URL}/api/organizer/events`, {
      credentials: "include"
    });
    if (response.ok) {
      const data = await response.json();
      setMyEvents(data);
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

  // Log the current user out
  async function logoutUser() {
    const response = await fetch(`${API_BASE_URL}/api/logout`, {
      method: "POST",
      credentials: "include"
    });

    const data = await response.json();

    setMessage(data.message);

    if (response.ok) {
      setIsLoggedIn(false);
      setRole("");
      setProfileFirstName("");
      setProfileLastName("");
      setEmail("");
      setPassword("");
      setMyEvents([]);
    }
  }

  // Display the application
  return (
    <div className="dashboard-layout">
      {!isLoggedIn ? (
        <div className="auth-wrapper">
          <div className="auth-card">
            <h1>{!showRegister ? "Login" : "Create Account"}</h1>
            <p className="tagline">Your pass to every moment</p>

            {!showRegister ? (
              <form onSubmit={loginUser}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary">Login</button>
                <p style={{ marginTop: "15px", fontSize: "14px", color: "#444" }}>
                  Don't have an account?{" "}
                  <button type="button" className="btn-secondary" onClick={() => setShowRegister(true)}>
                    Create Account
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={registerUser}>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    required
                    value={first_name}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    required
                    value={last_name}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary">Register</button>
                <p style={{ marginTop: "15px", fontSize: "14px", color: "#444" }}>
                  Already have an account?{" "}
                  <button type="button" className="btn-secondary" onClick={() => { setMessage(""); setShowRegister(false)}}>
                    Login
                  </button>
                </p>
              </form>
            )}

            {message && (
              <div 
                style={{
                  marginTop: "16px",
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
            )}
            
          </div>
        </div>
      ) : (
        <>
          <aside className="sidebar">
            <div>
              <div className="sidebar-title">EVENT PASS</div>
              <ul className="nav-links">
                <li>
                  <button
                    className={`nav-item ${activeTab === "home" ? "active" : ""}`}
                    onClick={() => setActiveTab("home")}
                  >
                    HOME
                  </button>
                </li>
                {role === "Organizer" && (
                  <li>
                    <button
                      className={`nav-item ${activeTab === "events" ? "active" : ""}`}
                      onClick={() => setActiveTab("events")}
                    >
                      My Events
                    </button>
                  </li>
                )}
                {role === "Regular User" && (
                  <li>
                    <button
                      className={`nav-item ${activeTab === "bookings" ? "active" : ""}`}
                      onClick={() => setActiveTab("bookings")}
                    >
                      My Bookings
                    </button>
                  </li>
                )}
                {role === "Administrator" && (
                  <li>
                    <button
                      className={`nav-item ${activeTab === "admin" ? "active" : ""}`}
                      onClick={() => setActiveTab("admin")}
                    >
                      Admin Controls
                    </button>
                  </li>
                )}
                <li>
                  <button
                    className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
                    onClick={() => setActiveTab("profile")}
                  >
                    Profile
                  </button>
                </li>
              </ul>
            </div>
            <button className="btn-logout" onClick={logoutUser}>Logout</button>
          </aside>

          <main className="main-content">
            <header className="top-bar">
              <h2>{role} Dashboard</h2>
              <div className="user-badge">
                Logged in: <strong>{profileFirstName} {profileLastName}</strong>
              </div>
            </header>

            {activeTab === "home" && (
              <div>
                {role === "Organizer" && (
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
                              value={eventDate}
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
                        <div key={ev.event_id} className="event-card">
                          <div>
                            <h4>{ev.title}</h4>
                            <p>{ev.description}</p>
                            <p><strong>Date:</strong> {ev.date ? ev.date.substring(0, 10) : ""} at {ev.time}</p>
                            <p><strong>Location:</strong> {ev.location}</p>
                          </div>
                          <div>
                            <span className="badge">Capacity: {ev.capacity}</span>
                            <span className="badge" style={{ marginLeft: "8px", backgroundColor: "#c6f6d5", color: "#22543d" }}>
                              {ev.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {role !== "Organizer" && (
                    <div className="content-card">
                      
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "events" && role === "Organizer" && (
              <div>
                <h3 style={{ marginBottom: "20px" }}>My Created Events</h3>
                <div className="event-grid">
                  {myEvents.map((ev) => (
                    <div key={ev.event_id} className="event-card">
                      <div>
                        <h4>{ev.title}</h4>
                        <p>{ev.description}</p>
                        <p><strong>Date:</strong> {ev.date ? ev.date.substring(0, 10) : ""} at {ev.time}</p>
                        <p><strong>Location:</strong> {ev.location}</p>
                      </div>
                      <div>
                        <span className="badge">Capacity: {ev.capacity}</span>
                        <span className="badge" style={{ marginLeft: "8px", backgroundColor: "#c6f6d5", color: "#22543d" }}>
                          {ev.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="content-card" style={{ maxWidth: "600px" }}>
                <h3>User Profile</h3>
                <form onSubmit={updateProfile}>
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      required
                      value={profileFirstName}
                      onChange={(e) => setProfileFirstName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      required
                      value={profileLastName}
                      onChange={(e) => setProfileLastName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password (optional)</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep existing"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </form>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;