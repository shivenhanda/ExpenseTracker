
import { Bar } from "react-chartjs-2"
import { useState, useEffect } from "react"

export default function Charts({ transactions, list, mode }) {
    const [incomeList, setIncomeList] = useState([]);
    const [expenseList, setExpenseList] = useState([]);
    const [NotSelectedList, setNotSelectedList] = useState([]);

    useEffect(() => {
        const dateMap = {};

        list.forEach(day => {
            dateMap[day] = { income: 0, expense: 0, NotSelected: 0 };
        });

        transactions.forEach(item => {
            const day = new Date(item.date).getDate();
            if (!dateMap[day]) return;
            if (item.type === "Income") {
                dateMap[day].income += Number(item.money);
            } else if (item.type === "Expense") {
                dateMap[day].expense += Number(item.money);
            } else {
                dateMap[day].NotSelected += Number(item.money);
            }
        });

        setIncomeList(list.map(d => dateMap[d].income));
        setExpenseList(list.map(d => dateMap[d].expense));
        setNotSelectedList(list.map(d => dateMap[d].NotSelected));
    }, [transactions, list]);
    const baseDate = transactions.length
        ? new Date(transactions[0].date)
        : new Date();

    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, "0");

    return (
        <div style={{ height: "300px" }}>
            <Bar
                data={{
                    labels: list,
                    datasets: [
                        { label: "Income", data: incomeList, backgroundColor: "green" },
                        { label: "Expense", data: expenseList, backgroundColor: "red" },
                        {
                            label: "Not Selected", data: NotSelectedList, backgroundColor: "blue"
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            ticks: { maxRotation: 0, color: "red" }, grid: { display: false }, border: {
                                color: "orange"
                            }
                        },
                        y: {
                            beginAtZero: true, ticks: { color: "red" }, grid: { display: false }, border: {
                                color: "orange"
                            }
                        },
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: mode==="dark"?"white":"black"
                            }
                        },
                        tooltip: {
                            callbacks: {
                                title: (tooltipItems) => {
                                    const day = tooltipItems[0].label;
                                    return `${year}-${month}-${String(day).padStart(2, "0")}`;
                                }
                            }
                        }
                    }
                }}
            />
        </div>
    );
}
