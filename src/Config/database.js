import mongoose from "mongoose";

// Function to connect to the database
const connectDatabase = async() => {
 try {
   await mongoose.connect(process.env.MONGODB_URL)
     console.log("Database connected successfully");
 } catch (error) {
    console.log("Database not connnected",error);
    process.exit(1)
 }
}
export default connectDatabase;
