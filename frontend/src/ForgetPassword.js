import { useContext, useState } from "react";
import style from "./ResetPassword.module.css";
import { Online } from "./App";

export default function ForgetPassword({ mode }) {
    const isOnline = useContext(Online);

    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setIsSuccess(false);
        setLoading(true);

        try {
            const res = await fetch(
                "https://expense-tracker-two-eta-98.vercel.app/setpassword",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }
            );

            const result = await res.json();

            if (!res.ok || !result.success) {
                setMessage(result.message || "Unable to reset password.");
                return;
            }

            setIsSuccess(true);
            setMessage(
                result.message || "Password reset instructions have been sent to your email."
            );
            setEmail("");
        } catch (error) {
            setMessage("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {isOnline ? (
                <div
                    className={`${style.page} ${mode === "dark" ? style.dark : ""
                        }`}
                >
                    <div className={style.card}>
                        <div className={style.icon}>
                            <i className="fa-solid fa-envelope"></i>
                        </div>

                        <div className={style.header}>
                            <h1>Forgot Password?</h1>
                            <p>
                                Enter your registered email address to receive
                                password reset instructions.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className={style.form}
                        >
                            <div className={style.field}>
                                <label htmlFor="email">
                                    <i className="fa-solid fa-envelope"></i>
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    autoComplete="email"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                className={style.button}
                                disabled={loading}
                            >
                                <span>
                                    {loading
                                        ? "Sending..."
                                        : "Send Reset Instructions"}
                                </span>
                                <i
                                    className={`fa-solid ${loading
                                            ? "fa-spinner fa-spin"
                                            : "fa-arrow-right"
                                        }`}
                                ></i>
                            </button>

                            {message && (
                                <p
                                    className={`${style.message} ${isSuccess
                                            ? style.successMessage
                                            : style.errorMessage
                                        }`}
                                    role="status"
                                    aria-live="polite"
                                >
                                    {message}
                                </p>
                            )}
                        </form>

                        <div className={style.security}>
                            <i className="fa-solid fa-shield-halved"></i>
                            <span>
                                Your account security matters to us.
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    className={`${style.statePage} ${mode === "dark" ? style.dark : ""
                        }`}
                >
                    <div className={style.stateCard}>
                        <div className={style.stateIcon}>
                            <i className="fa-solid fa-wifi"></i>
                        </div>
                        <h3>Internet Connection Required</h3>
                        <p>
                            Connect to the internet to request password reset
                            instructions.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}