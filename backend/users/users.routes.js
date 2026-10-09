import express from 'express'
import { SignUp, login, ResetPassword, DeleteAccount, CheckAuth, Logout, SendOtp, VerifyOtp } from './users.controllers.js'

const userRouter = express.Router()

userRouter.post("/SignUp", SignUp)
userRouter.post("/login", login)
userRouter.post("/ResetPassword", ResetPassword)
userRouter.post("/DeleteAccount", DeleteAccount)
userRouter.get("/CheckAuth", CheckAuth);
userRouter.get("/logout", Logout)
userRouter.get("/sendotp", SendOtp)
userRouter.get("/verifyotp", VerifyOtp)

export default userRouter;