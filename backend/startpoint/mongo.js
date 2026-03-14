// startpoint/mongo.js
import 'dotenv/config';
import mongoose from 'mongoose';

export async function connectDB() {
  // mongoose moderno no necesita opciones extra
  await mongoose.connect(process.env.MONGO_URI);
}
