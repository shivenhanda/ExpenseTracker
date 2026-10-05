import mongoose from "mongoose";
import UsersModel from "./users.model.js";

export const createUser=async (data)=>{
    return await UsersModel.create(data);
}
export const loginUser=async({name})=>{
    return await UsersModel.findOne({ name })
}
export const ResetUserPassword=async({name,password})=>{
    return await UsersModel.findOneAndUpdate({ name: name }, { $set: { password: password } })
}
export const DeleteUser=async({name})=>{
    return await UsersModel.findOne({ name })
}