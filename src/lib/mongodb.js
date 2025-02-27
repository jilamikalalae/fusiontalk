import { connect } from 'http2';
import mongoose from 'mongoose';

const connection = {};

const connectMongoDB = async () => {
  try {
    if (connection.isConnected) return;

    const db = await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export default connectMongoDB;
