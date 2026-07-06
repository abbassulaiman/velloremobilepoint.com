require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { sequelize } = require('./models');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:9100',
  credentials: true,
}));

// Rate limiting
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use('/api/bookings', rateLimit({ windowMs: 60 * 1000, max: 30 }));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/cms', require('./routes/cms'));
app.use('/api/service-jobs', require('./routes/serviceJobs'));
app.use('/api/memberships', require('./routes/memberships'));
app.use('/api/3d-orders', require('./routes/threeDOrders'));
app.use('/api/product-enquiries', require('./routes/productEnquiries'));
app.use('/api/inventory', require('./routes/inventory'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
});

const PORT = process.env.PORT || 9200;

sequelize.authenticate()
  .then(() => {
    // Only run ALTER TABLE in non-production environments.
    // In production use explicit migrations (sequelize-cli / umzug).
    if (process.env.NODE_ENV !== 'production') {
      return sequelize.sync({ alter: true });
    }
  })
  .then(() => {
    console.log('Database connected and synced.');
    app.listen(PORT, () => console.log(`VMP API running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Cannot connect to database:', err.message);
    process.exit(1);
  });

module.exports = app;
