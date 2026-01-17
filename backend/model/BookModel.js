const mongoose = require("mongoose");
const bookSchema = new mongoose.Schema(
  {
    title: String,
    author: String,
    category: String,
    isbn: String,
    totalCopies: Number,
    availableCopies: Number,
    price: Number,
    description: String,
    coverImage: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);