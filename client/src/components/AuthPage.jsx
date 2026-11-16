import { useState } from "react";
import { API_BASE_URL } from "../config";
import MessageBanner from "./MessageBanner";

// Login / Create Account screen
function AuthPage({ message, setMessage, setIsLoggedIn, getProfile }) {
    const [showRegister, setShowRegister] = useState(false);

    // Store the values entered into the registration form
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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

    return (
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

                <MessageBanner message={message} style={{ marginTop: "16px" }} />
            </div>
        </div>
    );
}

export default AuthPage;
