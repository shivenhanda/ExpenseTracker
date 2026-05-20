export const TransactionSlice = createSlice({
    name: "Transactions",
    initialState: {
        Transactions:[]
    },
    reducers: {
        Add: (state, action) => {
            state.Transactions.push(action.payload)
        }
    }
})
export const { Add } = TransactionSlice.actions
export default TransactionSlice.reducer