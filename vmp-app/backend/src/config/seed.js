require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const { sequelize, User, CmsService, CmsSetting } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    // Schema sync only in non-production; in prod use explicit migrations.
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
    }

    // Seed owner user from .env
    const adminName   = process.env.ADMIN_NAME     || 'Admin';
    const adminMobile = process.env.ADMIN_MOBILE   || '9999999999';
    const adminPass   = process.env.ADMIN_PASSWORD || 'Admin@123';

    const [owner, created] = await User.findOrCreate({
      where: { mobile: adminMobile },
      defaults: {
        name: adminName,
        mobile: adminMobile,
        role: 'owner',
        password_hash: adminPass,
      },
    });

    if (!created) {
      // Keep credentials in sync with .env on re-seed
      owner.name = adminName;
      owner.password_hash = adminPass;
      await owner.save();
    }

    console.log(`Owner user ready: ${owner.name} (${adminMobile})`);
    console.log('Staff accounts can be created via the Admin → Staff panel.');

    // Seed CMS services
    const services = [
      { name: 'Screen Replacement', description: 'Original & compatible display replacements for all brands.', icon: 'fa-mobile-alt', price_range: '₹500 – ₹8,000', sort_order: 1 },
      { name: 'Battery Replacement', description: 'Original batteries for long-lasting performance.', icon: 'fa-battery-full', price_range: '₹300 – ₹1,500', sort_order: 2 },
      { name: 'Charging Port Repair', description: 'Fast micro-USB, USB-C, and Lightning port repairs.', icon: 'fa-plug', price_range: '₹200 – ₹800', sort_order: 3 },
      { name: 'Water Damage Repair', description: 'Board-level cleaning and component replacement.', icon: 'fa-tint', price_range: '₹500 – ₹3,000', sort_order: 4 },
      { name: 'Software & Flashing', description: 'OS updates, flashing, factory reset, and data recovery.', icon: 'fa-code', price_range: '₹200 – ₹1,000', sort_order: 5 },
      { name: 'Camera Repair', description: 'Front and rear camera module replacement.', icon: 'fa-camera', price_range: '₹400 – ₹4,000', sort_order: 6 },
    ];

    for (const svc of services) {
      await CmsService.findOrCreate({ where: { name: svc.name }, defaults: svc });
    }
    console.log('CMS services seeded.');

    // Seed CMS settings
    const settings = [
      { key: 'business_name', value: 'Vellore Mobile Point', label: 'Business Name' },
      { key: 'address', value: 'Sathuvachari Falls Trial, Phase 2, Sathuvachari, Vellore, Tamil Nadu 632009', label: 'Address' },
      { key: 'phone', value: '+91 98765 43210', label: 'Phone' },
      { key: 'whatsapp', value: '919790599905', label: 'WhatsApp Number' },
      { key: 'business_hours', value: 'All Days: 9:30 AM – 9:30 PM', label: 'Business Hours' },
      { key: 'founded_year', value: '2012', label: 'Founded Year' },
      { key: 'tagline', value: 'Your Trusted Mobile Repair Partner', label: 'Tagline' },
    ];

    for (const s of settings) {
      await CmsSetting.findOrCreate({ where: { key: s.key }, defaults: s });
    }
    console.log('CMS settings seeded.');

    console.log('\nSeed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
