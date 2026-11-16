import { useState } from "react";
import { API_BASE_URL } from "../config";
import MessageBanner from "./MessageBanner";

// Profile tab: edit name, email and (optionally) password
function ProfileTab({
    profileFirstName,
    setProfileFirstName,
    profileLastName,
    setProfileLastName,
    email,
    setEmail,
    message,
    setMessage,
    getProfile
}) {
    const [newPassword, setNewPassword] = useState("");

    // Update the user's profile
    async function updateProfile(event) {
        if (event) event.preventDefault();

        const payload = {
            first_name: profileFirstName,
            last_name: profileLastName,
            email: email
        };

        if (newPassword && newPassword.trim() !== "") {
            payload.password = newPassword;
        }

        try {
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
            getProfile();
        }
    } catch (err) {
        console.error("Profile update error:", err);
        setMessage("Failed to update profile.");
    }
    }

    return (
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
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            </div>

            <MessageBanner message={message} style={{ marginBottom: "16px" }} />

            <button type="submit" className="btn-primary">Save Changes</button>
        </form>
        </div>
    );
}

export default ProfileTab;
