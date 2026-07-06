const { Booking, User } = require('../models');
const { generateOtp, sendBookingOtp, notifyOwnerBooking, sendStatusUpdate } = require('../utils/whatsapp');
const { Op } = require('sequelize');

const create = async (req, res) => {
  try {
    const { customer_name, mobile, device_brand, device_model, service_type, service_other, issue_description } = req.body;

    if (!customer_name || !mobile || !device_brand || !service_type) {
      return res.status(400).json({ message: 'Name, mobile, device brand, and service type are required.' });
    }

    const { otp, expiresAt } = generateOtp();

    const booking = await Booking.create({
      customer_name, mobile, device_brand, device_model,
      service_type, service_other, issue_description,
      otp, otp_expires_at: expiresAt,
    });

    // Send OTP and owner notification concurrently
    await Promise.allSettled([
      sendBookingOtp(mobile, otp, customer_name),
      notifyOwnerBooking(booking),
    ]);

    res.status(201).json({
      message: 'Booking created. OTP sent to your WhatsApp.',
      bookingId: booking.id,
    });
  } catch (err) {
    res.status(500).json({ message: 'Booking failed.', error: err.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { bookingId, otp } = req.body;
    const booking = await Booking.findByPk(bookingId);

    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.otp_verified) return res.json({ message: 'Already verified.' });
    if (booking.otp !== otp) return res.status(400).json({ message: 'Invalid OTP.' });
    if (new Date() > new Date(booking.otp_expires_at)) {
      return res.status(400).json({ message: 'OTP expired. Please rebook.' });
    }

    booking.otp_verified = true;
    booking.status = 'confirmed';
    booking.otp = null;
    await booking.save();

    res.json({ message: 'Booking confirmed!', booking });
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed.', error: err.message });
  }
};

const list = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Booking.findAndCountAll({
      where,
      include: [{ model: User, as: 'assignedStaff', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ total: count, page: parseInt(page), bookings: rows });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings.' });
  }
};

const getOne = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: User, as: 'assignedStaff', attributes: ['id', 'name'] }],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch booking.' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status, notes, assigned_to } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    const prevStatus = booking.status;
    if (status) booking.status = status;
    if (notes !== undefined) booking.notes = notes;
    if (assigned_to !== undefined) booking.assigned_to = assigned_to;

    await booking.save();

    // Notify customer on key status changes
    if (status && status !== prevStatus && ['confirmed', 'in_progress', 'done', 'cancelled'].includes(status)) {
      sendStatusUpdate(booking.mobile, booking.customer_name, status).catch(console.error);
    }

    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: 'Update failed.', error: err.message });
  }
};

module.exports = { create, verifyOtp, list, getOne, updateStatus };
