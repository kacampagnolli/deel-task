const express = require("express");
const router = express.Router();

const controller = require("../controllers/job");

router.get("/unpaid", controller.listUnpaid);
router.post("/:id/pay", controller.pay);

module.exports = router;
