import express from 'express'
import { SignUp, login, ResetPassword, DeleteAccount, CheckAuth } from './users.controllers.js'

const userRouter = express.Router()

userRouter.post("/SignUp", SignUp)
userRouter.post("/login", login)
userRouter.post("/ResetPassword", ResetPassword)
userRouter.post("/DeleteAccount", DeleteAccount)
userRouter.get("/CheckAuth", CheckAuth);

export default userRouter;