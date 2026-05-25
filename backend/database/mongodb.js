import mongoose from "mongoose";
import dns from 'dns'

dns.setServers(['8.8.8.8','1.1.1.1'])
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://shivenhanda2003_db_user:AykRBcw3hTvMWHli@cluster0.mjfajaj.mongodb.net/?appName=Cluster0", {
            dbName: "UsersDB",
            serverSelectionTimeoutMS: 5000,
        })
        console.log("DB connected Successfully")
    } catch (error) {
        console.log("Error", error)
    }
}
export default connectDB;