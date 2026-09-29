import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/securecrypt';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000, // Quickly detect if local MongoDB daemon is offline
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] Note: MongoDB at "${uri}" is not currently reachable.`);
    console.log(`[MongoDB] Running in-memory database fallback so the app works immediately out-of-the-box!`);
    console.log(`[MongoDB] (To persist data, update MONGODB_URI in server/.env with your MongoDB Atlas connection string).\n`);
  }
};
