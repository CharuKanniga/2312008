const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const sequelize = require("./src/config/db");
const notificationRoutes = require("./src/routes/notificationRoutes");
const errorHandler = require("./src/middleware/errorHandler");
const { logInfo, logError } = require("./src/middleware/logging");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend project integration
app.use(cors({
    origin: "*", // Adjust as necessary for production security
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Built-in body parser for JSON payloads
app.use(express.json());

// Main entry route prefix
app.use("/api/notifications", notificationRoutes);

// Register Global Error Handling Middleware
app.use(errorHandler);

// Function to establish database connections and startup Express server
async function startServer() {
    try {
        console.log("Connecting to SQLite database via Sequelize...");
        await sequelize.authenticate();
        console.log("Database connection established successfully.");

        // Synchronize schema tables (forces table creation if missing)
        await sequelize.sync({ alter: true });
        console.log("Database models synchronized successfully.");

        // Start listening
        app.listen(PORT, async () => {
            console.log(`Server is running on port ${PORT}`);
            
            // Log startup to central Logging Service
            await logInfo("config", `Server initialized and running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Critical server startup failed:", error);
        
        // Log critical failure to Logging Service before exit
        try {
            await logError("config", `Critical startup failure: ${error.message}`);
        } catch (logErr) {
            console.error("Logging service unreachable during startup crash:", logErr);
        }
        
        process.exit(1);
    }
}

startServer();
