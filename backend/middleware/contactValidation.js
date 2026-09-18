const Joi = require("joi");

const contactValidation = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().min(2).max(50).required().messages({
      "string.empty": "Full name is required",
      "string.min": "Full name must be at least 2 characters",
      "string.max": "Full name cannot exceed 50 characters"
    }),
    email: Joi.string().email().required().messages({
      "string.empty": "Email is required",
      "string.email": "Please provide a valid email address"
    }),
    subject: Joi.string().min(3).max(100).required().messages({
      "string.empty": "Subject is required",
      "string.min": "Subject must be at least 3 characters",
      "string.max": "Subject cannot exceed 100 characters"
    }),
    message: Joi.string().min(5).max(1000).required().messages({
      "string.empty": "Message is required",
      "string.min": "Message must be at least 5 characters",
      "string.max": "Message cannot exceed 1000 characters"
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorDetails = error.details.map((err) => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: errorDetails
    });
  }

  next();
};

module.exports = contactValidation;
