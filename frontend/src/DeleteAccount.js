import style from "./ResetPassword.module.css"
import { useContext, useState } from "react"
import { Online } from "./App"

export default function DeleteAccount({ setActivation, mode }) {
    let isOnline = useContext(Online)
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState("")
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Password not Match")
            return;
        }
        try {
            let define = {
                name: name,
                userId: localStorage.getItem("userId"),
                password: password
            }
            localStorage.removeItem("TransactionData")
            localStorage.removeItem("user")
            localStorage.removeItem("userId")
            let res = await fetch("http://localhost:8000/DeleteAccount", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(define)
            })
            let result = await res.json();
            if (!result.success) {
                setMessage(result.message)
                return;
            }
            setActivation(false)
            alert(result.message)
        }
        catch (error) {
            setMessage("Frontend Error")
        }
    }
    return (
        <>
            {isOnline ? <><form onSubmit={handleSubmit}>
                <div className={style.row}>
                    <input type="text" className={`${style.input} ${mode === "dark" ? style.dinput : ""}`} id="name" onChange={(e) => setName(e.target.value)} required />
                    <label className={`${style.label} ${mode === "dark" ? style.dlabel : ""}`} htmlFor="name"><i class="fa-solid fa-user"></i>Name</label>
                </div>
                <div className={style.row}>
                    <input type="password" className={`${style.input} ${mode === "dark" ? style.dinput : ""}`} id="password" onChange={(e) => setPassword(e.target.value)} autoComplete="password" required />
                    <label className={`${style.label} ${mode === "dark" ? style.dlabel : ""}`} htmlFor="password"><i class="fa-solid fa-lock"></i>Password</label>
                </div>
                <div className={style.row}>
                    <input type="password" className={`${style.input} ${mode === "dark" ? style.dinput : ""}`} id="confirmpassword" onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="password" required />
                    <label className={`${style.label} ${mode === "dark" ? style.dlabel : ""}`} htmlFor="confirmpassword"><i class="fa-solid fa-lock"></i>Confirm Password</label>
                </div>
                <button className={`${style.delete} ${mode==="dark"?style.dbutton:""}`} type="submit">Delete Account</button>
                <h3>{message}</h3>
            </form></> : <h3>Account Delete Only When Internet is Connected</h3>}
        </>
    );
}