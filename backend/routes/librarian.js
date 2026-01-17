const express = require("express");
const router = express.Router();
const librarianController  = require("../controller/librarian");
const { userAuth } = require("../middlewares/userAuth");
const { checkRole } = require("../middlewares/checkRole");

/* ===================== ISSUED BOOKS ===================== */
// Get all issued books (Admins & Librarians)
router.get(
  "/bookissued",
  userAuth,
  checkRole(["admin", "librarian"]),
  librarianController.bookIssued
);

/* ===================== ISSUE REQUESTS ===================== */
// Get all issue requests (Librarians)
router.get(
  "/issuerequest",
  userAuth,
  checkRole(["librarian"]),
  librarianController.issueRequest
);

/* ===================== RETURN REQUESTS ===================== */
// Get all return requests (Librarians)
router.get(
  "/returnrequest",
  userAuth,
  checkRole(["librarian"]),
  librarianController.returnRequest
);

/* ===================== USER RETURN REQUEST ===================== */
// User requests to return an issued book
router.put(
  "/request-return/:id",
  userAuth,
  checkRole(["user"]),
  librarianController.requestReturn
);


/* ===================== APPROVALS ===================== */
// Approve a book issue request (Librarians)
router.put(
  "/approverequest/:id",
  userAuth,
  checkRole(["librarian"]),
  librarianController.approveRequest
);

// Approve a return request (Librarians)
router.put(
  "/approvereturnrequest/:id",
  userAuth,
  checkRole(["librarian"]),
  librarianController.approveReturnRequest
);

/* ===================== CANCEL ISSUE REQUEST ===================== */
// Cancel a requested book (Librarians)
router.delete(
  "/cancelrequest/:id",
  userAuth,
  checkRole(["librarian"]),
  librarianController.cancelRequest
);



module.exports = router;
