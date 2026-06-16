const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Membership = sequelize.define('Membership', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  membership_id:  { type: DataTypes.STRING(30), unique: true },
  full_name:      { type: DataTypes.STRING(100), allowNull: false },
  dob:            { type: DataTypes.DATEONLY },
  mobile:         { type: DataTypes.STRING(15), allowNull: false },
  start_date:     { type: DataTypes.DATEONLY },
  expiry_date:    { type: DataTypes.DATEONLY },
  payment_mode:   { type: DataTypes.ENUM('cash','gpay','both'), defaultValue: 'cash' },
  amount:         { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  phone_brand:    { type: DataTypes.STRING(100) },
  phone_model:    { type: DataTypes.STRING(100) },
  imei:           { type: DataTypes.STRING(20) },
  status:         { type: DataTypes.ENUM('active','expired','cancelled'), defaultValue: 'active' },
  notes:          { type: DataTypes.TEXT },
  entered_by:     { type: DataTypes.INTEGER },
}, {
  tableName: 'memberships',
  indexes: [{ fields: ['mobile'] }, { fields: ['membership_id'] }, { fields: ['status'] }],
});

module.exports = Membership;
