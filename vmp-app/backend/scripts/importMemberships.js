/**
 * One-time import script: VMP_Membership_All.csv → memberships table
 * Usage: node backend/scripts/importMemberships.js /path/to/VMP_Membership_All.csv
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fs   = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const sequelize = require('../src/config/database');
const { Membership } = require('../src/models');

const JUNK = new Set(['NA', 'N/A', 'XXXX', 'XXXXX', 'XXX', 'CMC NAVEEN', '']);
function clean(val) {
  if (val === undefined || val === null) return null;
  const v = val.trim();
  return JUNK.has(v.toUpperCase()) ? null : (v || null);
}

// Parse date — handles YYYY-MM-DD and DD-MM-YYYY
function parseDate(val) {
  const v = clean(val);
  if (!v) return null;
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  // DD-MM-YYYY
  const m = v.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return null;
}

// The CSV has payment_mode always blank and amount sometimes has
// payment text ("Cash/Gpay", "GPAY", "CASH") instead of a number.
// We extract both from the raw amount cell.
function parsePaymentAndAmount(rawAmount) {
  const v = (rawAmount || '').trim().toUpperCase();
  if (!v) return { payment_mode: 'cash', amount: 0 };

  const isNumeric = !isNaN(parseFloat(v)) && isFinite(v);
  if (isNumeric) return { payment_mode: 'cash', amount: parseFloat(v) };

  // Detect payment mode from text
  const hasCash = v.includes('CASH');
  const hasGpay = v.includes('GPAY') || v.includes('GOOGLE') || v.includes('PAY');
  let mode = 'cash';
  if (hasCash && hasGpay) mode = 'both';
  else if (hasGpay)       mode = 'gpay';
  else                    mode = 'cash';

  return { payment_mode: mode, amount: 0 };
}

// Map status → valid enum: active | expired | cancelled
function mapStatus(raw) {
  if (!raw) return 'active';
  const s = raw.trim().toLowerCase();
  if (s === 'expired')   return 'expired';
  if (s === 'cancelled') return 'cancelled';
  return 'active';
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: node importMemberships.js <path-to-csv>');
    process.exit(1);
  }

  const content = fs.readFileSync(path.resolve(csvPath), 'utf8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  console.log(`Read ${records.length} rows from CSV.`);
  await sequelize.authenticate();

  let inserted = 0;
  let skipped  = 0;

  for (const r of records) {
    const fullName = clean(r.full_name);
    const mobile   = clean(r.mobile);

    // full_name and mobile are required
    if (!fullName || !mobile) { skipped++; continue; }

    const { payment_mode, amount } = parsePaymentAndAmount(r.amount);

    const row = {
      membership_id: r.membership_id ? String(r.membership_id).trim() : undefined,
      full_name:     fullName,
      dob:           parseDate(r.dob),
      mobile,
      start_date:    parseDate(r.start_date),
      expiry_date:   parseDate(r.expiry_date),
      payment_mode,
      amount,
      phone_brand:   clean(r.phone_brand),
      phone_model:   clean(r.phone_model),
      imei:          clean(r.imei),
      status:        mapStatus(r.status),
      notes:         clean(r.notes),
    };

    await Membership.create(row);
    inserted++;
  }

  console.log(`Done. Inserted: ${inserted}, Skipped: ${skipped}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Import failed:', err.message);
  process.exit(1);
});
