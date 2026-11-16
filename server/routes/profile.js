const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const isValidPassword = require("../password");

const router = express.Router();

// Get the profile information of the logged-in user
router.get("/api/profile", async (req, res) => {
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

// Update the logged-in user's profile
router.put("/api/profile", async (req, res) => {

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

module.exports = router;
