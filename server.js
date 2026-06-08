require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import Models
const Consultation = require('./models/Consultation');
const Application = require('./models/Application');
const SoftLanding = require('./models/SoftLanding');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from current directory
app.use(express.static(path.join(__dirname, '')));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nihonnest';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB successfully.');
}).catch((err) => {
    console.log('⚠️ Failed to connect to MongoDB. Make sure MongoDB is running or MONGODB_URI is set.');
    console.log('Error details:', err.message);
});

// API ROUTES

// 1. Get Jobs (Read from local JSON file to keep it simple, or migrate to DB later)
app.get('/api/jobs', (req, res) => {
    try {
        const jobsData = fs.readFileSync(path.join(__dirname, 'data', 'jobs.json'), 'utf-8');
        res.json(JSON.parse(jobsData));
    } catch (err) {
        res.status(500).json({ error: 'Failed to load jobs.' });
    }
});

// 2. Submit Consultation
app.post('/api/consultations', async (req, res) => {
    try {
        const newConsultation = new Consultation(req.body);
        await newConsultation.save();
        res.status(201).json({ message: 'Consultation request saved successfully!' });
    } catch (err) {
        console.error('Error saving consultation:', err);
        res.status(500).json({ error: 'Failed to save consultation request.' });
    }
});

// 3. Submit Job Application
app.post('/api/applications', async (req, res) => {
    try {
        const newApp = new Application(req.body);
        await newApp.save();
        res.status(201).json({ message: 'Job application saved successfully!' });
    } catch (err) {
        console.error('Error saving application:', err);
        res.status(500).json({ error: 'Failed to submit job application.' });
    }
});

// 4. Submit Soft Landing Booking
app.post('/api/softlanding', async (req, res) => {
    try {
        const newBooking = new SoftLanding(req.body);
        await newBooking.save();
        res.status(201).json({ message: 'Soft landing booking saved successfully!' });
    } catch (err) {
        console.error('Error saving soft landing booking:', err);
        res.status(500).json({ error: 'Failed to submit booking.' });
    }
});

// Catch-all route to serve index.html for any unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
