const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { signToken } = require("../utils/token");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const SALT_ROUNDS = 12;

function authResponse(user) {
  return {
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email }
  };
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash });

  res.status(201).json(authResponse(user));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");
  const passwordMatches = user?.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !passwordMatches) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json(authResponse(user));
});

const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    res.status(400);
    throw new Error("Google credential is required");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const payload = ticket.getPayload();

  const user = await User.findOneAndUpdate(
    { $or: [{ googleId: payload.sub }, { email: payload.email }] },
    { name: payload.name, email: payload.email, googleId: payload.sub },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.json(authResponse(user));
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
});

module.exports = { register, login, googleLogin, getMe };
