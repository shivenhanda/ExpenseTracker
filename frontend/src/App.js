import { Link, Route, Routes } from "react-router-dom";
import { useState, useEffect, createContext } from "react";
import { Analytics } from '@vercel/analytics/react';
import "./App.css"
import Home from "./Home";
import Reports from "./Reports";
import Calendar from "./Calendar";
import ResetPassword from "./ResetPassword";
import DeleteAccount from "./DeleteAccount";
import About from "./About";
import ForgetPassword from "./ForgetPassword";
import Settings from "./Settings";

export const Online = createContext(false)
export const CategoryContext = createContext({ categories: [], setCategories: () => {}, fetchCategories: () => {} })
export default function App() {
  const [activation, setActivation] = useState(false)
  const [isOnline, setOnline] = useState(navigator.onLine);
  const [Transaction, setTransaction] = useState([])
  const [categories, setCategories] = useState([]);
  const [mode, setMode] = useState("light");
  function toggleMode() {
    setMode(prev => (prev === "light" ? "dark" : "light"));
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        "https://expense-tracker-two-eta-98.vercel.app/categories",
        {
          method: "GET",
          credentials: "include"
        }
      );
      const result = await res.json();
      let list = [];
      if (Array.isArray(result)) {
        list = result;
      } else if (result.success && Array.isArray(result.categories)) {
        list = result.categories;
      } else if (result.success && Array.isArray(result.message)) {
        list = result.message;
      }
      setCategories(list);
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

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
        } else {
          setActivation(false);
        }

      } catch (error) {
        console.error("Auth check error:", error);
        setActivation(false);
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
  useEffect(() => {
    if (activation) {
      if (!isOnline) {
        alert("Check internet connection");
        return;
      }
      const fetchTransactions = async () => {
        try {
          const res = await fetch(`https://expense-tracker-two-eta-98.vercel.app/ViewData`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({})
          });
          const result = await res.json();
          if (result.success && Array.isArray(result.message)) {
            const sorted = [...result.message].sort(
              (a, b) => new Date(b.date) - new Date(a.date)
            );
            setTransaction(sorted);
            await fetchCategories();
          } else {
            alert(result.message || "Failed to fetch transactions");
          }
        } catch (error) {
          console.error("Fetch transactions error:", error);
          alert("Failed to fetch transactions");
        }
      };
      fetchTransactions();
    }
  }, [activation, isOnline])
  async function Delete(data) {
    if (!data?._id) {
      alert("Transaction ID is missing");
      return;
    }
    if (!isOnline) {
      alert("Check internet connection");
      return;
    }
    try {
      let define = {
        id: data._id
      };
      let res = await fetch(
        `https://expense-tracker-two-eta-98.vercel.app/Delete`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(define)
        }
      );
      let result = await res.json();
      if (!res.ok || !result.success) {
        alert(
          result.message ||
          "Failed to delete transaction"
        );
        return;
      }
      setTransaction((prev) => {
        const newData = [...prev];
        const actualIndex = newData.findIndex(
          (item) => item._id === data._id
        );

        if (actualIndex !== -1) {
          newData.splice(actualIndex, 1);
        }

        return newData;
      });

      alert(result.message);

    } catch (error) {
      console.error("Delete transaction error:", error);
      alert("Failed to delete transaction");
    }
  }
  const handleLogout = () => {
    localStorage.clear();
    setCategories([]);
    window.location.href =
      "https://expense-tracker-two-eta-98.vercel.app/logout";
    setActivation(false)
  };
  return (
    <Online.Provider value={isOnline}>
      <CategoryContext.Provider value={{ categories, setCategories, fetchCategories }}>
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
              <Link to="/Settings" className={`Settings ${mode === "dark" ? "darkLink" : ""}`}>
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
          <main id="main-content">
            <Routes>
              <Route path="/Calendar" element={<Calendar activation={activation} mode={mode} Transaction={Transaction} setTransaction={setTransaction} Delete={Delete} categories={categories} />} />
              <Route path="/Reports" element={<Reports activation={activation} mode={mode} Transaction={Transaction} setTransaction={setTransaction} Delete={Delete} categories={categories} />} />
              <Route path="/About" element={<About mode={mode} />} />
              <Route path="/ResetPassword" element={<ResetPassword activation={activation} mode={mode} />} />
              <Route path="/ForgetPassword" element={<ForgetPassword mode={mode} />} />
              <Route path="/DeleteAccount" element={<DeleteAccount mode={mode} handleLogout={handleLogout} />} />
              <Route path="/Settings" element={<Settings activation={activation} setActivation={setActivation} mode={mode} setMode={setMode} toggleMode={toggleMode} handleLogout={handleLogout} />} />
              <Route path="*" element={<Home activation={activation} setActivation={setActivation} mode={mode} Transaction={Transaction} setTransaction={setTransaction} Delete={Delete} categories={categories} setCategories={setCategories} fetchCategories={fetchCategories} />} />
            </Routes>
          </main>
        </div>
        <Analytics />
      </CategoryContext.Provider>
    </Online.Provider>
  )
}