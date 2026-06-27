const jwt = require("jsonwebtoken");

function signToken(user) {
  return jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "2d"
  });
}

module.exports = { signToken };
