import { useActionState, useContext, useState } from 'react'
import style from './Home.module.css'
import HandleTransaction from './HandleTransaction'
import { Link } from 'react-router-dom'
import { Online } from './App'


export default function Home({ activation, setActivation, mode }) {
    let isOnline = useContext(Online)
    const [activeform, setform] = useState("signup");
    const [data, action, pending] = useActionState((previousData, formData) => HandleSignUp(previousData, formData, setActivation, isOnline), undefined)
    const [logindata, loginaction, loginpending] = useActionState((previousData, formData) => HandleLogin(previousData, formData, setActivation, isOnline), undefined)

    return (
        <>
            {activation ? <HandleTransaction mode={mode} activation={activation} /> : <div className={`${style.main} ${mode === "dark" ? style.darkMain : ""}`}>

                <div className={`${style.container} ${mode === "dark" ? style.dcontainer : ""}`}>


                    {
                        activeform === 'signup' &&
                        <SignUpUser
                            action={action}
                            pending={pending}
                            data={data}
                            setActivation={setActivation}
                            mode={mode}
                        />
                    }

                    {
                        activeform === 'login' &&
                        <LoginUser
                            loginaction={loginaction}
                            loginpending={loginpending}
                            logindata={logindata}
                            activation={activation}
                            setActivation={setActivation}
                            mode={mode}
                        />
                    }

                    <div className={style.buttons}>
                        {
                            activeform === "login"
                                ?
                                <>
                                    <p>Create a new account</p>
                                    <button
                                        type="button"
                                        className={style.switchButton}
                                        onClick={() => setform("signup")}
                                    >
                                        Sign Up
                                        <i className="fa-solid fa-arrow-right"></i>
                                    </button>
                                </>
                                :
                                <>
                                    <p>Already have an account?</p>
                                    <button
                                        type="button"
                                        className={style.switchButton}
                                        onClick={() => setform("login")}
                                    >
                                        Login
                                        <i className="fa-solid fa-arrow-right"></i>
                                    </button>
                                </>
                        }
                    </div>

                    <div className={style.security}>
                        <i className="fa-solid fa-shield-halved"></i>
                        <span>Your data stays secure with us</span>
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
            <div className={style.header}>
                <div className={style.headerIcon}>
                    <i className="fa-solid fa-user-plus"></i>
                </div>

                <h1>Create your account</h1>

                <p>
                    Start managing your expenses with ease.
                </p>
            </div>

            <form action={action} style={{display:"flex",flexDirection:"column"}}>

                <div className={style.row}>
                    <label htmlFor="user">
                        <i className='fa-solid fa-user'></i>
                        Username
                    </label>

                    <input
                        className={`${style.input} ${mode === "dark" ? style.dinput : ""}`}
                        type="text"
                        name="user"
                        id="user"
                        placeholder="Enter your username"
                        autoComplete='off'
                        required
                    />
                </div>

                <div className={style.row}>
                    <label htmlFor="email">
                        <i className='fa-solid fa-envelope'></i>
                        Email address
                    </label>

                    <input
                        className={`${style.input} ${mode === "dark" ? style.dinput : ""}`}
                        type="email"
                        name="email"
                        id="email"
                        placeholder="you@example.com"
                        required
                    />
                </div>

                <div className={style.row}>
                    <label htmlFor="password">
                        <i className="fa-solid fa-lock"></i>
                        Password
                    </label>

                    <input
                        className={`${style.input} ${mode === "dark" ? style.dinput : ""}`}
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Create a password"
                        autoComplete='password'
                        minLength={8}
                        required
                    />

                    <span className={style.hint}>
                        Use at least 8 characters.
                    </span>
                </div>

                <button
                    className={`${style.primaryButton} ${mode === "dark" ? style.dbutton : ""}`}
                    disabled={pending}
                >
                    {pending ? (
                        <>
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            Signing Up...
                        </>
                    ) : (
                        <>
                            Create Account
                            <i className="fa-solid fa-arrow-right"></i>
                        </>
                    )}
                </button>

                {data?.success === false &&
                    <p className={style.error}>{data.message}</p>
                }

            </form>
        </>
    )
}


function LoginUser({ loginaction, loginpending, logindata, setActivation, mode }) {
    return (
        <>
            <div className={style.header}>
                <div className={style.headerIcon}>
                    <i className="fa-solid fa-right-to-bracket"></i>
                </div>

                <h1>Welcome back</h1>

                <p>
                    Login to continue managing your expenses.
                </p>
            </div>

            <form action={loginaction} style={{display:"flex",flexDirection:"column"}}>

                <div className={style.row}>
                    <label htmlFor="user">
                        <i className="fa-solid fa-user"></i>
                        Username
                    </label>

                    <input
                        className={`${style.input} ${mode === "dark" ? style.dinput : ""}`}
                        type="text"
                        name="user"
                        id="user"
                        placeholder="Enter your username"
                        autoComplete='off'
                        required
                    />
                </div>

                <div className={style.row}>
                    <label htmlFor="password">
                        <i className="fa-solid fa-lock"></i>
                        Password
                    </label>

                    <input
                        className={`${style.input} ${mode === "dark" ? style.dinput : ""}`}
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Enter your password"
                        autoComplete="password"
                        minLength={8}
                        required
                    />
                </div>

                <div className={style.forgot}>
                    <Link
                        to="/ResetPassword"
                        className={mode === "dark" ? style.dreset : style.reset}
                    >
                        Forgot password?
                    </Link>
                </div>

                <button
                    className={`${style.primaryButton} ${mode === "dark" ? style.dbutton : ""}`}
                    disabled={loginpending}
                >
                    {loginpending ? (
                        <>
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            Trying Login...
                        </>
                    ) : (
                        <>
                            Login
                            <i className="fa-solid fa-arrow-right"></i>
                        </>
                    )}
                </button>

                {logindata?.success === false &&
                    <p className={style.error}>{logindata.message}</p>
                }

            </form>
        </>
    )
}
async function HandleSignUp(previousData, formData, setActivation, isOnline) {
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
        if (!isOnline) {
            return { success: false, message: "Check Internet Connection" };
        }
        name = name.trim();
        email = email.trim().toLowerCase();
        let object = {
            name: name,
            email: email,
            password: password
        }
        const res = await fetch(`https://expense-tracker-two-eta-98.vercel.app/SignUp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(object)
        });
        let result = await res.json();
        if (!res.ok || !result.success) {
            setActivation(false);
            return { success: false, message: result.message };
        }
        localStorage.setItem("userId", result.message);
        setActivation(true);
        return { success: true, message: "Signup Successfully." };
    }
    catch (error) {
        console.error("SIGNUP FRONTEND ERROR:", error);

        return {
            success: false,
            message: error.message || "Server Error"
        };
    }
}

async function HandleLogin(previousData, formData, setActivation, isOnline) {
    let name = formData.get("user");
    let password = formData.get("password");

    if (!name || !password) {
        return {
            success: false,
            message: "All fields Required"
        };
    }

    if (isOnline) {
        try {
            let message = {
                name: name,
                password: password
            };

            let res = await fetch(
                `https://expense-tracker-two-eta-98.vercel.app/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify(message)
                }
            );

            let result = await res.json();

            if (!res.ok || !result.success) {
                setActivation(false);

                return {
                    success: false,
                    message: result.message || "Login failed"
                };
            }

            localStorage.setItem("userId", result.message);
            setActivation(true);

            return {
                success: true
            };

        } catch (error) {
            console.error("LOGIN FRONTEND ERROR:", error);
            setActivation(false);

            return {
                success: false,
                message: error.message || "Server Error"
            };
        }
    } else {
        return {
            success: false,
            message: "Check Internet Connection"
        };
    }
}