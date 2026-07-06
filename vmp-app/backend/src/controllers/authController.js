const jwt = require('jsonwebtoken');
const { User } = require('../models');

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ message: 'Mobile and password are required.' });
    }

    const user = await User.findOne({ where: { mobile } });
    if (!user || !user.active) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const valid = await user.verifyPassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
};

const me = async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
};

const createStaff = async (req, res) => {
  try {
    const { name, mobile, password } = req.body;
    if (!name || !mobile || !password) {
      return res.status(400).json({ message: 'Name, mobile, and password are required.' });
    }

    const user = await User.create({ name, mobile, role: 'staff', password_hash: password });
    res.status(201).json({ user: user.toSafeJSON() });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Mobile number already registered.' });
    }
    res.status(500).json({ message: 'Failed to create staff.', error: err.message });
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password_hash'] } });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, active, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (name !== undefined) user.name = name;
    if (active !== undefined) user.active = active;
    if (password) user.password_hash = password;

    await user.save();
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Update failed.', error: err.message });
  }
};

module.exports = { login, me, createStaff, listUsers, updateUser };
