// Turn a 24-hour time like "18:13:00" into 12-hour format like "6:13 PM"
export function formatTime(time) {
    if (!time) return "";

    const [hourText, minute] = time.split(":");
    const hour = Number(hourText);
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;

    return `${hour12}:${minute} ${suffix}`;
}