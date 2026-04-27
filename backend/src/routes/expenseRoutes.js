const express = require("express");
const { listExpenses, addExpense, updateExpense, deleteExpense } = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");
const { requireGroupMember } = require("../middleware/groupAuthMiddleware");

const router = express.Router();

router.use(protect);
router.get("/group/:groupId", requireGroupMember, listExpenses);
router.post("/", requireGroupMember, addExpense);
router.put("/:expenseId", requireGroupMember, updateExpense);
router.delete("/:expenseId", requireGroupMember, deleteExpense);

module.exports = router;
