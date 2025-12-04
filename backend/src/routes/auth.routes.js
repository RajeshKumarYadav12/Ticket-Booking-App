const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  refreshToken,
} = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");
const {
  validate,
  registerSchema,
  loginSchema,
} = require("../utils/validators");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.post("/refresh", refreshToken);

module.exports = router;
