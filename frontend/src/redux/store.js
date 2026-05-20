import configureStore from '@reduxjs/toolkit'
import { TransactionSlice } from "./feat/TransactionSlice";

export const store=configureStore({
    reducer:{
        Transactions=TransactionSlice
    }
})