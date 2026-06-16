const { Transaction, Expense, MonthlyBalance, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// Configurable via env; defaults to the initial business launch date.
// Must be in YYYY-MM-DD format.
const _rawAnchor = process.env.REPORT_ANCHOR_DATE || '2025-09-01';
const ANCHOR = /^\d{4}-\d{2}-\d{2}$/.test(_rawAnchor) ? _rawAnchor : (() => {
  console.warn(`[reportsController] REPORT_ANCHOR_DATE "${_rawAnchor}" is not YYYY-MM-DD, using default 2025-09-01.`);
  return '2025-09-01';
})();
// YYYY-MM slice of the anchor for BETWEEN comparisons
const ANCHOR_MONTH = ANCHOR.slice(0, 7); // e.g. '2025-09'

/** Validate YYYY-MM string */
function isValidYearMonth(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

/** Validate YYYY string */
function isValidYear(value) {
  return /^\d{4}$/.test(value);
}

/** Return the first and last date string for a given YYYY-MM month */
function monthRange(month) {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, '0')}` };
}

/**
 * Shared helper: compute carry-forward (cumulative net from ANCHOR up to start of `month`).
 * Returns 0 for the anchor month itself.
 */
async function computeCarryForward(month) {
  const upTo = `${month}-01`;
  if (upTo <= ANCHOR) return 0;

  const [txRows] = await sequelize.query(
    `SELECT COALESCE(SUM(amount), 0) AS total_income FROM transactions
     WHERE date >= :from AND date < :to`,
    { replacements: { from: ANCHOR, to: upTo }, type: sequelize.QueryTypes.SELECT }
  );
  const [expRows] = await sequelize.query(
    `SELECT COALESCE(SUM(amount), 0) AS total_expense FROM expenses
     WHERE date >= :from AND date < :to`,
    { replacements: { from: ANCHOR, to: upTo }, type: sequelize.QueryTypes.SELECT }
  );

  return parseFloat(txRows.total_income) - parseFloat(expRows.total_expense);
}

/**
 * Upsert a month's balance snapshot into monthly_balances.
 */
async function saveMonthlyBalance(month, carry_forward, net_profit) {
  const total_cash_available = carry_forward + net_profit;
  await MonthlyBalance.upsert({ month, carry_forward, net_profit, total_cash_available });
}

/**
 * Daily summary: totals for a specific date
 */
const dailySummary = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date query param required.' });

    const [txTotals] = await Transaction.findAll({
      where: { date },
      attributes: [
        [fn('SUM', col('amount')), 'total_amount'],
        [fn('SUM', col('cash')), 'total_cash'],
        [fn('SUM', col('gpay')), 'total_gpay'],
        [fn('SUM', col('vmp_cost')), 'total_cost'],
        [fn('SUM', col('sales_amount')), 'total_sales'],
        [fn('SUM', col('service_amount')), 'total_service'],
        [fn('COUNT', col('id')), 'tx_count'],
      ],
      raw: true,
    });

    const [expTotals] = await Expense.findAll({
      where: { date },
      attributes: [
        [fn('SUM', col('amount')), 'total_expense'],
        [fn('COUNT', col('id')), 'exp_count'],
      ],
      raw: true,
    });

    const transactions = await Transaction.findAll({ where: { date }, order: [['serial_no', 'ASC']] });
    const expenses = await Expense.findAll({ where: { date }, order: [['id', 'ASC']] });

    const totalIncome = parseFloat(txTotals.total_amount) || 0;
    const totalExpense = parseFloat(expTotals.total_expense) || 0;

    res.json({
      date,
      summary: {
        total_income: totalIncome,
        total_sales: parseFloat(txTotals.total_sales) || 0,
        total_service: parseFloat(txTotals.total_service) || 0,
        total_cash: parseFloat(txTotals.total_cash) || 0,
        total_gpay: parseFloat(txTotals.total_gpay) || 0,
        total_cost: parseFloat(txTotals.total_cost) || 0,
        total_expense: totalExpense,
        net_profit: totalIncome - totalExpense,
        tx_count: parseInt(txTotals.tx_count) || 0,
      },
      transactions,
      expenses,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate daily summary.', error: err.message });
  }
};

/**
 * Monthly P&L: aggregate by day for a given month (YYYY-MM)
 */
const monthlySummary = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ message: 'month query param required (YYYY-MM).' });
    if (!isValidYearMonth(month)) return res.status(400).json({ message: 'month must be in YYYY-MM format.' });

    const [year, mo] = month.split('-');
    const from = `${month}-01`;
    const lastDay = new Date(parseInt(year), parseInt(mo), 0).getDate();
    const to = `${month}-${String(lastDay).padStart(2, '0')}`;

    const txByDay = await Transaction.findAll({
      where: { date: { [Op.between]: [from, to] } },
      attributes: [
        'date',
        [fn('SUM', col('amount')), 'income'],
        [fn('SUM', col('sales_amount')), 'sales'],
        [fn('SUM', col('service_amount')), 'service'],
        [fn('SUM', col('vmp_cost')), 'cost'],
      ],
      group: ['date'],
      order: [['date', 'ASC']],
      raw: true,
    });

    const expByDay = await Expense.findAll({
      where: { date: { [Op.between]: [from, to] } },
      attributes: [
        'date',
        [fn('SUM', col('amount')), 'expense'],
      ],
      group: ['date'],
      raw: true,
    });

    const expByCategory = await Expense.findAll({
      where: { date: { [Op.between]: [from, to] } },
      attributes: [
        'category',
        [fn('SUM', col('amount')), 'total'],
      ],
      group: ['category'],
      raw: true,
    });

    const expMap = Object.fromEntries(expByDay.map(e => [e.date, parseFloat(e.expense)]));

    // Merge all dates that have either transactions or expenses
    const allDates = new Set([...txByDay.map(t => t.date), ...expByDay.map(e => e.date)]);
    const txMap = Object.fromEntries(txByDay.map(t => [t.date, t]));

    const days = Array.from(allDates).sort().map(date => {
      const t = txMap[date];
      const income = t ? (parseFloat(t.income) || 0) : 0;
      const expense = expMap[date] || 0;
      return {
        date,
        income,
        sales: t ? (parseFloat(t.sales) || 0) : 0,
        service: t ? (parseFloat(t.service) || 0) : 0,
        cost: t ? (parseFloat(t.cost) || 0) : 0,
        expense,
        net: income - expense,
      };
    });

    const totalIncome = days.reduce((s, d) => s + d.income, 0);
    const totalExpense = days.reduce((s, d) => s + d.expense, 0);
    const netProfit = totalIncome - totalExpense;

    // Compute carry-forward and auto-save snapshot for valid historical months
    const currentMonth = new Date().toISOString().slice(0, 7);
    const carry_forward = (month >= ANCHOR_MONTH && month <= currentMonth)
      ? await computeCarryForward(month)
      : 0;
    if (month >= ANCHOR_MONTH && month <= currentMonth) {
      saveMonthlyBalance(month, carry_forward, netProfit).catch((err) => {
        console.error(`[saveMonthlyBalance] Failed to persist balance for ${month}:`, err.message);
      }); // fire-and-forget
    }

    res.json({
      month,
      summary: {
        total_income: totalIncome,
        total_expense: totalExpense,
        net_profit: netProfit,
        working_days: days.length,
        carry_forward,
        total_cash_available: carry_forward + netProfit,
      },
      by_day: days,
      expense_by_category: expByCategory,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate monthly summary.', error: err.message });
  }
};

/**
 * Customer history: search by name or mobile
 */
const customerHistory = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'q query param required.' });

    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [
          { customer_name: { [Op.like]: `%${q}%` } },
          { mobile: { [Op.like]: `%${q}%` } },
        ],
      },
      order: [['date', 'DESC']],
      limit: 100,
    });

    const totalSpend = transactions.reduce((s, t) => s + parseFloat(t.amount), 0);

    res.json({ query: q, total_visits: transactions.length, total_spend: totalSpend, transactions });
  } catch (err) {
    res.status(500).json({ message: 'Customer search failed.' });
  }
};

/**
 * Staff expense breakdown for a date range
 */
const staffBreakdown = async (req, res) => {
  try {
    const { from, to, month } = req.query;
    let dateFilter = null; // null = no filter

    if (month) {
      const [yr, mo] = month.split('-');
      const lastDay = new Date(parseInt(yr), parseInt(mo), 0).getDate();
      dateFilter = { [Op.between]: [`${month}-01`, `${month}-${String(lastDay).padStart(2, '0')}`] };
    } else if (from || to) {
      dateFilter = {};
      if (from) dateFilter[Op.gte] = from;
      if (to) dateFilter[Op.lte] = to;
    }

    const dateWhere = dateFilter ? { date: dateFilter } : {};

    const breakdown = await Expense.findAll({
      where: { category: 'staff', ...dateWhere },
      attributes: [
        'staff_name',
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('id')), 'entries'],
      ],
      group: ['staff_name'],
      order: [[literal('total'), 'DESC']],
      raw: true,
    });

    const details = await Expense.findAll({
      where: { category: 'staff', ...dateWhere },
      attributes: ['id', 'staff_name', 'date', 'description', 'amount'],
      order: [['staff_name', 'ASC'], ['date', 'ASC']],
      raw: true,
    });

    const detailMap = details.reduce((acc, e) => {
      if (!acc[e.staff_name]) acc[e.staff_name] = [];
      acc[e.staff_name].push(e);
      return acc;
    }, {});

    res.json({ breakdown: breakdown.map(b => ({ ...b, expenses: detailMap[b.staff_name] || [] })) });
  } catch (err) {
    res.status(500).json({ message: 'Staff breakdown failed.' });
  }
};

/**
 * Yearly P&L: aggregate by month for a given year (YYYY)
 */
const yearlySummary = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ message: 'year query param required (YYYY).' });
    if (!isValidYear(year)) return res.status(400).json({ message: 'year must be a 4-digit number (YYYY).' });

    const from = `${year}-01-01`;
    const to = `${year}-12-31`;

    const txByMonth = await Transaction.findAll({
      where: { date: { [Op.between]: [from, to] } },
      attributes: [
        [fn('DATE_FORMAT', col('date'), '%Y-%m'), 'month'],
        [fn('SUM', col('amount')), 'income'],
        [fn('SUM', col('sales_amount')), 'sales'],
        [fn('SUM', col('service_amount')), 'service'],
        [fn('SUM', col('vmp_cost')), 'profit'],
        [fn('COUNT', col('id')), 'tx_count'],
      ],
      group: [fn('DATE_FORMAT', col('date'), '%Y-%m')],
      order: [[fn('DATE_FORMAT', col('date'), '%Y-%m'), 'ASC']],
      raw: true,
    });

    const expByMonth = await Expense.findAll({
      where: { date: { [Op.between]: [from, to] } },
      attributes: [
        [fn('DATE_FORMAT', col('date'), '%Y-%m'), 'month'],
        [fn('SUM', col('amount')), 'expense'],
      ],
      group: [fn('DATE_FORMAT', col('date'), '%Y-%m')],
      raw: true,
    });

    const expByCategory = await Expense.findAll({
      where: { date: { [Op.between]: [from, to] } },
      attributes: [
        'category',
        [fn('SUM', col('amount')), 'total'],
      ],
      group: ['category'],
      order: [[fn('SUM', col('amount')), 'DESC']],
      raw: true,
    });

    const expMap = Object.fromEntries(expByMonth.map(e => [e.month, parseFloat(e.expense)]));
    const txMap = Object.fromEntries(txByMonth.map(t => [t.month, t]));
    const allMonths = new Set([...txByMonth.map(t => t.month), ...expByMonth.map(e => e.month)]);

    const by_month = Array.from(allMonths).sort().map(month => {
      const t = txMap[month];
      const income = t ? (parseFloat(t.income) || 0) : 0;
      const expense = expMap[month] || 0;
      return {
        month,
        income,
        sales: t ? (parseFloat(t.sales) || 0) : 0,
        service: t ? (parseFloat(t.service) || 0) : 0,
        profit: t ? (parseFloat(t.profit) || 0) : 0,
        expense,
        net: income - expense,
        tx_count: t ? (parseInt(t.tx_count) || 0) : 0,
      };
    });

    const totalIncome = by_month.reduce((s, m) => s + m.income, 0);
    const totalExpense = by_month.reduce((s, m) => s + m.expense, 0);
    const totalProfit = by_month.reduce((s, m) => s + m.profit, 0);

    res.json({
      year,
      summary: {
        total_income: totalIncome,
        total_expense: totalExpense,
        net_profit: totalIncome - totalExpense,
        total_profit: totalProfit,
        active_months: by_month.length,
      },
      by_month,
      expense_by_category: expByCategory,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate yearly summary.', error: err.message });
  }
};

/**
 * Cumulative cash: carry-forward balance into the given month (uses shared helper).
 */
const cumulativeCash = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ message: 'month query param required (YYYY-MM).' });
    if (!isValidYearMonth(month)) return res.status(400).json({ message: 'month must be in YYYY-MM format.' });
    const carry_forward = await computeCarryForward(month);
    res.json({ month, carry_forward });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute cumulative cash.', error: err.message });
  }
};

/**
 * All monthly balances: returns every saved snapshot ordered by month.
 * Optionally triggers a full recalculation by passing ?recalc=1.
 */
const allBalances = async (req, res) => {
  try {
    if (req.query.recalc === '1') {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const [monthRows] = await sequelize.query(
        `SELECT DISTINCT DATE_FORMAT(date, '%Y-%m') AS month
         FROM (SELECT date FROM transactions UNION ALL SELECT date FROM expenses) t
         WHERE DATE_FORMAT(date, '%Y-%m') BETWEEN :anchor AND :current
         ORDER BY month`,
        { replacements: { anchor: ANCHOR_MONTH, current: currentMonth } }
      );
      for (const { month } of monthRows) {
        const cf = await computeCarryForward(month);
        const { from, to } = monthRange(month);
        const [txRow] = await sequelize.query(
          `SELECT COALESCE(SUM(amount),0) AS income FROM transactions WHERE date BETWEEN :from AND :to`,
          { replacements: { from, to }, type: sequelize.QueryTypes.SELECT }
        );
        const [expRow] = await sequelize.query(
          `SELECT COALESCE(SUM(amount),0) AS expense FROM expenses WHERE date BETWEEN :from AND :to`,
          { replacements: { from, to }, type: sequelize.QueryTypes.SELECT }
        );
        const net = parseFloat(txRow.income) - parseFloat(expRow.expense);
        await saveMonthlyBalance(month, cf, net);
      }
      // Remove any ghost rows outside the valid range
      await sequelize.query(
        `DELETE FROM monthly_balances WHERE month NOT BETWEEN :anchor AND :current`,
        { replacements: { anchor: ANCHOR_MONTH, current: currentMonth } }
      );
    }

    const balances = await MonthlyBalance.findAll({ order: [['month', 'ASC']] });
    res.json({ balances });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch all balances.', error: err.message });
  }
};

module.exports = { dailySummary, monthlySummary, yearlySummary, customerHistory, staffBreakdown, cumulativeCash, allBalances };
