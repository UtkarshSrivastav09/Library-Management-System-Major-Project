const BorrowModel = require("../model/BorrowModel");
const BookModel = require("../model/BookModel");
const mongoose = require("mongoose");

const librarianController = {};

/* ================= ISSUED BOOKS ================= */
librarianController.bookIssued = async (req, res) => {
  try {
    const issuedBooks = await BorrowModel.find({ status: "issued" })
      .populate("userId", "name email")
      .populate("bookId", "title author");

    res.status(200).json({ success: true, issuedBooks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= ISSUE REQUESTS ================= */
librarianController.issueRequest = async (req, res) => {
  try {
    const requests = await BorrowModel.find({ status: "requested" })
      .populate("userId", "name email")
      .populate("bookId", "title author");

    res.status(200).json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= APPROVE ISSUE ================= */
librarianController.approveRequest = async (req, res) => {
  try {
    const borrow = await BorrowModel.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (borrow.status !== "requested") {
      return res.status(400).json({
        message: "Only requested books can be issued",
      });
    }

    borrow.status = "issued";
    borrow.issueDate = new Date();
    await borrow.save();

    res.json({ success: true, message: "Book issued successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

librarianController.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid request ID" });
    }

    const borrow = await BorrowModel.findById(id);
    if (!borrow) {
      return res.status(404).json({ success: false, message: "Borrow request not found" });
    }

    if (borrow.status !== "requested") {
      return res.status(400).json({
        success: false,
        message: "Only requests with status 'requested' can be cancelled",
      });
    }

    // DELETE THE RECORD INSTEAD OF SETTING STATUS
    await BorrowModel.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Request cancelled successfully" });
  } catch (err) {
    console.error("Cancel request error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* ================= RETURN REQUESTS ================= */
librarianController.returnRequest = async (req, res) => {
  try {
    const requests = await BorrowModel.find({ status: "return_requested" })
      .populate("userId", "name email")
      .populate("bookId", "title author");

    res.status(200).json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= USER REQUEST RETURN ================= */
librarianController.requestReturn = async (req, res) => {
  try {
    const borrow = await BorrowModel.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({ message: "Borrow record not found" });
    }

    if (borrow.status !== "issued") {
      return res.status(400).json({
        message: "Only issued books can be returned",
      });
    }

    borrow.status = "return_requested";
    await borrow.save();

    res.json({ success: true, message: "Return request sent" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= APPROVE RETURN ================= */
librarianController.approveReturnRequest = async (req, res) => {
  try {
    const borrow = await BorrowModel.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({ message: "Borrow record not found" });
    }

    if (borrow.status !== "return_requested") {
      return res.status(400).json({
        message: "Only return requested books can be approved",
      });
    }

    borrow.status = "returned";
    borrow.returnDate = new Date();
    await borrow.save();

    res.json({ success: true, message: "Book returned successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = librarianController;
