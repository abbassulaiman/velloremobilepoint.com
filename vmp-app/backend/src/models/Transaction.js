const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  serial_no: { type: DataTypes.INTEGER, allowNull: false },
  customer_name: { type: DataTypes.STRING(100) },
  mobile: { type: DataTypes.STRING(15) },
  product_desc: { type: DataTypes.STRING(300), allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  cash: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  gpay: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  vmp_cost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0, comment: 'Profit margin on this transaction' },
  sales_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  service_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  entered_by: { type: DataTypes.INTEGER, comment: 'FK → users.id' },
}, {
  tableName: 'transactions',
  indexes: [{ fields: ['date'] }, { fields: ['mobile'] }, { fields: ['customer_name'] }],
});

module.exports = Transaction;
