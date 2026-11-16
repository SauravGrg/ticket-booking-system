const pool = require("../config/db");

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

module.exports = checkRole;
