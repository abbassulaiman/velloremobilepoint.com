const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define('Contact', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  mobile: { type: DataTypes.STRING(15), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('new', 'read', 'replied'), defaultValue: 'new' },
}, {
  tableName: 'contacts',
});

module.exports = Contact;
