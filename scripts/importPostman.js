/**
 * Script to import Postman collections for testing the API
 * Run with: npm run postman:import
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== VYRE API - POSTMAN COLLECTION IMPORT ===');
console.log('\nThis script helps you import the Vyre API Postman collections for testing the API endpoints.\n');

// Check if postman directory exists
const postmanDir = path.join(__dirname, '../postman');
if (!fs.existsSync(postmanDir)) {
  console.log('❌ Postman directory not found. Creating it...');
  fs.mkdirSync(postmanDir);
}

// Check for company-settings-collection.json
const companySettingsCollectionPath = path.join(postmanDir, 'company-settings-collection.json');
if (!fs.existsSync(companySettingsCollectionPath)) {
  console.log('❌ Company settings collection not found.');
  console.log('Please make sure the file exists at: ' + companySettingsCollectionPath);
  process.exit(1);
}

// Display import instructions
console.log('✅ Found Postman collection: company-settings-collection.json');
console.log('\nImport Instructions:');
console.log('1. Open Postman');
console.log('2. Click "Import" button in the top left');
console.log('3. Select "File" tab and upload the following file:');
console.log(`   ${companySettingsCollectionPath}`);
console.log('\n4. After importing, set up environment variables:');
console.log('   - baseUrl: Your API base URL (e.g., http://localhost:5000/api)');
console.log('   - accessToken: Your JWT access token after login');
console.log('   - refreshToken: Your JWT refresh token after login');

// Try to open the file in the default application
console.log('\nAttempting to open the collection file...');
try {
  if (process.platform === 'win32') {
    execSync(`start "" "${companySettingsCollectionPath}"`);
    console.log('✅ File opened successfully. Import it into Postman.');
  } else if (process.platform === 'darwin') {
    execSync(`open "${companySettingsCollectionPath}"`);
    console.log('✅ File opened successfully. Import it into Postman.');
  } else {
    console.log('❓ Automatic opening not supported on this platform.');
    console.log('Please manually open the file at:');
    console.log(companySettingsCollectionPath);
  }
} catch (error) {
  console.log('❌ Failed to open the file automatically.');
  console.log('Please manually open the file at:');
  console.log(companySettingsCollectionPath);
}

console.log('\nOnce imported, you can use these collections to test all company settings endpoints!');
console.log('Make sure to run the login request first to get your access token.\n');
