import { MongoClient } from 'mongodb';



if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function connectToDatabase() {
  try {
    await client.connect();
    return client.db(process.env.MONGODB_DB || 'fusiontalk');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function upsertLineContact(contact: {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}) {
  const db = await connectToDatabase();
  const collection = db.collection('contacts');
  
  return await collection.updateOne(
    { userId: contact.userId },
    { 
      $set: {
        ...contact,
        messageType: 'line',
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );
}

export async function storeLineMessage(userId: string, userName: string, content: string, sender: 'user' | 'bot' = 'user') {
  const db = await connectToDatabase();
  const collection = db.collection('messages');
  
  return await collection.insertOne({
    userId,
    userName,
    messageType: 'line',
    content,
    sender,
    createdAt: new Date()
  });
}

export async function getLineMessages() {
  const db = await connectToDatabase();
  const collection = db.collection('messages');
  
  return await collection
    .find({ messageType: 'line' })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getLineContacts() {
  const db = await connectToDatabase();
  const collection = db.collection('contacts');
  
  return await collection
    .find({ messageType: 'line' })
    .sort({ updatedAt: -1 })
    .toArray();
}
