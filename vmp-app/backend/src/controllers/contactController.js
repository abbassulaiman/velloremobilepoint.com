const { Contact } = require('../models');
const { notifyOwnerContact } = require('../utils/whatsapp');

const create = async (req, res) => {
  try {
    const { name, mobile, message } = req.body;
    if (!name || !mobile || !message) {
      return res.status(400).json({ message: 'Name, mobile, and message are required.' });
    }

    const contact = await Contact.create({ name, mobile, message });
    notifyOwnerContact(contact).catch(console.error);

    res.status(201).json({ message: 'Message sent successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message.', error: err.message });
  }
};

const list = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Contact.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ total: count, page: parseInt(page), contacts: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contacts.' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found.' });

    contact.status = status;
    await contact.save();
    res.json({ contact });
  } catch (err) {
    res.status(500).json({ message: 'Update failed.' });
  }
};

module.exports = { create, list, updateStatus };
