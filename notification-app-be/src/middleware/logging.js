// Import the Logging Middleware from Question 1 (using relative path)
const { Log } = require("../../../logging-middleware");

/**
 * Log an informational event.
 * @param {string} packageName - The module name (e.g. 'handler', 'service', 'middleware')
 * @param {string} message - Descriptive log message
 */
async function logInfo(packageName, message) {
    try {
        await Log("backend", "info", packageName, message);
    } catch (err) {
        console.error("[Logger integration error]", err);
    }
}

/**
 * Log a warning event.
 * @param {string} packageName - The module name
 * @param {string} message - Descriptive log message
 */
async function logWarn(packageName, message) {
    try {
        await Log("backend", "warn", packageName, message);
    } catch (err) {
        console.error("[Logger integration error]", err);
    }
}

/**
 * Log an error event.
 * @param {string} packageName - The module name
 * @param {string} message - Descriptive log message
 */
async function logError(packageName, message) {
    try {
        await Log("backend", "error", packageName, message);
    } catch (err) {
        console.error("[Logger integration error]", err);
    }
}

/**
 * Log a debug event.
 * @param {string} packageName - The module name
 * @param {string} message - Descriptive log message
 */
async function logDebug(packageName, message) {
    try {
        await Log("backend", "debug", packageName, message);
    } catch (err) {
        console.error("[Logger integration error]", err);
    }
}

/**
 * Log a fatal crash event.
 * @param {string} packageName - The module name
 * @param {string} message - Descriptive log message
 */
async function logFatal(packageName, message) {
    try {
        await Log("backend", "fatal", packageName, message);
    } catch (err) {
        console.error("[Logger integration error]", err);
    }
}

module.exports = {
    logInfo,
    logWarn,
    logError,
    logDebug,
    logFatal
};
