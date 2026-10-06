import { useActionState, useContext, useEffect, useState } from "react"
import style from "./Calendar.module.css"
import style1 from './Reports.module.css'
import Charts from "./Charts"
import { Online } from './App'


export default function Reports({ activation, mode }) {
    let isOnline = useContext(Online)
    const [Transaction, setTransaction] = useState([])
    const [currentDate] = useState(new Date())
    const [year, setYear] = useState(currentDate.getFullYear());
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    let monthname = new Date(year, month - 1).toLocaleString("default", { month: "long" });
    const [list, setlist] = useState([])
    const [show, setShow] = useState(false)
    const [editIndex, setIndex] = useState()
    const [, action, pending] = useActionState(UpdateData, undefined);
    async function UpdateData(_, formData) {
        if (!isOnline) {
            alert("Check internet connection");
            return;
        }
        let array = ["title", "money", "type", "date", "category"]
        let obj = {}
        array.forEach(data => {
            let value = formData.get(data)
            if (value !== null && value.trim() !== "") {
                if (data === "money") {
                    obj[data] = Number(value.trim());
                } else {
                    obj[data] = value.trim();
                }
            }
        })
        let Value = {
            ...Transaction[editIndex],
            ...obj,
            userId: localStorage.getItem("userId")
        }
        try {
            const res = await fetch(`https://expense-tracker-two-eta-98.vercel.app/Updates`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(Value)
            })
            let data = await res.json();
            if (!res.ok || !data.success) {
                alert(data.message || "Failed to update transaction")
                return;
            }
            let updatedItem = data.transactions || Value;
            let newData = [...Transaction]
            newData[editIndex] = updatedItem
            newData.sort((a, b) => new Date(a.date) - new Date(b.date));
            setTransaction(newData)
            setShow(false)
        } catch (error) {
            console.error("Update error:", error);
            alert("Failed to update transaction");
        }
    }
    useEffect(() => {
        const fetchData = async () => {
            if (!isOnline) {
                alert("Check internet connection");
                return;
            }
            try {
                const userId = localStorage.getItem("userId");
                if (!userId) return;

                const define = {
                    userId,
                    year,
                    month
                };

                const res = await fetch(`https://expense-tracker-two-eta-98.vercel.app/Transactions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(define)
                });

                const data = await res.json();

                if (data.success && Array.isArray(data.transactions)) {
                    const sorted = [...data.transactions].sort(
                        (a, b) => new Date(a.date) - new Date(b.date)
                    );
                    setTransaction(sorted);
                } else {
                    setTransaction([]);
                }
            } catch (error) {
                console.error("Fetch transactions error:", error);
                alert("Failed to fetch transactions");
            }
        }
        let list1 = []
        let lastDay = new Date(year, month, 0).getDate();
        for (let i = 1; i <= lastDay; i++) {
            list1.push(i)
        }
        setlist(list1)
        if (activation) {
            fetchData();
        }
    }, [month, year, isOnline, activation]);
    return (
        <>
            {
                show &&
                < form key={editIndex} action={action} className={style.DataUpdate} style={{display: "flex", flexDirection: "column",gap:"5px"}}>
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
                    <input type="text" name="category" id="category" placeholder="Enter Category" />
                    <button type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</button>
                    <button type="button" onClick={() => setShow(false)}>Close</button>
                </form >
            }
            <div className="styleMonths" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div className={style.months}>
                    <i onClick={() => {
                        if (month === 1) {
                            setMonth(12);
                            setYear(year - 1);
                        }
                        else {
                            setMonth(month - 1)
                        }
                    }} className="fa-solid fa-less-than"></i>
                    <h3>{monthname} {year}</h3>
                    <i onClick={() => {
                        if (month === 12) {
                            setMonth(1);
                            setYear(year + 1);
                        }
                        else {
                            setMonth(month + 1)
                        }
                    }} className="fa-solid fa-greater-than"></i>
                </div>
            </div>
            {
                activation ? (<>
                    <Charts transactions={Transaction} list={list} mode={mode} />
                    <div className={`${style1.data} ${mode === "dark" ? style1.ddata : " style.data"}`}>
                        <h3>Date</h3>
                        <h3>Title</h3>
                        <h3 className={style1.type}>Type</h3>
                        <h3 className={style1.category}>Category</h3>
                        <h3>Rupees</h3>
                        <h3 className={style1.edit}>Edit</h3>
                        <h3 className={style1.delete}>Delete</h3>
                    </div>
                    <div>
                        {
                            Transaction.map((data, index) => (
                                <div key={data._id || index} className={`${style1.data} ${mode === "dark" ? style1.ddata : ""}`}>
                                    <span>{data.date && !isNaN(new Date(data.date).getTime()) ? new Date(data.date).toISOString().split("T")[0] : "--"}</span>
                                    <span>{data.title}</span>
                                    <span className={style1.type}>{data.type}</span>
                                    <span className={style1.category}>{data.category}</span>
                                    <span>{data.money}</span>
                                    <span><i className="fa-solid fa-pen-to-square" onClick={() => {
                                        setIndex(index)
                                        setShow(true)
                                    }}></i></span>
                                    <span><i className="fa-solid fa-trash" onClick={async () => {
                                        if (!isOnline) {
                                            alert("Check internet connection");
                                            return;
                                        }
                                        try {
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
                                            if (!res.ok || !result.success) {
                                                alert(result.message || "Failed to delete transaction")
                                                return;
                                            }
                                            let newData = [...Transaction]
                                            newData.splice(index, 1)
                                            setTransaction(newData)
                                            alert(result.message)
                                        } catch (error) {
                                            console.error("Delete error:", error);
                                            alert("Failed to delete transaction");
                                        }
                                    }}></i>
                                    </span>
                                </div>
                            ))
                        }
                    </div>
                </>) : <h2 style={{ textAlign: "center" }}>Please SignUp/Login to View</h2>
            }
        </>
    )
}