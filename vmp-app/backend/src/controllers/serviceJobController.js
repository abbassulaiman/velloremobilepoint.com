const { ServiceJob } = require('../models');
const { Op } = require('sequelize');

// Convert empty string dates to null so MySQL DATE columns don't reject them
const DATE_FIELDS = ['in_date', 'out_date', 'ready_date'];
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
      where.in_date = {};
      if (from) where.in_date[Op.gte] = from;
      if (to)   where.in_date[Op.lte] = to;
    }
    if (search) {
      where[Op.or] = [
        { customer_name: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
        { mobile_model: { [Op.like]: `%${search}%` } },
      ];
    }
    const { count, rows } = await ServiceJob.findAndCountAll({
      where, order: [['in_date', 'DESC'], ['id', 'DESC']],
      limit: parseInt(limit), offset: parseInt(offset),
    });
    res.json({ total: count, rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch service jobs.', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const body = sanitizeDates(req.body);
    const job = await ServiceJob.create({ ...body, entered_by: req.user?.id });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create service job.', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const job = await ServiceJob.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Not found.' });
    await job.update(sanitizeDates(req.body));
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update service job.', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const job = await ServiceJob.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Not found.' });
    await job.destroy();
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete service job.', error: err.message });
  }
};

module.exports = { list, create, update, remove };
