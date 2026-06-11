const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendMail = async (to, subject, contentHTML) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('[MAILER] Missing credentials. Skipping email send.');
        return;
    }

    const template = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; line-height: 1.6; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .header { background: #0f172a; color: #ffffff; padding: 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; color: #ff4d4f; }
            .header p { margin: 5px 0 0; font-size: 14px; color: #94a3b8; }
            .content { padding: 30px; }
            .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
            .btn { display: inline-block; background: #ff4d4f; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🇯🇵 NihonNest 🇮🇳</h1>
                <p>India's First Verified Japan Settlement Platform</p>
            </div>
            <div class="content">
                ${contentHTML}
            </div>
            <div class="footer">
                <p>NihonNest.in | Contact: nitinn1924@gmail.com | +91 8191092773</p>
                <p>Please do not reply directly to this automated email.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: `"NihonNest" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: template
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(\`[MAILER] Sent email to \${to}: "\${subject}"\`);
    } catch (err) {
        console.error('[MAILER] Failed to send email:', err);
    }
};

module.exports = { sendMail };
