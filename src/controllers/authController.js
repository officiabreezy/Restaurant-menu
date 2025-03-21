const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require("../config/db");
// const dotenv = require('dotenv').config();  

const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email }}); 
      if (user)
        return res.status(400).json({ error: 'Email already exists, pls login  credentials' });
      
      const hashedPassword = await bcrypt.hash(password, 10);
       await prisma.user.create({
        data: { name, email, password: hashedPassword, role: role},
      });

    res.status(201).json({ message: 'User created successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "User registration failed" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(201).json({ token, userId:user.id });
    } catch (error) {
        console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
}

module.exports = {register,login}
