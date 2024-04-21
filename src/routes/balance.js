const express = require("express");
const router = express.Router();

const controller = require("../controllers/balance");

router.post("/deposit/:userId", controller.deposit);

module.exports = router;
