const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductEnquiry = sequelize.define('ProductEnquiry', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  enquiry_date: { type: DataTypes.DATEONLY, allowNull: false },
  customer_name:{ type: DataTypes.STRING(100) },
  mobile:       { type: DataTypes.STRING(15) },
  brand_name:   { type: DataTypes.STRING(100) },
  model_number: { type: DataTypes.STRING(100) },
  product:      { type: DataTypes.STRING(200), allowNull: false },
  shop_need:    { type: DataTypes.STRING(300) },
  status:       { type: DataTypes.ENUM('pending','ordered','available','delivered','cancelled'), defaultValue: 'pending' },
  notes:        { type: DataTypes.TEXT },
  entered_by:   { type: DataTypes.INTEGER },
}, {
  tableName: 'product_enquiries',
  indexes: [{ fields: ['enquiry_date'] }, { fields: ['status'] }, { fields: ['mobile'] }],
});

module.exports = ProductEnquiry;
