import { useContext, useState } from "react";
import style from "./ResetPassword.module.css"
import bcrypt from "bcryptjs"
import { Online } from "./App"

export default function ResetPassword({ activation, mode }) {
    let isOnline = useContext(Online)
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Password not Match")
            return;
        }
        const hash = await bcrypt.hash(password, 10);
        let define = {
            userId: localStorage.getItem("userId"),
            password: hash
        }
        try {
            let res = await fetch(`${process.env.REACT_APP_API_URL}/ResetPassword`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(define)
            })
            let result = await res.json();
            if (!result.success) {
                setMessage(result.message);
                return;
            }
            setMessage("Password Successfully Changed")
            let object = JSON.parse(localStorage.getItem("user"));
            object={
                ...object,
                password:result.message
            }
            localStorage.setItem("user", JSON.stringify(object))
        } catch (error) {
            setMessage("Server Error")
        }
    }
    return (
        <>
            {
                isOnline ? activation ? <><form onSubmit={handleSubmit}>
                    <div className={style.row}>
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