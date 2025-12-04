const Joi = require("joi");

// User validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("user", "agent", "admin").default("user"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  role: Joi.string().valid("user", "agent", "admin"),
  isActive: Joi.boolean(),
});

// Ticket validation schemas
const createTicketSchema = Joi.object({
  subject: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  priority: Joi.string()
    .valid("low", "medium", "high", "urgent")
    .default("medium"),
});

const updateTicketSchema = Joi.object({
  subject: Joi.string().min(5).max(200),
  description: Joi.string().min(10).max(2000),
  priority: Joi.string().valid("low", "medium", "high", "urgent"),
  status: Joi.string().valid("open", "in-progress", "resolved", "closed"),
  assignee: Joi.string().allow(null),
});

const rateTicketSchema = Joi.object({
  score: Joi.number().min(1).max(5).required(),
  feedback: Joi.string().max(500).allow(""),
});

// Comment validation schema
const createCommentSchema = Joi.object({
  text: Joi.string().min(1).max(1000).required(),
  isInternal: Joi.boolean().default(false),
});

// Validate request body
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema,
  createTicketSchema,
  updateTicketSchema,
  rateTicketSchema,
  createCommentSchema,
  validate,
};
