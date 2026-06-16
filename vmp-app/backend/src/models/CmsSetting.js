const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CmsSetting = sequelize.define('CmsSetting', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  value: { type: DataTypes.TEXT },
  label: { type: DataTypes.STRING(200) },
}, {
  tableName: 'cms_settings',
});

module.exports = CmsSetting;
