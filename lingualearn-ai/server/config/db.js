/* global process */
import mongoose from 'mongoose'

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lingualearn_ai'
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  })
  console.log('MongoDB connected')
}
