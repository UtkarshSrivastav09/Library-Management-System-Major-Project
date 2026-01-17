const express = require("express");
const router = express.Router();
const { upload } = require("../utils/cloudConfig");
const booksController = require("../controller/books");
const { userAuth } = require("../middlewares/userAuth");
const { checkRole } = require("../middlewares/checkRole");

// Add book
router.post(
  "/add",
  userAuth,
  checkRole(["admin", "librarian"]),
  upload.single("coverImage"),
  booksController.addBook
);

// Get all books
router.get("/", userAuth, booksController.getAllBooks);

// Get latest books
router.get("/latest", userAuth, booksController.getLatestBooks);

module.exports = router;
