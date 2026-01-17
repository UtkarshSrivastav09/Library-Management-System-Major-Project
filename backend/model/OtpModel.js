// const {model} = require("mongoose");
const {OtpSchema} = require("../schemas/OtpSchema");

// const OtpModel = new model("Otp",OtpSchema);

// module.exports = {OtpModel};

const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  OtpModel: mongoose.model("Otp", otpSchema)
};

