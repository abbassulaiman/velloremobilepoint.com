const { Membership } = require('../models');
const { Op } = require('sequelize');

const DATE_FIELDS = ['dob', 'start_date', 'expiry_date'];
function sanitizeDates(body) {
  const out = { ...body };
  DATE_FIELDS.forEach(f => { if (out[f] === '' || out[f] === undefined) out[f] = null; });
  return out;
}

const list = async (req, res) => {
  try {
    const { status, search, limit = 100, offset = 0 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
        { membership_id: { [Op.like]: `%${search}%` } },
      ];
    }
    const { count, rows } = await Membership.findAndCountAll({
      where, order: [['createdAt', 'DESC']],
      limit: parseInt(limit), offset: parseInt(offset),
    });
    res.json({ total: count, rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch memberships.', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    // Auto-generate membership ID if not provided
    if (!req.body.membership_id) {
      const count = await Membership.count();
      req.body.membership_id = `VMP${String(count + 1).padStart(4, '0')}`;
    }
    const member = await Membership.create({ ...sanitizeDates(req.body), entered_by: req.user?.id });
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create membership.', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const member = await Membership.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: 'Not found.' });
    await member.update(sanitizeDates(req.body));
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update membership.', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const member = await Membership.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: 'Not found.' });
    await member.destroy();
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete membership.', error: err.message });
  }
};

module.exports = { list, create, update, remove };
