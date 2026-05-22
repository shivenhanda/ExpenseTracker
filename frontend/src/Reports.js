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
            const res = await fetch(`${process.env.REACT_APP_API_URL}/Updates`, {
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
        const fetchData = async () => {
            if (!isOnline) {
                let Data = localStorage.getItem("TransactionData");
                if (Data) {
                    Data = JSON.parse(Data);
                    const filteredData = Data.filter(item => item && item.date).filter(item => {
                        const itemDate = new Date(item.date);

                        return (
                            itemDate.getFullYear() === year &&
                            itemDate.getMonth() + 1 === month
                        );
                    });

                    filteredData.sort(
                        (a, b) => new Date(a.date) - new Date(b.date)
                    );

                    setTransaction(filteredData);
                }
            }
            else {
                const userId = localStorage.getItem("userId");

                const define = {
                    userId,
                    year,
                    month
                };

                const res = await fetch(`${process.env.REACT_APP_API_URL}/Transactions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(define)
                });

                const data = await res.json();

                if (data.success) {
                    setTransaction(data.transactions);
                }
            }
        }
        let list1 = []
        let lastDay = new Date(year, month, 0).getDate();
        for (let i = 1; i <= lastDay; i++) {
            list1.push(i)
        }
        setlist(list1)
        fetchData();
    }, [month, year, isOnline]);
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
                                    <span>{data.date ? new Date(data.date).toISOString().split("T")[0] : "--"}</span>
                                    <span>{data.title}</span>
                                    <span className={style1.type}>{data.type}</span>
                                    <span className={style1.category}>{data.category}</span>
                                    <span>{data.money}</span>
                                    <span><i className="fa-solid fa-pen-to-square" onClick={() => {
                                        setIndex(index)
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
                                            let res = await fetch(`${process.env.REACT_APP_API_URL}/Delete`, {
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
                    </div>
                </>) : <h2 style={{ textAlign: "center" }}>Please SignUp/Login to View</h2>
            }
        </>
    )
}