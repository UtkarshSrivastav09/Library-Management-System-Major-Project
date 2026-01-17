const BookModel = require("../model/BookModel");
const multer = require("multer");
const path = require("path");

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // make sure uploads/ exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ================= CONTROLLER =================
const bookController = {};

// ADD BOOK
bookController.addBook = async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      isbn,
      totalCopies,
      price,
      description,
    } = req.body;

    const book = new BookModel({
      title,
      author,
      category,
      isbn,
      totalCopies,
      availableCopies: totalCopies,
      price,
      description,
      coverImage: req.file?.path || null,
      addedBy: req.user.id, // ✅ IMPORTANT
    });

    await book.save();

    res.status(201).json({
      error: false,
      message: "Book added successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

module.exports = bookController;

