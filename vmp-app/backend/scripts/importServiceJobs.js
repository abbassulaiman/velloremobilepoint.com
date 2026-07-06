/**
 * One-time import script: VMP_Services_All.csv → service_jobs table
 * Usage: node backend/scripts/importServiceJobs.js /path/to/VMP_Services_All.csv
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fs   = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const sequelize = require('../src/config/database');
const { ServiceJob } = require('../src/models');

// Map raw status strings → valid enum: pending | in_progress | ready | delivered | returned
function mapStatus(raw) {
  if (!raw) return 'pending';
  const s = raw.trim().toUpperCase();
  if (s === 'READY')                          return 'ready';
  if (s === 'DELIVERED')                      return 'delivered';
  if (s === 'IN_PROGRESS' || s === 'IN PROGRESS') return 'in_progress';
  if (s.includes('RETUN') || s.includes('RETURN')) return 'returned';
  // everything else (NOT READY, MOTHER BORD PROBLEM, IC NOT AVAILABLE, NOT PAID …)
  return 'pending';
}

// Treat placeholder non-values as null
const JUNK = new Set(['NA', 'N/A', 'NA.', 'XXXX', 'XXXXX', 'XXX', '']);
function clean(val) {
  if (val === undefined || val === null) return null;
  const v = val.trim();
  return JUNK.has(v.toUpperCase()) ? null : (v || null);
}

// Parse YYYY-MM-DD; return null for anything invalid
function parseDate(val) {
  const v = clean(val);
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return null; // skip "LAST MONTH" etc.
}

// Parse decimal; return 0 for junk
function parseAmount(val) {
  const v = clean(val);
  if (!v) return 0;
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: node importServiceJobs.js <path-to-csv>');
    process.exit(1);
  }

  const content = fs.readFileSync(path.resolve(csvPath), 'utf8');
  const records = parse(content, {
    columns: true,       // use first row as header
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  console.log(`Read ${records.length} rows from CSV.`);

  await sequelize.authenticate();

  let inserted = 0;
  let skipped  = 0;

  for (const r of records) {
    // customer_name is required
    const customerName = clean(r.customer_name);
    if (!customerName) { skipped++; continue; }

    // in_date is required
    const inDate = parseDate(r.in_date);
    if (!inDate) { skipped++; continue; }

    const row = {
      customer_name: customerName,
      mobile:        clean(r.mobile),
      mobile_model:  clean(r.mobile_model),
      problem:       clean(r.problem)   ? r.problem.trim().slice(0, 300)   : null,
      in_date:       inDate,
      out_date:      parseDate(r.out_date),
      ready_date:    parseDate(r.ready_date),
      status:        mapStatus(r.status),
      work_done:     clean(r.work_done) ? r.work_done.trim().slice(0, 300) : null,
      amount:        parseAmount(r.amount),
      advance:       parseAmount(r.advance),
      notes:         clean(r.notes),
    };

    await ServiceJob.create(row);
    inserted++;
  }

  console.log(`Done. Inserted: ${inserted}, Skipped: ${skipped}`);
  process.exit(0);
}

main().catch(err => {
  console.error('Import failed:', err.message);
  process.exit(1);
});
