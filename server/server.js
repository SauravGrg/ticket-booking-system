require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const cors = require("cors");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const isValidPassword = require("./password");

const app = express();
const port = process.env.PORT || 5000;

app.set("trust proxy", 1);

app.use(express.json());

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

// Allow the React frontend to communicate with the backend
app.use(cors({
    origin: allowedOrigin,
    credentials: true
}))

// Check if a cloud connection string is provided
const isProduction = process.env.NODE_ENV === "production";

// Create a connection pool for PostgreSQL
const pool = new Pool(
    process.env.DATABASE_URL
        ? {
              connectionString: process.env.DATABASE_URL,
              ssl: isProduction ? { rejectUnauthorized: false } : false
          }
        : {
              host: process.env.DB_HOST,
              port: process.env.DB_PORT,
              database: process.env.DB_NAME,
              user: process.env.DB_USER,
              password: process.env.DB_PASSWORD
          }
);

// Configure sessions for logged-in users
app.use(session({
    // Store session information in PostgreSQL
    store: new pgSession({
        pool: pool,
        createTableIfMissing: true
    }),
    // Secret key used to protect the session
    secret: process.env.SESSION_SECRET || "fallback_capstone_secret",
    // Do not save the session again if nothing changed
    resave: false,
    // Do not create a session until something is stored in it
    saveUninitialized: false,
    // Configure the session cookie
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        // Session expires after 1 hour
        maxAge: 1000 * 60 * 60
    }
}));

// Test route to make sure the server is running
app.get("/", (req, res) => {
    res.send(`Server is running on port ${port}`);
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

        // Check account status
        if (user.account_status === "Deactivated") {
            return res.status(403).json({
                message: "Your account is deactivated. Please contact an administrator."
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


 // Update the logged-in user's profile
app.put("/api/profile", async (req, res) => {

    // Check if the user is logged in
    if (!req.session.user_id) {
        return res.status(401).json({
            message: "Please log in first"
        });
    }

    // Get the updated information from the request
    const { first_name, last_name, email, password } = req.body;

    // Make sure all fields were provided
    if (!first_name || !last_name || !email) {
        return res.status(400).json({
            message: "Name and email are required"
        });
    }

    try {
        let result;

        if (password && password.trim() !== "") {
            if (!isValidPassword(password)) {
                return res.status(400).json({
                    message: "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character"
                });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            result = await pool.query(
                `UPDATE users
                 SET first_name = $1, last_name = $2, email = $3, password = $4, updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $5
                 RETURNING user_id, first_name, last_name, email, role, account_status`,
                [first_name, last_name, email, hashedPassword, req.session.user_id]
            );
        } else {
            result = await pool.query(
                `UPDATE users
                 SET first_name = $1, last_name = $2, email = $3, updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $4
                 RETURNING user_id, first_name, last_name, email, role, account_status`,
                [first_name, last_name, email, req.session.user_id]
            );
        }

        res.json({
            message: "Profile updated successfully",
            user: result.rows[0]
        });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ message: "That email address is already in use" });
        }
        console.error(err.message);
        res.status(500).json({ 
            message: "Something went wrong" 
        });
    }
});


// Check whether the logged-in user has the required role
function checkRole(requiredRole) {
    return async (req, res, next) => {
        // Check if the user is logged in
        if (!req.session.user_id) {
            return res.status(401).json({
                message: "Please log in first"
            });
        }

        try {
            // Find the user's role in the database
            const result = await pool.query(
                "SELECT role FROM users WHERE user_id = $1",
                [req.session.user_id]
            );

            // Check if the user exists
            if (result.rows.length === 0) {
                return res.status(401).json({
                    message: "User not found"
                });
            }

            // Check whether the user has the required role
            if (result.rows[0].role !== requiredRole) {
                return res.status(403).json({
                    message: "You do not have permission to access this page"
                });
            }

            // Continue to the requested route
            next();

        } catch (err) {
            console.log(err.message);

            res.status(500).json({
                message: "Something went wrong"
            });
        }
    };
}

app.get("/api/organizer/events", checkRole("Organizer"), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM events 
             WHERE user_id = $1 
             ORDER BY date ASC, time ASC`,
            [req.session.user_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Something went wrong" });
    }
});

app.post("/api/events", checkRole("Organizer"), async (req, res) => {
    const { title, description, date, time, location, capacity } = req.body;

    if (!title || !description || !date || !time || !location || capacity === undefined || capacity === "") {
        return res.status(400).json({ message: "Please fill in all event fields" });
    }

    if (title.length > 200 || description.length > 5000 || location.length > 1000) {
        return res.status(400).json({ message: "One or more fields exceed the allowed length" });
    }

    const eventCapacity = Number(capacity);

    if (!Number.isInteger(eventCapacity) || eventCapacity < 1 || eventCapacity > 100000) {
        return res.status(400).json({ message: "Capacity must be between 1 and 100000" });
    }

    const todayString = new Date().toLocaleDateString("en-CA"); // produces YYYY-MM-DD
    if (date < todayString) {
        return res.status(400).json({ message: "Event date cannot be in the past" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO events
            (user_id, title, description, date, time, location, capacity, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                req.session.user_id,
                title,
                description,
                date,
                time,
                location,
                eventCapacity,
                "Active"
            ]
        );

        res.status(201).json({
            message: "Event created successfully",
            event: result.rows[0]
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: "Something went wrong" });
    }
});


// Check whether the current user has a session
app.get("/api/session", (req, res) => {
    res.json({
        user_id: req.session.user_id
    });
});


 // Get the profile information of the logged-in user
app.get("/api/profile", async (req, res) => {
    // Check if the user is logged in
    if (!req.session.user_id) {
        return res.status(401).json({
            message: "Please log in first"
        });
    }

    try {
        // Find the user using the ID stored in the session
        const result = await pool.query(
            `SELECT user_id, first_name, last_name, email, role, account_status
            FROM users
            WHERE user_id = $1`,
            [req.session.user_id]
        );

        // Check if the user exists
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Return the user's profile information
        res.json(result.rows[0]);

    } catch (err) {
        console.log(err.message);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
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