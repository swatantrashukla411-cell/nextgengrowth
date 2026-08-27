const mongoose = require('mongoose');
require('dotenv').config();

let mongoUri = process.env.MONGODB_URI;

if (!mongoUri || mongoUri.includes('your_mongodb_connection_uri')) {
  mongoUri = 'mongodb://127.0.0.1:27017/nextgengrowth';
}

const mockStudents = [
  {
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: 'aarav.sharma@example.com',
    role: 'student',
    college: 'IIT Delhi',
    year: '3rd Year',
    skills: ['React', 'Node.js', 'Python'],
    isVerified: true,
    createdAt: new Date('2026-06-01T10:00:00Z')
  },
  {
    firstName: 'Ananya',
    lastName: 'Iyer',
    email: 'ananya.iyer@example.com',
    role: 'student',
    college: 'BITS Pilani',
    year: '4th Year',
    skills: ['UI/UX', 'Figma', 'CSS'],
    isVerified: true,
    createdAt: new Date('2026-06-02T11:30:00Z')
  },
  {
    firstName: 'Kabir',
    lastName: 'Singh',
    email: 'kabir.singh@example.com',
    role: 'student',
    college: 'DTU',
    year: '2nd Year',
    skills: ['Java', 'C++', 'SQL'],
    isVerified: true,
    createdAt: new Date('2026-06-03T09:15:00Z')
  },
  {
    firstName: 'Diya',
    lastName: 'Sen',
    email: 'diya.sen@example.com',
    role: 'student',
    college: 'Jadavpur University',
    year: '3rd Year',
    skills: ['Content Writing', 'SEO', 'Social Media'],
    isVerified: true,
    createdAt: new Date('2026-06-04T14:20:00Z')
  },
  {
    firstName: 'Ishaan',
    lastName: 'Gupta',
    email: 'ishaan.gupta@example.com',
    role: 'student',
    college: 'VIT Vellore',
    year: '4th Year',
    skills: ['Machine Learning', 'Python', 'TensorFlow'],
    isVerified: true,
    createdAt: new Date('2026-06-05T16:45:00Z')
  },
  {
    firstName: 'Riya',
    lastName: 'Verma',
    email: 'riya.verma@example.com',
    role: 'student',
    college: 'SRM University',
    year: '3rd Year',
    skills: ['Graphic Design', 'Illustrator', 'Photoshop'],
    isVerified: true,
    createdAt: new Date('2026-06-06T12:00:00Z')
  },
  {
    firstName: 'Arjun',
    lastName: 'Mehta',
    email: 'arjun.mehta@example.com',
    role: 'student',
    college: 'RVCE Bangalore',
    year: '2nd Year',
    skills: ['Webflow', 'HTML', 'Javascript'],
    isVerified: true,
    createdAt: new Date('2026-06-07T10:10:00Z')
  },
  {
    firstName: 'Meera',
    lastName: 'Nair',
    email: 'meera.nair@example.com',
    role: 'student',
    college: 'NIT Trichy',
    year: '4th Year',
    skills: ['Product Management', 'Data Analytics', 'Excel'],
    isVerified: true,
    createdAt: new Date('2026-06-08T15:30:00Z')
  }
];

async function seed() {
  try {
    const maskedUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
    console.log(`🔄 Connecting to MongoDB at: ${maskedUri}...`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected successfully!');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    console.log('🧹 Clearing existing students from database...');
    // Only delete students that match our mock domain to keep other data safe
    const deleteResult = await usersCollection.deleteMany({ role: 'student', email: /@example\.com$/ });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} old mock students.`);

    console.log('🌱 Inserting mock students...');
    const insertResult = await usersCollection.insertMany(mockStudents);
    console.log(`✅ Successfully seeded ${insertResult.insertedCount} mock students into the database!`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

seed();
