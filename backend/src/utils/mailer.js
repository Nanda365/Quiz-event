const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    console.log('Nodemailer Transporter Config:', {
        service: 'gmail',
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: '"Pinnacle Portal" <noreply@example.com>',
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
