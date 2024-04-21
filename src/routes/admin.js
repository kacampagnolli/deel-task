const express = require("express");
const router = express.Router();

const controller = require("../controllers/admin");

router.get("/best-profession", controller.bestProfession);
router.get("/best-clients", controller.bestClients);

module.exports = router;
