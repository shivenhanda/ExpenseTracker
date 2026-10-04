import {
    createTransaction,
    deleteAllTransaction,
    deleteTransaction,
    getTransaction,
    UpdateTransaction,
    ViewTransaction
} from './transactions.services.js';


export const addTransaction = async (req, res) => {
    try {
        const {
            userId,
            title,
            money,
            type,
            category,
            date
        } = req.body;

        const transaction = await createTransaction({
            userId,
            title,
            money,
            type,
            category,
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
        const {
            userId,
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
        const {
            _id,
            userId,
            title,
            category,
            money,
            date,
            type
        } = req.body;

        const Update = await UpdateTransaction({
            _id,
            userId,
            title,
            category,
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
        const {
            id,
            userId
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
        const {
            userId
        } = req.body;

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
        const {
            userId
        } = req.body;

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