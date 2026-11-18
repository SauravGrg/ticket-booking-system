import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import MessageBanner from "./MessageBanner";

// Profile tab: edit name, email and (optionally) password
function ProfileTab({
    profileFirstName,
    profileLastName,
    email,
    message,
    setMessage,
    getProfile
}) {
    // Local copies of the form fields. The top bar keeps using the saved
    // values from App, so it only changes after "Save Changes" succeeds.
    const [firstName, setFirstName] = useState(profileFirstName);
    const [lastName, setLastName] = useState(profileLastName);
    const [emailInput, setEmailInput] = useState(email);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // When the saved profile loads or changes, refresh the form fields
    useEffect(() => {
        setFirstName(profileFirstName);
        setLastName(profileLastName);
        setEmailInput(email);
    }, [profileFirstName, profileLastName, email]);

    // Update the user's profile
    async function updateProfile(event) {
        if (event) event.preventDefault();

        // Both password boxes must match before we send anything
        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        const payload = {
            first_name: firstName,
            last_name: lastName,
            email: emailInput
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
            setConfirmPassword("");
            getProfile(); // reloads the saved name, so the top bar updates now
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
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />
            </div>
            <div className="form-group">
            <label>Last Name</label>
            <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />
            </div>
            <div className="form-group">
            <label>Email</label>
            <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
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
            <div className="form-group">
            <label>Confirm New Password (optional)</label>
            <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            </div>
            

            <MessageBanner message={message} style={{ marginBottom: "16px" }} />

            <button type="submit" className="btn-primary">Save Changes</button>
        </form>
        </div>
    );
}

export default ProfileTab;
