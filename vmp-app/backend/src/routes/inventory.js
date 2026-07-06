const router = require('express').Router();
const ctrl = require('../controllers/inventoryController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.use(authenticate);
router.get('/brands', ctrl.brands);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.patch('/:id/adjust', ctrl.adjustStock);
router.delete('/:id', requireRole('owner'), ctrl.remove);

module.exports = router;
