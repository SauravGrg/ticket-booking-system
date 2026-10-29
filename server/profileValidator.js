const isValidPassword = require("./password");

function validateProfileUpdate(data) {
    const { first_name, last_name, email, password } = data;

    // Check required fields
    if (!first_name || !last_name || !email) {
        return { isValid: false, message: "Name and email are required" };
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, message: "Invalid email format" };
    }

    // Check optional password if provided
    if (password && password.trim() !== "") {
        if (!isValidPassword(password)) {
            return {
                isValid: false,
                message: "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character"
            };
        }
    }

    return { isValid: true };
}

module.exports = validateProfileUpdate;