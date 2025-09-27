import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const collectionName = process.argv[2];

if (!collectionName) {
  console.error('Please provide a collection name as an argument.');
  process.exit(1);
}

const clearCollection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const exists = collections.some(c => c.name === collectionName);
    if (!exists) {
      console.error(`Collection '${collectionName}' does not exist.`);
      process.exit(1);
    }

    // Clear the collection
    await mongoose.connection.db.collection(collectionName).deleteMany({});
    console.log(`✅ Cleared collection: ${collectionName}`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

clearCollection();
