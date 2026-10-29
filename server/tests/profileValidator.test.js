const validateProfileUpdate = require("../profileValidator");

test("valid profile update without password change should return true", () => {
    const result = validateProfileUpdate({
        first_name: "Saurav",
        last_name: "Gurung",
        email: "saurav@test.com"
    });
    expect(result.isValid).toBe(true);
});

test("valid profile update with strong new password should return true", () => {
    const result = validateProfileUpdate({
        first_name: "Saurav",
        last_name: "Gurung",
        email: "saurav@test.com",
        password: "@Password123"
    });
    expect(result.isValid).toBe(true);
});

test("missing first name or last name should return false", () => {
    const result = validateProfileUpdate({
        first_name: "",
        last_name: "Gurung",
        email: "saurav@test.com"
    });
    expect(result.isValid).toBe(false);
    expect(result.message).toBe("Name and email are required");
});

test("missing email should return false", () => {
    const result = validateProfileUpdate({
        first_name: "Saurav",
        last_name: "Gurung",
        email: ""
    });
    expect(result.isValid).toBe(false);
    expect(result.message).toBe("Name and email are required");
});

test("invalid email format should return false", () => {
    const result = validateProfileUpdate({
        first_name: "Saurav",
        last_name: "Gurung",
        email: "invalid-email"
    });
    expect(result.isValid).toBe(false);
    expect(result.message).toBe("Invalid email format");
});

test("profile update with weak new password should return false", () => {
    const result = validateProfileUpdate({
        first_name: "Saurav",
        last_name: "Gurung",
        email: "saurav@test.com",
        password: "weak"
    });
    expect(result.isValid).toBe(false);
    expect(result.message).toContain("Password must be at least 8 characters");
});