const express = require('express');
const { signup, login, forgotPassword, resetPassword, getMe } = require('../controllers/authController');
const { signupValidation, loginValidation } = require('../middleware/authValidation');

const router = express.Router();

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', getMe);

module.exports = router;
