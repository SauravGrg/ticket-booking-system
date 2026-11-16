require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./config/db");
const sessionMiddleware = require("./config/session");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const eventRoutes = require("./routes/events");

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

// Configure sessions for logged-in users
app.use(sessionMiddleware);

// Test route to make sure the server is running
app.get("/", (req, res) => {
    res.send(`Server is running on port ${port}`);
});

// Routes
app.use(authRoutes);
app.use(profileRoutes);
app.use(eventRoutes);

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
