import React, { useState, useEffect, useContext } from "react";
import "./Settings.css";
import { CategoryContext, Online } from "./App";

export default function Settings({ mode, activation, setActivation, toggleMode }) {
    const isOnline = useContext(Online);
    const { categories, setCategories, fetchCategories } = useContext(CategoryContext);
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        userId: ""
    });
    const [loadingUser, setLoadingUser] = useState(false);

    const [newCategoryName, setNewCategoryName] = useState("");
    const [selectedColor, setSelectedColor] = useState("#3B82F6");
    const [categoryPending, setCategoryPending] = useState(false);

    const [notification, setNotification] = useState({ type: "", message: "" });

    const isDarkMode = mode === "dark";
    const userInitial = userData.name
        ? userData.name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part.charAt(0).toUpperCase()).join("")
        : "U";

    const colorPalette = [
        { name: "Blue", hex: "#3B82F6" },
        { name: "Emerald", hex: "#10B981" },
        { name: "Purple", hex: "#8B5CF6" },
        { name: "Coral", hex: "#EF4444" },
        { name: "Amber", hex: "#F59E0B" },
        { name: "Pink", hex: "#EC4899" },
        { name: "Cyan", hex: "#06B6D4" },
        { name: "Teal", hex: "#14B8A6" },
    ];

    const showMessage = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => {
            setNotification({ type: "", message: "" });
        }, 4000);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoadingUser(true);
                const res = await fetch("https://expense-tracker-two-eta-98.vercel.app/CheckAuth", {
                    method: "GET",
                    credentials: "include"
                });
                const data = await res.json();
                if (data.success) {
                    setUserData({
                        name: data.name || "User",
                        email: data.email || "",
                        userId: data.userId || ""
                    });
                    console.log("email:", data.email);
                    console.log("userId", data.userId);
                    if (typeof setActivation === "function") {
                        setActivation(true);
                    }
                }
            } catch (err) {
                console.error("Error fetching user data from CheckAuth:", err);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUserData();
    }, [setActivation]);

    const handleThemeChange = (targetMode) => {
        if (mode !== targetMode && typeof toggleMode === "function") {
            toggleMode();
        }
        localStorage.setItem("theme", targetMode);
        document.body.className = targetMode;
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        const trimmed = newCategoryName.trim();

        if (!trimmed) {
            showMessage("error", "Please enter a category name");
            return;
        }

        if (!isOnline) {
            showMessage("error", "Cannot add category while offline. Check connection.");
            return;
        }

        setCategoryPending(true);
        try {
            const payload = {
                category: trimmed,
                categoryName: trimmed,
                name: trimmed,
                color: selectedColor
            };

            const res = await fetch("https://expense-tracker-two-eta-98.vercel.app/categories", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                showMessage("error", data.message || "Failed to add category");
                setCategoryPending(false);
                return;
            }

            const savedItem = data.category || {
                name: trimmed,
                category: trimmed,
                color: selectedColor
            };

            const categoryList = Array.isArray(categories) ? categories : [];
            const updated = [
                ...categoryList.filter(c => (c.name || c.category || c) !== trimmed),
                savedItem
            ];

            if (typeof setCategories === "function") {
                setCategories(updated);
            }
            if (typeof fetchCategories === "function") {
                fetchCategories();
            }

            setNewCategoryName("");
            showMessage("success", data.message || `Category "${trimmed}" added successfully!`);
        } catch (err) {
            console.error("Add category error:", err);
            showMessage("error", "An error occurred while adding category");
        } finally {
            setCategoryPending(false);
        }
    };

    return (
        <div className="settings-page">
            <div className={`settings-container ${isDarkMode ? "dark-mode" : "light-mode"}`}>

                <div className="settings-header">
                    <h1>Settings</h1>
                    <p>Manage your account profile, theme appearance, and transaction categories</p>
                </div>

                {notification.message && (
                    <div className={`settings-alert ${notification.type}`}>
                        <span>
                            <i className={`fa-solid ${notification.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}`} style={{ marginRight: "8px" }}></i>
                            {notification.message}
                        </span>
                        <button className="alert-close" onClick={() => setNotification({ type: "", message: "" })}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                )}

                <div className="settings-card profile-card">
                    <div className="card-title-group">
                        <div className="card-icon">
                            <i className="fa-solid fa-user-gear"></i>
                        </div>
                        <div>
                            <h2>Account & Profile</h2>
                            <p>Your user profile information and email address</p>
                        </div>
                    </div>

                    <div className="profile-content">
                        <div className="profile-top">
                            <div className="avatar-wrapper">
                                <div className="avatar">
                                    {loadingUser ? (
                                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "20px" }}></i>
                                    ) : (
                                        userInitial
                                    )}
                                </div>
                                <span
                                    className="online-indicator"
                                    title={isOnline ? "Online" : "Offline"}
                                    style={{ backgroundColor: isOnline ? "#10b981" : "#ef4444" }}
                                ></span>
                            </div>

                            <div className="profile-identity">
                                <h3>
                                    {userData.name || "Signed In User"}
                                    <span className="badge-verified">
                                        <i className="fa-solid fa-circle-check"></i> Active
                                    </span>
                                </h3>
                                <div className="profile-email-row">
                                    <i className="fa-solid fa-envelope" style={{ opacity: 0.7 }}></i>
                                    <span>{userData.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-fields-grid">
                            <div className="info-field">
                                <label>
                                    <i className="fa-solid fa-user"></i> Username
                                </label>
                                <div className="field-input-box">
                                    <input
                                        type="text"
                                        value={userData.name || "Loading..."}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="info-field">
                                <label>
                                    <i className="fa-solid fa-at"></i> Email Address
                                </label>
                                <div className="field-input-box">
                                    <input
                                        type="email"
                                        value={userData.email || ""}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="profile-meta-row">
                            <span className="meta-chip">
                                <i className="fa-solid fa-wifi" style={{ color: isOnline ? "#10b981" : "#ef4444" }}></i>
                                Connectivity: {isOnline ? "Connected" : "Offline"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="settings-card theme-card-section">
                    <div className="card-title-group">
                        <div className="card-icon">
                            <i className="fa-solid fa-circle-half-stroke"></i>
                        </div>
                        <div>
                            <h2>Appearance Mode</h2>
                            <p>Switch between light and dark visual presentation</p>
                        </div>
                    </div>

                    <div className="theme-selector-grid">
                        <div
                            className={`theme-card ${!isDarkMode ? "active" : ""}`}
                            onClick={() => handleThemeChange("light")}
                        >
                            <div className="theme-preview theme-preview-light">
                                <div className="preview-bar" style={{ background: "#cbd5e1" }}></div>
                                <div className="preview-bar short" style={{ background: "#93c5fd" }}></div>
                                <div className="preview-dots">
                                    <span className="preview-dot" style={{ background: "#3b82f6" }}></span>
                                    <span className="preview-dot" style={{ background: "#10b981" }}></span>
                                    <span className="preview-dot" style={{ background: "#f59e0b" }}></span>
                                </div>
                            </div>
                            <div className="theme-info">
                                <div className="theme-info-left">
                                    <i className="fa-solid fa-sun" style={{ color: "#f59e0b" }}></i>
                                    <div>
                                        <h4>Light Mode</h4>
                                    </div>
                                </div>
                                {!isDarkMode && (
                                    <span className="active-check">
                                        <i className="fa-solid fa-check"></i>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div
                            className={`theme-card ${isDarkMode ? "active" : ""}`}
                            onClick={() => handleThemeChange("dark")}
                        >
                            <div className="theme-preview theme-preview-dark">
                                <div className="preview-bar" style={{ background: "#334155" }}></div>
                                <div className="preview-bar short" style={{ background: "#38bdf8" }}></div>
                                <div className="preview-dots">
                                    <span className="preview-dot" style={{ background: "#38bdf8" }}></span>
                                    <span className="preview-dot" style={{ background: "#34d399" }}></span>
                                    <span className="preview-dot" style={{ background: "#fbbf24" }}></span>
                                </div>
                            </div>
                            <div className="theme-info">
                                <div className="theme-info-left">
                                    <i className="fa-solid fa-moon" style={{ color: "#38bdf8" }}></i>
                                    <div>
                                        <h4>Dark Mode</h4>
                                    </div>
                                </div>
                                {isDarkMode && (
                                    <span className="active-check">
                                        <i className="fa-solid fa-check"></i>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="quick-toggle-bar">
                        <div className="quick-toggle-text">
                            <i className={`fa-solid ${isDarkMode ? "fa-moon" : "fa-sun"}`}></i>
                            <span>Active Theme: <strong>{isDarkMode ? "Dark Theme" : "Light Theme"}</strong></span>
                        </div>
                        <button
                            type="button"
                            className="toggle-switch-btn"
                            onClick={() => handleThemeChange(isDarkMode ? "light" : "dark")}
                        >
                            <i className={`fa-solid ${isDarkMode ? "fa-sun" : "fa-moon"}`}></i>
                            Switch to {isDarkMode ? "Light Mode" : "Dark Mode"}
                        </button>
                    </div>
                </div>

                <div className="settings-card categories-card">
                    <div className="card-title-group">
                        <div className="card-icon">
                            <i className="fa-solid fa-tags"></i>
                        </div>
                        <div>
                            <h2>Category Management</h2>
                            <p>Add new transaction categories and view existing ones</p>
                        </div>
                    </div>

                    <form onSubmit={handleAddCategory} className="category-add-form">
                        <div className="category-input-row">
                            <input
                                type="text"
                                className="category-text-input"
                                placeholder="Enter category name (e.g. Groceries, Gym, Salary)"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                maxLength={30}
                                disabled={categoryPending}
                            />

                            <div className="color-picker-wrapper">
                                <input
                                    type="color"
                                    className="color-picker-input"
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    title="Choose Custom Color"
                                />
                            </div>
                        </div>

                        <div className="palette-presets">
                            <span style={{ fontSize: "0.85rem", fontWeight: "600", marginRight: "4px" }}>
                                Preset Colors:
                            </span>
                            {colorPalette.map((col) => (
                                <button
                                    key={col.hex}
                                    type="button"
                                    className={`palette-dot ${selectedColor.toLowerCase() === col.hex.toLowerCase() ? "selected" : ""}`}
                                    style={{ backgroundColor: col.hex }}
                                    onClick={() => setSelectedColor(col.hex)}
                                    title={col.name}
                                />
                            ))}
                        </div>

                        <div className="category-preview-bar">
                            <span>Preview:</span>
                            <span
                                className="preview-badge"
                                style={{ backgroundColor: selectedColor }}
                            >
                                <i className="fa-solid fa-tag" style={{ fontSize: "11px" }}></i>
                                {newCategoryName.trim() || "Sample Category"}
                            </span>
                        </div>

                        <button
                            type="submit"
                            className="add-category-btn"
                            disabled={categoryPending || !newCategoryName.trim()}
                        >
                            {categoryPending ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    Adding Category...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-plus"></i>
                                    Add Category
                                </>
                            )}
                        </button>
                    </form>

                    <div className="category-list-section">
                        <div className="category-list-header">
                            <h3>Existing Categories</h3>
                            <span className="category-count">
                                {Array.isArray(categories) ? categories.length : 0} Available
                            </span>
                        </div>

                        {Array.isArray(categories) && categories.length > 0 ? (
                            <div className="category-chips-grid">
                                {categories.map((cat, index) => {
                                    const catName = typeof cat === "string" ? cat : (cat.name || cat.category || "Unnamed");
                                    const catColor = (typeof cat === "object" && cat.color) ? cat.color : "#3B82F6";
                                    return (
                                        <div key={cat._id || index} className="category-chip">
                                            <span
                                                className="chip-color-dot"
                                                style={{ backgroundColor: catColor }}
                                            ></span>
                                            <span>{catName}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="category-empty-state">
                                <i className="fa-solid fa-folder-open" style={{ fontSize: "2rem", marginBottom: "8px", opacity: 0.5 }}></i>
                                <p>No categories found. Add your first category using the form above!</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}