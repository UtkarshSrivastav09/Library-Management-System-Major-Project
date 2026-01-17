const BookModel = require("../model/BookModel");
// const { BorrowModel } = require("../model/BorrowModel");

const calculateFine = require("../utils/fineCalculator");
const { clearCache } = require("../utils/cache");

const booksController = {};

// ================= ADD BOOK =================
booksController.addBook = async (req, res) => {
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
      addedBy: req.user.id,
    });

    await book.save();

    res.status(201).json({
      error: false,
      message: "Book added successfully",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// ================= GET BOOK BY ID =================
booksController.getBookById = async (req, res) => {
  try {
    const book = await BookModel.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        error: true,
        message: "Book not found",
      });
    }

    res.status(200).json({
      error: false,
      book,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch book details",
    });
  }
};

// ================= GET ALL BOOKS =================
booksController.getAllBooks = async (req, res) => {
  try {
    const books = await BookModel.find();

    res.status(200).json({
      error: false,
      message: "Books fetched successfully",
      books,
      totalBooks: books.length,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// ================= GET LATEST BOOKS =================
booksController.getLatestBooks = async (req, res) => {
  try {
    const books = await BookModel.find().sort({ createdAt: -1 });

    res.status(200).json({
      error: false,
      books,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// ================= UPDATE BOOK =================
booksController.updateBook = async (req, res) => {
  try {
    const book = await BookModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    clearCache("homeData");

    res.json({ message: "Book updated", book });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE BOOK =================
booksController.deleteBook = async (req, res) => {
  try {
    const book = await BookModel.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    await BookModel.findByIdAndDelete(req.params.id);
    clearCache("homeData");

    res.json({ message: "Book deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = booksController;
