import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDB = async() =>{
    try{
        const connectDBInstance= await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MongoDB connected:${connectDBInstance.connection.host}`)
    }
    catch(error){
        console.error("ERROR",error);
        process.exit(1)
    }
}
