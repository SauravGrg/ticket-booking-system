const { isValidRole, isAdmin, isOrganizer } = require("../roleValidator");

test("valid system roles should return true", () => {
    expect(isValidRole("Administrator")).toBe(true);
    expect(isValidRole("Organizer")).toBe(true);
    expect(isValidRole("Regular User")).toBe(true);
});

test("invalid or unrecognized roles should return false", () => {
    expect(isValidRole("Guest")).toBe(false);
    expect(isValidRole("SuperAdmin")).toBe(false);
    expect(isValidRole("")).toBe(false);
    expect(isValidRole(null)).toBe(false);
});

test("only Administrator should return true for isAdmin", () => {
    expect(isAdmin("Administrator")).toBe(true);
    expect(isAdmin("Organizer")).toBe(false);
    expect(isAdmin("Regular User")).toBe(false);
});

test("only Organizer should return true for isOrganizer", () => {
    expect(isOrganizer("Organizer")).toBe(true);
    expect(isOrganizer("Regular User")).toBe(false);
    expect(isOrganizer("Administrator")).toBe(false);
});