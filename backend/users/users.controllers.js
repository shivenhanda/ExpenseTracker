import mongoose from "mongoose";
import bcrypt from "bcrypt";
import UsersModel from "./users.model.js";
import TransactionModel from "../transactions/transactions.model.js";
import jwt from 'jsonwebtoken';
import { createUser, DeleteUser, loginUser, ResetUserPassword } from "./users.services.js";
import connectDB from "../database/mongodb.js";
import nodemailer from "nodemailer";
import crypto from "node:crypto";

export const CheckAuth = async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.json({
                success: false,
                message: "Not authenticated"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        return res.json({
            success: true,
            userId: decoded.userId,
            name: decoded.name
        });

    } catch (error) {
        return res.json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};
export const SignUp = async (req, res) => {
    try {
        await connectDB()
        let { name, email, password } = req.body;
        name = name.trim().toLowerCase();
        email = email.trim().toLowerCase();
        const existingUser = await UsersModel.findOne({ $or: [{ name }, { email }] }, { _id: 1 })
        if (existingUser) {
            return res.json({ success: false, message: "User Already Register with these name or email" })
        }
        password = await bcrypt.hash(password, 10);
        const newUser = await createUser({ name, email, password })
        const token = jwt.sign(
            {
                name: newUser.name,
                userId: newUser._id
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.json({ success: true, message: newUser._id.toString() })
    } catch (error) {
        console.error("Signup error", error)
        return res.json({ success: false, message: error.message })
    }
}
export const login = async (req, res) => {
    try {
        await connectDB();
        let { name, password } = req.body;
        if (!name || !password) {
            return res.json({
                success: false,
                message: "Name and Password required"
            });
        }
        name = name.trim().toLowerCase();
        const existingUser = await loginUser({ name })
        if (!existingUser) {
            return res.json({ success: false, "message": "No User Found. Please Sign Up" })
        }
        const isPasswordCorrect = await bcrypt.compare(
            password,
            existingUser.password
        );
        if (!isPasswordCorrect) {
            return res.json({
                success: false,
                message: "Invalid password"
            });
        }
        const token = jwt.sign(
            {
                name: existingUser.name,
                userId: existingUser._id
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.json({ success: true, message: existingUser._id });
    }
    catch (error) {
        console.log("Login error", error)
        return res.json({ success: false, message: error.message });
    }
}
export const ResetPassword = async (req, res) => {
    try {
        await connectDB();
        let { name, password } = req.body;
        name = name.trim().toLowerCase()
        password = await bcrypt.hash(password, 10);
        let Update = await ResetUserPassword({ name, password })
        if (!Update) {
            return res.json({ success: false, message: "No User Found" })
        }
        return res.json({ success: true, message: "Password Updated Successfully" })
    }
    catch (error) {
        console.error("Password Update", error)
        return res.json({ success: false, message: error.message })
    }
}
export const Logout = async (req, res) => {
    res.clearCookie('token', {
        path: '/',
        httpOnly: true,
        secure: true,
    });
    return res.redirect('https://expensetracker-eta-navy-42.vercel.app/');
}
export const DeleteAccount = async (req, res) => {
    try {
        await connectDB();
        let { name, password } = req.body;
        name = name.trim().toLowerCase()
        let find = await DeleteUser({ name })
        if (!find) {
            return res.json({ success: false, message: "No User found" })
        }
        let match = await bcrypt.compare(password, find.password)
        if (!match) {
            return res.json({ success: false, message: "Password Not Match" })
        }
        let deletetoken = req.cookies.token;

        if (!deletetoken) {
            return res.json({
                success: false,
                message: "Login Again First"
            });
        }

        let token = jwt.verify(
            deletetoken,
            process.env.JWT_SECRET
        );
        let Delete = await TransactionModel.deleteMany({ userId: token.userId })
        Delete = await UsersModel.findByIdAndDelete(token.userId);
        return res.json({ success: true, message: "Account Deleted Successfully" })
    }
    catch (error) {
        console.error("Delete Error", error)
        return res.json({ success: false, message: error.message })
    }
}
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
const otpMap = new Map()
export const SendOtp = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                message: "Email is required.",
            });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address.",
            });
        }
        const fromAddress = process.env.EMAIL_USER || "";
        const fromPass = process.env.EMAIL_PASS || "";
        if (!fromAddress || !fromPass) {
            return res.json({ message: "Error on env" })
        }
        let transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: fromAddress,
                pass: fromPass
            }
        });
        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000;

        const mailOptions = {
            from: fromAddress,
            to: email,
            subject: `Expense Tracker Verification Code (Valid for 5 mins)`,
            text: `Your OTP is: ${otp}. This code is valid for 5 minutes only.`,
        };
        otpMap.set(email, {
            otp,
            expiresAt,
            createdAt: Date.now()
        });
        await transporter.sendMail(mailOptions);
        return res.json({ message: "OTP Sent Successfully" });
    }
    catch (error) {
        console.error("Error", error);
        return res.json({ message: error.message })
    }
}
export const VerifyOtp = async (req, res) => {
    try {
        let { email, otp } = req.body;
        email = email.trim().toLowerCase()
        otp = otp.trim().toLowerCase()
        const storedOtp = otpMap.get(email);
        if (!storedOtp) {
            return res.json({ message: "No OTP request found for this email. Please click 'Send OTP' first." })
        }
        const now = Date.now()
        if (now > storedOtp.expiresAt) {
            otpMap.delete(email);
            return res.json({ message: "OTP has expired. OTP is only valid for 5 minutes. Please request a new OTP code." })
        }
        if (otp != storedOtp.otp) {
            return res.json({ message: "Invalid OTP code. Please check your email and try again." })
        }
        otpMap.delete(email)
        return res.json({ message: "OTP Verified Successfully." })
    }
    catch (error) {
        console.error("Error", error);
        return res.json({ message: error.message })
    }
}
export const SetPassword = async (req, res) => {

    let existing
    let oldPassword = null
    let passwordUpdate = false
    try {
        await connectDB();
        const email = req.body.email?.trim().toLowerCase();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailPattern.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address.",
            });
        }
        existing = await UsersModel.findOne({ email })
        if (!existing) {
            return res.json({ success: false, message: "No User Found" })
        }
        oldPassword = existing.password
        let newPassword = existing.name + crypto.randomBytes(5).toString("hex")
        let hashPassword = await bcrypt.hash(newPassword, 10);
        const fromAddress = process.env.EMAIL_USER || "";
        const fromPass = process.env.EMAIL_PASS || "";
        if (!fromAddress || !fromPass) {
            return res.json({ success: false, message: "Error on env" })
        }
        let Update = await ResetUserPassword({ name: existing.name, password: hashPassword })
        if (!Update) {
            return res.json({ success: false, message: "No User Found" })
        }
        passwordUpdate = true
        let transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: fromAddress,
                pass: fromPass
            }
        });
        const mailOptions = {
            from: fromAddress,
            to: email,
            subject: `Expense Tracker New Password`,
            text: `Your New Password is: ${newPassword}.`,
        };
        await transporter.sendMail(mailOptions);
        return res.json({ success: true, message: "New Password Sent Successfully" });
    }
    catch (error) {
        console.error("Error", error);
        try {
            if (passwordUpdate && existing && oldPassword !== null) {
                await ResetUserPassword({ name: existing.name, password: oldPassword })
            }
        } catch (error) {
            console.error("Password rollback failed:", error.message);
        }
        return res.json({ success: false, message: error.message })
    }
}