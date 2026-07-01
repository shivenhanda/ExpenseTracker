import UsersModel from "./users.model.js";
import { createUser, DeleteUser, loginUser, ResetUserPassword } from "./users.services.js";

export const SignUp= async (req, res) => {
    try {
        let { name, email, password } = req.body;
        name = name.trim();
        email = email.trim().toLowerCase();
        const existingUser = await UsersModel.findOne({ $or: [{ name }, { email }] }, { _id: 1 })
        if (existingUser) {
            return res.json({ success: false, message: "User Already Register with these name or email" })
        }
        const newUser = await createUser({ name, email, password })
        return res.json({ success: true, message: newUser._id.toString() })
    } catch (error) {
        return res.json({ success: false, message: "Server Error" })
    }
}
export const login=async (req, res) => {
    try {
        const { name, password } = req.body;
        if (!name) {
            return res.json({
                success: false,
                message: "Name required"
            });
        }
        const existingUser = await loginUser({ name }, { _id: 1, name: 1, email: 1, password: 1 })
        if (!existingUser) {
            res.json({ success: false, "message": "No User Found. Please Sign Up" })
        }
        res.json({ success: true, name: existingUser.name, password: existingUser.password, id: existingUser._id });
    }
    catch (error) {
        return res.json({ success: false, message: "Server Error" });
    }
}
export const ResetPassword=async (req, res) => {
    try {
        const { userId, password } = req.body;
        let Update = await ResetUserPassword({userId,password})
        if (!Update) {
            res.json({ success: false, message: "No User Found" })
        }
        res.json({ success: true, message: password })
    }
    catch (error) {
        res.json({ success: false, message: "Server Error" })
    }
}
export const DeleteAccount=async (req, res) => {
    try {
        const { name, userId, password } = req.body;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.json({ success: false, message: "Invalid User ID" });
        }
        let find = await DeleteUser({userId,password})
        if (!find) {
            return res.json({ success: false, message: "No User found" })
        }
        let match = await bcrypt.compare(password, find.password)
        if (!match) {
            return res.json({ success: false, message: "Password Not Match" })
        }
        let Delete = await Transaction.deleteMany({ userId: new mongoose.Types.ObjectId(userId) })
        Delete = await Users.findOneAndDelete({ _id: new mongoose.Types.ObjectId(userId) })
        return res.json({ success: true, message: "Account Deleted Successfully" })
    }
    catch (error) {
        return res.json({ success: false, message: "Server Error" })
    }
}