import { Link, Route, Routes } from "react-router-dom";
import { useState, useEffect, createContext } from "react";
import "./App.css"
import Home from "./Home";
import Reports from "./Reports";
import Calendar from "./Calendar";
import ResetPassword from "./ResetPassword";
import DeleteAccount from "./DeleteAccount";
import About from "./About";

export const Online = createContext(false)
export default function App() {
  const [activation, setActivation] = useState(false)
  const [isOnline, setOnline] = useState(navigator.onLine);
  const [, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });
  const [mode, setMode] = useState("light")
  const [checkingAuth, setCheckingAuth] = useState(true);
  function toggleMode() {
    setMode(prev => (prev === "light" ? "dark" : "light"));
  }
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(
          "https://expense-tracker-two-eta-98.vercel.app/CheckAuth",
          {
            method: "GET",
            credentials: "include"
          }
        );

        const result = await res.json();

        if (result.success) {
          setActivation(true);
          localStorage.setItem("userId", result.userId)
        } else {
          setActivation(false);
        }

      } catch (error) {
        console.error("Auth check error:", error);
        setActivation(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);
  useEffect(() => {
    localStorage.setItem("theme", mode);
    document.body.className = mode;
  }, [mode]);
  useEffect(() => {
    const updateOnlineStatus = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);
  const handleLogout = () => {
    localStorage.clear();
    window.location.href =
      "https://expense-tracker-two-eta-98.vercel.app/logout";
    setActivation(false)
  };
  if (checkingAuth) {
    return <h2>Checking authentication...</h2>;
  }
  return (
    <Online.Provider value={isOnline}>
      <div className="body">
        <h1 className={`${mode === "dark" ? "dh1" : ""}`}>Expense Tracker</h1>
        <div className="links">
          <Link to="/" className={`Dashboard
        ${mode === "dark" ? "darkLink" : ""}`}>Dashboard</Link>
          <Link to="/Calendar" className={`Calendar
        ${mode === "dark" ? "darkLink" : ""}`}>Calendar</Link>
          <Link to="/Reports" className={`Reports
        ${mode === "dark" ? "darkLink" : ""}`}>Reports</Link>
          <Link to="/About" className={`About
        ${mode === "dark" ? "darkLink" : ""}`}>About</Link>
          <div className="dropDown">
            <Link to="#" className={`Settings ${mode === "dark" ? "darkLink" : ""}`}>
              Settings
            </Link>
            <ul className="lists">
              <li className={`a
        ${mode === "dark" ? "da" : ""}`} onClick={() => handleLogout()}>Logout</li>
              <li><Link to="/ResetPassword" className={`a
        ${mode === "dark" ? "da" : ""}`}>Reset Password</Link></li>
              <li><Link to="/DeleteAccount" className={`a
        ${mode === "dark" ? "da" : ""}`}>Delete Account</Link></li>
            </ul>
          </div>
          <span className="toggle" onClick={toggleMode}>
            {mode === "light" ? (<i className="fa-regular fa-lightbulb"></i>) : (<i className="fa-solid fa-lightbulb"></i>)}
          </span>
        </div>
        <Routes>
          <Route path="/Calendar" element={<Calendar activation={activation} mode={mode} />} />
          <Route path="/Reports" element={<Reports activation={activation} mode={mode} />} />
          <Route path="/About" element={<About mode={mode} />} />
          <Route path="/ResetPassword" element={<ResetPassword activation={activation} mode={mode} />} />
          <Route path="/DeleteAccount" element={<DeleteAccount setActivation={setActivation} mode={mode} />} />
          <Route path="*" element={<Home activation={activation} setActivation={setActivation} setUser={setUser} mode={mode} />} />
        </Routes>
      </div>
    </Online.Provider>
  )
}