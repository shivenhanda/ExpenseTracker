import express from 'express'
import { SignUp, login, ResetPassword, DeleteAccount } from './users.controllers.js'

const userRouter = express.Router()

userRouter.post("/SignUp", SignUp)
userRouter.post("/login", login)
userRouter.post("/ResetPassword", ResetPassword)
userRouter.post("/DeleteAccount", DeleteAccount)

export default userRouter;