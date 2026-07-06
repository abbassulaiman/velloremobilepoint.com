const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CmsService = sequelize.define('CmsService', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
  icon: { type: DataTypes.STRING(100) },
  price_range: { type: DataTypes.STRING(50) },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'cms_services',
});

module.exports = CmsService;
