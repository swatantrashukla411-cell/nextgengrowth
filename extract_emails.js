const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

let mongoUri = process.env.MONGODB_URI;

// Fallback to local MongoDB if placeholder or empty
if (!mongoUri || mongoUri.includes('your_mongodb_connection_uri')) {
  mongoUri = 'mongodb://127.0.0.1:27017/nextgengrowth';
}

async function extract() {
  try {
    // Mask password in connection URI for logs
    const maskedUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
    console.log(`🔄 Connecting to MongoDB at: ${maskedUri}...`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected successfully!');

    // Query users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    console.log('🔍 Fetching students...');
    const students = await usersCollection.find({ role: 'student' }).toArray();

    console.log(`📊 Total registered student records in DB: ${students.length}`);

    if (students.length === 0) {
      console.log('⚠️ No student records found in the database.');
      await mongoose.disconnect();
      return;
    }

    // Email validation regex and duplicate detection Set
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const uniqueEmails = new Set();
    const validStudents = [];

    students.forEach(student => {
      if (!student.email) return;
      const cleanEmail = student.email.trim().toLowerCase();
      
      // Safeguard: validate format and ensure uniqueness
      if (emailRegex.test(cleanEmail)) {
        if (!uniqueEmails.has(cleanEmail)) {
          uniqueEmails.add(cleanEmail);
          validStudents.push({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            email: cleanEmail,
            joinedDate: student.createdAt ? new Date(student.createdAt).toISOString().split('T')[0] : ''
          });
        }
      }
    });

    console.log(`📊 Valid unique student emails extracted: ${validStudents.length}`);
    console.log(`🧹 Filtered out ${students.length - validStudents.length} invalid/duplicate records.`);

    // Prepare CSV header and rows
    let csvContent = 'First Name,Last Name,Email,Joined Date\n';
    
    validStudents.forEach(s => {
      const firstName = s.firstName.replace(/"/g, '""');
      const lastName = s.lastName.replace(/"/g, '""');
      csvContent += `"${firstName}","${lastName}","${s.email}","${s.joinedDate}"\n`;
    });

    const outputPath = path.resolve(__dirname, 'students_emails.csv');
    fs.writeFileSync(outputPath, csvContent, 'utf8');

    console.log(`\n🎉 Success! Emails exported to CSV.`);
    console.log(`📁 File Location: ${outputPath}`);
    
    // Print preview of first 10 students
    console.log('\n--- Students Preview (First 10 Unique & Valid) ---');
    validStudents.slice(0, 10).forEach((s, idx) => {
      console.log(`${idx + 1}. ${s.firstName} ${s.lastName} <${s.email}>`);
    });

  } catch (error) {
    console.error('❌ Error during extraction:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

extract();
