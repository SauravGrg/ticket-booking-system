const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const isValidPassword = require("../password");

const router = express.Router();

// Register a new user
router.post("/api/register", async (req, res) => {
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
router.post("/api/login", async (req, res) => {

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

// Check whether the current user has a session
router.get("/api/session", (req, res) => {
    res.json({
        user_id: req.session.user_id
    });
});

// Log the user out
router.post("/api/logout", (req, res) => {
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

module.exports = router;
