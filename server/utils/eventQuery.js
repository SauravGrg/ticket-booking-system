// Allowed sort options (user input is never placed in the SQL directly)
const SORT_OPTIONS = {
    date_asc: "e.date ASC, e.time ASC",
    date_desc: "e.date DESC, e.time DESC"
};

// Check that a value looks like a real YYYY-MM-DD date
function isValidDateString(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

// Build the SQL for the event list (search by title/location, filter by date, sort by date)
function buildEventsQuery({ search, date, sort } = {}) {
    const conditions = ["e.status = 'Active'", "e.date >= CURRENT_DATE"];
    const values = [];

    if (typeof search === "string" && search.trim() !== "") {
        // Escape LIKE wildcards so the user's text is matched literally
        const escaped = search.trim().replace(/[\\%_]/g, "\\$&");
        values.push(`%${escaped}%`);
        conditions.push(`(e.title ILIKE $${values.length} OR e.location ILIKE $${values.length})`);
    }

    if (typeof date === "string" && date !== "") {
        values.push(date);
        conditions.push(`e.date = $${values.length}`);
    }

    const orderBy = (typeof sort === "string" && SORT_OPTIONS[sort]) || SORT_OPTIONS.date_asc;

    const text = `SELECT e.*, (e.capacity - COALESCE(e.booked_count, 0)) AS remaining_capacity
        FROM events e
        WHERE ${conditions.join(" AND ")}
        ORDER BY ${orderBy}`;

    return { text, values };
}

module.exports = { buildEventsQuery, isValidDateString, SORT_OPTIONS };
