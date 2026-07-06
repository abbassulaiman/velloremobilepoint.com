const router = require('express').Router();
const { login, me, createStaff, listUsers, updateUser } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.post('/login', login);
router.get('/me', authenticate, me);
router.post('/staff', authenticate, requireRole('owner'), createStaff);
router.get('/users', authenticate, requireRole('owner'), listUsers);
router.put('/users/:id', authenticate, requireRole('owner'), updateUser);

module.exports = router;
