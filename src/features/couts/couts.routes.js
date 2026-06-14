const express = require("express");
const controller = require("./couts.controller");

const router = express.Router();

router.get("/", controller.listCouts);
router.post("/saisie", controller.createCoutSaisi);
router.post("/reouverture", controller.createCoutReouverture);
router.delete("/saisie/dernier/:ticketId", controller.deleteLatestCoutSaisi);

module.exports = router;
