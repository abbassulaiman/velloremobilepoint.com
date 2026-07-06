const { ThreeDOrder } = require('../models');
const { Op } = require('sequelize');

const DATE_FIELDS = ['order_date'];
function sanitizeDates(body) {
  const out = { ...body };
  DATE_FIELDS.forEach(f => { if (out[f] === '' || out[f] === undefined) out[f] = null; });
  return out;
}

const list = async (req, res) => {
  try {
    const { status, search, from, to, limit = 100, offset = 0 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (from || to) {
      where.order_date = {};
      if (from) where.order_date[Op.gte] = from;
      if (to)   where.order_date[Op.lte] = to;
    }
    if (search) {
      where[Op.or] = [
        { customer_name: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
        { product_name: { [Op.like]: `%${search}%` } },
      ];
    }
    const { count, rows } = await ThreeDOrder.findAndCountAll({
      where, order: [['order_date', 'DESC'], ['id', 'DESC']],
      limit: parseInt(limit), offset: parseInt(offset),
    });
    res.json({ total: count, rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch 3D orders.', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const order = await ThreeDOrder.create({ ...sanitizeDates(req.body), entered_by: req.user?.id });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create 3D order.', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const order = await ThreeDOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found.' });
    await order.update(sanitizeDates(req.body));
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update 3D order.', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const order = await ThreeDOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found.' });
    await order.destroy();
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete 3D order.', error: err.message });
  }
};

module.exports = { list, create, update, remove };
