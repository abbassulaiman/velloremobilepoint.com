const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceJob = sequelize.define('ServiceJob', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_name:{ type: DataTypes.STRING(100), allowNull: false },
  mobile:       { type: DataTypes.STRING(15) },
  mobile_model: { type: DataTypes.STRING(100) },
  problem:      { type: DataTypes.STRING(300) },
  in_date:      { type: DataTypes.DATEONLY, allowNull: false },
  out_date:     { type: DataTypes.DATEONLY },
  ready_date:   { type: DataTypes.DATEONLY },
  status:       { type: DataTypes.ENUM('pending','in_progress','ready','delivered','returned'), defaultValue: 'pending' },
  work_done:    { type: DataTypes.STRING(300) },
  amount:       { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  advance:      { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  notes:        { type: DataTypes.TEXT },
  entered_by:   { type: DataTypes.INTEGER },
}, {
  tableName: 'service_jobs',
  indexes: [{ fields: ['in_date'] }, { fields: ['mobile'] }, { fields: ['status'] }],
});

module.exports = ServiceJob;
