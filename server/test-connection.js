/**
 * Quick MongoDB Connection Test Script
 * Run this to test your MongoDB connection: node test-connection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal';

console.log('🔍 Testing MongoDB connection...');
console.log(`📍 Connection string: ${mongoURI.replace(/:[^:@]+@/, ':****@')}`); // Hide password

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
})
  .then(() => {
    console.log('\n✅ SUCCESS: MongoDB connected successfully!');
    console.log(`✅ Database: ${mongoURI.split('/').pop().split('?')[0]}`);
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ FAILED: MongoDB connection error');
    console.error(`❌ Error: ${err.message}`);
    
    if (err.message.includes('authentication failed') || err.message.includes('bad auth')) {
      console.error('\n🔐 AUTHENTICATION ISSUE:');
      console.error('   1. Check username and password in connection string');
      console.error('   2. For MongoDB Atlas:');
      console.error('      - Go to Database Access → Verify username/password');
      console.error('      - URL-encode special characters in password');
      console.error('      - Example: password "p@ss#word" → "p%40ss%23word"');
      console.error('   3. Verify user has "Atlas admin" or "Read and write" permissions');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error('\n🔌 CONNECTION REFUSED:');
      console.error('   MongoDB is not running locally');
      console.error('   Windows: net start MongoDB');
      console.error('   Or use MongoDB Atlas cloud database');
    } else if (err.message.includes('ENOTFOUND')) {
      console.error('\n🌐 NETWORK ISSUE:');
      console.error('   - Check internet connection (for Atlas)');
      console.error('   - Verify cluster is running in Atlas dashboard');
      console.error('   - Check IP whitelist in Network Access');
    }
    
    console.error('\n📝 Connection string examples:');
    console.error('   Local: mongodb://localhost:27017/jobportal');
    console.error('   Atlas: mongodb+srv://username:password@cluster.mongodb.net/jobportal');
    
    process.exit(1);
  });
