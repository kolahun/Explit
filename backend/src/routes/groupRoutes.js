const express = require("express");
const { listGroups, createGroup, getGroup, addMember, removeMember, deleteGroup, joinGroup } = require("../controllers/groupController");
const { protect } = require("../middleware/authMiddleware");
const { requireGroupMember } = require("../middleware/groupAuthMiddleware");

const router = express.Router();

router.use(protect);
router.route("/").get(listGroups).post(createGroup);
router.route("/:groupId").get(requireGroupMember, getGroup).delete(requireGroupMember, deleteGroup);
router.post("/:groupId/join", joinGroup); // invite link — no requireGroupMember
router.post("/:groupId/members", requireGroupMember, addMember);
router.delete("/:groupId/members/:memberId", requireGroupMember, removeMember);

module.exports = router;
