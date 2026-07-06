const router = require('express').Router();
const ctrl = require('../controllers/reportsController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.use(authenticate);

router.get('/daily', ctrl.dailySummary);
router.get('/monthly', ctrl.monthlySummary);
router.get('/yearly', ctrl.yearlySummary);
router.get('/customers', ctrl.customerHistory);
router.get('/staff', ctrl.staffBreakdown);
// Owner-only: expose financial carry-forward data
router.get('/cumulative-cash', requireRole('owner'), ctrl.cumulativeCash);
router.get('/all-balances',    requireRole('owner'), ctrl.allBalances);

module.exports = router;
