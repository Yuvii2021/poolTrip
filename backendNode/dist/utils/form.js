export function getArrayField(req, fieldName) {
    const body = req.body;
    const values = [];
    const direct = body[fieldName];
    if (Array.isArray(direct)) {
        for (const v of direct)
            values.push(String(v));
    }
    else if (typeof direct === "string" && direct.length > 0) {
        values.push(direct);
    }
    for (const [key, value] of Object.entries(body)) {
        if (key.startsWith(`${fieldName}[`)) {
            values.push(String(value));
        }
    }
    return values;
}
export function parseBoolean(value, fallback) {
    if (typeof value === "boolean")
        return value;
    if (typeof value === "string")
        return value.toLowerCase() === "true";
    return fallback;
}
export function parseNumber(value) {
    if (typeof value === "number")
        return value;
    if (typeof value === "string" && value.length > 0) {
        const n = Number(value);
        if (!Number.isNaN(n))
            return n;
    }
    return undefined;
}
