const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
  getAgents,
} = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/roles.middleware");
const {
  validate,
  registerSchema,
  updateUserSchema,
} = require("../utils/validators");

// Public routes (for agents)
router.get("/agents", protect, getAgents);

// Admin only routes
router.use(protect);
router.use(isAdmin);

router.route("/").get(getUsers).post(validate(registerSchema), createUser);

router
  .route("/:id")
  .get(getUser)
  .put(validate(updateUserSchema), updateUser)
  .delete(deleteUser);

router.put("/:id/role", updateUserRole);

module.exports = router;
