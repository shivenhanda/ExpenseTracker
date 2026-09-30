import mongoose from "mongoose";
import bcrypt from "bcrypt";
import UsersModel from "./users.model.js";
import TransactionModel from "../transactions/transactions.model.js";
import { createUser, DeleteUser, loginUser, ResetUserPassword } from "./users.services.js";

export const SignUp = async (req, res) => {
    try {
        let { name, email, password } = req.body;
        const existingUser = await UsersModel.findOne({ $or: [{ name }, { email }] }, { _id: 1 })
        if (existingUser) {
            return res.json({ success: false, message: "User Already Register with these name or email" })
        }
        const newUser = await createUser({ name, email, password })
        return res.json({ success: true, message: newUser._id.toString() })
    } catch (error) {
        console.error("Signup error", error)
        return res.json({ success: false, message: error.message })
    }
}
export const login = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.json({
                success: false,
                message: "Name required"
            });
        }
        const existingUser = await loginUser({ name })
        if (!existingUser) {
            return res.json({ success: false, "message": "No User Found. Please Sign Up" })
        }
        return res.json({ success: true, name: existingUser.name, password: existingUser.password, id: existingUser._id });
    }
    catch (error) {
        console.log("Login error", error)
        return res.json({ success: false, message: error.message });
    }
}
export const ResetPassword = async (req, res) => {
    try {
        const { userId, password } = req.body;
        let Update = await ResetUserPassword({ userId, password })
        if (!Update) {
            return res.json({ success: false, message: "No User Found" })
        }
        return res.json({ success: true, message: password })
    }
    catch (error) {
        return res.json({ success: false, message: "Server Error" })
    }
}
export const DeleteAccount = async (req, res) => {
    try {
        const { userId, password } = req.body;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.json({ success: false, message: "Invalid User ID" });
        }
        let find = await DeleteUser({ userId })
        if (!find) {
            return res.json({ success: false, message: "No User found" })
        }
        let match = await bcrypt.compare(password, find.password)
        if (!match) {
            return res.json({ success: false, message: "Password Not Match" })
        }
        let Delete = await TransactionModel.deleteMany({ userId: new mongoose.Types.ObjectId(userId) })
        Delete = await UsersModel.findOneAndDelete({ _id: new mongoose.Types.ObjectId(userId) })
        return res.json({ success: true, message: "Account Deleted Successfully" })
    }
    catch (error) {
        console.error("Delete Error",error)
        return res.json({ success: false, message: error.message })
    }
}