const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    whatsapp: {
        type: String,
        required: true,
        trim: true
    },
    situation: {
        type: String,
        required: true
    },
    preferredDate: {
        type: String,
        required: true
    },
    preferredTime: {
        type: String,
        required: true
    },
    question: {
        type: String,
        trim: true
    },
    razorpayOrderId: {
        type: String
    },
    paymentStatus: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Success', 'Failed']
    },
    referredBy: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);
