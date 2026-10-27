import pool from "../config/db.js";


// Cập nhật thông tin cá nhân & Avatar
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, avatar } = req.body;

    await pool.query(
      "UPDATE users SET username = ?, avatar = COALESCE(?, avatar) WHERE id = ?",
      [username, avatar, userId]
    );

    // Lấy thông tin user mới sau khi cập nhật
    const [updatedUser] = await pool.query(
      "SELECT id, username, email, avatar FROM users WHERE id = ?",
      [userId]
    );

    res.status(200).json({
      message: "Cập nhật thông tin thành công!",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("❌ LỖI CẬP NHẬT PROFILE:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
