const express = require("express");
const router = express.Router();

const { isClient } = require("../middleware/isClient");

const controller = require("../controllers/job");

router.get("/unpaid", controller.listUnpaid);
router.post("/:id/pay", isClient, controller.pay);

module.exports = router;
