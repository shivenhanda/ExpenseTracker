import { useActionState, useContext, useEffect, useState } from "react"
import style from './HandleTransaction.module.css'
import { Link, Route, Routes } from "react-router-dom";
import Reports from "./Reports";
import style1 from './Reports.module.css'
import { Online } from "./App";
import { Pie } from "react-chartjs-2";

export default function HandleTransaction({ displayadd, mode, activation }) {
    let isOnline = useContext(Online)
    const [, action, pending] = useActionState((previousData, formData) => HandleData(previousData, formData, isOnline), undefined)
    const [Transaction, setTransaction] = useState([])
    const [show, setShow] = useState(null)
    const [show1, setShow1] = useState(false)
    const [editIndex, setIndex] = useState()
    const [, action1, pending1] = useActionState(UpdateData, undefined);
    const [valueIndex, setValueIndex] = useState();
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
            const res = await fetch("http://localhost:8000/Updates", {
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
            const res = await fetch("http://localhost:8000/AddTransaction", {
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
                console.log(Transaction)
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
                show1 &&
                < form action={action1} className={style.DataUpdate}>
                    <h2>Enter only the fields you want to update.</h2>
                    <label htmlFor="title">Enter Transaction</label>
                    <input type="text" name="title" placeholder="Enter Transaction Title" />
                    <label htmlFor="money">Amount</label>
                    <input type="number" name="money" placeholder="Enter Transaction Amount" />
                    <label htmlFor="date">Transaction Date</label>
                    <input type="date" name="date" id="date" />
                    <label htmlFor="type">Type</label>
                    <select name="type" id="type">
                        <option value=""></option>
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                    </select>
                    <label htmlFor="category">Category</label>
                    <select name="category" id="category">
                        <option value=""></option>
                        <option value="Job">Job</option>
                        <option value="Home">Home</option>
                        <option value="Grocery">Grocery</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Education">Education</option>
                        <option value="Bill">Bill</option>
                        <option value="Other">Other</option>
                    </select>
                    <button type="submit" disabled={pending1}>{pending1 ? "Saving..." : "Save"}</button>
                    <button type="button" onClick={() => setShow1(false)}>Close</button>
                </form >
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
                            setValueIndex(data._id)
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
                                let res = await fetch("http://localhost:8000/Delete", {
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
                <form action={action}>
                    <label htmlFor="add">New Transaction</label>
                    <input type="text" name="add" placeholder="Enter Transaction Title" />
                    <label htmlFor="money">Amount</label>
                    <input type="number" name="money" placeholder="Enter Transaction Amount" />
                    <label htmlFor="date">Transaction Date</label>
                    <input type="date" name="date" id="date" />
                    <label htmlFor="type">Type</label>
                    <select name="type" id="type">
                        <option value="NotSelected">Select Type</option>
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                    </select>
                    <label htmlFor="category">Category</label>
                    <select name="category" id="category">
                        <option value="Job">Job</option>
                        <option value="Home">Home</option>
                        <option value="Grocery">Grocery</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Education">Education</option>
                        <option value="Bill">Bill</option>
                        <option value="Other">Other</option>
                    </select>
                    <button type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</button>
                    <button type="button" onClick={() => setShow(null)}>Close</button>
                </form>
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
                    let res = await fetch("http://localhost:8000/DeleteAllTransaction", {
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