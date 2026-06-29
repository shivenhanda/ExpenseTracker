import mongoose from "mongoose";
import dns from 'dns'

dns.setServers(['8.8.8.8','1.1.1.1'])
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.mongoDB, {
            dbName: "UsersDB",
            serverSelectionTimeoutMS: 5000,
        })
        console.log("DB connected Successfully")
    } catch (error) {
        console.log("Error", error)
    }
}
export default connectDB;