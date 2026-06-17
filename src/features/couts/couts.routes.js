const express = require("express");
const controller = require("./couts.controller");

const router = express.Router();

router.get("/", controller.listCouts);
router.post("/tickets-ref", controller.saveTicketRef);
router.get("/tickets-ref/:refTicket", controller.findTicketRef);
router.post("/saisie", controller.createCoutSaisi);
router.post("/reouverture", controller.createCoutReouverture);
router.delete("/saisie/dernier/:ticketId", controller.deleteLatestCoutSaisi);

module.exports = router;
