import express from "express";
import path from "path";
import cors from "cors";

import connectDB from "./database/mongodb.js";

import transactionRouter from "./transactions/transactions.routes.js";
import userRouter from "./users/users.routes.js";

const app = express();

/* ---------------- DATABASE ---------------- */
connectDB();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors());
app.use(express.json());

/* ---------------- API ROUTES ---------------- */
app.use("/", transactionRouter);
app.use("/", userRouter);

/* ---------------- FRONTEND ---------------- */
const staticPath = path.join(process.cwd(), "..", "frontend", "build");

app.use(express.static(staticPath));

/* ---------------- REACT ROUTES ---------------- */
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

export default app;