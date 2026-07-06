const axios = require('axios');

const WA_BASE = 'https://graph.facebook.com/v20.0';

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Send a plain text WhatsApp message.
 */
async function sendTextMessage(to, text) {
  const phoneId = process.env.WA_PHONE_NUMBER_ID;
  if (!phoneId || !process.env.WA_ACCESS_TOKEN) {
    console.warn('[WhatsApp] Credentials not configured — skipping message.');
    return null;
  }

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  };

  const { data } = await axios.post(`${WA_BASE}/${phoneId}/messages`, payload, {
    headers: getHeaders(),
  });
  return data;
}

/**
 * Generate a 6-digit numeric OTP and its expiry timestamp (10 min).
 */
function generateOtp() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return { otp, expiresAt };
}

/**
 * Send OTP message for booking verification.
 */
async function sendBookingOtp(mobile, otp, customerName) {
  const to = mobile.startsWith('91') ? mobile : `91${mobile}`;
  const text =
    `Hi ${customerName},\n\nYour OTP for booking verification at *Vellore Mobile Point* is:\n\n*${otp}*\n\nValid for 10 minutes. Do not share this OTP.\n\n– VMP Team`;
  return sendTextMessage(to, text);
}

/**
 * Notify owner about new booking.
 */
async function notifyOwnerBooking(booking) {
  const ownerWa = process.env.OWNER_WHATSAPP;
  if (!ownerWa) return;

  const text =
    `📱 *New Booking*\nName: ${booking.customer_name}\nMobile: ${booking.mobile}\nDevice: ${booking.device_brand} ${booking.device_model || ''}\nService: ${booking.service_type}\nIssue: ${booking.issue_description || 'N/A'}`;
  return sendTextMessage(ownerWa, text);
}

/**
 * Notify owner about new contact form submission.
 */
async function notifyOwnerContact(contact) {
  const ownerWa = process.env.OWNER_WHATSAPP;
  if (!ownerWa) return;

  const text =
    `📩 *New Contact Message*\nFrom: ${contact.name}\nMobile: ${contact.mobile}\nMessage: ${contact.message}`;
  return sendTextMessage(ownerWa, text);
}

/**
 * Send booking status update to customer.
 */
async function sendStatusUpdate(mobile, customerName, status) {
  const to = mobile.startsWith('91') ? mobile : `91${mobile}`;
  const statusLabels = {
    confirmed: 'confirmed and our team will contact you soon',
    in_progress: 'now in progress — we are working on your device',
    done: 'completed — your device is ready for pickup!',
    cancelled: 'cancelled. Please contact us for more information.',
  };
  const label = statusLabels[status] || status;
  const text = `Hi ${customerName},\n\nYour repair booking at *Vellore Mobile Point* has been *${label}*.\n\nCall us: +91 97905 99905\n– VMP Team`;
  return sendTextMessage(to, text);
}

module.exports = {
  sendTextMessage,
  generateOtp,
  sendBookingOtp,
  notifyOwnerBooking,
  notifyOwnerContact,
  sendStatusUpdate,
};
