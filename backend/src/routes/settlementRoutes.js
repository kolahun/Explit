const express = require("express");
const { getSettlements, createSettlement, markSettled } = require("../controllers/settlementController");
const { protect } = require("../middleware/authMiddleware");
const { requireGroupMember } = require("../middleware/groupAuthMiddleware");

const router = express.Router();

router.use(protect);
router.get("/group/:groupId", requireGroupMember, getSettlements);
router.post("/", requireGroupMember, createSettlement);
router.patch("/:settlementId/group/:groupId/settle", requireGroupMember, markSettled);

module.exports = router;
