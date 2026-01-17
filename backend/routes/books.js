const express = require("express");
const router = express.Router();
const { upload } = require("../utils/cloudConfig");
const booksController = require("../controller/book"); // ✅ name is fine
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

// ✅ GET LATEST BOOKS (MOVE THIS UP)
router.get("/latest", booksController.getLatestBooks);

// Get all books
router.get("/", booksController.getAllBooks);

// Get book by ID (KEEP THIS LAST)
router.get("/:id", booksController.getBookById);

// Update book
router.put(
  "/update/:id",
  userAuth,
  checkRole(["admin", "librarian"]),
  booksController.updateBook
);

// Delete book
router.delete(
  "/delete/:id",
  userAuth,
  checkRole(["admin", "librarian"]),
  booksController.deleteBook
);

module.exports = router;
