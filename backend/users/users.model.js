import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique:true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    }
})
const UsersModel = mongoose.model("Users", schema);
export default UsersModel;
