require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const { sequelize, User, Booking, Contact, Transaction, Expense, CmsService, CmsSetting } = require('../models');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ alter: true });
    console.log('All tables created/updated successfully.');

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
