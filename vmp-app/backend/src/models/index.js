const sequelize = require('../config/database');
const User = require('./User');
const Booking = require('./Booking');
const Contact = require('./Contact');
const Transaction = require('./Transaction');
const Expense = require('./Expense');
const CmsService = require('./CmsService');
const CmsSetting = require('./CmsSetting');
const ServiceJob = require('./ServiceJob');
const Membership = require('./Membership');
const ThreeDOrder = require('./ThreeDOrder');
const ProductEnquiry = require('./ProductEnquiry');
const InventoryItem = require('./InventoryItem');
const MonthlyBalance = require('./MonthlyBalance');

// Associations
Booking.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedStaff' });
Transaction.belongsTo(User, { foreignKey: 'entered_by', as: 'enteredByUser' });
Expense.belongsTo(User, { foreignKey: 'entered_by', as: 'enteredByUser' });

module.exports = {
  sequelize,
  User, Booking, Contact, Transaction, Expense,
  CmsService, CmsSetting,
  ServiceJob, Membership, ThreeDOrder, ProductEnquiry, InventoryItem, MonthlyBalance,
};
