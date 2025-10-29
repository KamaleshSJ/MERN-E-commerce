import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config({path:'backend/config/config.env'})

export const dbConnection = ()=>{
    mongoose.connect(process.env.MONGODB_URL)
    .then((data)=>{console.log(`MongoDB connected with server ${data.connection.host}`)})
    
}

