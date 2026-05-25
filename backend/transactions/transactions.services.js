import TransactionModel from "./transactions.model.js";
import mongoose from "mongoose";

export const createTransaction = async (data) => {
    return await TransactionModel.create(data);
}
export const getTransaction = async ({ userId, year, month }) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    return await TransactionModel.find({
        userId: new mongoose.Types.ObjectId(userId),
        date: {
            $gte: startDate,
            $lt: endDate
        }
    }).sort({ date: 1 });
}
export const UpdateTransaction = async({ _id, userId, title, category, money, date, type})=> {
    return await TransactionModel.findOneAndUpdate({ _id: _id, userId: userId }, { $set: { title: title, category: category, money: money, date: date, type: type } }, { new: true, runValidators: true })
}

export const deleteTransaction = async ({id, userId}) => {
    return await TransactionModel.findOneAndDelete({ _id: id, userId });
};
export const deleteAllTransaction = async ({userId}) => {
    return await TransactionModel.deleteMany({ userId:userId });
};

export const ViewTransaction =async({userId})=>{
    return await TransactionModel.find({ userId: userId })
}