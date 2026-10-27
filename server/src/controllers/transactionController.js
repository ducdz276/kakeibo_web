import pool from "../config/db.js";

// 1. Lấy danh sách giao dịch của người dùng đang đăng nhập
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT * FROM transactions
       WHERE user_id = ?
       ORDER BY date DESC, id DESC`,
      [userId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error("❌ LỖI LẤY GIAO DỊCH:", error);

    return res.status(500).json({
      message: "Lỗi server khi lấy giao dịch.",
      error: error.message,
    });
  }
};

// 2. Thêm giao dịch mới
export const addTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, amount, type, category, date } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (
      !title?.trim() ||
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !type ||
      !category ||
      !date
    ) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ thông tin giao dịch!",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Số tiền phải lớn hơn 0!",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Loại giao dịch không hợp lệ!",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO transactions
       (user_id, title, amount, type, category, date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, title.trim(), numericAmount, type, category, date]
    );

    return res.status(201).json({
      message: "Thêm giao dịch thành công!",
      transactionId: result.insertId,
    });
  } catch (error) {
    console.error("❌ LỖI THÊM GIAO DỊCH:", error);

    return res.status(500).json({
      message: "Lỗi server khi thêm giao dịch.",
      error: error.message,
    });
  }
};

// 3. Cập nhật giao dịch
export const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, amount, type, category, date } = req.body;

    if (
      !title?.trim() ||
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !type ||
      !category ||
      !date
    ) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ thông tin giao dịch!",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Số tiền phải lớn hơn 0!",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Loại giao dịch không hợp lệ!",
      });
    }

    // Chỉ cập nhật giao dịch thuộc về người dùng hiện tại
    const [result] = await pool.query(
      `UPDATE transactions
       SET title = ?, amount = ?, type = ?, category = ?, date = ?
       WHERE id = ? AND user_id = ?`,
      [title.trim(), numericAmount, type, category, date, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Không tìm thấy giao dịch để cập nhật!",
      });
    }

    return res.status(200).json({
      message: "Cập nhật giao dịch thành công!",
    });
  } catch (error) {
    console.error("❌ LỖI CẬP NHẬT GIAO DỊCH:", error);

    return res.status(500).json({
      message: "Lỗi server khi cập nhật giao dịch.",
      error: error.message,
    });
  }
};

// 4. Xóa giao dịch
export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Chỉ xóa giao dịch thuộc về người dùng hiện tại
    const [result] = await pool.query(
      `DELETE FROM transactions
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Không tìm thấy giao dịch để xóa!",
      });
    }

    return res.status(200).json({
      message: "Xóa giao dịch thành công!",
    });
  } catch (error) {
    console.error("❌ LỖI XÓA GIAO DỊCH:", error);

    return res.status(500).json({
      message: "Lỗi server khi xóa giao dịch.",
      error: error.message,
    });
  }
};
