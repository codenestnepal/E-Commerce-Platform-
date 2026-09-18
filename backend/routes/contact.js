const express = require("express");
const router = express.Router();
const {
  submitContact,
  getAllContacts,
  getContactById,
  deleteContact
} = require("../controllers/contactController");
const contactValidation = require("../middleware/contactValidation");

// @route   POST /contact  (or /contact/submit)
// @desc    Submit contact form
router.post("/", contactValidation, submitContact);
router.post("/submit", contactValidation, submitContact);

// Legacy fallback route in case frontend posts to /contact/contact
router.post("/contact", contactValidation, submitContact);

// @route   GET /contact
// @desc    Get all contact submissions
router.get("/", getAllContacts);

// @route   GET /contact/:id
// @desc    Get single contact submission by ID
router.get("/:id", getContactById);

// @route   DELETE /contact/:id
// @desc    Delete contact submission by ID
router.delete("/:id", deleteContact);

module.exports = router;
