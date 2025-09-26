import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import all models to ensure they're registered
import './src/models/cartModel.js';
import './src/models/customerModel.js';
import './src/models/customerPaymentModel.js';
import './src/models/deliveryDriverModel.js';
import './src/models/deliveryTaskModel.js';
import './src/models/employeeModel.js';
import './src/models/farmerModel.js';
import './src/models/farmerPaymentModel.js';
import './src/models/inventoryHistoryModel.js';
import './src/models/orderModel.js';
import './src/models/productModel.js';
import './src/models/rawMaterialModel.js';
import './src/models/rawMaterialOrderModel.js';
import './src/models/salaryModel.js';
import './src/models/userModel.js';

const clearAllCollections = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log(`Found ${collections.length} collections to clear:`);
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Clear all collections
    for (const collection of collections) {
      try {
        await mongoose.connection.db.collection(collection.name).deleteMany({});
        console.log(`✅ Cleared collection: ${collection.name}`);
      } catch (error) {
        console.error(`❌ Error clearing collection ${collection.name}:`, error.message);
      }
    }

    console.log('\n🎉 All collections have been cleared successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

// Run the script
clearAllCollections();
