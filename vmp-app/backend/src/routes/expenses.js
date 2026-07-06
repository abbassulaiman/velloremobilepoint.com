const router = require('express').Router();
const multer = require('multer');
const ctrl = require('../controllers/expenseController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authenticate);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.post('/import', upload.single('file'), ctrl.importExcel);
router.put('/:id', ctrl.update);
router.delete('/:id', requireRole('owner'), ctrl.remove);

module.exports = router;
