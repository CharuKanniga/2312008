const { logError } = require("./logging");

/**
 * Global Express Error Handling Middleware.
 * Catches all unhandled controller/service exceptions, logs them to the Logging API,
 * and returns a clean 500 response.
 */
async function errorHandler(err, req, res, next) {
    const errorMsg = err.stack || err.message || err;
    console.error("[Express Server Error]", errorMsg);

    // Send log to the central evaluation logging server
    await logError("middleware", `Unhandled server error: ${err.message}`);

    res.status(500).json({
        success: false,
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? err.message : "An unexpected error occurred."
    });
}

module.exports = errorHandler;
