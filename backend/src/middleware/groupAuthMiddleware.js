const asyncHandler = require("express-async-handler");
const Group = require("../models/Group");

const requireGroupMember = asyncHandler(async (req, res, next) => {
  const groupId = req.params.groupId || req.body.groupId || req.query.groupId;
  if (!groupId) {
    res.status(400);
    throw new Error("groupId is required");
  }

  const group = await Group.findById(groupId);
  if (!group) {
    res.status(404);
    throw new Error("Group not found");
  }

  const isMember = group.members.some((memberId) => memberId.equals(req.user._id));
  if (!isMember) {
    res.status(403);
    throw new Error("You are not a member of this group");
  }

  req.group = group;
  next();
});

module.exports = { requireGroupMember };
