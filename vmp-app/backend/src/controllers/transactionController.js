const { Transaction, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const XLSX = require('xlsx');
const dayjs = require('dayjs');

/** Remove owner-only fields from a transaction data object for staff users */
function sanitiseTxForRole(data, role) {
  if (role !== 'staff') return data;
  const d = { ...data };
  delete d.vmp_cost;
  return d;
}

const create = async (req, res) => {
  try {
    const data = sanitiseTxForRole({ ...req.body, entered_by: req.user.id }, req.user.role);
    const tx = await Transaction.create(data);
    res.status(201).json({ transaction: tx });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create transaction.', error: err.message });
  }
};

const bulkCreate = async (req, res) => {
  try {
    const items = req.body.map(item =>
      sanitiseTxForRole({ ...item, entered_by: req.user.id }, req.user.role)
    );
    const txs = await Transaction.bulkCreate(items, { validate: true });
    res.status(201).json({ created: txs.length });
  } catch (err) {
    res.status(500).json({ message: 'Bulk create failed.', error: err.message });
  }
};

const list = async (req, res) => {
  try {
    const { date, from, to, mobile, customer_name, page = 1, limit = 50 } = req.query;
    const where = {};

    if (date) {
      where.date = date;
    } else if (from || to) {
      where.date = {};
      if (from) where.date[Op.gte] = from;
      if (to) where.date[Op.lte] = to;
    }
    if (mobile) where.mobile = { [Op.like]: `%${mobile}%` };
    if (customer_name) where.customer_name = { [Op.like]: `%${customer_name}%` };

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [{ model: User, as: 'enteredByUser', attributes: ['id', 'name'] }],
      order: [['date', 'DESC'], ['serial_no', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ total: count, page: parseInt(page), transactions: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch transactions.' });
  }
};

const update = async (req, res) => {
  try {
    const tx = await Transaction.findByPk(req.params.id);
    if (!tx) return res.status(404).json({ message: 'Transaction not found.' });

    // Staff can only edit their own entries
    if (req.user.role === 'staff' && tx.entered_by !== req.user.id) {
      return res.status(403).json({ message: 'Cannot edit another staff member\'s entry.' });
    }

    // Strip owner-only fields for staff to prevent UI bypass
    const body = { ...req.body };
    if (req.user.role === 'staff') {
      delete body.vmp_cost;
    }

    await tx.update(body);
    res.json({ transaction: tx });
  } catch (err) {
    res.status(500).json({ message: 'Update failed.', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const tx = await Transaction.findByPk(req.params.id);
    if (!tx) return res.status(404).json({ message: 'Transaction not found.' });
    await tx.destroy();
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

    const transactions = rows
      .filter(r => r['Date'] && r['Products'])
      .map((r, i) => sanitiseTxForRole({
        date: dayjs(r['Date']).format('YYYY-MM-DD'),
        serial_no: r['S. No'] || i + 1,
        customer_name: r['Name'] || null,
        mobile: r['Mobile Number'] ? String(r['Mobile Number']) : null,
        product_desc: r['Products'] || '',
        amount: parseFloat(r['Amount']) || 0,
        cash: parseFloat(r['Cash']) || 0,
        gpay: parseFloat(r['Gpay']) || 0,
        vmp_cost: parseFloat(r['VMP']) || 0,
        sales_amount: parseFloat(r['Sales']) || 0,
        service_amount: parseFloat(r['Service']) || 0,
        entered_by: req.user.id,
      }, req.user.role));

    const created = await Transaction.bulkCreate(transactions, { validate: true });
    res.status(201).json({ imported: created.length });
  } catch (err) {
    res.status(500).json({ message: 'Import failed.', error: err.message });
  }
};

module.exports = { create, bulkCreate, list, update, remove, importExcel };
