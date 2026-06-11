const cors = require("cors");
const express = require("express");
const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.use((request, response) => {
    response.status(404).json({
        message: "Endpoint introuvable."
    });
});

app.use((error, request, response, next) => {
    const statusCode = error.statusCode || 500;

    response.status(statusCode).json({
        message: error.message || "Erreur serveur."
    });
});

module.exports = app;
