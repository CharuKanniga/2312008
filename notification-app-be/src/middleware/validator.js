const { ALLOWED_LEVELS } = require("../../../logging-middleware");

/**
 * Validates pagination and filter queries for notification retrieval.
 */
function validateFetch(req, res, next) {
    const { type, page, limit, read } = req.query;

    const allowedTypes = ["All", "Placement", "Result", "Event"];
    if (type && !allowedTypes.includes(type)) {
        return res.status(400).json({
            success: false,
            error: `Invalid query parameter 'type'. Allowed values are: ${allowedTypes.join(", ")}`
        });
    }

    if (page !== undefined) {
        const pageNum = parseInt(page, 10);
        if (isNaN(pageNum) || pageNum < 1) {
            return res.status(400).json({
                success: false,
                error: "Query parameter 'page' must be an integer greater than or equal to 1."
            });
        }
    }

    if (limit !== undefined) {
        const limitNum = parseInt(limit, 10);
        if (isNaN(limitNum) || limitNum < 1) {
            return res.status(400).json({
                success: false,
                error: "Query parameter 'limit' must be an integer greater than or equal to 1."
            });
        }
    }

    if (read !== undefined && read !== "true" && read !== "false") {
        return res.status(400).json({
            success: false,
            error: "Query parameter 'read' must be a boolean ('true' or 'false')."
        });
    }

    next();
}

/**
 * Validates request payload for creating a notification.
 */
function validateCreate(req, res, next) {
    const { type, title, message } = req.body;

    if (!type || typeof type !== "string") {
        return res.status(400).json({
            success: false,
            error: "Field 'type' is required and must be a string."
        });
    }

    const allowedTypes = ["Placement", "Result", "Event"];
    if (!allowedTypes.includes(type)) {
        return res.status(400).json({
            success: false,
            error: `Invalid 'type'. Allowed values are: ${allowedTypes.join(", ")}`
        });
    }

    if (!title || typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            success: false,
            error: "Field 'title' is required and must be a non-empty string."
        });
    }

    if (!message || typeof message !== "string" || message.trim() === "") {
        return res.status(400).json({
            success: false,
            error: "Field 'message' is required and must be a non-empty string."
        });
    }

    next();
}

module.exports = {
    validateFetch,
    validateCreate
};
