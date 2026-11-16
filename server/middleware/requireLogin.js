// Make sure the user is logged in (any role)
function requireLogin(req, res, next) {
    if (!req.session.user_id) {
        return res.status(401).json({
            message: "Please log in first"
        });
    }

    next();
}

module.exports = requireLogin;
