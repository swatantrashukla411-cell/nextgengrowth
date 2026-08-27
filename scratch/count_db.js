const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;
console.log("URI from env:", MONGO_URI);

if (!MONGO_URI) {
  console.error("No MONGODB_URI found in process.env");
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB!");
    
    // Get list of collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections in DB:");
    for (let col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count} documents`);
    }
  } catch (err) {
    console.error("Error connecting/querying:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
