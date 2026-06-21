import UsersModel from '../users/users.model.js';
import TransactionModel from './transactions.model.js';
import { createTransaction, deleteAllTransaction, deleteTransaction, getTransaction, UpdateTransaction, ViewTransaction } from './transactions.services.js'

export const addTransaction = async (req, res) => {
    try {
        const { userId, title, money, type, category, date, isUpdate, noDelete } = req.body;
        const transaction = await createTransaction({
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
}

export const Transactions = async (req, res) => {
    try {
        const { userId, year, month } = req.body;
        const transactions = await getTransaction({ userId, year, month })
        res.json({ success: true, transactions: transactions });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch transactions"
        });
    }
}

export const Updates = async (req, res) => {
    try {
        const { _id, userId, title, category, money, date, type } = req.body;
        let Update = await UpdateTransaction({ _id, userId, title, category, money, date, type })
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
}
export const Delete= async (req,res)=>{
    try {
        const { id, userId } = req.body;
        let Delete = await deleteTransaction({ _id: id, userId: userId })
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
}
export const DeleteAllTransaction=async(req,res)=>{
    try {
        const { userId } = req.body;
        const Delete = await deleteAllTransaction({ userId: userId })
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
}
export const SyncData=async(req,res)=>{
    try {
        let { userId, transaction, user, email, password } = req.body;
        if (!userId) {
            const existing = await UsersModel.findOne({ $or: [{ name: user }, { email }] }, { _id: 1 })
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
                let newUser = new UsersModel({ name: user, email: email, password: password })
                await newUser.save();
                console.log("unmatched user", user)
                userId = newUser._id.toString()
            }
        }
        const newTransaction = transaction.filter(item => !item._id).map(item => ({ ...item, userId }));
        let newUpdateTransaction = [];
        if (newTransaction.length > 0) {
            newUpdateTransaction = await TransactionModel.insertMany(newTransaction);
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
            let value = await TransactionModel.findOneAndUpdate(
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
                const created = await TransactionModel.create({
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
        await TransactionModel.deleteMany({
            userId: userId,
            _id: { $nin: noDeleteTransaction }
        })
        console.log("transaction", transaction)
        res.json({ success: true, message: "Transaction Successfully Synced", userId, transaction })
    }
    catch (error) {
        res.json({ success: false, message: "Server Error" })
    }
}
export const ViewData=async(req,res)=>{
    try {
        const { userId } = req.body;
        let transactions = await ViewTransaction({userId});
        res.json({ success: true, message: transactions })
    }
    catch (error) {
        res.json({ success: false, message: "Server Error" })
    }
}