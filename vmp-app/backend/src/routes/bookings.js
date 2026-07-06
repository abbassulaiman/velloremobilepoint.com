const router = require('express').Router();
const ctrl = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// Public
router.post('/', ctrl.create);
router.post('/verify-otp', ctrl.verifyOtp);

// Protected
router.get('/', authenticate, ctrl.list);
router.get('/:id', authenticate, ctrl.getOne);
router.patch('/:id/status', authenticate, ctrl.updateStatus);

module.exports = router;
