const Newsletter = require('../model/newsletter.js');

exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;

       
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existingEmail = await Newsletter.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already subscribed",
      });

    }

    const newSubscriber = await Newsletter.create({ email });   
    res.status(201).json({
      success: true,
      message: "Successfully subscribed to the newsletter",
      data: newSubscriber,
    });
  }  catch (error) {
        res.status(500).json({ message: error.message });
    }
}