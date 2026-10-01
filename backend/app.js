import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookieParser";
import connectDB from "./database/mongodb.js";
import transactionRouter from "./transactions/transactions.routes.js";
import userRouter from "./users/users.routes.js";

const app = express();
app.use((req, res, next) => {
    console.log("REQUEST:", req.method, req.url);
    next();
});
const corsOptions = {
    origin: "https://expensetracker-eta-navy-42.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use("/", transactionRouter);
app.use("/", userRouter);

const staticPath = path.join(
    process.cwd(),
    "..",
    "frontend",
    "build"
);

app.use(express.static(staticPath));

app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
});

connectDB()
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });

export default app;