import mongoose from "mongoose";

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
export const TransactionModel = mongoose.model("Transaction", schema1);
export default TransactionModel;