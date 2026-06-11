require("dotenv").config();

const app = require("./app");
const env = require("./config/env");
const { initializeDatabase } = require("./database/database");

/**
 * Initialise SQLite puis demarre le serveur HTTP Express.
 * @returns {Promise<void>} Promesse resolue quand le serveur est lance.
 */
const startServer = async () => {
    await initializeDatabase();

    app.listen(env.port, () => {
        console.log(
            `Back-end SQLite demarre sur http://localhost:${env.port}`
        );
    });
};

startServer().catch((error) => {
    console.error("Impossible de demarrer le serveur.", error);
    process.exit(1);
});
