import { useActionState, useContext, useEffect, useState } from 'react'
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
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [isVerify, setIsVerify] = useState(false);
    const [otpPending, setOtpPending] = useState(false);
    const [verifyPending, setVerifyPending] = useState(false);
    const [otpMessage, setOtpMessage] = useState("");
    const [otpError, setOtpError] = useState("");
    const [resendSeconds, setResendSeconds] = useState(0);

    useEffect(() => {
        if (resendSeconds <= 0) return;

        const timer = setTimeout(() => {
            setResendSeconds((seconds) => seconds - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [resendSeconds]);
    const API_URL = "https://expense-tracker-two-eta-98.vercel.app";


    const handleSendOtp = async () => {
        if (!email.trim()) {
            setOtpError("Please enter your email address.");
            return;
        }

        if (otpPending || resendSeconds > 0 || isVerify) {
            return;
        }

        setOtpPending(true);
        setOtpError("");
        setOtpMessage("");

        try {
            const response = await fetch(`${API_URL}/sendotp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to send OTP.");
            }

            setOtpMessage(result.message || "OTP sent successfully.");
            setResendSeconds(60);
        } catch (error) {
            setOtpError(error.message || "Unable to send OTP.");
        } finally {
            setOtpPending(false);
        }
    };


    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            setOtpError("Please enter the OTP.");
            return;
        }

        setVerifyPending(true);
        setOtpError("");
        setOtpMessage("");
        setIsVerify(false);

        try {
            const response = await fetch(`${API_URL}/verifyotp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim(),
                    otp: otp.trim(),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Invalid OTP.");
            }

            setIsVerify(true);
            setOtpMessage(result.message || "Email verified successfully.");
        } catch (error) {
            setIsVerify(false);
            setOtpError(error.message || "OTP verification failed.");
        } finally {
            setVerifyPending(false);
        }
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
        setIsVerify(false);
        setOtp("");
        setOtpMessage("");
        setOtpError("");
    };

    const handleSubmit = (event) => {
        if (!isVerify) {
            event.preventDefault();
            setOtpError("Please verify your email before signing up.");
        }
    };

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

            <form
                action={action}
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                }}
            >
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
                        autoComplete="username"
                        required
                    />
                </div>

                <div className={style.row}>
                    <label htmlFor="email">
                        <i className="fa-solid fa-envelope"></i>
                        Email address
                    </label>

                    <div className={style.otpRow}>
                        <input
                            className={`${style.input} ${mode === "dark" ? style.dinput : ""}`}
                            type="email"
                            name="email"
                            id="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={handleEmailChange}
                            autoComplete="email"
                            required
                        />


                        <button
                            type="button"
                            className={`${style.otpButton} ${mode === "dark" ? style.dButton : ""}`}
                            onClick={handleSendOtp}
                            disabled={otpPending || verifyPending || isVerify || resendSeconds > 0}
                        >
                            {otpPending
                                ? "Sending..."
                                : resendSeconds > 0 ? `Resend in ${resendSeconds}s`
                                    : "Send OTP"}
                        </button>
                    </div>
                </div>

                <div className={style.row}>
                    <label htmlFor="otp">
                        <i className="fa-solid fa-shield-halved"></i>
                        Email OTP
                    </label>

                    <div className={style.otpRow}>
                        <input
                            className={`${style.input} ${mode === "dark" ? style.dinput : ""}`}
                            type="text"
                            id="otp"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(event) => {
                                setOtp(event.target.value);
                                setOtpError("");
                            }}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                        />

                        <button
                            type="button"
                            className={`${style.otpButton} ${mode === "dark" ? style.dButton : ""}`}
                            onClick={handleVerifyOtp}
                            disabled={verifyPending || otpPending || isVerify}
                        >
                            {verifyPending ? "Verifying..." : "Verify"}
                        </button>
                    </div>

                    {isVerify && (
                        <span className={style.success}>
                            <i className="fa-solid fa-circle-check"></i>
                            Email verified successfully
                        </span>
                    )}
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
                        autoComplete="new-password"
                        minLength={8}
                        required
                    />

                    <span className={style.hint}>
                        Use at least 8 characters.
                    </span>
                </div>

                {otpError && (
                    <p className={style.error}>{otpError}</p>
                )}

                {otpMessage && !otpError && (
                    <p className={isVerify ? style.success : style.hint}>
                        {otpMessage}
                    </p>
                )}

                <button
                    type="submit"
                    className={`${style.primaryButton} ${mode === "dark" ? style.dbutton : ""}`}
                    disabled={pending || !isVerify}
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

                {data?.success === false && (
                    <p className={style.error}>{data.message}</p>
                )}
            </form>
        </>
    );
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

            <form action={loginaction} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>

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