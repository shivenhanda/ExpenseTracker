import {
    createTransaction,
    deleteAllTransaction,
    deleteTransaction,
    getTransaction,
    UpdateTransaction,
    ViewTransaction
} from './transactions.services.js';
import connectDB from '../database/mongodb.js';
import jwt from 'jsonwebtoken';

const getAuthenticatedUserId = (req) => {
    try {
        return jwt.verify(req.cookies?.token, process.env.JWT_SECRET).userId;
    } catch {
        return null;
    }
};

export const addTransaction = async (req, res) => {
    try {
        await connectDB();
        const userId = getAuthenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        const {
            title,
            money,
            type,
            category,
            categoryColor,
            date
        } = req.body;

        const transaction = await createTransaction({
            userId,
            title,
            money,
            type,
            category,
            categoryColor,
            date
        });

        return res.json({
            success: true,
            transaction
        });

    } catch (err) {
        console.error("ADD TRANSACTION ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to add transaction"
        });
    }
};


export const Transactions = async (req, res) => {
    try {
        await connectDB();
        const userId = getAuthenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        const {
            year,
            month
        } = req.body;

        const transactions = await getTransaction({
            userId,
            year,
            month
        });

        return res.json({
            success: true,
            transactions
        });

    } catch (err) {
        console.error("GET TRANSACTIONS ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch transactions"
        });
    }
};


export const Updates = async (req, res) => {
    try {
        await connectDB();
        const authenticatedUserId = getAuthenticatedUserId(req);
        if (!authenticatedUserId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        const {
            _id,
            title,
            category,
            categoryColor,
            money,
            date,
            type
        } = req.body;

        const Update = await UpdateTransaction({
            _id,
            userId: authenticatedUserId,
            title,
            category,
            categoryColor,
            money,
            date,
            type
        });

        if (!Update) {
            return res.json({
                success: false,
                message: "No Data Found"
            });
        }

        return res.json({
            success: true,
            transactions: Update
        });

    } catch (error) {
        console.error("UPDATE TRANSACTION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update transaction"
        });
    }
};


export const Delete = async (req, res) => {
    try {
        await connectDB();
        const userId = getAuthenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        const {
            id
        } = req.body;

        const deletedTransaction = await deleteTransaction({
            id,
            userId
        });

        if (!deletedTransaction) {
            return res.json({
                success: false,
                message: "Transaction not Found"
            });
        }

        return res.json({
            success: true,
            message: "Transaction Delete Successfully"
        });

    } catch (error) {
        console.error("DELETE TRANSACTION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


export const DeleteAllTransaction = async (req, res) => {
    try {
        await connectDB();
        const userId = getAuthenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        const Delete = await deleteAllTransaction({
            userId
        });

        if (Delete.deletedCount === 0) {
            return res.json({
                result: false,
                message: "No Transaction Found"
            });
        }

        return res.json({
            result: true,
            message: `${Delete.deletedCount} Transactions Deleted`
        });

    } catch (error) {
        console.error("DELETE ALL ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};


export const ViewData = async (req, res) => {
    try {
        await connectDB();
        const userId = getAuthenticatedUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        const transactions = await ViewTransaction({
            userId
        });

        return res.json({
            success: true,
            message: transactions
        });

    } catch (error) {
        console.error(
            "Unable to load Data",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};