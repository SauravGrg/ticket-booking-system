require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const cors = require("cors");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const isValidPassword = require("./password");

const app = express();
const port = 5000;

app.use(express.json());

// Allow the React frontend to communicate with the backend
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

// Create a connection pool for PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Configure sessions for logged-in users
app.use(session({
    // Store session information in PostgreSQL
    store: new pgSession({
        pool: pool,
        createTableIfMissing: true
    }),
    // Secret key used to protect the session
    secret: process.env.SESSION_SECRET,
    // Do not save the session again if nothing changed
    resave: false,
    // Do not create a session until something is stored in it
    saveUninitialized: false,
    // Configure the session cookie
    cookie: {
        httpOnly: true,
        secure: false,
        // Session expires after 1 hour
        maxAge: 1000 * 60 * 60
    }
}));

// Test route to make sure the server is running
app.get("/", (req, res) => {
    res.send("Hello World! I am runnin on port 5000 right now");
});

// Register a new user
app.post("/api/register", async (req, res) => {
    // Get the registration information from the request
    const {first_name, last_name, email, password} = req.body;

    // Make sure all required fields were provided
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({
            message: "All field are require"
        })
    }

    // Check if the password follows the required password rules
    if (!isValidPassword(password)) {
        return res.status(400).json({
            message: "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number and special character"
        })
    }

    try {
        // Check if an account with this email already exists
        const existingUser = await pool.query(
            "SELECT user_id FROM users WHERE email = $1", [email]
        );

        // Stop registration if the email is already registered
        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "Email is already registered"
            });
        }

        // Hash the password before saving it to the database
        const hashedPasswrord = await bcrypt.hash(password, 10);

        // Create the new user in the database
        await pool.query(
            `INSERT INTO users
            (first_name, last_name, email, password, role, account_status)
            VALUES ($1, $2, $3, $4, $5, $6)`, 
            [
                first_name, last_name, email, hashedPasswrord, "Regular User", "Active"
            ]
        );

        // Tell the frontend that the account was created successfully
        res.status(201).json({
            message: "Account created successfully"
        });
    } catch (err) {
        // Print error to console
        console.log(err.message);
        
        // Send an error response to the frontend
        res.status(500).json({
            message: "Something went wrong"
        })
    }
});

// Log an existing user into the application
app.post("/api/login", async (req, res) => {

    // Get the email and password from the request
    const {email, password} = req.body;

    // Make sure both fields were provided
    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are require"
        });
    }

    try {
        // Find the user using the email address
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1", [email]
        );

        // Stop if no account was found
        if (result.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Get the user information from the query result
        const user = result.rows[0];
        // Compare the entered password with the hashed password stored in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        // Stop if the passwords do not match
        if (!passwordMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Store the user's ID in the session after successful login
        req.session.user_id = user.user_id;

        // Tell the frontend that login was successful
        res.status(200).json({
            message: "Login successful"
        });

    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

// Check whether the current user has a session
app.get("/api/session", (req, res) => {
    res.json({
        user_id: req.session.user_id
    });
});

// Log the user out
app.post("/api/logout", (req, res) => {
    // Destroy the current session
    req.session.destroy((err) => {
        // Handle an error while destroying the session
        if (err) {
            console.log(err.message);

            return res.status(500).json({
                message: "Something went wrong"
            });
        }

        // Remove the session cookie from the browser
        res.clearCookie("connect.sid");
        
        // Tell the frontend that logout was successful
        res.json({
            message: "Logout successful"
        })
    })
})

// Test the database connection when the server starts
pool.query("SELECT NOW()", (err, result) => {
    // Display an error if the database connection failed
    if (err) {
        console.log("Database connection failed");
        console.log(err.message);
    } else {
        // Display a message if the database connection worked
        console.log("Connection to PostgresSQL");
        console.log("Database time:", result.rows[0].now);
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
})