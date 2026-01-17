const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

router.post("/contact", async (req, res) => {
  res.json({ message: "Contact route working" });
});

module.exports = router;
