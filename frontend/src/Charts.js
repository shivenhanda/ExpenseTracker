
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

    const isDark = mode === "dark";
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    const tickColor = isDark ? "#9ca3af" : "#6b7280";
    const axisColor = isDark ? "#374151" : "#e5e7eb";

    return (
        <Bar
            data={{
                labels: list,
                datasets: [
                    {
                        label: "Income",
                        data: incomeList,
                        backgroundColor: "rgba(22, 163, 74, 0.85)",
                        borderRadius: 6,
                        borderSkipped: false,
                    },
                    {
                        label: "Expense",
                        data: expenseList,
                        backgroundColor: "rgba(220, 38, 38, 0.85)",
                        borderRadius: 6,
                        borderSkipped: false,
                    },
                    {
                        label: "Other",
                        data: NotSelectedList,
                        backgroundColor: "rgba(99, 102, 241, 0.75)",
                        borderRadius: 6,
                        borderSkipped: false,
                    },
                ],
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: {
                            maxRotation: 0,
                            color: tickColor,
                            font: { size: 10 },
                        },
                        grid: { color: gridColor },
                        border: { color: axisColor },
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: tickColor, font: { size: 11 } },
                        grid: { color: gridColor },
                        border: { color: axisColor },
                    },
                },
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            color: isDark ? "#e5e7eb" : "#374151",
                            font: { size: 12, weight: "600" },
                            boxWidth: 12,
                            borderRadius: 4,
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: "rectRounded",
                        },
                    },
                    tooltip: {
                        backgroundColor: isDark ? "#1f2937" : "#ffffff",
                        titleColor: isDark ? "#f9fafb" : "#111827",
                        bodyColor: isDark ? "#d1d5db" : "#374151",
                        borderColor: isDark ? "#374151" : "#e5e7eb",
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            title: (tooltipItems) => {
                                const day = tooltipItems[0].label;
                                return `${year}-${month}-${String(day).padStart(2, "0")}`;
                            },
                            label: (item) => ` ₹${item.formattedValue}`
                        }
                    }
                }
            }}
        />
    );
}
