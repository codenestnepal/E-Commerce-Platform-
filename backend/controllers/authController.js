const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/User');

const signup = async (req, res) => {

  try {
    const { fName, lName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists", success: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      FName: fName,
      LName: lName,
      email: email,
      password: hashedPassword
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully", success: true });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

}


const login = async (req, res) => {

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({ message: "User not found", success: false });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }
    const jwtToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ message: "Login successful", success: true, user, jwtToken, email: user.email, role: user.role, verified: user.verified });

  }catch (error) {
    res.status(500).json({ message: error.message });
  }

}

     

module.exports = { 
    signup,
    login
}