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
    const daysinMonth = new Date(year, month, 0).getDate()
    const firstDay = new Date(year, month - 1, 1).getDay()
    const startDay = firstDay === 0 ? 6 : firstDay - 1
    let days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(null)
    }
    for (let i = 1; i <= daysinMonth; i++) {
        days.push(i)
    }
    const Dayname = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const [Transaction, setTransaction] = useState([])
    let today = new Date();
    const [targetDate, setTargetDate] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`)

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
                    userId: userId,
                    year: year,
                    month: month
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
                    const filtered = data.transactions.filter(t =>
                        t && t.date && !isNaN(new Date(t.date).getTime()) &&
                        new Date(t.date).toISOString().split("T")[0] === targetDate
                    );
                    setTransaction(filtered);
                } else {
                    setTransaction([]);
                }
            } catch (error) {
                console.error("Calendar fetch error:", error);
                alert("Failed to fetch transactions");
            }
        }
        if (activation) {
            fetchData();
        }
    }, [targetDate, isOnline, month, year, activation])

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
            setTransaction(newData)
            setShow(false)
        } catch (error) {
            console.error("Calendar update error:", error);
            alert("Failed to update transaction");
        }
    }

    useEffect(() => {
        if (selected) {
            setTargetDate(
                `${year}-${String(month).padStart(2, '0')}-${String(selected).padStart(2, '0')}`
            );
        }
    }, [selected, month, year]);

    const isDark = mode === "dark";

    return (
        <>
            {/* ── Edit Popup Overlay ── */}
            {show && (
                <div className={style.overlay} onClick={(e) => { if (e.target === e.currentTarget) setShow(false); }}>
                    <form
                        key={editIndex}
                        action={action}
                        className={style.DataUpdate}
                        style={{ background: isDark ? "#1f2937" : "#ffffff" }}
                    >
                        <h2 style={{ color: isDark ? "#f9fafb" : "#111827" }}>
                            ✏️ Update Transaction
                        </h2>
                        <p style={{ fontSize: "12px", color: isDark ? "#9ca3af" : "#6b7280", textAlign: "center", marginTop: "-8px" }}>
                            Leave fields blank to keep existing values
                        </p>

                        <div className={style.formRow}>
                            <label style={{ color: isDark ? "#d1d5db" : "#374151" }}>Transaction Title</label>
                            <input
                                type="text"
                                name="title"
                                placeholder="Enter transaction title"
                                style={{ background: isDark ? "#111827" : "#f9fafb", color: isDark ? "#f9fafb" : "#111827", borderColor: isDark ? "#374151" : "#d1d5db" }}
                            />
                        </div>
                        <div className={style.formRow}>
                            <label style={{ color: isDark ? "#d1d5db" : "#374151" }}>Amount (₹)</label>
                            <input
                                type="number"
                                name="money"
                                placeholder="Enter amount"
                                style={{ background: isDark ? "#111827" : "#f9fafb", color: isDark ? "#f9fafb" : "#111827", borderColor: isDark ? "#374151" : "#d1d5db" }}
                            />
                        </div>
                        <div className={style.formRow}>
                            <label style={{ color: isDark ? "#d1d5db" : "#374151" }}>Date</label>
                            <input
                                type="date"
                                name="date"
                                style={{ background: isDark ? "#111827" : "#f9fafb", color: isDark ? "#f9fafb" : "#111827", borderColor: isDark ? "#374151" : "#d1d5db" }}
                            />
                        </div>
                        <div className={style.formRow}>
                            <label style={{ color: isDark ? "#d1d5db" : "#374151" }}>Type</label>
                            <select
                                name="type"
                                style={{ background: isDark ? "#111827" : "#f9fafb", color: isDark ? "#f9fafb" : "#111827", borderColor: isDark ? "#374151" : "#d1d5db" }}
                            >
                                <option value="">-- Keep current --</option>
                                <option value="Income">Income</option>
                                <option value="Expense">Expense</option>
                            </select>
                        </div>
                        <div className={style.formRow}>
                            <label style={{ color: isDark ? "#d1d5db" : "#374151" }}>Category</label>
                            <input
                                type="text"
                                name="category"
                                placeholder="Enter category"
                                style={{ background: isDark ? "#111827" : "#f9fafb", color: isDark ? "#f9fafb" : "#111827", borderColor: isDark ? "#374151" : "#d1d5db" }}
                            />
                        </div>

                        <div className={style.btnRow}>
                            <button type="submit" className={style.saveBtn} disabled={pending}>
                                {pending ? "Saving..." : "💾 Save Changes"}
                            </button>
                            <button type="button" className={style.closeBtn} onClick={() => setShow(false)}
                                style={{ background: isDark ? "#374151" : "#f9fafb", color: isDark ? "#e5e7eb" : "#374151", borderColor: isDark ? "#4b5563" : "#e5e7eb" }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Month Navigator ── */}
            <div style={{ display: "flex", justifyContent: "center", padding: "0 12px" }}>
                <div className={style.months}>
                    <i
                        onClick={() => {
                            if (month === 1) { setMonth(12); setYear(year - 1); }
                            else { setMonth(month - 1); }
                        }}
                        className="fa-solid fa-less-than"
                    />
                    <h3 style={{ color: isDark ? "#f9fafb" : "#111827" }}>{monthname} {year}</h3>
                    <i
                        onClick={() => {
                            if (month === 12) { setMonth(1); setYear(year + 1); }
                            else { setMonth(month + 1); }
                        }}
                        className="fa-solid fa-greater-than"
                    />
                </div>
            </div>

            {/* ── Calendar Grid ── */}
            <div className={style.container}>
                {Dayname.map((data, index) => (
                    <div key={index} className={`${style.dayname} ${isDark ? style.ddayname : ""}`}>
                        <span>{data}</span>
                    </div>
                ))}
                {days.map((data, index) => (
                    <div
                        key={index}
                        onClick={() => setSelected(data)}
                        className={`${data === selected ? style.selected : ""}`}
                        style={{ color: isDark && data !== selected ? "#d1d5db" : undefined }}
                    >
                        <span>{data || ""}</span>
                    </div>
                ))}
            </div>

            {/* ── Selected Date Banner ── */}
            <div className={style.dateBanner}>
                <p>📅 Transactions for: {targetDate}</p>
            </div>

            {/* ── Transaction List ── */}
            <div className={style.txnWrapper}>
                {/* Header */}
                <div className={`${style1.data} ${isDark ? style1.ddata : ""}`}>
                    <h3>Date</h3>
                    <h3>Title</h3>
                    <h3 className={style1.type}>Type</h3>
                    <h3 className={style1.category}>Category</h3>
                    <h3>₹ Amount</h3>
                    <h3 className={style1.edit}>Edit</h3>
                    <h3 className={style1.delete}>Delete</h3>
                </div>

                {/* Rows */}
                {activation
                    ? Transaction.length > 0
                        ? Transaction.map((data, index) => (
                            <div key={data._id || index} className={`${style1.data} ${isDark ? style1.ddata : ""}`}>
                                <span style={{ fontSize: "12px" }}>
                                    {data.date && !isNaN(new Date(data.date).getTime())
                                        ? new Date(data.date).toISOString().split("T")[0]
                                        : "--"}
                                </span>
                                <span>{data.title}</span>
                                <span className={style1.type}>
                                    <span className={`${style1.typeBadge} ${data.type === "Income" ? style1.incomeType : data.type === "Expense" ? style1.expenseType : ""}`}>
                                        {data.type || "--"}
                                    </span>
                                </span>
                                <span className={style1.category}>{data.category}</span>
                                <span style={{ fontWeight: 600, color: data.type === "Income" ? "#16a34a" : data.type === "Expense" ? "#dc2626" : "inherit" }}>
                                    ₹{data.money}
                                </span>
                                <span className={style1.edit}>
                                    <i
                                        className={`fa-solid fa-pen-to-square ${style1.editIcon}`}
                                        onClick={() => { setIndex(index); setShow(true); }}
                                    />
                                </span>
                                <span className={style1.delete}>
                                    <i
                                        className={`fa-solid fa-trash ${style1.deleteIcon}`}
                                        onClick={async () => {
                                            if (!isOnline) { alert("Check internet connection"); return; }
                                            if (!window.confirm("Delete this transaction?")) return;
                                            try {
                                                let define = { id: data._id, userId: localStorage.getItem("userId") }
                                                let res = await fetch(`https://expense-tracker-two-eta-98.vercel.app/Delete`, {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify(define)
                                                })
                                                let result = await res.json();
                                                if (!res.ok || !result.success) { alert(result.message || "Failed to delete transaction"); return; }
                                                let newData = [...Transaction]
                                                newData.splice(index, 1)
                                                setTransaction(newData)
                                            } catch (error) {
                                                console.error("Delete error:", error);
                                                alert("Failed to delete transaction");
                                            }
                                        }}
                                    />
                                </span>
                            </div>
                        ))
                        : <p style={{ textAlign: "center", color: isDark ? "#9ca3af" : "#6b7280", padding: "24px", fontSize: "14px" }}>
                            No transactions found for this date.
                        </p>
                    : ""}
            </div>
        </>
    )
}