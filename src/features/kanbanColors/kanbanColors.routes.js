const express = require("express");
const controller = require("./kanbanColors.controller");

const router = express.Router();

router.get("/", controller.listColors);
router.put("/", controller.updateColors);
router.put("/:statusKey", controller.updateColor);

module.exports = router;
