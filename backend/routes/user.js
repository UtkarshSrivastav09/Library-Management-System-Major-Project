const express = require("express");
const router = express.Router();

const { checkRole } = require("../middlewares/checkRole");
const { userAuth } = require("../middlewares/userAuth");
const userController = require("../controller/user");

// ---------------------------
// Public Routes
// ---------------------------

// Get all users (admin purpose maybe)
router.get("/", userController.getUsers);



// User registration & login
router.post("/register", userController.userRegistration);
router.post("/login", userController.login);

// Contact form
// ✅ Contact form (FIXED)
router.post("/contact", (req, res, next) => {
  console.log("📩 Contact API hit");
  console.log(req.body);
  next(); // pass control to controller
}, userController.addContact);

// Forgot Password Flow
router.post("/forgot-password", userController.forgotPassword); // Send OTP
// router.post("/verify-otp", userController.verifyOTP);            // Verify OTP
router.post("/reset-password", userController.resetPassword);    // Reset password
router.post("/verify-otp", userController.verifyOTP);
router.post("/resend-otp", userController.resendOTP);

// Only admin can add librarian
// Only admin can add librarian
router.post(
    "/admin/addlibrarian",
    userAuth,            // verify JWT
    checkRole("admin"),  // only admin can call this
    userController.addLibrarian
);



// ---------------------------
// Protected Routes (User Only)
// ---------------------------
router.get("/profile", userAuth, checkRole("user"), userController.profile);

module.exports = router;
