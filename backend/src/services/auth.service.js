const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

class AuthService {
  // Generate JWT token
  generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "24h",
    });
  }

  // Generate refresh token
  generateRefreshToken(id) {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
    });
  }

  // Send token response
  sendTokenResponse(user, statusCode, res) {
    const token = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    const options = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    res
      .status(statusCode)
      .cookie("token", token, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        token,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  }

  // Register user
  async register(userData) {
    const user = await User.create(userData);
    return user;
  }

  // Login user
  async login(email, password) {
    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return user;
  }

  // Verify refresh token
  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        throw new Error("User not found or inactive");
      }

      return this.generateToken(user._id);
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }
}

module.exports = new AuthService();
