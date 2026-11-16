import { useState, useEffect } from "react";
import "./App.css";
import { API_BASE_URL } from "./config";

import AuthPage from "./components/AuthPage";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import HomeTab from "./components/HomeTab";
import MyEventsTab from "./components/MyEventsTab";
import ProfileTab from "./components/ProfileTab";

// App only keeps the state that is shared between several components.
// Everything specific to one screen lives in that screen's component file.
function App() {
    // Navigation / auth
    const [activeTab, setActiveTab] = useState("home");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState("");

    // Store messages received from the server
    const [message, setMessage] = useState("");

    // Logged-in user's profile (used by TopBar, ProfileTab and getProfile)
    const [profileFirstName, setProfileFirstName] = useState("");
    const [profileLastName, setProfileLastName] = useState("");
    const [email, setEmail] = useState("");

    // Organizer events list state (used by HomeTab and MyEventsTab)
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

    // Automatically clear notification messages after 3 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
            setMessage("");
        }, 3000);

        // Clean up timer if a new message arrives before 3s
        return () => clearTimeout(timer);
        }
    }, [message]);

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

    // Reset the shared state after the user logs out
    function handleLoggedOut() {
        setIsLoggedIn(false);
        setRole("");
        setProfileFirstName("");
        setProfileLastName("");
        setEmail("");
        setMyEvents([]);
    }

    // Display the application
    return (
        <div className="dashboard-layout">
        {!isLoggedIn ? (
            <AuthPage
                message={message}
                setMessage={setMessage}
                setIsLoggedIn={setIsLoggedIn}
                getProfile={getProfile}
            />
        ) : (
            <>
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    role={role}
                    setMessage={setMessage}
                    onLoggedOut={handleLoggedOut}
                />

                <main className="main-content">
                    <TopBar
                        role={role}
                        profileFirstName={profileFirstName}
                        profileLastName={profileLastName}
                    />

                    {activeTab === "home" && (
                    <HomeTab
                        role={role}
                        myEvents={myEvents}
                        setMessage={setMessage}
                        fetchOrganizerEvents={fetchOrganizerEvents}
                    />
                    )}

                    {activeTab === "events" && role === "Organizer" && (
                    <MyEventsTab myEvents={myEvents} />
                    )}

                    {activeTab === "profile" && (
                    <ProfileTab
                        profileFirstName={profileFirstName}
                        setProfileFirstName={setProfileFirstName}
                        profileLastName={profileLastName}
                        setProfileLastName={setProfileLastName}
                        email={email}
                        setEmail={setEmail}
                        message={message}
                        setMessage={setMessage}
                        getProfile={getProfile}
                    />
                    )}
                </main>
            </>
        )}
        </div>
    );
}

export default App;
