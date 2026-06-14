const express = require("express");
const kanbanColorsRoutes = require("../features/kanbanColors/kanbanColors.routes");
const coutsRoutes = require("../features/couts/couts.routes");
const resetRoutes = require("../features/reset/reset.routes");
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
router.use("/couts", coutsRoutes);
router.use("/reset", resetRoutes);

module.exports = router;
