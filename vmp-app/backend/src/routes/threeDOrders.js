const router = require('express').Router();
const ctrl = require('../controllers/threeDOrderController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.use(authenticate);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', requireRole('owner'), ctrl.remove);

module.exports = router;
