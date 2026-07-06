const { CmsService, CmsSetting } = require('../models');

// ─── Services ───────────────────────────────────────────────────────────────

const listServices = async (req, res) => {
  try {
    const services = await CmsService.findAll({ order: [['sort_order', 'ASC']] });
    res.json({ services });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch services.' });
  }
};

const createService = async (req, res) => {
  try {
    const service = await CmsService.create(req.body);
    res.status(201).json({ service });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create service.', error: err.message });
  }
};

const updateService = async (req, res) => {
  try {
    const svc = await CmsService.findByPk(req.params.id);
    if (!svc) return res.status(404).json({ message: 'Service not found.' });
    await svc.update(req.body);
    res.json({ service: svc });
  } catch (err) {
    res.status(500).json({ message: 'Update failed.' });
  }
};

const deleteService = async (req, res) => {
  try {
    const svc = await CmsService.findByPk(req.params.id);
    if (!svc) return res.status(404).json({ message: 'Service not found.' });
    await svc.destroy();
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed.' });
  }
};

// ─── Settings ────────────────────────────────────────────────────────────────

const getSettings = async (req, res) => {
  try {
    const rows = await CmsSetting.findAll();
    const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch settings.' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const updates = req.body; // { key: value, ... }
    for (const [key, value] of Object.entries(updates)) {
      await CmsSetting.upsert({ key, value });
    }
    res.json({ message: 'Settings updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update settings.', error: err.message });
  }
};

module.exports = { listServices, createService, updateService, deleteService, getSettings, updateSettings };
