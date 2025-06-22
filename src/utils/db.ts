import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const url =process.env.MONGODB_URI!;
if(!url){
     console.error('❌ MONGODB_URI not set in .env');
     process.exit(1);
}

export async function connectDB(){
    try{
        mongoose.set('strictQuery', true);
        await mongoose.connect(url);
        console.log('✅ MongoDB connected');
    }
    catch(error: any){
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}