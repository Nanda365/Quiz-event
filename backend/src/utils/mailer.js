const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Ensure email credentials are set
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
        console.error('Email credentials (EMAIL_USERNAME, EMAIL_PASSWORD) are not set in environment variables.');
        throw new Error('Email credentials are not configured.');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com', // Default to Gmail SMTP host
        port: process.env.EMAIL_PORT || 465, // Default to 465 for secure SSL
        secure: true, // Use SSL
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    console.log('Nodemailer Transporter Config:', {
        service: 'gmail',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const fromAddress = process.env.EMAIL_USERNAME ? `"${options.fromName || "Pinnacle Portal"}" <${process.env.EMAIL_USERNAME}>` : '"Pinnacle Portal" <noreply@example.com>';

    const mailOptions = {
        from: fromAddress,
        to: options.email,
        subject: options.subject,
        text: options.text || '',
        html: options.message
    };

    console.log('Mail Options:', mailOptions);

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail;
