const { buildEventsQuery, isValidDateString } = require("../utils/eventQuery");

/* ============================ PART 1:  MAIN TESTS ======================================*/


/* -------------------------- EVENT LIST (DEFAULT QUERY) -------------------------------- */

describe("F3.1 - Event list (default query)", () => {
    // No search, date or sort given: only active, upcoming events, earliest first
    test("no filters returns active upcoming events sorted by date ascending", () => {
        const { text, values } = buildEventsQuery({});
        expect(text).toContain("e.status = 'Active'");
        expect(text).toContain("e.date >= CURRENT_DATE");
        expect(text).toContain("ORDER BY e.date ASC, e.time ASC");
        expect(values).toEqual([]);
    });
});


/* -------------------------- SEARCH BY TITLE OR LOCATION -------------------------------- */

describe("F3.4 - Search by title or location", () => {
    // Search text becomes one parameter, used for both title and location; spaces are trimmed
    test("search matches title or location using a parameter", () => {
        const { text, values } = buildEventsQuery({ search: "  Tech  " });
        expect(text).toContain("e.title ILIKE $1 OR e.location ILIKE $1");
        expect(values).toEqual(["%Tech%"]);
    });

    // A search box with only spaces should not filter anything
    test("blank search is ignored", () => {
        const { values } = buildEventsQuery({ search: "   " });
        expect(values).toEqual([]);
    });

    // % and _ typed by the user are searched as normal characters, not as wildcards
    test("LIKE wildcards in search are escaped", () => {
        const { values } = buildEventsQuery({ search: "100%_off" });
        expect(values).toEqual(["%100\\%\\_off%"]);
    });
});


/* -------------------------- FILTER BY DATE -------------------------------- */

describe("F3.5 - Filter by date", () => {
    // A date adds an exact-match condition on the event date
    test("date filter adds an exact date condition", () => {
        const { text, values } = buildEventsQuery({ date: "2026-12-01" });
        expect(text).toContain("e.date = $1");
        expect(values).toEqual(["2026-12-01"]);
    });

    // When both are used, search is $1 and date is $2 (numbers must not clash)
    test("search and date use separate parameter numbers", () => {
        const { text, values } = buildEventsQuery({ search: "Toronto", date: "2026-12-01" });
        expect(text).toContain("ILIKE $1");
        expect(text).toContain("e.date = $2");
        expect(values).toEqual(["%Toronto%", "2026-12-01"]);
    });
});


/* -------------------------- DATE VALIDATION -------------------------------- */

describe("F3.5 - Date validation", () => {
    // Correct format and a real calendar date
    test("accepts a real date", () => {
        expect(isValidDateString("2026-12-01")).toBe(true);
    });

    // Only YYYY-MM-DD is allowed
    test("rejects wrong format", () => {
        expect(isValidDateString("12/01/2026")).toBe(false);
    });

    // Right format, but the day does not exist
    test("rejects impossible dates", () => {
        expect(isValidDateString("2026-02-31")).toBe(false);
    });

    // Missing values and lists (from ?date=a&date=b) are not valid dates
    test("rejects non-strings", () => {
        expect(isValidDateString(undefined)).toBe(false);
        expect(isValidDateString(["2026-12-01"])).toBe(false);
    });
});


/* -------------------------- SORT BY DATE -------------------------------- */

describe("F3.6 - Sort by date", () => {
    // date_desc puts the furthest date first
    test("sort by date descending", () => {
        const { text } = buildEventsQuery({ sort: "date_desc" });
        expect(text).toContain("ORDER BY e.date DESC, e.time DESC");
    });

    // Any other sort value is ignored, so user input never reaches the SQL
    test("unknown sort value falls back to ascending", () => {
        const { text } = buildEventsQuery({ sort: "date; DROP TABLE events" });
        expect(text).toContain("ORDER BY e.date ASC, e.time ASC");
        expect(text).not.toContain("DROP TABLE");
    });
});


/* -------------------------- SQL INJECTION PROTECTION -------------------------------- */

describe("NFR1.1 - SQL injection protection", () => {
    // An attack string is passed as a value, so the database treats it as plain text
    test("SQL injection text stays in the values, not in the query", () => {
        const attack = "' OR 1=1; --";
        const { text, values } = buildEventsQuery({ search: attack });
        expect(text).not.toContain(attack);
        expect(values).toEqual([`%${attack}%`]);
    });

    // Repeated URL parameters arrive as lists and must be ignored
    test("non-string inputs are ignored", () => {
        const { values } = buildEventsQuery({ search: ["a", "b"], date: ["2026-12-01"], sort: ["date_desc"] });
        expect(values).toEqual([]);
    });
});


/* ===================== PART 2: Extra edge cases for more protection ======================*/


/* -------------------------- SEARCH EDGE CASES -------------------------------- */

describe("Additional - Search edge cases", () => {
    // A single quote is normal text, and cannot end the SQL string
    test("search text with an apostrophe stays in the values", () => {
        const { text, values } = buildEventsQuery({ search: "O'Brien" });
        expect(text).not.toContain("O'Brien");
        expect(values).toEqual(["%O'Brien%"]);
    });

    // A backslash is escaped so it is searched literally
    test("search text with a backslash is escaped", () => {
        const { values } = buildEventsQuery({ search: "a\\b" });
        expect(values).toEqual(["%a\\\\b%"]);
    });

    // Non-English letters are not removed or changed
    test("search keeps accented characters", () => {
        const { values } = buildEventsQuery({ search: "café" });
        expect(values).toEqual(["%café%"]);
    });

    // Capital letters are kept; the database does the case-insensitive match (ILIKE)
    test("search is not changed to lower case (matching is done by ILIKE)", () => {
        const { text, values } = buildEventsQuery({ search: "TORONTO" });
        expect(text).toContain("ILIKE");
        expect(values).toEqual(["%TORONTO%"]);
    });

    // Long text is passed through in full
    test("a very long search keeps the full text in the values", () => {
        const long = "a".repeat(500);
        const { values } = buildEventsQuery({ search: long });
        expect(values).toEqual([`%${long}%`]);
    });
});


/* -------------------------- QUERY STRUCTURE -------------------------------- */

describe("Additional - Query structure", () => {
    // Calling the helper with nothing must not throw
    test("calling it with no arguments does not crash", () => {
        const { text, values } = buildEventsQuery();
        expect(text).toContain("ORDER BY e.date ASC, e.time ASC");
        expect(values).toEqual([]);
    });

    // Seats left = capacity - booked_count (used by the event cards, F3.2)
    test("query always includes the remaining seats calculation", () => {
        const { text } = buildEventsQuery({});
        expect(text).toContain("e.capacity - COALESCE(e.booked_count, 0)");
        expect(text).toContain("AS remaining_capacity");
    });

    // An empty date box means "no date filter"
    test("empty date string is ignored", () => {
        const { text, values } = buildEventsQuery({ date: "" });
        expect(text).not.toContain("e.date = $");
        expect(values).toEqual([]);
    });

    // With no search, the date is the first parameter
    test("date filter alone uses the first parameter", () => {
        const { text, values } = buildEventsQuery({ date: "2027-01-15" });
        expect(text).toContain("e.date = $1");
        expect(values).toEqual(["2027-01-15"]);
    });

    // Only the exact value "date_desc" flips the order
    test("sort value is case sensitive, so DATE_DESC falls back to ascending", () => {
        const { text } = buildEventsQuery({ sort: "DATE_DESC" });
        expect(text).toContain("ORDER BY e.date ASC, e.time ASC");
    });

    // Search, date and sort used at the same time
    test("all three filters together build one query", () => {
        const { text, values } = buildEventsQuery({ search: "winter", date: "2026-12-12", sort: "date_desc" });
        expect(text).toContain("e.status = 'Active'");
        expect(text).toContain("e.date >= CURRENT_DATE");
        expect(text).toContain("ILIKE $1");
        expect(text).toContain("e.date = $2");
        expect(text).toContain("ORDER BY e.date DESC, e.time DESC");
        expect(values).toEqual(["%winter%", "2026-12-12"]);
    });
});


/* -------------------------- DATE VALIDATION EDGE CASES -------------------------------- */

describe("Additional - Date validation edge cases", () => {
    // 2028 is a leap year, so February 29 exists
    test("accepts a leap day in a leap year", () => {
        expect(isValidDateString("2028-02-29")).toBe(true);
    });

    // 2027 is not a leap year, so February 29 does not exist
    test("rejects a leap day in a normal year", () => {
        expect(isValidDateString("2027-02-29")).toBe(false);
    });

    // There are only 12 months
    test("rejects month 13", () => {
        expect(isValidDateString("2026-13-01")).toBe(false);
    });

    // Days start at 01
    test("rejects day 00", () => {
        expect(isValidDateString("2026-12-00")).toBe(false);
    });

    // Months and days must have two digits
    test("rejects single digit month and day", () => {
        expect(isValidDateString("2026-1-5")).toBe(false);
    });

    // A full timestamp is not just a date
    test("rejects a date with a time attached", () => {
        expect(isValidDateString("2026-12-12T10:00:00Z")).toBe(false);
    });

    // The date-picker bug from earlier: a year typed with six digits
    test("rejects a six digit year", () => {
        expect(isValidDateString("202608-08-08")).toBe(false);
    });

    // Empty and missing values are not valid dates
    test("rejects empty string and null", () => {
        expect(isValidDateString("")).toBe(false);
        expect(isValidDateString(null)).toBe(false);
    });
});
