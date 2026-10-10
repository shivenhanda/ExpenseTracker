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
                            <button
                                type="button"
                                className={style.closeBtn}
                                onClick={() => setShow(false)}
                                style={{ background: isDark ? "#374151" : "#f9fafb", color: isDark ? "#e5e7eb" : "#374151", borderColor: isDark ? "#4b5563" : "#e5e7eb" }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Centered Page Wrapper ── */}
            <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 16px" }}>

            {/* ── Month Navigator ── */}
            <div style={{ display: "flex", justifyContent: "center" }}>
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

            {activation ? (
                <>
                    {/* ── Chart Card ── */}
                    <div
                        className={`${style1.chartWrapper} ${isDark ? style1.dchartWrapper : ""}`}
                        style={{ margin: "14px 0 8px" }}
                    >
                        <Charts transactions={Transaction} list={list} mode={mode} />
                    </div>

                    {/* ── Transaction Table ── */}
                    <div style={{ paddingBottom: "24px" }}>
                        {/* Header */}
                        <div className={`${style1.data} ${isDark ? style1.ddata : ""}`}
                            style={{ background: isDark ? "#1f2937" : "#f3f4f6", borderColor: isDark ? "#374151" : "#e5e7eb" }}
                        >
                            <h3>Date</h3>
                            <h3>Title</h3>
                            <h3 className={style1.type}>Type</h3>
                            <h3 className={style1.category}>Category</h3>
                            <h3>₹ Amount</h3>
                            <h3 className={style1.edit}>Edit</h3>
                            <h3 className={style1.delete}>Delete</h3>
                        </div>

                        {/* Data Rows */}
                        {Transaction.length > 0
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
                            : <p style={{ textAlign: "center", color: isDark ? "#9ca3af" : "#6b7280", padding: "28px 16px", fontSize: "14px" }}>
                                No transactions found for {monthname} {year}.
                            </p>
                        }
                    </div>
                </>
            ) : (
                <div style={{ textAlign: "center", padding: "48px 20px" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
                    <h2 style={{ color: isDark ? "#9ca3af" : "#6b7280", fontSize: "18px", fontWeight: 600 }}>
                        Please Sign Up / Login to View Reports
                    </h2>
                </div>
            )}

            </div> {/* ── End Centered Wrapper ── */}
        </>
    )
}