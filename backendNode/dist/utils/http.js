export class ApiError extends Error {
    status;
    details;
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
}
export function toNumber(value) {
    if (value === undefined)
        return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}
export function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
