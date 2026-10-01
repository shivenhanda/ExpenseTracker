import mongoose from "mongoose";
import dns from 'dns'

dns.setServers(['8.8.8.8', '1.1.1.1'])
const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return;
    }
    const uri = process.env.mongoDB;

    if (!uri) {
        return Promise.reject(
            new Error("mongoDB environment variable is missing")
        );
    }

    try {
        await mongoose.connect(uri);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        throw error;
    }
}
export default connectDB;