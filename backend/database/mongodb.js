import mongoose from "mongoose";
import dns from 'dns'

dns.setServers(['8.8.8.8','1.1.1.1'])
const connectDB = () =>{
    const uri = process.env.mongoDB;

    if (!uri) {
        return Promise.reject(
            new Error("mongoDB environment variable is missing")
        );
    }

    return mongoose.connect(uri, {
        dbName: "UsersDB",
        serverSelectionTimeoutMS: 10000,
    });
}
export default connectDB;