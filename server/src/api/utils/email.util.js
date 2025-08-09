/**
 * Email Utility
 * Provides functions for sending emails
 */

const nodemailer = require('nodemailer');

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.message - Email message
 * @param {String} options.html - HTML content (optional)
 * @returns {Promise} Resolved when email is sent
 */
const sendEmail = async (options) => {
  try {
    console.log('Email Service: Preparing to send email');
    console.log(`Email Service: Recipient: ${options.email}`);
    console.log(`Email Service: Using SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    
    // Check if all required email config is available
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || 
        !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Missing email configuration. Check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env file');
    }
    
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      // Add debug option to see detailed logs
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development'
    });
    
    // Verify SMTP connection configuration
    await transporter.verify();
    console.log('Email Service: SMTP connection verified successfully');

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || `CivicConnect <noreply@civicconnect.org>`,
      to: options.email,
      subject: options.subject,
      text: options.message
    };

    // Add HTML if provided
    if (options.html) {
      mailOptions.html = options.html;
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email Service: Email sent successfully! Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email Service Error:', error);
    throw error; // Re-throw to let the caller handle it
  }
};

module.exports = sendEmail;
