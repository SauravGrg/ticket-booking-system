const VALID_ROLES = ["Administrator", "Organizer", "Regular User"];

function isValidRole(role) {
    return VALID_ROLES.includes(role);
}

function isAdmin(role) {
    return role === "Administrator";
}

function isOrganizer(role) {
    return role === "Organizer";
}

module.exports = { isValidRole, isAdmin, isOrganizer };