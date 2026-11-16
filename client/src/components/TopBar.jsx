// Header at the top of the main content area
function TopBar({ role, profileFirstName, profileLastName }) {
    return (
        <header className="top-bar">
        <h2>{role} Dashboard</h2>
        <div className="user-badge">
            Logged in: <strong>{profileFirstName} {profileLastName}</strong>
        </div>
        </header>
    );
}

export default TopBar;
