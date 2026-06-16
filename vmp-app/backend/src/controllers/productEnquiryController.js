const { ProductEnquiry } = require('../models');
const { Op } = require('sequelize');

const DATE_FIELDS = ['enquiry_date'];
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
      where.enquiry_date = {};
      if (from) where.enquiry_date[Op.gte] = from;
      if (to)   where.enquiry_date[Op.lte] = to;
    }
    if (search) {
      where[Op.or] = [
        { customer_name: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
        { product: { [Op.like]: `%${search}%` } },
        { brand_name: { [Op.like]: `%${search}%` } },
      ];
    }
    const { count, rows } = await ProductEnquiry.findAndCountAll({
      where, order: [['enquiry_date', 'DESC'], ['id', 'DESC']],
      limit: parseInt(limit), offset: parseInt(offset),
    });
    res.json({ total: count, rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch enquiries.', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const enquiry = await ProductEnquiry.create({ ...sanitizeDates(req.body), entered_by: req.user?.id });
    res.status(201).json(enquiry);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create enquiry.', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const enquiry = await ProductEnquiry.findByPk(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Not found.' });
    await enquiry.update(sanitizeDates(req.body));
    res.json(enquiry);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update enquiry.', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const enquiry = await ProductEnquiry.findByPk(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Not found.' });
    await enquiry.destroy();
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete enquiry.', error: err.message });
  }
};

module.exports = { list, create, update, remove };
