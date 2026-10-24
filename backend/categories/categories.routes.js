import express from "express";
import { addCategory, getCategories, deleteCategory } from "./categories.controllers.js";

const categoryRouter = express.Router();

categoryRouter.post("/categories", addCategory);
categoryRouter.get("/categories", getCategories);
categoryRouter.post("/deleteCategory", deleteCategory);

export default categoryRouter;
