import { useActionState, useContext, useState } from 'react'
import style from './Home.module.css'
import HandleTransaction from './HandleTransaction'
import bcrypt from 'bcryptjs'
import { Link } from 'react-router-dom'
import { Online } from './App'


export default function Home({ activation, setActivation, setUser, mode }) {
    let isOnline = useContext(Online)
    const [activeform, setform] = useState("signup");
    const [data, action, pending] = useActionState((prev, formData) => HandleSignUp(prev, formData, setActivation, isOnline, setUser), undefined)
    const [logindata, loginaction, loginpending] = useActionState((prev, formData) => HandleLogin(prev, formData, setActivation, isOnline), undefined)
    return (
        <>
            {activation ? <HandleTransaction mode={mode} activation={activation}/> : <div className={style.main}>
                <div className={`${style.container} ${mode === "dark" ? style.dcontainer : ""}`}>
                    {
                        activeform === 'signup' && <SignUpUser action={action} pending={pending} data={data} setActivation={setActivation} mode={mode} />
                    }
                    {
                        activeform === 'login' && <LoginUser loginaction={loginaction} loginpending={loginpending} logindata={logindata} activation={activation} setActivation={setActivation} mode={mode} />
                    }
                    <div className={style.buttons}>
                        {
                            activeform==="login"?(<><p>Create a New Account</p><span onClick={() => setform("signup")} style={{border:"1px solid black",backgroundColor:"black",color:"white",padding:"5px",borderRadius:"5px",fontWeight:"bold"}}>Click here</span></>):(<><p>Already have an Account</p><span onClick={() => setform("login")} style={{border:"1px solid black",backgroundColor:"black",color:"white",padding:"5px",borderRadius:"5px",fontWeight:"bold"}}>Click here</span></>)
                        }
                    </div>
                </div>
            </div>
            }
        </>
    )
}

function SignUpUser({ action, pending, data, setActivation, mode }) {
    return (
        <>
            <form action={action}>
                <div className={style.row}>
                    <input className={`${style.input} ${mode==="dark"?style.dinput:""}`} type="text" name="user" id="user" autoComplete='off' required />
                    <label htmlFor="user" className={`${style.label} ${mode === "dark" ? style.dlabel : ""}`}><i className='fa-solid fa-user'></i>Username</label>
                </div>
                <div className={style.row}>
                    <input className={`${style.input} ${mode==="dark"?style.dinput:""}`} type="email" name="email" id="email" required />
                    <label htmlFor="email" className={`${style.label} ${mode === "dark" ? style.dlabel : ""}`}><i className='fa-solid fa-envelope'></i>Email ID</label>
                </div>
                <div className={style.row}>
                    <input className={`${style.input} ${mode==="dark"?style.dinput:""}`} type="password" name="password" id="password" autoComplete='password' minLength={8} required />
                    <label htmlFor="password" className={`${style.label} ${mode === "dark" ? style.dlabel : ""}`}><i className="fa-solid fa-lock"></i>Password</label>
                </div>
                <button className={`${mode==="dark"?style.dbutton:""}`} disabled={pending}>{pending ? "Signing Up..." : "Sign Up"}</button>
                {data?.success === false && <p>{data.message}</p>}
            </form>
        </>
    )
}
function LoginUser({ loginaction, loginpending, logindata, setActivation, mode }) {
    return (
        <>
            <form action={loginaction}>
                <div className={style.row}>
                    <input className={`${style.input} ${mode==="dark"?style.dinput:""}`} type="text" name="user" id="user" autoComplete='off' required />
                    <label htmlFor="user" className={`${style.label} ${mode === "dark" ? style.dlabel : ""}`}><i class="fa-solid fa-user"></i>Username</label>
                </div>
                <div className={style.row}>
                    <input className={`${style.input} ${mode==="dark"?style.dinput:""}`} type="password" name="password" id="password" autoComplete="password" minLength={8} required />
                    <label htmlFor="password" className={`${style.label} ${mode === "dark" ? style.dlabel : ""}`}><i class="fa-solid fa-lock"></i>Password</label>
                </div>
                <button  className={`${mode==="dark"?style.dbutton:""}`} disabled={loginpending}>{loginpending ? "Trying Login..." : "Login"}</button>
                <Link to="/ResetPassword" className={mode === "dark" ? style.dreset : style.reset}>Reset Password</Link>
                {logindata?.success === false && <p>{logindata.message}</p>}
            </form>
        </>
    )
}

async function HandleSignUp(previousData, formData, setActivation, isOnline, setUser) {
    try {
        let name = formData.get("user");
        let email = formData.get("email");
        let password = formData.get("password");
        if (!name || !email || !password) {
            return {
                success: false,
                message: "All Fields Required"
            }
        }
        alert("Account created Successfully")
        password = await bcrypt.hash(password, 10)
        let object = {
            name: name,
            email: email,
            password: password
        }
        if (!isOnline && localStorage.getItem("user")) {
            alert("User already registered on this device")
            return { success: false, message: "User Already registered" };
        }
        if (isOnline) {
            const res = await fetch(`https://expense-tracker-two-eta-98.vercel.app/SignUp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(object)
            });
            let result = await res.json();
            if (!result.success) {
                setActivation(false);
                return { success: false, message: result.message };
            }
            localStorage.setItem("userId", result.message);
        }
        let define = { name: name, email: email, password: password }
        localStorage.setItem("user", JSON.stringify(define))
        localStorage.setItem("TransactionData", JSON.stringify([]))
        setUser(define)
        setActivation(true);
        return { success: true, message: "Signup Successfully." };
    }
    catch (error) {
        return { success: false, message: "Server Error" };
    }
}

async function HandleLogin(previousData, formData, setActivation, isOnline) {
    let name = formData.get("user");
    let password = formData.get("password");
    await new Promise(res => setTimeout(res, 2000))
    if (!name || !password) {
        return {
            success: false,
            message: "All fields Required"
        }
    }
    let message = {};
    if (isOnline) {
        message = {
            name: name,
            password: password
        }
        const res = await fetch(`https://expense-tracker-two-eta-98.vercel.app/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(message)
        })
        let result = await res.json();
        let define = {
            name: result.name,
            password: result.password
        }
        localStorage.setItem("user", JSON.stringify(define))
        localStorage.setItem("userId", result.id);
        if (!result.success) {
            setActivation(false);
            return { success: false, message: result.message };
        }
        message = {
            name: result.name,
            password: result.password
        }
    }
    else {
        message = JSON.parse(localStorage.getItem("user"))
        if (!message) {
            return {
                success: false,
                message: "No User Found. Please Sign Up"
            }
        }
    }
    let match = await bcrypt.compare(password, message.password);
    if (name === message.name && match) {
        if (isOnline) {
            try {
                let define = {
                    userId: localStorage.getItem("userId")
                }
                let res = await fetch (`https://expense-tracker-two-eta-98.vercel.app/ViewData`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(define)
                })
                let result = await res.json();
                if (!result.success) {
                    console.log(result.message)
                    return;
                }
                localStorage.setItem("TransactionData", JSON.stringify(result.message))
            }
            catch (error) {
                console.log("Frontend Error")
                setActivation(false)
                return { success: false, message: "Frontend Error" }
            }
        }
        setActivation(true);
        return {
            success: true
        }
    }
    alert("If you are facing problems with online login, please try creating a new account in offline mode without connecting to the internet, and then log in again")
    localStorage.removeItem("user")
    return {
        success: false,
        message: "Check entered Information"
    }
}