import express from 'express'
import { addTransaction, Transactions, Updates, Delete, DeleteAllTransaction,ViewData } from './transactions.controllers.js'

const transactionRouter = express.Router();
transactionRouter.post("/AddTransaction", addTransaction)
transactionRouter.post("/Transactions", Transactions)
transactionRouter.post("/Updates", Updates)
transactionRouter.post("/Delete", Delete)
transactionRouter.post("/DeleteAllTransaction", DeleteAllTransaction)
transactionRouter.post("/ViewData", ViewData)
export default transactionRouter;