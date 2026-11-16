import { API_BASE_URL } from "../config";

// Left navigation bar (tabs depend on the user's role)
function Sidebar({ activeTab, setActiveTab, role, setMessage, onLoggedOut }) {
  // Log the current user out
    async function logoutUser() {
        const response = await fetch(`${API_BASE_URL}/api/logout`, {
            method: "POST",
            credentials: "include"
        });

        const data = await response.json();

        setMessage(data.message);

        if (response.ok) {
            onLoggedOut();
        }
    }

    return (
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
    );
}

export default Sidebar;
