const express = require("express");
const router = express.Router();

const controller = require("../controllers/contract");

router.get("/", controller.listContracts);
router.get("/:id", controller.getContractById);

module.exports = router;
