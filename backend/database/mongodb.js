import mongoose from "mongoose";
import dns from 'dns'

dns.setServers(['8.8.8.8','1.1.1.1'])
const connectDB = () =>
    mongoose.connect(process.env.mongoDB, {
            dbName: "UsersDB",
            serverSelectionTimeoutMS: 5000,
        })
export default connectDB;