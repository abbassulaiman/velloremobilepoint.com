const router = require('express').Router();
const ctrl = require('../controllers/contactController');
const { authenticate } = require('../middleware/auth');

// Public
router.post('/', ctrl.create);

// Protected
router.get('/', authenticate, ctrl.list);
router.patch('/:id/status', authenticate, ctrl.updateStatus);

module.exports = router;
