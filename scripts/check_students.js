require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log("Connected!");
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    const usersCol = db.collection('users');
    const totalUsers = await usersCol.countDocuments();
    const students = await usersCol.find({ role: 'student' }).toArray();
    console.log(`Total users: ${totalUsers}, Students: ${students.length}`);

    let withPhone = 0;
    let sampleStudent = null;
    for (const s of students) {
      if (s.phone || s.mobile || s.whatsapp) withPhone++;
      if (!sampleStudent) sampleStudent = s;
    }
    console.log(`Students with phone/mobile/whatsapp: ${withPhone}`);
    if (sampleStudent) {
      console.log("Sample student keys:", Object.keys(sampleStudent));
      console.log("Sample student basic info:", {
        name: sampleStudent.firstName + ' ' + sampleStudent.lastName,
        email: sampleStudent.email,
        phone: sampleStudent.phone,
        whatsapp: sampleStudent.whatsapp,
        skills: sampleStudent.skills
      });
    }

    if (collections.some(c => c.name === 'campusapplications')) {
      const campusApps = await db.collection('campusapplications').find({}).toArray();
      console.log(`Campus applications count: ${campusApps.length}`);
      const withPhones = campusApps.filter(a => a.phone || a.whatsapp);
      console.log(`Campus apps with phone: ${withPhones.length}`);
    }

    if (collections.some(c => c.name === 'longtermapplications')) {
      const ltApps = await db.collection('longtermapplications').find({}).toArray();
      console.log(`Long term applications count: ${ltApps.length}`);
    }

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
