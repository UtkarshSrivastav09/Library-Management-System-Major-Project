const mongoose = require("mongoose");

// Import schema
const BorrowSchema = require("../schemas/BorrowSchema");

// Prevent model overwrite on hot reload
const BorrowModel =
  mongoose.models.Borrow || mongoose.model("Borrow", BorrowSchema);

// ✅ DEFAULT EXPORT
module.exports = BorrowModel;
