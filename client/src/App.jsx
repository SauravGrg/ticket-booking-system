import { useState } from "react";

// Store the values entered into the registration form
function App() {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Store messages received from the server
  const [message, setMessage] = useState("");

  // Send the registration information to the backend
  async function registerUser(event) {
    // Prevent the page from refreshing when the form is submitted
    event.preventDefault();

    // Send a POST request to the registration route
    const response = await fetch("http://localhost:5000/api/register", {
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
    
    // Get the response from the server as JSON
    const data = await response.json();

    // Display the message returned by the server
    setMessage(data.message);
  }

  // Send the login information to the backend
  async function loginUser(event) {
    event.preventDefault();

    // Send a POST request to the login route
    const response = await fetch("http://localhost:5000/api/login", {
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
  }

  // Check whether a user is currently logged in
  async function checkSession() {
    const response = await fetch("http://localhost:5000/api/session", {
      credentials: "include"
    });

    const data = await response.json();

    // Check if a user ID exists in the current session
    if (data.user_id) {
      setMessage("User is logged in. User ID: " + data.user_id);
    } else {
      setMessage("No user is logged in")
    }
  }

  // Log the current user out
  async function logoutUser() {
    const response = await fetch("http://localhost:5000/api/logout", {
      method: "POST",
      credentials: "include"
    });

    const data = await response.json();

    setMessage(data.message);
  }

  // Display the applicatio
  return (
    <div>
    {/* Registration section */}
      <h1>Create Account</h1>

      <form onSubmit={registerUser}>
        <div>
          <label>First Name</label>
          <input 
            type="text"
            value={first_name}
            onChange={(event) => setFirstName(event.target.value)}
          />
        </div>

        <div>
          <label>Last Name</label>
          <input 
            type="text"
            value={last_name}
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>

        <div>
          <label>Email</label>
          <input 
            type="text"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label>Password</label>
          <input 
            type="text"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {/* Submit the registration form */}
        <button type="submit">Register</button>
        <p>{message}</p>
      </form>

      {/* Login section */}
      <h1>Login</h1>

    <form onSubmit={loginUser}>
        <div>
            <label>Email</label>
            <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
            />
        </div>

        <div>
            <label>Password</label>
            <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
            />
        </div>

        <button type="submit">Login</button>
    </form>

    <button type="button" onClick={checkSession}> Check Session </button>

    <button type="button" onClick={logoutUser}> Logout </button>
    {/* Display messages from the server */}
      <p>{message}</p>
    </div>
  );
}

export default App;