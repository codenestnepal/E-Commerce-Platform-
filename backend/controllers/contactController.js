const Contact = require("../model/contact");

/**
 * @desc   Submit contact form
 * @route  POST /contact
 * @access Public
 */
const submitContact = async (req, res) => {
  try {
    const { fullName, email, subject, message } = req.body;

    const newContact = new Contact({
      fullName,
      email,
      subject,
      message
    });

    await newContact.save();

    res.status(201).json({
      success: true,
      message: "Contact form submitted successfully",
      data: newContact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit contact form",
      error: error.message
    });
  }
};

/**
 * @desc   Get all contact messages
 * @route  GET /contact
 * @access Admin/Public
 */
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact messages",
      error: error.message
    });
  }
};

/**
 * @desc   Get single contact message by ID
 * @route  GET /contact/:id
 * @access Admin/Public
 */
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }

    if (contact.status === "unread") {
      contact.status = "read";
      await contact.save();
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact message",
      error: error.message
    });
  }
};

/**
 * @desc   Delete contact message by ID
 * @route  DELETE /contact/:id
 * @access Admin/Public
 */
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact message deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete contact message",
      error: error.message
    });
  }
};

module.exports = {
  submitContact,
  getAllContacts,
  getContactById,
  deleteContact
};
