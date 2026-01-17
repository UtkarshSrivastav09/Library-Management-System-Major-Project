const { UserModel } = require("../model/UserModel");
const BorrowModel = require("../model/BorrowModel");
const BookModel = require("../model/BookModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "12345@abcd12";

const adminController = {};

/* ================= ADD LIBRARIAN ================= */
adminController.addLibrarian = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await UserModel.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    await UserModel.create({ name, email, password: hashed, role });

    res.status(201).json({ message: "Librarian added successfully" });
  } catch (error) {
    console.error("Add librarian error:", error);
    res.status(500).json({ message: "Failed to add librarian" });
  }
};

/* ================= LOGIN ================= */
adminController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user || user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ================= BORROW STATS ================= */
adminController.getBorrowStats = async (req, res) => {
  try {
    const requestedCount = await BorrowModel.countDocuments({ status: "requested" });
    const issuedCount = await BorrowModel.countDocuments({ status: "issued" });

    res.json({
      requested: requestedCount,
      issued: issuedCount,
      totalBorrowed: requestedCount + issuedCount,
    });
  } catch (error) {
    console.error("Borrow stats error:", error);
    res.status(500).json({ message: "Failed to fetch borrow stats" });
  }
};

/* ================= ISSUED BOOKS ================= */
adminController.getIssuedBooks = async (req, res) => {
  try {
    const issued = await BorrowModel.find({ status: "issued" })
      .populate("userId", "name email")
      .populate("bookId", "title author")
      .lean();

    // Map to frontend expected format
    const formatted = issued.map(item => ({
      _id: item._id,
      user: item.userId,
      book: item.bookId,
      issueDate: item.createdAt,
      returnDate: item.dueDate,
      status: item.status
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Issued books error:", error);
    res.status(500).json({ message: "Failed to fetch issued books" });
  }
};

/* ================= GET ALL USERS ================= */
adminController.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().lean();
    res.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* ================= GET ALL BOOKS ================= */
adminController.getAllBooks = async (req, res) => {
  try {
    const books = await BookModel.find().lean();
    res.json({ books });
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

/* ================= GET LATEST BOOKS ================= */
adminController.getLatestBooks = async (req, res) => {
  try {
    const books = await BookModel.find().sort({ createdAt: -1 }).limit(5).lean();
    res.json({ books });
  } catch (error) {
    console.error("Get latest books error:", error);
    res.status(500).json({ message: "Failed to fetch latest books" });
  }
};

module.exports = { adminController };
