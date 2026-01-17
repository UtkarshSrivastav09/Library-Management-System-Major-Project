const { UserModel } = require("../model/UserModel");
const { ContactModel } = require("../model/ContactModel");
const { OtpModel } = require("../model/OtpModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "12345@abcd12";

// ================= NODEMAILER =================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Email config error:", error.message);
  } else {
    console.log("✅ Email server ready");
  }
});

const userController = {};

// ================= REGISTER =================
userController.userRegistration = async (req, res) => {
  try {
    const { name, email, password, stream, year, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await UserModel.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
      name,
      email: email.trim(),
      password: hashedPassword,
      stream,
      year,
      role,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= LOGIN =================
userController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email: email.trim() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, // ✅ Include role
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email, role: user.role },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET USERS =================
userController.getUsers = async (req, res) => {
  try {
    const users = await UserModel.find({}, "-password");
    res.status(200).json({
      success: true,
      users,
      totalUsers: users.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= PROFILE =================
userController.profile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= CONTACT =================
userController.addContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1️⃣ Save message to DB
    await new ContactModel({ name, email, subject, message }).save();

    // 2️⃣ Send email to ADMIN (YOU)
    await transporter.sendMail({
      from: `"Library Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // your Gmail
      subject: `📩 Contact Form: ${subject}`,
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b><br/>${message}</p>
      `,
    });

    console.log("✅ Contact email sent");

    res.json({ success: true, message: "Message sent successfully" });

  } catch (error) {
    console.error("❌ Contact email error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};


// ================= FORGOT PASSWORD =================
userController.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim();
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OtpModel.findOneAndUpdate(
      { email },
      { otp, verified: false, createdAt: new Date() },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: `"Library Management" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `<h2>Your OTP: ${otp}</h2><p>Valid for 10 minutes</p>`,
    });

    res.json({ message: "OTP sent to your email" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Email sending failed" });
  }
};

// ================= VERIFY OTP =================
userController.verifyOTP = async (req, res) => {
  try {
    let { email, otp } = req.body;

    email = email?.trim();
    otp = otp?.toString();

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const record = await OtpModel.findOne({ email });

    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const diff = Date.now() - record.createdAt.getTime();
    const minutes = diff / (1000 * 60);

    if (minutes > 10) {
      return res.status(400).json({ message: "OTP expired" });
    }

    record.verified = true;
    await record.save();

    res.json({ message: "OTP verified successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

userController.resendOTP = async (req, res) => {
  try {
    const email = req.body.email?.trim();
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OtpModel.findOneAndUpdate(
      { email },
      { otp, verified: false, createdAt: new Date() },
      { upsert: true }
    );

    await transporter.sendMail({
      from: `"Library Management System || CEO:- Utkarsh" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Resend OTP",
      html: `<h2>Your OTP is: ${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If any error occurred. Feel free to talk with our CEO:- Utkarsh Srivastav</p>`
    });

    res.json({ message: "OTP resent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};


// ================= RESET PASSWORD =================
userController.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const record = await OtpModel.findOne({ email });
    if (!record || !record.verified) {
      return res.status(400).json({ message: "OTP not verified" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.findOneAndUpdate({ email }, { password: hashedPassword });

    await OtpModel.deleteOne({ email });

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// ================= ADD LIBRARIAN =================
// ================= ADD LIBRARIAN =================
userController.addLibrarian = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existingUser = await UserModel.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create librarian
    const librarian = new UserModel({
      name,
      email: email.trim(),
      password: hashedPassword,
      role: "librarian",
    });

    await librarian.save();

    res.status(201).json({ message: "Librarian added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = userController;
