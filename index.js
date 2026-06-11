require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const Razorpay = require('razorpay');
const ExcelJS = require('exceljs');
const { sendMail } = require('./utils/mailer');
// Import Models
const Consultation = require('./models/Consultation');
const JobAlert = require('./models/JobAlert');
const Lead = require('./models/Lead');
const Application = require('./models/Application');
const SoftLanding = require('./models/SoftLanding');

const app = express();
const PORT = process.env.PORT || 5000;

// Database Connection & Hard Check
const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV === 'production' && !MONGODB_URI) {
    console.error('FATAL: MONGODB_URI not set in environment variables');
    process.exit(1);
}

mongoose.connect(MONGODB_URI || 'mongodb://localhost:27017/nihonnest').then(() => {
    console.log('✅ Connected to MongoDB successfully.');
}).catch((err) => {
    console.log('⚠️ Failed to connect to MongoDB.');
    console.log('Error details:', err.message);
});

// Middleware
app.use(cors({
    origin: NODE_ENV === 'production' ? 'https://nihonnest.in' : '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from current directory
app.use(express.static(path.join(__dirname, '')));

// Rate Limiting for API routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', apiLimiter);

// Nodemailer Transporter

// Initialize Razorpay
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

// Helper to send data to Google Sheet
async function sendToGoogleSheet(data, formName) {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) return;
    try {
        const payload = { formName, ...data };
        await fetch(scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error('Error sending data to Google Sheet:', err);
    }
}

// Helper for Validation Errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed.', details: errors.array() });
    }
    next();
};

// API ROUTES

// 1. Get Jobs
app.get('/api/jobs', (req, res) => {
    try {
        const jobsData = fs.readFileSync(path.join(__dirname, 'data', 'jobs.json'), 'utf-8');
        res.json(JSON.parse(jobsData));
    } catch (err) {
        res.status(500).json({ error: 'Failed to load jobs.' });
    }
});

// 2. Submit Consultation
app.post('/api/consultations', [
    body('fullName').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('whatsapp').notEmpty().withMessage('WhatsApp number is required'),
    body('situation').notEmpty().withMessage('Situation is required'),
    body('preferredDate').notEmpty().withMessage('Preferred Date is required'),
    body('preferredTime').notEmpty().withMessage('Preferred Time is required'),
    handleValidationErrors
], async (req, res) => {
    try {
        const newConsultation = new Consultation(req.body);
        await newConsultation.save();
        
        // Send Email Notifications
        const adminContent = `
            <h2>New Consultation Request</h2>
            <p><strong>Name:</strong> ${req.body.fullName}</p>
            <p><strong>WhatsApp:</strong> ${req.body.whatsapp}</p>
            <p><strong>Email:</strong> ${req.body.email}</p>
            <p><strong>Situation:</strong> ${req.body.situation}</p>
            <p><strong>Preferred Slot:</strong> ${req.body.preferredDate} at ${req.body.preferredTime}</p>
            <p><strong>Question:</strong> ${req.body.question || 'N/A'}</p>
            <p><strong>Referred By:</strong> ${req.body.referredBy || 'None'}</p>
        `;
        sendMail('nitinn1924@gmail.com', `New Consultation: ${req.body.fullName}`, adminContent);

        const userContent = `
            <h2>Hi ${req.body.fullName},</h2>
            <p>We have received your consultation request.</p>
            <p>Your preferred slot is <strong>${req.body.preferredDate} at ${req.body.preferredTime}</strong>.</p>
            <p>If you haven't completed the ₹500 payment yet, please do so via the WhatsApp link. Our team will message you shortly to confirm your booking.</p>
        `;
        sendMail(req.body.email, 'Consultation Request Received - NihonNest', userContent);
        
        // Send to Google Sheet
        sendToGoogleSheet(req.body, 'Consultation');

        res.status(201).json({ message: 'Consultation request saved successfully!', consultationId: newConsultation._id });
    } catch (err) {
        console.error('Error saving consultation:', err);
        res.status(500).json({ error: 'Failed to save consultation request.' });
    }
});

// Razorpay Create Order
app.post('/api/create-order', async (req, res) => {
    try {
        const { consultationId } = req.body;
        const options = {
            amount: 50000, // ₹500 in paise
            currency: 'INR',
            receipt: `receipt_${consultationId}`
        };
        const order = await razorpayInstance.orders.create(options);
        
        if (consultationId) {
            await Consultation.findByIdAndUpdate(consultationId, { razorpayOrderId: order.id });
        }
        
        res.json({ order_id: order.id, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (err) {
        console.error('Razorpay Error:', err);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
});

// Verify Payment
app.post('/api/verify-payment', async (req, res) => {
    try {
        const { consultationId, paymentId, orderId, signature } = req.body;
        // In a real app, verify signature using crypto here
        await Consultation.findByIdAndUpdate(consultationId, { paymentStatus: 'Success' });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

// 3. Submit Job Application
app.post('/api/applications', [
    body('jobTitle').notEmpty().withMessage('Job Title is required'),
    body('fullName').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('jlptLevel').notEmpty().withMessage('JLPT Level is required'),
    body('currentCity').notEmpty().withMessage('City is required'),
    handleValidationErrors
], async (req, res) => {
    try {
        const newApp = new Application(req.body);
        await newApp.save();
        
        const adminAppContent = `
            <h2>New Job Application</h2>
            <p><strong>Applicant:</strong> ${req.body.fullName}</p>
            <p><strong>Email:</strong> ${req.body.email}</p>
            <p><strong>Phone:</strong> ${req.body.phone}</p>
            <p><strong>Job Title:</strong> ${req.body.jobTitle}</p>
            <p><strong>JLPT Level:</strong> ${req.body.jlptLevel}</p>
            <p><strong>City:</strong> ${req.body.currentCity}</p>
        `;
        sendMail('nitinn1924@gmail.com', `New Application: ${req.body.jobTitle}`, adminAppContent);
        
        const userAppContent = `
            <h2>Hi ${req.body.fullName},</h2>
            <p>We have received your application for <strong>${req.body.jobTitle}</strong>.</p>
            <p>Our recruitment team is reviewing your profile and will contact you via WhatsApp to collect your resume.</p>
        `;
        sendMail(req.body.email, 'Application Received - NihonNest', userAppContent);
        
        // Send to Google Sheet
        sendToGoogleSheet(req.body, 'Job Application');
        
        res.status(201).json({ message: 'Job application saved successfully!' });
    } catch (err) {
        console.error('Error saving application:', err);
        res.status(500).json({ error: 'Failed to submit job application.' });
    }
});

// 4. Submit Soft Landing Booking
app.post('/api/softlanding', [
    body('fullName').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('whatsapp').notEmpty().withMessage('WhatsApp is required'),
    body('arrivalDate').notEmpty().withMessage('Arrival Date is required'),
    body('duration').notEmpty().withMessage('Duration is required'),
    body('mealPlan').notEmpty().withMessage('Meal Plan is required'),
    body('city').notEmpty().withMessage('City is required'),
    handleValidationErrors
], async (req, res) => {
    try {
        const newBooking = new SoftLanding(req.body);
        await newBooking.save();
        
        const adminSlContent = `
            <h2>New Soft Landing Booking</h2>
            <p><strong>Name:</strong> ${req.body.fullName}</p>
            <p><strong>Email:</strong> ${req.body.email}</p>
            <p><strong>Phone:</strong> ${req.body.phone}</p>
            <p><strong>Package:</strong> ${req.body.packageType}</p>
            <p><strong>City:</strong> ${req.body.city}</p>
            <p><strong>Arrival Date:</strong> ${req.body.arrivalDate}</p>
            <p><strong>Message:</strong> ${req.body.message || 'N/A'}</p>
        `;
        sendMail('nitinn1924@gmail.com', `Soft Landing Booking: ${req.body.fullName}`, adminSlContent);
        
        const userSlContent = `
            <h2>Hi ${req.body.fullName},</h2>
            <p>Thank you for choosing NihonNest's Soft Landing service for ${req.body.city}.</p>
            <p>We will contact you shortly to finalize your ${req.body.packageType} arrangements for your arrival on ${req.body.arrivalDate}.</p>
            <p>Rest assured, we will make your move to Japan completely stress-free!</p>
        `;
        sendMail(req.body.email, 'Soft Landing Booking Confirmed - NihonNest', userSlContent);
        
        // Send to Google Sheet
        sendToGoogleSheet(req.body, 'Soft Landing');
        
        res.status(201).json({ message: 'Soft landing booking saved successfully!' });
    } catch (err) {
        console.error('Error saving soft landing booking:', err);
        res.status(500).json({ error: 'Failed to submit booking.' });
    }
});

// Admin Route
app.get('/admin', async (req, res) => {
    const { password } = req.query;
    if (password !== process.env.ADMIN_PASSWORD || !process.env.ADMIN_PASSWORD) {
        return res.status(401).send('Unauthorized');
    }
    
    try {
        const subs = await Consultation.find().sort({ createdAt: -1 }).limit(50);
        let rows = subs.map(sub => `<tr>
            <td style="padding: 8px; border: 1px solid #ccc;">${sub.fullName}</td>
            <td style="padding: 8px; border: 1px solid #ccc;">${sub.email}</td>
            <td style="padding: 8px; border: 1px solid #ccc;">${sub.whatsapp}</td>
            <td style="padding: 8px; border: 1px solid #ccc;">${sub.situation}</td>
            <td style="padding: 8px; border: 1px solid #ccc;">${new Date(sub.createdAt).toLocaleString()}</td>
        </tr>`).join('');
        
        res.send(`
            <html><body style="font-family: sans-serif; padding: 20px;">
                <h2>Admin Dashboard - Last 50 Consultations</h2>
                <a href="/admin/export/excel?password=${password}" style="display:inline-block; margin-bottom: 20px; padding: 10px 15px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Download Excel</a>
                <table style="border-collapse: collapse; width: 100%;">
                    <tr style="background: #f0f0f0;">
                        <th style="padding: 8px; border: 1px solid #ccc;">Name</th>
                        <th style="padding: 8px; border: 1px solid #ccc;">Email</th>
                        <th style="padding: 8px; border: 1px solid #ccc;">WhatsApp</th>
                        <th style="padding: 8px; border: 1px solid #ccc;">Situation</th>
                        <th style="padding: 8px; border: 1px solid #ccc;">Date</th>
                    </tr>
                    ${rows}
                </table>
            </body></html>
        `);
    } catch (err) {
        res.status(500).send('Error loading dashboard');
    }
});

// Admin Export Excel Route
app.get('/admin/export/excel', async (req, res) => {
    const { password } = req.query;
    if (password !== process.env.ADMIN_PASSWORD || !process.env.ADMIN_PASSWORD) {
        return res.status(401).send('Unauthorized');
    }
    
    try {
        const subs = await Consultation.find().sort({ createdAt: -1 });
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Consultations');
        
        worksheet.columns = [
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Full Name', key: 'fullName', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'WhatsApp', key: 'whatsapp', width: 15 },
            { header: 'Situation', key: 'situation', width: 30 },
            { header: 'Preferred Date', key: 'preferredDate', width: 15 },
            { header: 'Preferred Time', key: 'preferredTime', width: 15 },
            { header: 'Payment Status', key: 'paymentStatus', width: 15 }
        ];
        
        subs.forEach(sub => {
            worksheet.addRow({
                date: new Date(sub.createdAt).toLocaleString(),
                fullName: sub.fullName,
                email: sub.email,
                whatsapp: sub.whatsapp,
                situation: sub.situation,
                preferredDate: sub.preferredDate,
                preferredTime: sub.preferredTime,
                paymentStatus: sub.paymentStatus || 'Pending'
            });
        });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'consultations.xlsx');
        
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('Export Error:', err);
        res.status(500).send('Error exporting to Excel');
    }
});

// Catch-all route
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Route not found' });
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
