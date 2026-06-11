const mongoose = require('mongoose');

const softLandingSchema = new mongoose.Schema({
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
    arrivalDate: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    mealPlan: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    message: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('SoftLanding', softLandingSchema);
