const BorrowModel = require("../model/BorrowModel");
const BookModel = require("../model/BookModel");

/* ================= ISSUE BOOK ================= */
const requestIssueBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const book = await BookModel.findById(bookId);
    if (!book) {
      return res.status(404).json({
        error: true,
        message: "Book not found",
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        error: true,
        message: "Book out of stock",
      });
    }

    // ❌ Prevent duplicate requests
    const existingBorrow = await BorrowModel.findOne({
      bookId,
      userId,
      status: { $in: ["requested", "issued"] },
    });

    if (existingBorrow) {
      return res.status(400).json({
        error: true,
        message: "Book already requested or issued",
      });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrow = new BorrowModel({
      bookId,
      userId,
      dueDate,
      status: "requested", // 👈 consistent lowercase
    });

    await borrow.save();

    return res.status(201).json({
      error: false,
      message: "Book issue requested successfully",
    });
  } catch (error) {
    console.error("Issue book error:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to request book issue",
    });
  }
};

/* ================= RETURN BOOK ================= */
const requestReturnBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const borrow = await BorrowModel.findOne({
      bookId,
      userId,
      status: "issued", // 👈 book must be issued
    });

    if (!borrow) {
      return res.status(404).json({
        error: true,
        message: "No issued book found to return",
      });
    }

    borrow.status = "return_requested"; // 👈 consistent lowercase
    await borrow.save();

    return res.status(200).json({
      error: false,
      message: "Return request sent to librarian",
    });
  } catch (error) {
    console.error("Return book error:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to request return",
    });
  }
};

module.exports = {
  requestIssueBook,
  requestReturnBook,
};
