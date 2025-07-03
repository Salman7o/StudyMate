#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting StudyBuddy setup...\n');

// Create .env file if it doesn't exist
if (!fs.existsSync('.env')) {
  console.log('📝 Creating environment configuration...');
  fs.writeFileSync('.env', 'SESSION_SECRET=studybuddy_secret_key_12345\n');
  console.log('✅ Environment configured\n');
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies (this may take a few minutes)...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies. Please run: npm install');
    process.exit(1);
  }
}

// Start the application
console.log('🌟 Starting StudyBuddy application...');
console.log('📍 App will be available at: http://localhost:5000');
console.log('👤 Test users:');
console.log('   Student: salman / password123');
console.log('   Tutor: shujja / password123\n');

try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to start application');
  process.exit(1);
}