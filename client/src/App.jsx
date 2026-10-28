import { useState, useEffect } from "react";

// Store the values entered into the registration form
function App() {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Store messages received from the server
  const [message, setMessage] = useState("");
  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileLastName, setProfileLastName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

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

    if (response.ok) {
      setIsLoggedIn(true);
      getProfile();
    }
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

    // Check the session when the app first loads
  useEffect(() => {
    async function loadSession() {
      const response = await fetch("http://localhost:5000/api/session", {
        credentials: "include"
      });

      const data = await response.json();

      if (data.user_id) {
        setIsLoggedIn(true);
        getProfile();
      }
    }

    loadSession();
  }, []);


  // Get the profile information of the logged-in user
  async function getProfile() {
    const response = await fetch("http://localhost:5000/api/profile", {
      credentials: "include"
    });

    const data = await response.json();

    // Display the profile information
    if (response.ok) {
      setProfileFirstName(data.first_name);
      setProfileLastName(data.last_name);
      setEmail(data.email);
      setMessage(
        "Name: " + data.first_name + " " + data.last_name +
        ", Email: " + data.email +
        ", Role: " + data.role
      );
    } else {
      setMessage(data.message);
    }
  }


  // Update the user's profile
  async function updateProfile() {
    const response = await fetch("http://localhost:5000/api/profile", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        first_name: profileFirstName,
        last_name: profileLastName,
        email: email
})
    });

    const data = await response.json();

    // Display the result
    if (response.ok) {
      setMessage(data.message);
    } else {
      setMessage(data.message);
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

    if (response.ok) {
      setIsLoggedIn(false);
    }
  }

  // Display the applicatio
  return (
    <div> 
      {!isLoggedIn && (
        <>
          {!showRegister ? (
            <>
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

              <p>
                Don't have an account?
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                >
                  Create Account
                </button>
              </p>
            </>
          ) : (
            <>
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

                <button type="submit">Register</button>
              </form>

              <p>
                Already have an account?
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                >
                  Login
                </button>
              </p>
            </>
          )}

          <p>{message}</p>
        </>
      )}


    {isLoggedIn && (
      <>
    <button type="button" onClick={checkSession}> Check Session </button>
    <button type="button" onClick={getProfile}> View Profile </button>

    <div>
      <h3>Update Profile</h3>

      <input
        type="text"
        placeholder="First Name"
        value={profileFirstName}
        onChange={(event) => setProfileFirstName(event.target.value)}
      />

      <input
        type="text"
        placeholder="Last Name"
        value={profileLastName}
        onChange={(event) => setProfileLastName(event.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button type="button" onClick={updateProfile}>
        Update Profile
      </button>
    </div>


    <button type="button" onClick={logoutUser}> Logout </button>
    {/* Display messages from the server */}
      <p>{message}</p>
      </>
    )}
    </div>
  );
}

export default App;