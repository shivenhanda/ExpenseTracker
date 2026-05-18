export default function About({mode}) {
    const teamMembers = [
        {
            name: "Shivansh",
            role: "UI/UX Designer",
            image: "/shivansh.jpeg",
        },
        {
            name: "Shiven Handa",
            role: "MERN Stack Developer",
            image: "/shiven.jpeg",
        },
        {
            name: "Utsav",
            role: "UI/UX Designer",
            image: "/utsav.jpeg",
        },
    ];

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
                <section>
                    <div style={{ textAlign: "center", marginBottom: "30px" }}>
                        <h2
                            style={{
                                fontSize: "2rem",
                                fontWeight: "700",
                                color: mode==="dark"?"yellow":"red",
                                marginBottom: "10px",
                            }}
                        >
                            Meet Our Team
                        </h2>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                            gap: "30px",
                        }}
                    >
                        {teamMembers.map((member, index) => (
                            <div
                                key={index}
                                style={{
                                    background: "#ffffff",
                                    borderRadius: "20px",
                                    padding: "25px",
                                    textAlign: "center",
                                    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
                                    transition: "transform 0.3s ease",
                                }}
                            >
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    style={{
                                        width: "140px",
                                        height: "140px",
                                        objectFit: "cover",
                                        borderRadius: "50%",
                                        border: "4px solid #e2e8f0",
                                        marginBottom: "20px",
                                    }}
                                />
                                <h3
                                    style={{
                                        fontSize: "1.3rem",
                                        fontWeight: "700",
                                        color: "#0f172a",
                                        marginBottom: "8px",
                                    }}
                                >
                                    {member.name}
                                </h3>
                                <p
                                    style={{
                                        fontSize: "1rem",
                                        color: "#64748b",
                                        fontWeight: "500",
                                    }}
                                >
                                    {member.role}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}