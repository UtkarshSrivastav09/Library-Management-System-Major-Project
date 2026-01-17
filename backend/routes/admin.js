const express = require("express");
const router = express.Router();
const { adminController } = require("../controller/admin");
const { userAuth } = require("../middlewares/userAuth");
const { checkRole } = require("../middlewares/checkRole");

// Admin login
router.post("/login", adminController.login);

// Add librarian (admin only)
router.post(
  "/addlibrarian",
  userAuth,
  checkRole("admin"),
  adminController.addLibrarian
);

// Borrowed stats (Admin + Librarian)
router.get(
  "/borrow-stats",
  userAuth,
  checkRole(["admin", "librarian"]),
  adminController.getBorrowStats
);

// Issued books list (Admin + Librarian)
router.get(
  "/issued-books",
  userAuth,
  checkRole(["admin", "librarian"]),
  adminController.getIssuedBooks
);

// All users (Admin + Librarian)
router.get(
  "/users",
  userAuth,
  checkRole(["admin", "librarian"]),
  adminController.getAllUsers
);

// All books (Admin + Librarian)
router.get(
  "/books",
  userAuth,
  checkRole(["admin", "librarian"]),
  adminController.getAllBooks
);

// Latest books
router.get(
  "/books/latest",
  userAuth,
  checkRole(["admin", "librarian"]),
  adminController.getLatestBooks
);

module.exports = router;
