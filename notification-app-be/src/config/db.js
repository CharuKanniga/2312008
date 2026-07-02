const { Sequelize } = require("sequelize");
const path = require("path");

// Define path to the SQLite file inside the src directory
const storagePath = path.join(__dirname, "..", "database.sqlite");

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: storagePath,
    logging: false, // Set to console.log to inspect SQL queries in dev
    define: {
        timestamps: true // Automatically manage createdAt and updatedAt fields
    }
});

module.exports = sequelize;
