const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MonthlyBalance = sequelize.define('MonthlyBalance', {
  month: {
    type: DataTypes.STRING(7), // YYYY-MM
    primaryKey: true,
    allowNull: false,
  },
  carry_forward: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'Cumulative net cash from Sep 2025 up to start of this month',
  },
  net_profit: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'This month income minus expenses',
  },
  total_cash_available: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
    comment: 'carry_forward + net_profit',
  },
}, {
  tableName: 'monthly_balances',
  timestamps: true,
});

module.exports = MonthlyBalance;
