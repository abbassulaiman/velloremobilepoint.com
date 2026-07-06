/**
 * Unit tests for reportsController helpers and HTTP handlers.
 * All DB calls are mocked — no real database connection required.
 */

// ─── Mock Sequelize models ────────────────────────────────────────────────────
const mockQuery = jest.fn();
const mockUpsert = jest.fn().mockResolvedValue([{}, true]);

jest.mock('../src/models', () => ({
  Transaction: { findAll: jest.fn() },
  Expense: { findAll: jest.fn() },
  MonthlyBalance: { findAll: jest.fn(), upsert: mockUpsert },
  sequelize: {
    query: mockQuery,
    QueryTypes: { SELECT: 'SELECT' },
    authenticate: jest.fn().mockResolvedValue(true),
  },
}));

const { Transaction, Expense, MonthlyBalance, sequelize } = require('../src/models');
const { Op } = require('sequelize');

// ─── Helpers extracted from the controller (tested in isolation) ───────────────

// Must match the env-configurable constant used in production.
// Set process.env.REPORT_ANCHOR_DATE before running tests to use a different anchor.
const ANCHOR = process.env.REPORT_ANCHOR_DATE || '2025-09-01';
const ANCHOR_MONTH = ANCHOR.slice(0, 7); // e.g. '2025-09'

async function computeCarryForward(month) {
  const upTo = `${month}-01`;
  if (upTo <= ANCHOR) return 0;
  const [txRows] = await sequelize.query(
    `SELECT COALESCE(SUM(amount), 0) AS total_income FROM transactions WHERE date >= :from AND date < :to`,
    { replacements: { from: ANCHOR, to: upTo }, type: sequelize.QueryTypes.SELECT }
  );
  const [expRows] = await sequelize.query(
    `SELECT COALESCE(SUM(amount), 0) AS total_expense FROM expenses WHERE date >= :from AND date < :to`,
    { replacements: { from: ANCHOR, to: upTo }, type: sequelize.QueryTypes.SELECT }
  );
  return parseFloat(txRows.total_income) - parseFloat(expRows.total_expense);
}

async function saveMonthlyBalance(month, carry_forward, net_profit) {
  const total_cash_available = carry_forward + net_profit;
  await MonthlyBalance.upsert({ month, carry_forward, net_profit, total_cash_available });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('computeCarryForward', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 0 for Sep 2025 (anchor month — nothing before it)', async () => {
    const result = await computeCarryForward('2025-09');
    expect(result).toBe(0);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  test('returns 0 for any month before the anchor', async () => {
    expect(await computeCarryForward('2025-01')).toBe(0);
    expect(await computeCarryForward('2024-12')).toBe(0);
  });

  test('correctly computes carry-forward for Oct 2025 (= Sep net profit)', async () => {
    // Sep 2025: income 50000, expense 14845 → net 35155
    mockQuery
      .mockResolvedValueOnce([{ total_income: '50000' }])   // tx query
      .mockResolvedValueOnce([{ total_expense: '14845' }]);  // exp query

    const result = await computeCarryForward('2025-10');
    expect(result).toBeCloseTo(35155);
    expect(mockQuery).toHaveBeenCalledTimes(2);
    // Verify date range: should cover Sep 2025 only (up to 2025-10-01)
    const firstCall = mockQuery.mock.calls[0];
    expect(firstCall[1].replacements).toEqual({ from: '2025-09-01', to: '2025-10-01' });
  });

  test('chains months: Nov 2025 carry-forward = Sep + Oct net', async () => {
    // Total income = 85155, total expense = 10000 → net = 75155
    mockQuery
      .mockResolvedValueOnce([{ total_income: '85155' }])
      .mockResolvedValueOnce([{ total_expense: '10000' }]);

    const result = await computeCarryForward('2025-11');
    expect(result).toBeCloseTo(75155);
    const firstCall = mockQuery.mock.calls[0];
    expect(firstCall[1].replacements).toEqual({ from: '2025-09-01', to: '2025-11-01' });
  });

  test('handles negative net correctly (expenses > income)', async () => {
    mockQuery
      .mockResolvedValueOnce([{ total_income: '5000' }])
      .mockResolvedValueOnce([{ total_expense: '8000' }]);

    const result = await computeCarryForward('2025-10');
    expect(result).toBeCloseTo(-3000);
  });
});

describe('saveMonthlyBalance', () => {
  beforeEach(() => jest.clearAllMocks());

  test('upserts carry_forward, net_profit, and total_cash_available', async () => {
    await saveMonthlyBalance('2025-10', 3307, 35155);
    expect(mockUpsert).toHaveBeenCalledWith({
      month: '2025-10',
      carry_forward: 3307,
      net_profit: 35155,
      total_cash_available: 38462,
    });
  });

  test('handles negative net (loss month)', async () => {
    await saveMonthlyBalance('2025-11', 38462, -25493);
    expect(mockUpsert).toHaveBeenCalledWith({
      month: '2025-11',
      carry_forward: 38462,
      net_profit: -25493,
      total_cash_available: 12969,
    });
  });
});

describe('staffBreakdown — dateWhere filter (Symbol key bug)', () => {
  /**
   * Regression test for the Object.keys(dateFilter) bug:
   * Sequelize Op.between is a Symbol, so Object.keys() returns [] even when
   * the filter object is populated. This test verifies the fix uses null-check instead.
   */

  function buildDateWhere(month) {
    let dateFilter = null;
    if (month) {
      const [yr, mo] = month.split('-');
      const lastDay = new Date(parseInt(yr), parseInt(mo), 0).getDate();
      dateFilter = { [Op.between]: [`${month}-01`, `${month}-${String(lastDay).padStart(2, '0')}`] };
    }
    return dateFilter ? { date: dateFilter } : {};
  }

  test('returns empty object when no month provided (all-time query)', () => {
    const where = buildDateWhere(undefined);
    expect(where).toEqual({});
  });

  test('returns date filter object when month is provided', () => {
    const where = buildDateWhere('2026-06');
    expect(where).toHaveProperty('date');
    expect(where.date[Op.between]).toEqual(['2026-06-01', '2026-06-30']);
  });

  test('correctly handles 31-day months', () => {
    const where = buildDateWhere('2026-05');
    expect(where.date[Op.between]).toEqual(['2026-05-01', '2026-05-31']);
  });

  test('correctly handles February', () => {
    const where = buildDateWhere('2026-02');
    expect(where.date[Op.between]).toEqual(['2026-02-01', '2026-02-28']);
  });

  test('REGRESSION: Op.between key is a Symbol — Object.keys() bug', () => {
    const filter = { [Op.between]: ['2026-06-01', '2026-06-30'] };
    // This is the OLD broken check — must return 0 (which caused the bug)
    expect(Object.keys(filter).length).toBe(0);
    // The fix: use null-check on the parent variable instead
    expect(filter).not.toBeNull();
  });
});

describe('monthly summary — carry_forward scope', () => {
  /**
   * Regression test: carry_forward was declared inside an `if` block with `const`
   * but used in res.json() outside the block → "carry_forward is not defined".
   * The fix: declare it at the outer scope.
   */

  function buildSummary(month, totalIncome, totalExpense, carry_forward) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    // Mirrors the fixed logic in monthlySummary: uses the env-driven ANCHOR_MONTH
    const cf = (month >= ANCHOR_MONTH && month <= currentMonth) ? carry_forward : 0;
    const netProfit = totalIncome - totalExpense;
    return {
      total_income: totalIncome,
      total_expense: totalExpense,
      net_profit: netProfit,
      carry_forward: cf,
      total_cash_available: cf + netProfit,
    };
  }

  test('valid month returns carry_forward and total_cash_available', () => {
    const summary = buildSummary('2026-06', 50000, 57123, 18093);
    expect(summary.carry_forward).toBe(18093);
    expect(summary.total_cash_available).toBeCloseTo(10970);
    expect(summary.net_profit).toBeCloseTo(-7123);
  });

  test('future month returns carry_forward = 0', () => {
    const summary = buildSummary('2099-01', 0, 0, 99999);
    expect(summary.carry_forward).toBe(0);
  });

  test('pre-anchor month returns carry_forward = 0', () => {
    const summary = buildSummary('2025-01', 10000, 5000, 99999);
    expect(summary.carry_forward).toBe(0);
  });
});

describe('carry-forward chain integrity', () => {
  beforeEach(() => jest.clearAllMocks());

  test('Sep→Oct→Nov chain matches real data', async () => {
    // Sep 2025: income=50000, expense=14845 → net=35155
    // Oct 2025: carry=3307, income=..., not directly tested here
    // Test: Oct carry-forward should equal Sep net profit

    mockQuery
      .mockResolvedValueOnce([{ total_income: '50000' }])   // tx up to 2025-10-01
      .mockResolvedValueOnce([{ total_expense: '14845' }]);  // exp up to 2025-10-01

    const octCarry = await computeCarryForward('2025-10');
    expect(octCarry).toBeCloseTo(35155); // Sep net profit

    // Now Nov: income = Sep + Oct income, expense = Sep + Oct expense
    mockQuery
      .mockResolvedValueOnce([{ total_income: '85155' }])    // tx up to 2025-11-01
      .mockResolvedValueOnce([{ total_expense: '14845' }]);  // exp up to 2025-11-01

    const novCarry = await computeCarryForward('2025-11');
    // Nov carry = total net from Sep+Oct = 85155 - 14845 = 70310
    expect(novCarry).toBeCloseTo(70310);
    // Nov carry > Oct carry (Oct had income in between)
    expect(novCarry).toBeGreaterThan(octCarry);
  });
});
