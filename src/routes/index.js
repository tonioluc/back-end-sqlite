const express = require("express");
const kanbanColorsRoutes = require("../features/kanbanColors/kanbanColors.routes");

/**
 * Routeur principal de l'API SQLite.
 * @type {import("express").Router}
 */
const router = express.Router();

router.get("/health", (request, response) => {
    response.json({
        status: "ok"
    });
});

router.use("/kanban-colors", kanbanColorsRoutes);

module.exports = router;
