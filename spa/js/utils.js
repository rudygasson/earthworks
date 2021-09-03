export function assert(condition, data, message) {
    if (!condition) {
        console.table(data);
        throw new Error(message || "Assertion failed");
    }
}
