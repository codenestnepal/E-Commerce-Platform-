const express = require("express");
const { subscribe } = require("../controllers/newsletterController.js");

const router = express.Router();

router.post("/subscribe", subscribe);

module.exports = router;