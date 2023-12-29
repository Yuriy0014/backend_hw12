import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

dotenv.config();

const dbName = 'blog_platform';

const mongoURI = process.env.MONGO_URL || `mongodb://0.0.0.0:27017/${dbName}`;

export const client = new MongoClient(mongoURI);
const db = client.db();

export async function connectToMongoDB() {
  try {
    await client.connect();
    await db.command({ ping: 1 });

    const isLocalDB = mongoURI === 'mongodb://0.0.0.0:27017';

    console.log(
      `You successfully connected to ${isLocalDB ? 'local' : 'remote'} MongoDB!`
    );
  } catch (err) {
    console.log('Disconnected MongoDB.');
    await client.close();
  }
}

export async function connectToMongoose() {
  try {
    await mongoose.connect(mongoURI);

    const isLocalDB = mongoURI.startsWith('mongodb://0.0.0.0:27017');

    console.log(
      `You successfully connected to ${
        isLocalDB ? 'local' : 'remote'
      } MongoDB through Mongoose!`
    );
  } catch (err) {
    console.log('Disconnected MongoDB.');
    await mongoose.disconnect();
  }
}
