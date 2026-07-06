const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ThreeDOrder = sequelize.define('ThreeDOrder', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_date:   { type: DataTypes.DATEONLY, allowNull: false },
  customer_name:{ type: DataTypes.STRING(100) },
  mobile:       { type: DataTypes.STRING(15) },
  product_name: { type: DataTypes.STRING(200), allowNull: false },
  advance:      { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  total:        { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  margin:       { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  status:       { type: DataTypes.ENUM('pending','in_progress','ready','delivered','cancelled'), defaultValue: 'pending' },
  notes:        { type: DataTypes.TEXT },
  entered_by:   { type: DataTypes.INTEGER },
}, {
  tableName: '3d_orders',
  indexes: [{ fields: ['order_date'] }, { fields: ['status'] }],
});

module.exports = ThreeDOrder;
