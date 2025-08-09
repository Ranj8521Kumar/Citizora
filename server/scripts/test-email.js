/**
 * Email Test Script
 * Run this script to test email functionality:
 * node scripts/test-email.js
 */

// Load environment variables
require('dotenv').config();

const sendEmail = require('../src/api/utils/email.util');

async function testEmail() {
  console.log('Starting email test script...');
  console.log('Environment variables:');
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? '********' : 'Not set'}`);
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM}`);
  
  const testEmail = process.argv[2] || process.env.EMAIL_FROM;
  
  if (!testEmail) {
    console.error('No test email provided. Please specify an email address as an argument:');
    console.error('node scripts/test-email.js your-email@example.com');
    process.exit(1);
  }
  
  try {
    console.log(`Sending test email to: ${testEmail}`);
    
    const result = await sendEmail({
      email: testEmail,
      subject: 'CivicConnect Email Test',
      message: 'This is a test email from CivicConnect to verify that the email system is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #3366cc;">CivicConnect Email Test</h2>
          <p>This is a test email from CivicConnect to verify that the email system is working correctly.</p>
          <p>If you received this email, it means the email functionality is working properly!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated test message.</p>
        </div>
      `
    });
    
    console.log('Email sent successfully!');
    console.log('Result:', result);
    console.log('');
    console.log('If you do not receive the email:');
    console.log('1. Check your spam folder');
    console.log('2. Verify your SMTP settings');
    console.log('3. Check if your email provider allows SMTP access');
    console.log('4. Make sure the server has outbound access to port 587');
    
  } catch (error) {
    console.error('Failed to send test email:');
    console.error(error);
    process.exit(1);
  }
}

testEmail();
