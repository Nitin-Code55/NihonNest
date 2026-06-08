const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  jlptLevel: { type: String, required: true },
  currentCity: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);
