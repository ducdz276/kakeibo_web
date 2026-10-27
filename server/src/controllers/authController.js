import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// API Đăng ký (Register)
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    const [existingUsers] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email này đã được sử dụng!" });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Lưu vào database
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    res
      .status(201)
      .json({ message: "Đăng ký thành công!", userId: result.insertId });
  } catch (error) {
    // Dòng này sẽ in chi tiết lỗi màu đỏ ra màn hình Terminal của Server
    console.error("❌ LỖI ĐĂNG KÝ:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// API Đăng nhập (Login)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user theo email
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng!" });
    }

    const user = users[0];

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng!" });
    }

    // Tạo token (JWT)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    // Dòng này sẽ in chi tiết lỗi màu đỏ ra màn hình Terminal của Server
    console.error("❌ LỖI ĐĂNG NHẬP:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
