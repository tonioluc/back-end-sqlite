const express = require("express");
const controller = require("./reset.controller");

const router = express.Router();

router.delete("/couts", controller.resetCouts);

module.exports = router;
