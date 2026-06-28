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