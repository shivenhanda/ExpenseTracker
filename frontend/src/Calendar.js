import { useActionState, useContext, useEffect, useState } from "react";
import style from "./Calendar.module.css"
import style1 from './Reports.module.css'
import { Online } from './App'

export default function Calendar({ activation, mode }) {
    const [currentDate,] = useState(new Date())
    const [selected, setSelected] = useState(null);
    let isOnline = useContext(Online)
    const [year, setYear] = useState(currentDate.getFullYear());
    const [month, setMonth] = useState(currentDate.getMonth() + 1);
    let monthname = new Date(year, month - 1).toLocaleString("default", { month: "long" });
    const daysinMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay()
    const startDay = firstDay === 0 ? 6 : firstDay - 1
    const [valueIndex, setValueIndex] = useState();
    let days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(null)
    }
    for (let i = 1; i <= daysinMonth; i++) {
        days.push(i)
    }
    const Dayname = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const [Transaction, setTransaction] = useState([])
    let today = new Date();
    const [targetDate, setTargetDate] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`)
    useEffect(() => {
        const fetchData = async () => {
            if (isOnline) {
                const userId = localStorage.getItem("userId");

                const define = {
                    userId: userId,
                    year: year,
                    month: month
                };

                const res = await fetch("http://localhost:8000/Transactions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(define)
                });

                const data = await res.json();

                if (data.success) {
                    const filtered = data.transactions.filter(t =>
                        new Date(t.date).toISOString().split("T")[0] === targetDate
                    );
                    setTransaction(filtered);
                }
            }
            else {
                let Data = localStorage.getItem("TransactionData");
                if (Data) {
                    Data = JSON.parse(Data)
                    let filterData = Data.filter(item => item.date === targetDate)
                    setTransaction(filterData)
                }
            }
        }
        fetchData();
    }, [targetDate, isOnline, month, year])

    const [show, setShow] = useState(false)
    const [editIndex, setIndex] = useState()
    const [, action, pending] = useActionState(UpdateData, undefined);
    async function UpdateData(previousData, formData) {
        let array = ["title", "money", "type", "date", "category"]
        let obj = {}
        array.forEach(data => {
            let value = formData.get(data)
            if (value !== null && value.trim() !== "") {
                obj[data] = value.trim();
            }
        })
        await new Promise(res => setTimeout(res, 2000))
        let Value = {
            ...Transaction[editIndex],
            ...obj
        }
        let newData = [...Transaction]
        newData[editIndex] = Value

        setTransaction(newData)
        localStorage.setItem("TransactionData", JSON.stringify(newData));
        if (isOnline) {
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
        setShow(false)
    }

    useEffect(() => {
        if (selected) {
            setTargetDate(
                `${year}-${String(month).padStart(2, '0')}-${String(selected).padStart(2, '0')}`
            );
        }
    }, [selected, month, year]);
    return (
        <>
            {
                show &&
                < form action={action} className={style.DataUpdate}>
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
                    <button onClick={() => setShow(false)}>Close</button>
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
                    <h3>{monthname}</h3>
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
            <div className={style.container}>
                {
                    Dayname.map((data, index) => (
                        <div key={index} className={`${style.dayname} ${mode === "dark" ? style.ddayname : ""}`}>
                            <span>{data}</span>
                        </div>
                    ))
                }
                {
                    days.map((data, index) => (
                        <div key={index} style={{ fontWeight: "bold" }} onClick={() => setSelected(data)} className={`${data === selected ? style.selected : ""}`}>
                            <span>{data || ""}</span>
                        </div>
                    ))
                }
            </div>
            <div className="textTransactionDate" style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "5px" }}>
                <p style={{ display: "inline-block", fontSize: "20px", fontWeight: "bold", backgroundColor: "black", padding: "5px", borderRadius: " 5px", color: mode === "dark" ? "yellow" : "red" }}>Transactions Date: {targetDate}</p>
            </div>
            <div className={`${style1.data} ${mode === "dark" ? style1.ddata : " style.data"}`} >
                <h3>Date</h3>
                <h3>Title</h3>
                <h3 className={style1.type}>Type</h3>
                <h3 className={style1.category}>Category</h3>
                <h3>Rupees</h3>
                <h3 className={style1.edit}>Edit</h3>
                <h3 className={style1.delete}>Delete</h3>
            </div>
            {
                activation ?
                    Transaction.map((data, index) => (
                        <div key={data._id || index} className={`${style1.data} ${mode === "dark" ? style1.ddata : ""}`}>
                            <span>{data.date ? new Date(data.date).toISOString().split("T")[0] : "--"}</span>
                            <span>{data.title}</span>
                            <span className={style1.type}>{data.type}</span>
                            <span className={style1.category}>{data.category}</span>
                            <span>{data.money}</span>
                            <span><i className="fa-solid fa-pen-to-square" onClick={() => {
                                setIndex(index)
                                setValueIndex(data._id)
                                setShow(true)
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
                    )) : ""
            }
        </>
    )
}