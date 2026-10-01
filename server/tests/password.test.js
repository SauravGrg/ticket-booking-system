const isValidPassword = require("../password");

test("valid password should return true", () => {
    expect(isValidPassword("@Password123")).toBe(true);
});

test("password without uppercase should return false", () => {
    expect(isValidPassword("@password123")).toBe(false);
});

test("password without lowercase should return false", () => {
    expect(isValidPassword("@PASSWORD123")).toBe(false);
});

test("password without number should return false", () => {
    expect(isValidPassword("@Password")).toBe(false);
});

test("password without special character should return false", () => {
    expect(isValidPassword("Password123")).toBe(false);
});

test("password shorte than 8 charactes should return false", () => {
    expect(isValidPassword("@Pass12")).toBe(false);
})