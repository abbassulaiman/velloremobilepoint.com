const router = require('express').Router();
const ctrl = require('../controllers/cmsController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// Public reads
router.get('/services', ctrl.listServices);
router.get('/settings', ctrl.getSettings);

// Protected writes (owner only)
router.post('/services', authenticate, requireRole('owner'), ctrl.createService);
router.put('/services/:id', authenticate, requireRole('owner'), ctrl.updateService);
router.delete('/services/:id', authenticate, requireRole('owner'), ctrl.deleteService);
router.put('/settings', authenticate, requireRole('owner'), ctrl.updateSettings);

module.exports = router;
