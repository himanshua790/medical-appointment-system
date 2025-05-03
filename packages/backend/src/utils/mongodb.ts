import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables from the backend package .env file
dotenv.config({ path: join(__dirname, '../../.env') });

/**
 * MongoDB connection URI loaded from environment variable MONGODB_URI.
 */
const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

/**
 * Connects to MongoDB and pings the database to ensure a successful connection.
 */
export async function connectToDatabase(): Promise<void> {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Connected successfully to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

/**
 * Returns the MongoDB database instance for the given database name.
 * @param dbName Name of the database to get.
 */
export function getDb(dbName: string) {
  return client.db(dbName);
} 