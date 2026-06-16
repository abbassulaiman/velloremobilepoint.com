const { Expense, User } = require('../models');
const { Op } = require('sequelize');
const XLSX = require('xlsx');
const dayjs = require('dayjs');

const STAFF_ALLOWED_CATEGORIES = ['service', 'sales', 'other'];

const create = async (req, res) => {
  try {
    if (req.user.role === 'staff' && req.body.category && !STAFF_ALLOWED_CATEGORIES.includes(req.body.category)) {
      return res.status(403).json({ message: `Category '${req.body.category}' is not allowed for staff.` });
    }
    const expense = await Expense.create({ ...req.body, entered_by: req.user.id });
    res.status(201).json({ expense });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create expense.', error: err.message });
  }
};

const list = async (req, res) => {
  try {
    const { date, from, to, category, page = 1, limit = 50 } = req.query;
    const where = {};

    if (date) {
      where.date = date;
    } else if (from || to) {
      where.date = {};
      if (from) where.date[Op.gte] = from;
      if (to) where.date[Op.lte] = to;
    }
    if (category) where.category = category;

    const { count, rows } = await Expense.findAndCountAll({
      where,
      include: [{ model: User, as: 'enteredByUser', attributes: ['id', 'name'] }],
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ total: count, page: parseInt(page), expenses: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expenses.' });
  }
};

const update = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found.' });

    if (req.user.role === 'staff' && expense.entered_by !== req.user.id) {
      return res.status(403).json({ message: 'Cannot edit another staff member\'s entry.' });
    }

    // Strip owner-only categories for staff to prevent UI bypass
    const body = { ...req.body };
    if (req.user.role === 'staff') {
      if (body.category && !STAFF_ALLOWED_CATEGORIES.includes(body.category)) {
        return res.status(403).json({ message: `Category '${body.category}' is not allowed for staff.` });
      }
    }

    await expense.update(body);
    res.json({ expense });
  } catch (err) {
    res.status(500).json({ message: 'Update failed.' });
  }
};

const remove = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found.' });
    await expense.destroy();
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed.' });
  }
};

const importExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const rawExpenses = rows
      .filter(r => r['Date'] && r['Expense'] && r['AMOUNT'])
      .map(r => ({
        date: dayjs(r['Date']).format('YYYY-MM-DD'),
        category: mapCategory(r['Exp for'] || ''),
        description: r['Expense'] || '',
        amount: parseFloat(r['AMOUNT']) || 0,
        staff_name: r['Exp for'] || null,
        entered_by: req.user.id,
      }));

    // Remap restricted categories to 'other' for staff
    const expenses = req.user.role === 'staff'
      ? rawExpenses.map(e => ({
          ...e,
          category: STAFF_ALLOWED_CATEGORIES.includes(e.category) ? e.category : 'other',
        }))
      : rawExpenses;

    const created = await Expense.bulkCreate(expenses, { validate: true });
    res.status(201).json({ imported: created.length });
  } catch (err) {
    res.status(500).json({ message: 'Import failed.', error: err.message });
  }
};

function mapCategory(expFor) {
  const lower = expFor.toLowerCase();
  if (lower === 'petrol') return 'petrol';
  if (lower === 'service') return 'service';
  if (lower === 'shop expense') return 'shop';
  if (lower) return 'staff';
  return 'other';
}

module.exports = { create, list, update, remove, importExcel };
