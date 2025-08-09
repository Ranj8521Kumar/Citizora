// Script to create a field worker user in the database
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Load the User model
const modelsDir = path.join(__dirname, '../src/api/models');

// Check if models directory exists
if (!fs.existsSync(modelsDir)) {
  console.error(`Models directory not found at ${modelsDir}`);
  console.log('Current directory:', __dirname);
  process.exit(1);
}

// Import the User model - file is lowercase
const userModelPath = path.join(modelsDir, 'user.model.js');
if (!fs.existsSync(userModelPath)) {
  console.error(`User model not found at ${userModelPath}`);
  process.exit(1);
}

const User = require(userModelPath);

// Connect to MongoDB
async function connectToDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Create a field worker user
async function createFieldWorker() {
  try {
    // Check if field worker already exists
    const existingUser = await User.findOne({ email: 'fieldworker@gmail.com' });
    
    if (existingUser) {
      console.log('Field worker already exists with email: fieldworker@civicconnect.test');
      
      // Update the field worker to ensure they're active and have correct role
      existingUser.isActive = true;  // The field is named isActive not active
      existingUser.role = 'employee'; // Using a valid role from the enum
      await existingUser.save();
      
      console.log('Updated field worker:', existingUser);
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123!', salt);
    
    // Create the field worker
    const fieldWorker = new User({
      firstName: 'John',
      lastName: 'Worker',
      email: 'fieldworker@gmail.com', // Using a standard email format
      password: hashedPassword,
      role: 'employee', // Using a valid role from the enum
      isActive: true, // The field is named isActive not active
      phoneNumber: '555-123-4567'
    });
    
    await fieldWorker.save();
    console.log('Field worker created successfully:', fieldWorker);
  } catch (error) {
    console.error('Error creating field worker:', error);
    process.exit(1);
  }
}

// Execute the script
async function run() {
  try {
    await connectToDatabase();
    await createFieldWorker();
  } catch (error) {
    console.error('Script error:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

run();
