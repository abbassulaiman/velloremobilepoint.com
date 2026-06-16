const { InventoryItem } = require('../models');
const { Op } = require('sequelize');

const getOne = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch item.', error: err.message });
  }
};

const list = async (req, res) => {
  try {
    const { search, category, brand, low_stock, limit = 500, offset = 0 } = req.query;
    const where = {};
    if (category) where.category = category;
    if (brand) where.phone_brand = { [Op.like]: `%${brand}%` };
    if (low_stock === 'true') {
      where[Op.and] = [{ quantity: { [Op.lte]: 1 } }];
    }
    if (search) {
      where[Op.or] = [
        { product_name: { [Op.like]: `%${search}%` } },
        { phone_brand: { [Op.like]: `%${search}%` } },
        { phone_model: { [Op.like]: `%${search}%` } },
      ];
    }
    const { count, rows } = await InventoryItem.findAndCountAll({
      where,
      order: [['phone_brand', 'ASC'], ['phone_model', 'ASC'], ['product_name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json({ total: count, rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch inventory.', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const item = await InventoryItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create item.', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found.' });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update item.', error: err.message });
  }
};

// Quick stock adjustment (+/-)
const adjustStock = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found.' });
    const delta = parseInt(req.body.delta) || 0;
    const newQty = Math.max(0, item.quantity + delta);
    await item.update({ quantity: newQty });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to adjust stock.', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found.' });
    await item.destroy();
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete item.', error: err.message });
  }
};

// Brands summary
const brands = async (req, res) => {
  try {
    const { fn, col } = require('sequelize');
    const rows = await InventoryItem.findAll({
      attributes: ['phone_brand', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('quantity')), 'total_qty']],
      group: ['phone_brand'],
      order: [['phone_brand', 'ASC']],
      raw: true,
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch brands.', error: err.message });
  }
};

module.exports = { getOne, list, create, update, adjustStock, remove, brands };
