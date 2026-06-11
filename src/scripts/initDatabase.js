require("dotenv").config();

const env = require("../config/env");
const {
    initializeDatabase,
    persistDatabase
} = require("../database/database");

const initDatabase = async () => {
    await initializeDatabase();
    persistDatabase();

    console.log(`Base SQLite initialisee: ${env.databaseFile}`);
};

initDatabase().catch((error) => {
    console.error("Initialisation SQLite echouee.", error);
    process.exit(1);
});
