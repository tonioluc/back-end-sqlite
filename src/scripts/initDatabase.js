require("dotenv").config();

const env = require("../config/env");
const {
    initializeDatabase,
    persistDatabase
} = require("../database/database");

/**
 * Initialise le fichier SQLite et persiste les donnees de base.
 * @returns {Promise<void>} Promesse resolue apres initialisation.
 */
const initDatabase = async () => {
    await initializeDatabase();
    persistDatabase();

    console.log(`Base SQLite initialisee: ${env.databaseFile}`);
};

initDatabase().catch((error) => {
    console.error("Initialisation SQLite echouee.", error);
    process.exit(1);
});
