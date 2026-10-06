import style from "./Delete.module.css"
import { useContext, useState } from "react"
import { Online } from "./App"

export default function DeleteAccount({ mode,handleLogout }) {
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
            let res = await fetch(`https://expense-tracker-two-eta-98.vercel.app/DeleteAccount`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, password })
            })
            let result = await res.json();
            if (!result.success) {
                setMessage(result.message)
                return;
            }
            handleLogout()
            alert(result.message)
        }
        catch (error) {
            setMessage("Frontend Error")
        }
    }

    return (
        <>
            {
                isOnline ?

                    <div className={`${style.deletePage} ${mode === "dark" ? style.dark : ""}`}>

                        <div className={style.deleteCard}>

                            <div className={style.deleteIcon}>
                                <i className="fa-solid fa-trash"></i>
                            </div>

                            <div className={style.deleteHeader}>
                                <h1>Delete Account</h1>
                                <p>
                                    Permanently remove your account and all associated data.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"5px"}}>

                                <div className={style.deleteField}>
                                    <label htmlFor="name">
                                        <i className="fa-solid fa-user"></i>
                                        Name
                                    </label>

                                    <input
                                        type="text"
                                        id="name"
                                        placeholder="Enter your name"
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className={style.deleteField}>
                                    <label htmlFor="password">
                                        <i className="fa-solid fa-lock"></i>
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        id="password"
                                        placeholder="Enter your password"
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="password"
                                        required
                                    />
                                </div>

                                <div className={style.deleteField}>
                                    <label htmlFor="confirmpassword">
                                        <i className="fa-solid fa-shield-halved"></i>
                                        Confirm Password
                                    </label>

                                    <input
                                        type="password"
                                        id="confirmpassword"
                                        placeholder="Confirm your password"
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="password"
                                        required
                                    />
                                </div>

                                <button
                                    className={style.deleteButton}
                                    type="submit"
                                >
                                    <i className="fa-solid fa-trash"></i>
                                    <span>Delete Account</span>
                                </button>

                                <h3 className={style.deleteMessage}>
                                    {message}
                                </h3>

                            </form>

                            <div className={style.deleteFooter}>
                                <i className="fa-solid fa-shield-halved"></i>
                                <span>Your account credentials are required for verification.</span>
                            </div>

                        </div>

                    </div>

                    :

                    <div className={`${style.statePage} ${mode === "dark" ? style.dark : ""}`}>
                        <div className={style.stateCard}>

                            <div className={style.stateIcon}>
                                <i className="fa-solid fa-wifi"></i>
                            </div>

                            <h3>Internet Connection Required</h3>

                            <p>
                                Account deletion is only available when you are connected to the internet.
                            </p>

                        </div>
                    </div>
            }
        </>
    );
}