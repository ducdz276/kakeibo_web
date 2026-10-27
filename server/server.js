import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import transactionRoutes from "./src/routes/transactionRoutes.js";

dotenv.config();
const app = express();

app.use(cors());

// 👇 CỰC KỲ QUAN TRỌNG: Tăng giới hạn dung lượng nhận JSON lên 10MB để tải ảnh đại diện
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Khai báo các đường dẫn API
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", authRoutes); // Hoặc route profile của bạn

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
