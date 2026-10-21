import express from "express";
import { addCategory, getCategories } from "./categories.controllers.js";

const categoryRouter = express.Router();

categoryRouter.post("/categories", addCategory);
categoryRouter.get("/categories", getCategories);

export default categoryRouter;
