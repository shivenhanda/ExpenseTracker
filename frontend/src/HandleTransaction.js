import { useActionState, useContext, useEffect, useState } from "react"
import style from './HandleTransaction.module.css'
import { Link } from "react-router-dom";
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
        if (!isOnline) {
            alert("Check internet connection");
            return;
        }

        let array = ["title", "money", "type", "date", "category"];
        let obj = {};

        array.forEach(data => {
            let value = formData.get(data);

            if (value !== null && value.trim() !== "") {
                if (data === "money") {
                    obj[data] = Number(value.trim());
                } else {
                    obj[data] = value.trim();
                }
            }
        });

        let Value = {
            ...Transaction[editIndex],
            ...obj,
            userId: localStorage.getItem("userId")
        };

        try {
            const res = await fetch(
                `https://expense-tracker-two-eta-98.vercel.app/Updates`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(Value)
                }
            );

            let data = await res.json();

            if (!res.ok || !data.success || !data.transactions) {
                alert(data.message || "Failed to update transaction");
                return;
            }

            let updatedItem = data.transactions;

            let newData = [...Transaction];
            newData[editIndex] = updatedItem;

            newData.sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );

            setTransaction(newData);
            setShow1(false);

        } catch (error) {
            console.error("Update transaction error:", error);
            alert("Failed to update transaction");
        }
    }
    async function HandleData(previousData, formData, isOnline) {
        let title = formData.get("add");
        let money = formData.get("money");
        let date = formData.get("date");
        let type = formData.get("type");
        let category = formData.get("category");

        if (
            title === "" || title === null ||
            money === "" || money === null ||
            date === "" || date === null
        ) {
            alert("Title, Money and Date Fields are Required");
            return;
        }

        if (!isOnline) {
            alert("Check internet connection");
            return;
        }

        let define = {
            userId: localStorage.getItem("userId"),
            title: title.trim(),
            money: Number(money),
            date: date,
            type: type,
            category: category
        };

        try {
            const res = await fetch(
                `https://expense-tracker-two-eta-98.vercel.app/AddTransaction`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(define)
                }
            );

            let existingData = await res.json();

            if (
                !res.ok ||
                !existingData.success ||
                !existingData.transaction
            ) {
                alert(existingData.message || "Failed to add transaction");
                return;
            }
            let updatedData = [
                ...Transaction,
                existingData.transaction
            ];

            updatedData.sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );

            setTransaction(updatedData);
            setShow(null);

        } catch (error) {
            console.error("Add transaction error:", error);
            alert("Failed to add transaction");
        }
    }
    useEffect(() => {
        if (activation) {
            if (!isOnline) {
                alert("Check internet connection");
                return;
            }
            const fetchTransactions = async () => {
                try {
                    const userId = localStorage.getItem("userId");
                    if (!userId) return;
                    const res = await fetch(`https://expense-tracker-two-eta-98.vercel.app/ViewData`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ userId })
                    });
                    const result = await res.json();
                    if (result.success && Array.isArray(result.message)) {
                        const sorted = [...result.message].sort(
                            (a, b) => new Date(b.date) - new Date(a.date)
                        );
                        setTransaction(sorted);
                    } else {
                        alert(result.message || "Failed to fetch transactions");
                    }
                } catch (error) {
                    console.error("Fetch transactions error:", error);
                    alert("Failed to fetch transactions");
                }
            };
            fetchTransactions();
        }
    }, [activation, isOnline])
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
    const categoryExpenses = currentMonthTransactions
        .filter(item => item.type === "Expense")
        .reduce((acc, item) => {
            const category = item.category || "Other";
            acc[category] = (acc[category] || 0) + Number(item.money);
            return acc;
        }, {});

    const categoryLabels = Object.keys(categoryExpenses);
    const categoryValues = Object.values(categoryExpenses);

    const categoryColors = [
        "#3B82F6",
        "#8B5CF6",
        "#EC4899",
        "#F59E0B",
        "#10B981",
        "#EF4444",
        "#6366F1"
    ];
    return (
        <div className={style.mainWrapper}>
            {
                <AnimatePresence>
                    {show1 && (
                        <motion.div
                            className={style.modalOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShow1(false)}
                        >
                            <motion.form
                                key={editIndex}
                                action={action1}
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                transition={{ duration: 0.25 }}
                                className={`${style.modalForm} ${mode === "dark" ? style.darkModalForm : ""}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {pending1 && (
                                    <div className={`${style.loadingOverlay} ${mode === "dark" ? style.darkLoadingOverlay : ""}`}>
                                        <div className={`${style.spinner} ${style.updateSpinner}`}></div>
                                        <p style={{ fontWeight: 600, color: "#059669" }}>
                                            Updating Transaction...
                                        </p>
                                    </div>
                                )}
                                <div className={`${style.modalHeader} ${mode === "dark" ? style.darkModalHeader : ""}`}>
                                    <div>
                                        <h2 className={`${style.modalTitle} ${style.emeraldTitle}`}>
                                            <i className="fa-solid fa-pen-to-square"></i>
                                            Update Transaction
                                        </h2>
                                        <p className={`${style.modalSubtitle} ${mode === "dark" ? style.darkModalSubtitle : ""}`}>
                                            Leave fields empty to keep current values.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShow1(false)}
                                        className={style.closeButton}
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>

                                <div className={style.modalGrid}>
                                    <div className={`${style.fieldGroup} ${style.fullRow}`}>
                                        <label className={`${style.fieldLabel} ${mode === "dark" ? style.darkFieldLabel : ""}`}>
                                            <i className="fa-solid fa-pen" style={{ color: "#059669" }}></i>
                                            Transaction Details
                                        </label>
                                        <input
                                            name="title"
                                            placeholder="e.g. Grocery, Salary"
                                            className={`${style.formInput} ${style.emeraldFocus} ${mode === "dark" ? style.darkFormInput : ""}`}
                                        />
                                    </div>

                                    <div className={style.fieldGroup}>
                                        <label className={`${style.fieldLabel} ${mode === "dark" ? style.darkFieldLabel : ""}`}>
                                            <i className="fa-solid fa-indian-rupee-sign" style={{ color: "#059669" }}></i>
                                            Amount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            name="money"
                                            placeholder="e.g. 1500"
                                            className={`${style.formInput} ${style.emeraldFocus} ${mode === "dark" ? style.darkFormInput : ""}`}
                                        />
                                    </div>

                                    <div className={style.fieldGroup}>
                                        <label className={`${style.fieldLabel} ${mode === "dark" ? style.darkFieldLabel : ""}`}>
                                            <i className="fa-solid fa-calendar" style={{ color: "#059669" }}></i>
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            className={`${style.formInput} ${style.emeraldFocus} ${mode === "dark" ? style.darkFormInput : ""}`}
                                        />
                                    </div>

                                    <div className={style.fieldGroup}>
                                        <label className={`${style.fieldLabel} ${mode === "dark" ? style.darkFieldLabel : ""}`}>
                                            <i className="fa-solid fa-list" style={{ color: "#059669" }}></i>
                                            Type
                                        </label>
                                        <select
                                            name="type"
                                            className={`${style.formInput} ${style.emeraldFocus} ${mode === "dark" ? style.darkFormInput : ""}`}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Income">Income</option>
                                            <option value="Expense">Expense</option>
                                        </select>
                                    </div>

                                    <div className={style.fieldGroup}>
                                        <label className={`${style.fieldLabel} ${mode === "dark" ? style.darkFieldLabel : ""}`}>
                                            <i className="fa-solid fa-layer-group" style={{ color: "#059669" }}></i>
                                            Category
                                        </label>
                                        <select
                                            name="category"
                                            className={`${style.formInput} ${style.emeraldFocus} ${mode === "dark" ? style.darkFormInput : ""}`}
                                        >
                                            <option value="">Select Category</option>
                                            <option>Job</option>
                                            <option>Home</option>
                                            <option>Shopping</option>
                                            <option>Bill</option>
                                            <option>Education</option>
                                            <option>Grocery</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={style.modalActions}>
                                    <button
                                        disabled={pending1}
                                        className={`${style.submitBtn} ${style.updateSubmitBtn}`}
                                    >
                                        {pending1 ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin"></i>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-check"></i>
                                                Update Transaction
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShow1(false)}
                                        className={`${style.cancelBtn} ${mode === "dark" ? style.darkCancelBtn : ""}`}
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
                    <div className={style.addTransactionWrapper}>
                        <button
                            className={`${style.addTransaction} ${mode === "dark" ? style.darkAddTransaction : ""
                                }`}
                            onClick={() => setShow("Add")}
                        >
                            <i className="fa-solid fa-plus"></i>
                            Add Transaction
                        </button>
                    </div>
                )
            }
            {!show && (
                <>
                    <div>
                        <h3 style={{ textAlign: "center", fontSize: 24 }}>
                            {monthname} {year}
                        </h3>
                    </div>
                    <div className={style.boxes}>
                        <div className={`${style.box} ${mode === "dark" ? style.dbox : ""}`}>
                            <h3>
                                <i
                                    className="fa-solid fa-arrow-trend-up"
                                    style={{ color: "#11f90d" }}
                                />{" "}
                                Income
                            </h3>
                            <p className={style.income}>{Income}</p>
                        </div>
                        <div className={`${style.box} ${mode === "dark" ? style.dbox : ""}`}>
                            <h3>
                                <i
                                    className="fa-solid fa-arrow-down"
                                    style={{ color: "#f20707" }}
                                />{" "}
                                Expense
                            </h3>
                            <p className={style.expense}>{Expense}</p>
                        </div>
                        <div className={`${style.box} ${mode === "dark" ? style.dbox : ""}`}>
                            <h3>
                                <i className="fa-solid fa-wallet"></i>{" "}
                                Balance
                            </h3>
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
            <AnimatePresence>
                {show === "Add" && <AddTransaction setShow={setShow} pending={pending} />}
            </AnimatePresence>
            {show === "DeleteAll" && <DeleteAllTransaction setShow={setShow} setTransaction={setTransaction} />}
            <div className={`${style1.data} ${mode === "dark" ? style1.ddata : style1.data}`}>
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
                    <div
                        key={data._id || index}
                        className={`${style1.data} ${mode === "dark"
                            ? style1.ddata
                            : style1.data
                            }`}
                    >
                        <span>
                            {data.date && !isNaN(new Date(data.date).getTime())
                                ? new Date(data.date).toISOString().split("T")[0]
                                : "--"}
                        </span>

                        <span>{data.title}</span>
                        <span className={style1.type}>
                            {data.type}
                        </span>
                        <span className={style1.category}>
                            {data.category}
                        </span>
                        <span>{data.money}</span>
                        <span>
                            <i
                                className="fa-solid fa-pen-to-square"
                                onClick={() => {
                                    setIndex(index);
                                    setShow1(true);
                                }}
                            ></i>
                        </span>
                        <span>
                            <i
                                className="fa-solid fa-trash"
                                onClick={() => Delete(data, index)}
                            ></i>
                        </span>
                    </div>
                ))
            }
            {!show && (
                <div className={style.container1}>
                    <Link className={`${style.viewAllBtn} ${mode === "dark" ? style.darkViewAllBtn : ""}`} to="/Reports">
                        <i className="fa-solid fa-list-check"></i>
                        View All
                    </Link>
                    <button className={`${style.deleteAllBtn} ${mode === "dark" ? style.darkDeleteAllBtn : ""}`} onClick={() => setShow("DeleteAll")}>
                        <i className="fa-solid fa-trash-can"></i>
                        Delete All
                    </button>
                </div>
            )}
            <div className={style.chartsRow}>
                <div className={style.chartCard}>
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
                                            size: 14
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
                                        size: 18
                                    }
                                }
                            }
                        }}
                    />
                </div>
                <div className={style.chartCard}>
                    {categoryLabels.length > 0 ? (
                        <Pie
                            data={{
                                labels: categoryLabels,
                                datasets: [
                                    {
                                        label: "Category Expense",
                                        data: categoryValues,
                                        backgroundColor: categoryLabels.map(
                                            (_, index) =>
                                                categoryColors[index % categoryColors.length]
                                        ),
                                        borderWidth: 3,
                                        borderColor: mode === "dark"
                                            ? "#111827"
                                            : "#ffffff"
                                    }
                                ]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,

                                plugins: {
                                    legend: {
                                        position: "bottom",
                                        labels: {
                                            color: mode === "dark"
                                                ? "#E5E7EB"
                                                : "#374151",
                                            font: {
                                                weight: "600",
                                                size: 12
                                            },
                                            padding: 10
                                        }
                                    },

                                    tooltip: {
                                        backgroundColor: mode === "dark"
                                            ? "#1F2937"
                                            : "#111827",

                                        padding: 10,
                                        cornerRadius: 10,

                                        callbacks: {
                                            label: function (context) {
                                                const total = categoryValues.reduce(
                                                    (sum, value) => sum + value,
                                                    0
                                                );

                                                const percentage = total > 0
                                                    ? ((context.raw / total) * 100).toFixed(1)
                                                    : 0;

                                                return [
                                                    `${context.label}`,
                                                    `Expense: ₹${Number(context.raw).toLocaleString("en-IN")}`,
                                                    `${percentage}% of expenses`
                                                ];
                                            }
                                        }
                                    },

                                    title: {
                                        display: true,
                                        text: `${monthname} Category Expenses`,
                                        color: mode === "dark"
                                            ? "#F9FAFB"
                                            : "#111827",
                                        font: {
                                            size: 18,
                                            weight: "700"
                                        },
                                        padding: {
                                            bottom: 15
                                        }
                                    }
                                }
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                                gap: "5px",
                                color: mode === "dark"
                                    ? "#9CA3AF"
                                    : "#6B7280"
                            }}
                        >
                            <i
                                className="fa-solid fa-chart-pie"
                                style={{
                                    fontSize: "36px",
                                    marginBottom: "10px"
                                }}
                            ></i>

                            <h3>No Expense Data</h3>

                            <p>
                                Add an expense to see category analysis
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>)
    async function Delete(data, index) {
        if (!isOnline) {
            alert("Check internet connection");
            return;
        }
        try {
            let define = {
                id: data._id,
                userId: localStorage.getItem("userId")
            };
            let res = await fetch(
                `https://expense-tracker-two-eta-98.vercel.app/Delete`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(define)
                }
            );
            let result = await res.json();
            if (!res.ok || !result.success) {
                alert(
                    result.message ||
                    "Failed to delete transaction"
                );
                return;
            }
            let newData = [...Transaction];
            newData.splice(index, 1);
            setTransaction(newData);

            alert(result.message);

        } catch (error) {
            console.error("Delete transaction error:", error);
            alert("Failed to delete transaction");
        }
    }
    function AddTransaction({ setShow, pending }) {
        return (
            <motion.div
                className={style.modalOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShow(null)}
            >
                <motion.form
                    action={action}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ duration: 0.25 }}
                    className={`${style.modalForm} ${mode === "dark" ? style.darkModalForm : ""}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {pending && (
                        <div className={`${style.loadingOverlay} ${mode === "dark" ? style.darkLoadingOverlay : ""}`}>
                            <div className={style.spinner}></div>
                            <p style={{ fontWeight: 600, color: "#2563eb" }}>
                                Creating Transaction...
                            </p>
                        </div>
                    )}
                    <div className={`${style.modalHeader} ${mode === "dark" ? style.darkModalHeader : ""}`}>
                        <div>
                            <h2 className={`${style.modalTitle} ${style.blueTitle}`}>
                                <i className="fa-solid fa-circle-plus"></i>
                                Add New Transaction
                            </h2>
                            <p className={`${style.modalSubtitle} ${mode === "dark" ? style.darkModalSubtitle : ""}`}>
                                Enter details to add an income or expense.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShow(null)}
                            className={style.closeButton}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className={style.modalGrid}>
                        <div className={`${style.fieldGroup} ${style.fullRow}`}>
                            <label className={`${style.fieldLabel} ${mode === "dark" ? style.darkFieldLabel : ""}`}>
                                <i className="fa-solid fa-pen" style={{ color: "#2563eb" }}></i>
                                Transaction Details *
                            </label>
                            <input
                                name="add"
                                placeholder="e.g. Monthly Salary, Grocery Bill"
                                className={`${style.formInput} ${mode === "dark" ? style.darkFormInput : ""}`}
                                required
                            />
                        </div>

                        <div className={style.fieldGroup}>
                            <label className={`${style.fieldLabel} ${mode === "dark" ? style.darkFieldLabel : ""}`}>
                                <i className="fa-solid fa-indian-rupee-sign" style={{ color: "#2563eb" }}></i>
                                Amount (₹) *
                            </label>
                            <input
                                type="number"
                                name="money"
                                placeholder="e.g. 2500"
                                className={`${style.formInput} ${mode === "dark" ? style.darkFormInput : ""}`}
                                required
                            />
                        </div>

                        <div className={style.fieldGroup}>
                            <label className={`${style.fieldLabel} ${mode === "dark" ? style.darkFieldLabel : ""}`}>
                                <i className="fa-solid fa-calendar" style={{ color: "#2563eb" }}></i>
                                Date *
                            </label>
                            <input
                                type="date"
                                name="date"
                                className={`${style.formInput} ${mode === "dark" ? style.darkFormInput : ""}`}
                                required
                            />
                        </div>

                        <div className={style.fieldGroup}>
                            <label className={`${style.fieldLabel} ${mode === "dark" ? style.darkFieldLabel : ""}`}>
                                <i className="fa-solid fa-list" style={{ color: "#2563eb" }}></i>
                                Type
                            </label>
                            <select
                                name="type"
                                className={`${style.formInput} ${mode === "dark" ? style.darkFormInput : ""}`}
                            >
                                <option value="Income">Income</option>
                                <option value="Expense">Expense</option>
                            </select>
                        </div>

                        <div className={style.fieldGroup}>
                            <label className={`${style.fieldLabel} ${mode === "dark" ? style.darkFieldLabel : ""}`}>
                                <i className="fa-solid fa-layer-group" style={{ color: "#2563eb" }}></i>
                                Category
                            </label>
                            <select
                                name="category"
                                className={`${style.formInput} ${mode === "dark" ? style.darkFormInput : ""}`}
                            >
                                <option>Job</option>
                                <option>Home</option>
                                <option>Shopping</option>
                                <option>Bill</option>
                                <option>Education</option>
                                <option>Grocery</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div className={style.modalActions}>
                        <button
                            disabled={pending}
                            className={style.submitBtn}
                        >
                            {pending ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-check"></i>
                                    Save Transaction
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShow(null)}
                            className={`${style.cancelBtn} ${mode === "dark" ? style.darkCancelBtn : ""}`}
                        >
                            Cancel
                        </button>
                    </div>
                </motion.form>
            </motion.div>
        )
    }
    function DeleteAllTransaction({ setShow, setTransaction }) {
        useEffect(() => {
            const deleteAll = async () => {
                if (Transaction.length === 0) {
                    alert("No Data Found");
                    setShow(null);
                    return;
                }
                let message = window.confirm("Are you Want to Delete All Data?");
                if (!message) {
                    setShow(null);
                    return;
                }
                if (!isOnline) {
                    alert("Check internet connection");
                    setShow(null);
                    return;
                }
                try {
                    let userId = localStorage.getItem("userId");
                    if (!userId) {
                        alert("Login Again");
                        return;
                    }
                    let res = await fetch(`https://expense-tracker-two-eta-98.vercel.app/DeleteAllTransaction`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ userId })
                    });
                    let result = await res.json();
                    if (!result.result && !result.success) {
                        alert(result.message || "Failed to delete transactions");
                        setShow(null);
                        return;
                    }
                    setTransaction([]);
                    alert(result.message);
                } catch (error) {
                    console.error("Delete all error:", error);
                    alert("Failed to delete transactions");
                } finally {
                    setShow(null);
                }
            };
            deleteAll();
        }, [setShow, setTransaction]);
        return null;
    }
}