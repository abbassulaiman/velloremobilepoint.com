const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  category: {
    type: DataTypes.ENUM('shop', 'petrol', 'staff', 'service', 'sales', '3d', 'other'),
    allowNull: false,
  },
  description: { type: DataTypes.STRING(300), allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  staff_name: { type: DataTypes.STRING(100), comment: 'Staff member this expense relates to' },
  entered_by: { type: DataTypes.INTEGER, comment: 'FK → users.id' },
}, {
  tableName: 'expenses',
  indexes: [{ fields: ['date'] }, { fields: ['category'] }],
});

module.exports = Expense;
