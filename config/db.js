import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    mongoose.connection.on('connected',()=>console.log("MongoDB Connected"))
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connection Successfull");
  } catch (error) {
    console.error("Connection Failed");
  }
};
