const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "12345@abcd12";

const userAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Check header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: true,
        message: "Authorization token missing",
      });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4️⃣ Attach user to request
    req.user = decoded; // { id, email, role }

    // 5️⃣ Validate decoded data
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: true,
        message: "Unauthorized access",
      });
    }

    console.log("✅ AUTH USER 👉", req.user);

    // 6️⃣ Move to controller
    next();
  } catch (error) {
    console.error("❌ AUTH ERROR:", error.message);
    return res.status(401).json({
      error: true,
      message: "Invalid or expired token",
    });
  }
};

module.exports = { userAuth };
