const mongoose = require('mongoose');

const softLandingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  arrivalDate: { type: String, required: true },
  durationMonths: { type: Number, required: true },
  includeFood: { type: Boolean, default: false },
  totalCostJPY: { type: Number, required: true },
  status: { type: String, default: 'Request Received' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SoftLanding', softLandingSchema);
