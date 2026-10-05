import { useContext, useState } from "react";
import style from "./ResetPassword.module.css"
import bcrypt from "bcryptjs"
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
                body: JSON.stringify({name,password})
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
                isOnline ? activation ? <><form onSubmit={handleSubmit}>
                    <div className={style.row}>
                        <input type="name" className={`${style.input} ${mode === "dark" ? style.dinput : ""}`} onChange={(event) => setName(event.target.value)} required />
                        <input type="password" className={`${style.input} ${mode === "dark" ? style.dinput : ""}`} name="password" id="password" onChange={(event) => setPassword(event.target.value)}
                            minLength={8} autoComplete="new-password" required />
                        <label className={`${style.label} ${mode === "dark" ? style.dlabel : ""}`} htmlFor="password"><i class="fa-solid fa-lock"></i>Set New Password</label>
                    </div>
                    <div className={style.row}>
                        <input type="password" className={`${style.input} ${mode === "dark" ? style.dinput : ""}`} name="confirmpassword" id="confirmpassword" onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} autoComplete="new-password" required />
                        <label className={`${style.label} ${mode === "dark" ? style.dlabel : ""}`} htmlFor="confirmpassword"><i class="fa-solid fa-lock"></i>Confirm Password</label>
                    </div>
                    <button>Set Password</button>
                    <h3>{message}</h3>
                </form></> : <h3>Please SignUp/Login to Reset Password</h3> : <h3>Password Change Only When Internet Connected</h3>}
        </>
    );
}