import { useActionState, useContext, useEffect, useState } from "react"
import style from './HandleTransaction.module.css'
import { Link, Route, Routes } from "react-router-dom";
import Reports from "./Reports";
import style1 from './Reports.module.css'
import { Online } from "./App";
import { Pie } from "react-chartjs-2";
import { AnimatePresence, motion } from "framer-motion";

export default function HandleTransaction({ displayadd, mode, activation }) {
    let isOnline = useContext(Online)
    const [, action, pending] = useActionState((previousData, formData) => HandleData(previousData, formData, isOnline), undefined)
    const [Transaction, setTransaction] = useState([])
    const [show, setShow] = useState(null)
    const [show1, setShow1] = useState(false)
    const [editIndex, setIndex] = useState()
    const [, action1, pending1] = useActionState(UpdateData, undefined);
    async function UpdateData(previousData, formData) {
        let array = ["title", "money", "type", "date", "category"]
        let obj = {}
        array.forEach(data => {
            let value = formData.get(data)
            if (value !== null && value.trim() !== "") {
                if(data==="money"){
                    obj[data] = Number(value.trim());
                }
                else{
                obj[data] = value.trim();
                }
            }
        })
        await new Promise(res => setTimeout(res, 2000))
        let Value = {
            ...Transaction[editIndex],
            ...obj,
            isUpdate: true,
            noDelete: true
        }
        let newData = [...Transaction]
        newData[editIndex] = Value
        setTransaction(newData)
        localStorage.setItem("TransactionData", JSON.stringify(newData));
        if (isOnline) {
            Value = {
                ...Transaction[editIndex],
                ...obj,
                isUpdate: false,
                noDelete: true
            }
            const res = await fetch(`https://expense-tracker-two-eta-98.vercel.app/Updates`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(Value)
            })
            let data = await res.json();
            if (!data.success) {
                alert(data.message)
            }
        }
        setShow1(false)
    }
    async function HandleData(previousData, formData, isOnline) {
        let title = formData.get("add");
        let money = formData.get("money");
        let date = formData.get("date");
        let type = formData.get("type");
        let category = formData.get("category");
        if (title === "" || title === null || money === "" || money === null || date === "" || date === null) {
            alert("Title, Money and Date Fields are Required")
            return;
        }
        let define = {
            userId: localStorage.getItem("userId"),
            title: title,
            money: Number(money),
            date: date,
            type: type,
            category: category,
            isUpdate: false,
            noDelete: true
        }
        let existingData;
        let updatedData = [];
        if (isOnline) {
            const res = await fetch(`https://expense-tracker-two-eta-98.vercel.app/AddTransaction`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(define)
            });
            existingData = await res.json();
            if (!existingData.success) {
                alert(existingData.message)
            }
            updatedData = [...Transaction, existingData.transaction]
        }
        else {
            existingData = JSON.parse(localStorage.getItem("TransactionData")) || []
            updatedData = [...existingData, define]
        }
        await new Promise(res => setTimeout(res, 2000))
        updatedData.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem("TransactionData", JSON.stringify(updatedData))
        setTransaction(updatedData);
        setShow(null);
    }
    useEffect(() => {
        if (activation) {
            let Data = localStorage.getItem("TransactionData");
            if (Data) {
                Data = JSON.parse(Data);
                Data.sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );
                setTransaction(Data)
            }
        }
    }, [activation])
    let year = (new Date()).getFullYear();
    let month = (new Date()).getMonth();
    let monthname = new Date(year, month).toLocaleString("default", { month: "long" });
    const currentMonthTransactions = Transaction.filter(item => {
        if (!item || !item.date || !item.type || item.money == null) {
            return false;
        }

        const d = new Date(item.date);
        return d.getFullYear() === year && d.getMonth() === month;
    });
    const { Income, Expense } = currentMonthTransactions.reduce(
        (acc, item) => {
            if (item.type === "Income") {
                acc.Income += Number(item.money);
            }
            if (item.type === "Expense") {
                acc.Expense += Number(item.money);
            }
            return acc;
        },
        { Income: 0, Expense: 0 }
    );

    return (
        <div>
            {
                <AnimatePresence>
                    {show1 && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.form
                                action={action1}
                                initial={{ scale: .8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: .8, opacity: 0 }}
                                transition={{ duration: .3 }}
                                className="w-[95%] max-w-xl rounded-3xl bg-white p-8 shadow-2xl space-y-5"
                                style={{padding:"5px"}}
                            >
                                <h2 className="text-3xl font-bold text-center text-emerald-600">
                                    Update Transaction
                                </h2>

                                <p className="text-center text-gray-500">
                                    Leave fields empty if you don't want to update them.
                                </p>

                                <input
                                    name="title"
                                    placeholder="Transaction Title"
                                    className="w-full rounded-xl border p-3"
                                />

                                <input
                                    type="number"
                                    name="money"
                                    placeholder="Amount"
                                    className="w-full rounded-xl border p-3"
                                />

                                <input
                                    type="date"
                                    name="date"
                                    className="w-full rounded-xl border p-3"
                                />

                                <select
                                    name="type"
                                    className="w-full rounded-xl border p-3"
                                >
                                    <option value="">Select Type</option>
                                    <option>Income</option>
                                    <option>Expense</option>
                                </select>

                                <select
                                    name="category"
                                    className="w-full rounded-xl border p-3"
                                >
                                    <option value="">Category</option>
                                    <option>Job</option>
                                    <option>Home</option>
                                    <option>Shopping</option>
                                    <option>Bill</option>
                                    <option>Education</option>
                                    <option>Grocery</option>
                                    <option>Other</option>
                                </select>

                                <div className="flex gap-4">
                                    <button
                                        disabled={pending1}
                                        className="flex-1 rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
                                    >
                                        {pending1 ? "Updating..." : "Update"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShow1(false)}
                                        className="flex-1 rounded-xl border py-3 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.form>
                        </motion.div>
                    )}
                </AnimatePresence>
            }
            {
                !show && (
                    <div className={style.container}>
                        <button onClick={() => setShow("Add")}><i class="fa-solid fa-plus"></i> Add Transaction</button>
                    </div>
                )
            }
            {!show && (
                <>
                    <div><h3 style={{ textAlign: "center", fontSize: 24 }}>{monthname}  {year}</h3></div>
                    <div className={style.boxes}>
                        <div className={`${style.box} ${mode === "dark" ? style.dbox : ""}`}>
                            <h3> <i className="fa-solid fa-arrow-trend-up" style={{ color: "#11f90d" }}></i> Income</h3>
                            <p className={style.income}>{Income}</p>
                        </div>
                        <div className={`${style.box} ${mode === "dark" ? style.dbox : ""}`}>
                            <h3> <i className="fa-solid fa-arrow-down" style={{ color: "#f20707" }}></i> Expense</h3>
                            <p className={style.expense}>{Expense}</p>
                        </div>
                        <div className={`${style.box} ${mode === "dark" ? style.dbox : ""}`}>
                            <h3> <i class="fa-solid fa-wallet"></i> Balance</h3>
                            <p className={style.balance}>{Income - Expense}</p>
                        </div>
                    </div>
                </>
            )
            }
            {!show && (
                <div className={style.text}>
                    <span className={style.span} style={{ color: mode === "dark" ? "#00ffde" : "black" }}>Last 5 Recent Transactions</span>
                </div>
            )}
            {show === "Add" && <AddTransaction setShow={setShow} pending={pending} />}
            {show === "DeleteAll" && <DeleteAllTransaction setShow={setShow} setTransaction={setTransaction} />}
            <div className={`${style1.data} ${mode === "dark" ? style1.ddata : " style.data"}`}>
                <h3>Date</h3>
                <h3>Title</h3>
                <h3 className={style1.type}>Type</h3>
                <h3 className={style1.category}>Category</h3>
                <h3>Rupees</h3>
                <h3 className={style1.edit}>Edit</h3>
                <h3 className={style1.delete}>Delete</h3>
            </div>
            {
                Transaction.slice(0, 5).map((data, index) => (
                    <div key={data._id || index} className={`${style1.data} ${mode === "dark" ? style1.ddata : " style.data"}`}>
                        <span>{data.date ? new Date(data.date).toISOString().split("T")[0] : "--"}</span>
                        <span>{data.title}</span>
                        <span className={style1.type}>{data.type}</span>
                        <span className={style1.category}>{data.category}</span>
                        <span>{data.money}</span>
                        <span><i className="fa-solid fa-pen-to-square" onClick={() => {
                            setIndex(index)
                            setShow1(true)
                        }}></i></span>
                        <span><i className="fa-solid fa-trash" onClick={async () => {
                            let newData = [...Transaction]
                            newData.splice(index, 1)
                            setTransaction(newData)
                            localStorage.setItem("TransactionData", JSON.stringify(newData))
                            if (isOnline) {
                                let define = {
                                    id: data._id,
                                    userId: localStorage.getItem("userId")
                                }
                                let res = await fetch(`https://expense-tracker-two-eta-98.vercel.app/Delete`, {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify(define)
                                })
                                let result = await res.json();
                                if (!result.success) {
                                    alert(result.message)
                                    return;
                                }
                                alert(result.message)
                            }
                        }}></i>
                        </span>
                    </div>
                ))
            }
            {!show && (
                <div className={style.container1}>
                    <Link className={style.button} to="/Reports">View All</Link>
                    <Routes>
                        <Route path="/Reports" element={<Reports />} />
                    </Routes>
                    <button className={style.delete} onClick={() => setShow("DeleteAll")}>Delete All</button>
                </div>
            )}
            {
                <div style={{ height: "300px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#F6F8FC;" }}>
                    <Pie
                        data={{
                            labels: ["Income", "Expense"],
                            datasets: [
                                {
                                    label: monthname,
                                    data: [Income, Expense],
                                    backgroundColor: ["rgb(0,255,0)", "rgb(255,0,0)"]
                                }
                            ]
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: "top",
                                    labels: {
                                        color: mode === "dark" ? "white" : "black",
                                        font: {
                                            weight: "bold",
                                            size: 15
                                        }
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            let value = context.raw
                                            let label = context.label
                                            return `${label} ${value}`
                                        }
                                    }
                                },
                                title: {
                                    display: true,
                                    text: `${monthname} Transactions`,
                                    color: mode === "dark" ? "white" : "#2563EB",
                                    font: {
                                        size: 20
                                    }
                                }
                            }
                        }}
                    />
                </div>
            }
        </div>)
    function AddTransaction({ setShow, pending }) {
        return (
            <>
                <AnimatePresence>
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.form
                        action={action}
                        initial={{ scale: 0.8, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: .3 }}
                        className="w-[95%] max-w-xl rounded-3xl bg-white p-8 shadow-2xl space-y-5"
                        style={{padding:"5px"}}
                    >
                        <h2 className="text-3xl font-bold text-center text-blue-600">
                            Add Transaction
                        </h2>

                        <input
                            name="add"
                            placeholder="Transaction Title"
                            className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <input
                            type="number"
                            name="money"
                            placeholder="Amount"
                            className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <input
                            type="date"
                            name="date"
                            className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <select
                            name="type"
                            className="w-full rounded-xl border p-3"
                        >
                            <option>Income</option>
                            <option>Expense</option>
                        </select>

                        <select
                            name="category"
                            className="w-full rounded-xl border p-3"
                        >
                            <option>Job</option>
                            <option>Home</option>
                            <option>Shopping</option>
                            <option>Bill</option>
                            <option>Education</option>
                            <option>Grocery</option>
                            <option>Other</option>
                        </select>

                        <div className="flex gap-4 pt-3">
                            <button
                                disabled={pending}
                                className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
                            >
                                {pending ? "Saving..." : "Save"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShow(null)}
                                className="flex-1 rounded-xl border py-3 font-semibold hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.form>
                </motion.div>
            </AnimatePresence>
            </>
        )
    }
    function DeleteAllTransaction({ setShow, setTransaction, pending }) {
        useEffect(() => {
            const deleteAll = async () => {
                let data = localStorage.getItem("TransactionData");
                if (!data || data === "[]") {
                    alert("No Data Found")
                    setShow(null)
                    return;
                }
                else {
                    let message = window.confirm("Are you Want to Delete All Data?")
                    if (!message) {
                        setShow(null);
                        return;
                    }
                    localStorage.removeItem("TransactionData");
                    setTransaction([])
                    let userId = localStorage.getItem("userId") || 0;
                    let res = await fetch(`https://expense-tracker-two-eta-98.vercel.app/DeleteAllTransaction`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ userId })
                    })
                    let result = await res.json();
                    if (!result.success) {
                        alert(result.message)
                        return;
                    }
                    setShow(null);
                }
            }
            deleteAll();
        }, [setShow, setTransaction])
        return null;
    }
}