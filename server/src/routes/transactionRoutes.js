import express from "express";
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
} from "../controllers/transactionController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getTransactions);
router.post("/", verifyToken, addTransaction);
router.delete("/:id", verifyToken, deleteTransaction);
router.put("/:id", verifyToken, updateTransaction);

export default router;
