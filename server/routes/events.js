const express = require("express");
const pool = require("../config/db");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

// Get all events created by the logged-in organizer
router.get("/api/organizer/events", checkRole("Organizer"), async (req, res) => {
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

// Create a new event
router.post("/api/events", checkRole("Organizer"), async (req, res) => {
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

module.exports = router;
