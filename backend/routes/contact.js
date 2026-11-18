const express = require("express");
const router = express.Router();
const {
  submitContact,
  getAllContacts,
  getContactById,
  deleteContact
} = require("../controllers/contactController");
const contactValidation = require("../middleware/contactValidation");
const adminAuth = require("../middleware/adminAuth");

// Public contact submission
router.post("/", contactValidation, submitContact);
router.post("/submit", contactValidation, submitContact);
router.post("/contact", contactValidation, submitContact);

// Admin-protected contact inspection & management
router.get("/", adminAuth, getAllContacts);
router.get("/:id", adminAuth, getContactById);
router.delete("/:id", adminAuth, deleteContact);

module.exports = router;
