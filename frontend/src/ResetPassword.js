import { useContext, useState } from "react";
import style from "./ResetPassword.module.css"
import { Online } from "./App"

export default function ResetPassword({ activation, mode }) {
    let isOnline = useContext(Online)
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Password not Match")
            return;
        }
        try {
            let res = await fetch(`https://expense-tracker-two-eta-98.vercel.app/ResetPassword`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, password })
            })
            let result = await res.json();
            if (!result.success) {
                setMessage(result.message);
                return;
            }
            setMessage(result.message)
        } catch (error) {
            setMessage("Server Error")
        }
    }

    return (
        <>
            {
                isOnline ? activation ?

                    <div className={`${style.page} ${mode === "dark" ? style.dark : ""}`}>
                        <div className={style.card}>

                            <div className={style.icon}>
                                <i className="fa-solid fa-lock"></i>
                            </div>

                            <div className={style.header}>
                                <h1>Reset Password</h1>
                                <p>Set a new password to keep your account secure.</p>
                            </div>

                            <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column"}}>

                                <div className={style.field}>
                                    <label htmlFor="name">
                                        <i className="fa-solid fa-user"></i>
                                        Username
                                    </label>

                                    <input
                                        type="name"
                                        id="name"
                                        placeholder="Enter your username"
                                        onChange={(event) => setName(event.target.value)}
                                        required
                                    />
                                </div>

                                <div className={style.field}>
                                    <label htmlFor="password">
                                        <i className="fa-solid fa-lock"></i>
                                        New Password
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        placeholder="Enter new password"
                                        onChange={(event) => setPassword(event.target.value)}
                                        minLength={8}
                                        autoComplete="new-password"
                                        required
                                    />

                                    <span className={style.hint}>
                                        Password must be at least 8 characters.
                                    </span>
                                </div>

                                <div className={style.field}>
                                    <label htmlFor="confirmpassword">
                                        <i className="fa-solid fa-shield-halved"></i>
                                        Confirm Password
                                    </label>

                                    <input
                                        type="password"
                                        name="confirmpassword"
                                        id="confirmpassword"
                                        placeholder="Confirm your new password"
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        minLength={8}
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>

                                <button type="submit" className={style.button}>
                                    <span>Update Password</span>
                                    <i className="fa-solid fa-arrow-right"></i>
                                </button>

                                <h3 className={style.message}>{message}</h3>

                            </form>

                            <div className={style.security}>
                                <i className="fa-solid fa-shield-halved"></i>
                                <span>Your account security matters to us.</span>
                            </div>

                        </div>
                    </div>

                    :

                    <div className={`${style.statePage} ${mode === "dark" ? style.dark : ""}`}>
                        <div className={style.stateCard}>
                            <div className={style.stateIcon}>
                                <i className="fa-solid fa-user-lock"></i>
                            </div>
                            <h3>Please SignUp/Login to Reset Password</h3>
                            <p>You need to be authenticated before changing your password.</p>
                        </div>
                    </div>

                    :

                    <div className={`${style.statePage} ${mode === "dark" ? style.dark : ""}`}>
                        <div className={style.stateCard}>
                            <div className={style.stateIcon}>
                                <i className="fa-solid fa-wifi"></i>
                            </div>
                            <h3>Internet Connection Required</h3>
                            <p>Password changes are only available when you are connected to the internet.</p>
                        </div>
                    </div>
            }
        </>
    );
}