require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

/**
 * Migration script to add phoneNumber, location, and bio fields to existing users
 * 
 * This script will:
 * 1. Connect to the MongoDB database
 * 2. Find all users
 * 3. Update any users that don't have the new fields
 * 4. Log the results
 * 5. Disconnect from the database
 */
async function migrateUsers() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Find users who might not have the new fields
    const usersToUpdate = await User.find({
      $or: [
        { phoneNumber: { $exists: false } },
        { location: { $exists: false } },
        { bio: { $exists: false } }
      ]
    });

    console.log(`Found ${usersToUpdate.length} users that need updating`);

    if (usersToUpdate.length === 0) {
      console.log('No users need updating. All users already have the required fields.');
      await mongoose.disconnect();
      return;
    }

    // Update users with default values
    const bulkOps = usersToUpdate.map(user => ({
      updateOne: {
        filter: { _id: user._id },
        update: {
          $set: {
            phoneNumber: user.phoneNumber || '',
            location: user.location || '',
            bio: user.bio || ''
          }
        }
      }
    }));

    const result = await User.bulkWrite(bulkOps);
    console.log(`Updated ${result.modifiedCount} users with default values for new fields`);
    
    // Verify the update
    const remainingUsers = await User.find({
      $or: [
        { phoneNumber: { $exists: false } },
        { location: { $exists: false } },
        { bio: { $exists: false } }
      ]
    });
    
    if (remainingUsers.length === 0) {
      console.log('All users now have the required fields.');
    } else {
      console.log(`Warning: ${remainingUsers.length} users still need updating.`);
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateUsers();
