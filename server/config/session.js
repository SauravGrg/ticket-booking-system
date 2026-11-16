const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./db");

// Configure sessions for logged-in users
const sessionMiddleware = session({
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
});

module.exports = sessionMiddleware;
