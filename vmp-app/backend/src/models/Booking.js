const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_name: { type: DataTypes.STRING(100), allowNull: false },
  mobile: { type: DataTypes.STRING(15), allowNull: false },
  device_brand: { type: DataTypes.STRING(50), allowNull: false },
  device_model: { type: DataTypes.STRING(100) },
  service_type: { type: DataTypes.STRING(100), allowNull: false },
  service_other: { type: DataTypes.STRING(200) },
  issue_description: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'done', 'cancelled'),
    defaultValue: 'pending',
  },
  otp: { type: DataTypes.STRING(6) },
  otp_expires_at: { type: DataTypes.DATE },
  otp_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  notes: { type: DataTypes.TEXT },
  assigned_to: { type: DataTypes.INTEGER },
}, {
  tableName: 'bookings',
});

module.exports = Booking;
