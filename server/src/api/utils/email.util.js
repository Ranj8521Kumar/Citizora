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
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Define email options
  const mailOptions = {
    from: `CivicConnect <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // Add HTML if provided
  if (options.html) {
    mailOptions.html = options.html;
  }

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
