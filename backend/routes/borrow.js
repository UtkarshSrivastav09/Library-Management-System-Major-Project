const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/userAuth");
const borrowController = require("../controller/borrow1");

// ISSUE BOOK
router.post(
  "/request-issue/:bookId",
  userAuth,
  borrowController.requestIssueBook
);

// ✅ RETURN BOOK (ADDED)
router.post(
  "/request-return/:bookId",
  userAuth,
  borrowController.requestReturnBook
);

module.exports = router;
