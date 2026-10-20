
import { Bar } from "react-chartjs-2";
import { useMemo } from "react";

export default function Charts({ transactions = [], mode, year,
    month }) {
    const isDark = mode === "dark";

    const monthIndex = month - 1;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const chartData = useMemo(() => {
        const dateMap = {};

        for (let day = 1; day <= daysInMonth; day++) {
            dateMap[day] = {
                income: 0,
                expense: 0,
                other: 0,
            };
        }

        transactions.forEach((item) => {
            const date = new Date(item.date);

            if (isNaN(date.getTime())) return;

            const day = date.getDate();
            if (!dateMap[day]) return;

            const amount = Number(item.money);
            if (!Number.isFinite(amount)) return;

            if (item.type === "Income") {
                dateMap[day].income += amount;
            } else if (item.type === "Expense") {
                dateMap[day].expense += amount;
            } else {
                dateMap[day].other += amount;
            }
        });

        return {
            labels: Object.keys(dateMap).map(Number),
            datasets: [
                {
                    label: "Income",
                    data: Object.values(dateMap).map((d) => d.income),
                    backgroundColor: "rgba(22, 163, 74, 0.85)",
                    borderRadius: 6,
                },
                {
                    label: "Expense",
                    data: Object.values(dateMap).map((d) => d.expense),
                    backgroundColor: "rgba(220, 38, 38, 0.85)",
                    borderRadius: 6,
                },
                {
                    label: "Other",
                    data: Object.values(dateMap).map((d) => d.other),
                    backgroundColor: "rgba(99, 102, 241, 0.75)",
                    borderRadius: 6,
                },
            ],
        };
    }, [transactions, daysInMonth, year, month]);

    const gridColor = isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(0,0,0,0.06)";

    const tickColor = isDark ? "#9ca3af" : "#6b7280";
    const axisColor = isDark ? "#374151" : "#e5e7eb";

    return (
        <Bar
            data={chartData}
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
                        ticks: {
                            color: tickColor,
                            font: { size: 11 },
                        },
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
                            padding: 16,
                            usePointStyle: true,
                        },
                    },
                    tooltip: {
                        callbacks: {
                            title: (items) => {
                                const day = items[0].label;
                                return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                            },
                            label: (item) =>
                                ` ₹${item.formattedValue}`,
                        },
                    },
                },
            }}
        />
    );
}
