import UsersModel from "./users.model.js";

export const createUser=async (data)=>{
    return await UsersModel.create(data);
}
export const loginUser=async({name})=>{
    return await UsersModel.findOne({ name }, { _id: 1, name: 1, email: 1, password: 1 })
}
export const ResetUserPassword=async({userId,password})=>{
    return await UsersModel.findOneAndUpdate({ _id: userId }, { $set: { password: password } })
}
export const DeleteUser=async({userId, password})=>{
    return await UsersModel.findOne({ _id: new mongoose.Types.ObjectId(userId) }, { _id: 0, password: 1 })
}