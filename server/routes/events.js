const express = require("express");
const pool = require("../config/db");
const checkRole = require("../middleware/checkRole");
const requireLogin = require("../middleware/requireLogin");

const router = express.Router();

// Browse upcoming events (any logged-in user)
router.get("/api/events", requireLogin, async (req, res) => {
    const { search } = req.query;
    console.log("SEARCH RECEIVED:", search);

    const conditions = ["e.status = 'Active'", "e.date >= CURRENT_DATE"];
    const values = [];

    // Search by title or location
    if (typeof search === "string" && search.trim() !== "") {
        // Escape LIKE wildcards so the text is matched literally
        const escaped = search.trim().replace(/[\\%_]/g, "\\$&");
        values.push(`%${escaped}%`);
        conditions.push(`(e.title ILIKE $${values.length} OR e.location ILIKE $${values.length})`);
    }

    try {
        const result = await pool.query(
            `SELECT e.*, (e.capacity - COALESCE(e.booked_count, 0)) AS remaining_capacity
            FROM events e
            WHERE ${conditions.join(" AND ")}
            ORDER BY e.date ASC, e.time ASC`,
            
            values
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Something went wrong" });
    }
});

// Get the full details of one event (any logged-in user)
router.get("/api/events/:id", requireLogin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT e.*, (e.capacity - COALESCE(e.booked_count, 0)) AS remaining_capacity
            FROM events e
            WHERE e.event_id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        // 22P02 = the id is not a valid value for the event_id column type
        if (err.code === "22P02") {
            return res.status(400).json({ message: "Invalid event id" });
        }

        console.error(err.message);
        res.status(500).json({ message: "Something went wrong" });
    }
});

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
