import express from "express"
import path from "path"
import mongoose from "mongoose";
import dns from "dns"
import cors from "cors"
import Users from "./Add.js";
import bcrypt from "bcrypt"
import dotenv from "dotenv";
dotenv.config()

const port = 8000


dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            dbName: "UsersDB",
            tls: true,
            serverSelectionTimeoutMS: 5000,
        })
        console.log("DB connected Successfully")
    } catch (error) {
        console.log("Error", error)
    }
}
connectDB();

const app = new express();

app.use(cors())
app.use(express.json());

const schema1 = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    title: {
        type: String
    },
    money: {
        type: Number
    },
    date: {
        type: Date
    },
    type: {
        type: String
    },
    category: {
        type: String
    },
    isUpdate: {
        type: Boolean
    },
    noDelete: {
        type: Boolean
    }
})
const Transaction = mongoose.model("Transaction", schema1);
app.post("/SignUp", async (req, res) => {
    try {
        let { name, email, password } = req.body;
        name = name.trim();
        email = email.trim().toLowerCase();
        const existingUser = await Users.findOne({ $or: [{ name }, { email }] }, { _id: 1 })
        if (existingUser) {
            return res.json({ success: false, message: "User Already Register with these name or email" })
        }
        const newUser = new Users({ name, email, password })
        await newUser.save();
        return res.json({ success: true, message: newUser._id.toString() })
    } catch (error) {
        return res.json({ success: false, message: "Server Error" })
    }
})
app.post("/login", async (req, res) => {
    try {
        const { name, password } = req.body;
        if (!name) {
            return res.json({
                success: false,
                message: "Name required"
            });
        }
        const existingUser = await Users.findOne({ name }, { _id: 1, name: 1, email: 1, password: 1 })
        if (!existingUser) {
            res.json({ success: false, "message": "No User Found. Please Sign Up" })
        }
        res.json({ success: true, name: existingUser.name, password: existingUser.password, id: existingUser._id });
    }
    catch (error) {
        return res.json({ success: false, message: "Server Error" });
    }
})
app.post("/AddTransaction", async (req, res) => {
    try {
        const { userId, title, money, type, category, date, isUpdate, noDelete } = req.body;
        const transaction = await Transaction.create({
            userId: userId,
            title: title,
            money: money,
            type: type,
            category: category,
            date: date,
            isUpdate: isUpdate,
            noDelete: noDelete
        })
        res.json({ success: true, transaction: transaction });
    }
    catch (err) {
        res.status(500).json({ success: false, message: "Failed to add transaction" });
    }
})
app.post("/Transactions", async (req, res) => {
    try {
        const { userId, year, month } = req.body;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        const transactions = await Transaction.find({
            userId: new mongoose.Types.ObjectId(userId),
            date: {
                $gte: startDate,
                $lt: endDate
            }
        }).sort({ date: 1 });
        res.json({ success: true, transactions: transactions });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch transactions"
        });
    }
});
app.post("/Updates", async (req, res) => {
    try {
        const { _id, userId, title, category, money, date, type } = req.body;
        let Update = await Transaction.findOneAndUpdate({ _id: _id, userId: userId }, { $set: { title: title, category: category, money: money, date: date, type: type } }, { new: true, runValidators: true })
        if (!Update) {
            res.json({ success: false, message: "No Data Found" });
        }
        res.json({ success: true, transactions: Update });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch transactions"
        })
    }
})
app.post("/Delete", async (req, res) => {
    try {
        const { id, userId } = req.body;
        let Delete = await Transaction.findOneAndDelete({ _id: id, userId: userId })
        if (!Delete) {
            res.json({ success: false, message: "Transaction not Found" })
        }
        res.json({ success: true, message: "Transaction Delete Successfully" })
    }
    catch (error) {
        res.json({
            success: false,
            message: "Server Error"
        })
    }
})
app.post("/DeleteAllTransaction", async (req, res) => {
    try {
        const { userId } = req.body;
        const Delete = await Transaction.deleteMany({ userId: userId })
        if (Delete.deletedCount === 0) {
            res.json({ result: false, message: "No Transaction Found" })
        }
        res.json({ result: true, message: `${Delete.deletedCount} Transactions Deleted` })
    }
    catch (error) {
        res.json({
            success: false,
            message: "Server Error"
        })
    }
})
app.post("/ResetPassword", async (req, res) => {
    try {
        const { userId, password } = req.body;
        let Update = await Users.findOneAndUpdate({ _id: userId }, { $set: { password: password } })
        if (!Update) {
            res.json({ success: false, message: "No User Found" })
        }
        res.json({ success: true, message: password })
    }
    catch (error) {
        res.json({ success: false, message: "Server Error" })
    }
})
app.post("/DeleteAccount", async (req, res) => {
    try {
        const { name, userId, password } = req.body;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.json({ success: false, message: "Invalid User ID" });
        }
        let find = await Users.findOne({ _id: new mongoose.Types.ObjectId(userId) }, { _id: 0, password: 1 })
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
})
app.post("/SyncData", async (req, res) => {
    try {
        let { userId, transaction, user, email, password } = req.body;
        if (!userId) {
            const existing = await Users.findOne({ $or: [{ name: user }, { email }] }, { _id: 1 })
            console.log("User", user)
            if (existing) {
                let match = await bcrypt.compare(password, existing.password)
                if (match) {
                    userId = existing._id.toString();
                    console.log("match", user)
                }
                else {
                    return res.json({ success: false, message: "No Password Matched. Now create Data Again." })
                }
            }
            else {
                let newUser = new Users({ name: user, email: email, password: password })
                await newUser.save();
                console.log("unmatched user", user)
                userId = newUser._id.toString()
            }
        }
        const newTransaction = transaction.filter(item => !item._id).map(item => ({ ...item, userId }));
        let newUpdateTransaction = [];
        if (newTransaction.length > 0) {
            newUpdateTransaction = await Transaction.insertMany(newTransaction);
        }
        console.log("new update Transaction", newUpdateTransaction)
        let n = 0
        transaction = transaction.map(item => {
            if (!item._id) {
                let value = newUpdateTransaction[n]
                n++
                return {
                    ...item,
                    _id: value._id.toString(),
                    userId: value.userId.toString()
                }
            }
            return item;
        })
        const updateTransaction = transaction.filter(item => item.isUpdate)
        for (let t of updateTransaction) {
            let value = await Transaction.findOneAndUpdate(
                { _id: t._id.toString(), userId: userId },
                {
                    $set: {
                        title: t.title,
                        money: t.money,
                        type: t.type,
                        date: t.date,
                        category: t.category,
                        isUpdate: false,
                        noDelete: true
                    }
                },
                { new: true }
            );
            if (!value) {
                const created = await Transaction.create({
                    ...t,
                    userId,
                    isUpdate: false,
                    noDelete: true
                });

                t._id = created._id.toString();
                t.userId = created.userId.toString();
                t.isUpdate = false;
                t.noDelete = true;
            } else {
                t.isUpdate = false;
                t.noDelete = true;
            }
        }
        console.log("Update Transactions", updateTransaction)
        const noDeleteTransaction = transaction
            .filter(item => item._id)
            .map(item => item._id);
        console.log("Delete Transactions", noDeleteTransaction)
        await Transaction.deleteMany({
            userId: userId,
            _id: { $nin: noDeleteTransaction }
        })
        console.log("transaction", transaction)
        res.json({ success: true, message: "Transaction Successfully Synced", userId, transaction })
    }
    catch (error) {
        res.json({ success: false, message: "Server Error" })
    }
})
app.post("/ViewData", async (req, res) => {
    try {
        const { userId } = req.body;
        let transactions = await Transaction.find({ userId: userId });
        res.json({ success: true, message: transactions })
    }
    catch (error) {
        res.json({ success: false, message: "Server Error" })
    }
})
const staticPath = path.join(process.cwd(), "..", "frontend", "build")
app.use(express.static(staticPath))
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
});



app.listen(port, () => {
    console.log("Available on Port", port)
})
