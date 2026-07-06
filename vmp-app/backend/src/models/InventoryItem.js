const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryItem = sequelize.define('InventoryItem', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  product_name: { type: DataTypes.STRING(200), allowNull: false, comment: 'e.g. SLIM CASE, FLIP CASE, TEMPER' },
  category:     { type: DataTypes.ENUM('case','temper','pouch','cable','charger','earphone','other'), defaultValue: 'case' },
  phone_brand:  { type: DataTypes.STRING(80), comment: 'e.g. iPhone, Samsung, Realme, OnePlus' },
  phone_model:  { type: DataTypes.STRING(100), comment: 'e.g. 14 PLUS, A55, NORD CE 5' },
  quantity:     { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
  min_quantity: { type: DataTypes.INTEGER, defaultValue: 1, comment: 'Alert threshold for low stock' },
  purchase_price: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  selling_price:  { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  notes:        { type: DataTypes.STRING(300) },
}, {
  tableName: 'inventory_items',
  indexes: [
    { fields: ['phone_brand'] },
    { fields: ['category'] },
    { fields: ['quantity'] },
  ],
});

module.exports = InventoryItem;
