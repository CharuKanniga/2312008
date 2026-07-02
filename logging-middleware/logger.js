const axios = require("axios");
const path = require("path");

// Safely load environment variables if they aren't loaded already
if (!process.env.ACCESS_TOKEN) {
    try {
        require("dotenv").config({ path: path.join(__dirname, ".env") });
    } catch (err) {
        // Dotenv package or file not present, will rely on environment variables
    }
}

const LOG_API = "http://4.224.186.213/evaluation-service/logs";

// Allowed stacks, levels, and packages based on AffordMed specifications
const ALLOWED_STACKS = ["backend", "frontend"];
const ALLOWED_LEVELS = ["debug", "info", "warn", "error", "fatal"];

const BACKEND_PACKAGES = [
    "cache",
    "controller",
    "cron_job",
    "db",
    "domain",
    "handler",
    "repository",
    "route",
    "service"
];

const FRONTEND_PACKAGES = [
    "api",
    "component",
    "hook",
    "page",
    "state",
    "style"
];

const COMMON_PACKAGES = [
    "auth",
    "config",
    "middleware",
    "utils"
];

/**
 * Validates inputs for the logging middleware according to stack-specific package rules.
 * 
 * @param {string} stack - Tech stack / environment ('backend' or 'frontend')
 * @param {string} level - Severity level ('debug', 'info', 'warn', 'error', 'fatal')
 * @param {string} packageName - Application module/component where log originated
 * @param {string} message - Descriptive log message
 * @returns {string|null} Validation error message if invalid, or null if valid
 */
function validateLogInput(stack, level, packageName, message) {
    if (!stack || typeof stack !== "string") {
        return "Parameter 'stack' is required and must be a string.";
    }
    const stackLower = stack.toLowerCase();
    if (!ALLOWED_STACKS.includes(stackLower)) {
        return `Invalid stack: "${stack}". Allowed values are: ${ALLOWED_STACKS.join(", ")}`;
    }

    if (!level || typeof level !== "string") {
        return "Parameter 'level' is required and must be a string.";
    }
    const levelLower = level.toLowerCase();
    if (!ALLOWED_LEVELS.includes(levelLower)) {
        return `Invalid level: "${level}". Allowed values are: ${ALLOWED_LEVELS.join(", ")}`;
    }

    if (!packageName || typeof packageName !== "string") {
        return "Parameter 'package' is required and must be a string.";
    }
    const packageLower = packageName.toLowerCase();

    // Verify package is allowed within the specified stack or common packages
    if (stackLower === "backend") {
        const allowedBackend = [...BACKEND_PACKAGES, ...COMMON_PACKAGES];
        if (!allowedBackend.includes(packageLower)) {
            return `Invalid package: "${packageName}" for backend stack. Allowed packages: ${allowedBackend.join(", ")}`;
        }
    } else if (stackLower === "frontend") {
        const allowedFrontend = [...FRONTEND_PACKAGES, ...COMMON_PACKAGES];
        if (!allowedFrontend.includes(packageLower)) {
            return `Invalid package: "${packageName}" for frontend stack. Allowed packages: ${allowedFrontend.join(", ")}`;
        }
    }

    if (!message || typeof message !== "string" || message.trim() === "") {
        return "Parameter 'message' is required and must be a non-empty string.";
    }

    if (!process.env.ACCESS_TOKEN) {
        return "Configuration error: ACCESS_TOKEN environment variable is not defined.";
    }

    return null;
}

/**
 * Logs a message to the evaluation service API.
 * Handles timeouts, network errors, authentication failures, and bad input validation.
 * 
 * @param {string} stack - Tech stack / environment ('backend' or 'frontend')
 * @param {string} level - Severity level ('debug', 'info', 'warn', 'error', 'fatal')
 * @param {string} packageName - Application module/component where log originated
 * @param {string} message - Descriptive log message
 * @param {object} [options] - Custom request overrides (used for testing timeouts/URLs)
 * @returns {Promise<object>} Structured response object indicating success or failure
 */
async function Log(stack, level, packageName, message, options = {}) {
    try {
        // 1. Perform validation checks before sending request
        const validationError = validateLogInput(stack, level, packageName, message);
        if (validationError) {
            console.error(`[Logging Middleware] Validation Error: ${validationError}`);
            return {
                success: false,
                error: "Validation failed",
                details: validationError
            };
        }

        const url = options.url || LOG_API;
        const timeout = options.timeout !== undefined ? options.timeout : 5000;

        // Truncate message if it exceeds 48 characters to satisfy logging API length constraints
        let sanitizedMessage = message;
        if (sanitizedMessage.length > 48) {
            sanitizedMessage = sanitizedMessage.substring(0, 45) + "...";
        }

        // 2. Perform Axios POST request to evaluation service
        const response = await axios.post(
            url,
            {
                stack: stack.toLowerCase(),
                level: level.toLowerCase(),
                package: packageName.toLowerCase(),
                message: sanitizedMessage,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
                timeout,
            }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        let errorMessage = "An unexpected error occurred while sending log";
        let status = null;
        let details = null;

        if (error.code === "ECONNABORTED" || error.message.toLowerCase().includes("timeout")) {
            // Request timed out
            errorMessage = `Request timed out after ${options.timeout || 5000}ms`;
            details = error.message;
        } else if (error.response) {
            // Server responded with a non-2xx status code
            status = error.response.status;
            details = error.response.data;
            if (status === 401) {
                errorMessage = "Authentication failed (invalid or expired access token)";
            } else if (status === 403) {
                errorMessage = "Access forbidden to logging service";
            } else {
                errorMessage = `API responded with error (status ${status})`;
            }
        } else if (error.request) {
            // Request was made but no response was received (network issue / down host)
            errorMessage = "No response received from logging service (network error)";
            details = error.message;
        } else {
            // Something happened in setting up the request
            errorMessage = error.message;
        }

        console.error(`[Logging Middleware] Logging failed: ${errorMessage}`, details || "");

        return {
            success: false,
            error: errorMessage,
            status,
            details
        };
    }
}

module.exports = {
    Log,
    ALLOWED_STACKS,
    ALLOWED_LEVELS,
    BACKEND_PACKAGES,
    FRONTEND_PACKAGES,
    COMMON_PACKAGES
};
