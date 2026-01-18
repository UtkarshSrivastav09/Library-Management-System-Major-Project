const express = require('express');
const app = express();
const path = require("path");
// import path from "path";
const cors = require('cors');
const mongoose = require("mongoose");
require('dotenv').config();

// Routes
const users = require("./routes/user.js");
const books = require("./routes/books.js");
const admin = require("./routes/admin.js");
const librarian = require("./routes/librarian.js");
const borrowRoutes = require("./routes/borrow");
const home = require("./routes/home.js"); 
// import contactRoutes from "./routes/contact.js";

// CORS configuration
// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:5173"
// ];

app.use(express.json());

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use((req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes with /api prefix
app.use("/api/users", users);
app.use("/api/books", books);
app.use("/api/admin", admin);
app.use("/api/librarian", librarian);
app.use("/api/home", home); 
app.use("/api/borrow", borrowRoutes);

app.get("/", (req, res) => {
  res.send("Library Management System-----> API is Running..");
});

// Database connection and server start
const PORT = process.env.PORT || 5000;
const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(() => {
    console.log("DB Connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });
