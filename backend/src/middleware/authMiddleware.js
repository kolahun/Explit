const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.status(401);
    throw new Error("Authentication token missing");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-__v");
    if (!user) {
      res.status(401);
      throw new Error("User no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Invalid or expired token");
  }
});

module.exports = { protect };
