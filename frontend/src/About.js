export default function About({mode}) {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "transparent",
                padding: "50px 20px",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "1200px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "50px",
                }}
            >
                <section
                    style={{
                        background: "#ffffff",
                        borderRadius: "20px",
                        padding: "40px",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "2.5rem",
                            fontWeight: "700",
                            color: "#0f172a",
                            marginBottom: "20px",
                            textAlign: "center",
                        }}
                    >
                        About Us
                    </h1>

                    <p
                        style={{
                            fontSize: "1.1rem",
                            lineHeight: "1.9",
                            color: "#475569",
                            textAlign: "center",
                            maxWidth: "950px",
                            margin: "0 auto 30px auto",
                        }}
                    >
                        Expense Tracker is a web-based application built using the MERN stack
                        (MongoDB, Express.js, React.js, and Node.js). It is designed to help
                        users manage their daily income and expenses in a simple, organized,
                        and efficient way.
                    </p>

                    <p
                        style={{
                            fontSize: "1.05rem",
                            lineHeight: "1.9",
                            color: "#475569",
                            textAlign: "center",
                            maxWidth: "950px",
                            margin: "0 auto 35px auto",
                        }}
                    >
                        The platform allows users to add, edit, and delete transactions,
                        categorize expenses, and monitor their financial balance in real time.
                        It also helps users better understand spending habits and improve
                        their financial planning through a clean and user-friendly interface.
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "20px",
                            marginTop: "20px",
                        }}
                    >
                        {[
                            "Real-time expense tracking",
                            "Monthly summary and balance calculation",
                            "Responsive and modern user interface",
                        ].map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    background: "#f1f5f9",
                                    padding: "20px",
                                    borderRadius: "14px",
                                    textAlign: "center",
                                    fontWeight: "600",
                                    color: "#1e293b",
                                    boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
                                }}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}