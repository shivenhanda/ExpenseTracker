import mongoose from "mongoose";
import connectDB from "../database/mongodb.js";
import CategoryModel from "./categories.model.js";
import jwt from "jsonwebtoken";

const getAuthenticatedUserId = (req) => {
    try {
        return jwt.verify(req.cookies?.token, process.env.JWT_SECRET).userId;
    } catch {
        return null;
    }
};

export const addCategory = async (req, res) => {
    try {
        await connectDB();
        const userId = getAuthenticatedUserId(req);
        const { category, categoryName, name, color } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const finalName = (category || categoryName || name || "").trim();
        const finalColor = (color || "#3B82F6").trim();

        if (!finalName) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        let existing = await CategoryModel.findOne({
            userId,
            name: { $regex: new RegExp(`^${finalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") }
        });

        if (existing) {
            existing.color = finalColor;
            await existing.save();
            return res.json({
                success: true,
                message: "Category updated successfully",
                category: {
                    _id: existing._id,
                    name: existing.name,
                    category: existing.name,
                    color: existing.color
                }
            });
        }

        const newCategory = await CategoryModel.create({
            userId,
            name: finalName,
            color: finalColor
        });

        return res.json({
            success: true,
            message: "Category created successfully",
            category: {
                _id: newCategory._id,
                name: newCategory.name,
                category: newCategory.name,
                color: newCategory.color
            }
        });

    } catch (error) {
        console.error("ADD CATEGORY ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add category"
        });
    }
};

export const getCategories = async (req, res) => {
    try {
        await connectDB();
        const userId = getAuthenticatedUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const categories = await CategoryModel.find({ userId }).sort({ date: 1 });

        const mapped = categories.map(cat => ({
            _id: cat._id,
            name: cat.name,
            category: cat.name,
            color: cat.color
        }));

        return res.json({
            success: true,
            categories: mapped,
            message: mapped
        });

    } catch (error) {
        console.error("GET CATEGORIES ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch categories"
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        await connectDB();
        const userId = getAuthenticatedUserId(req);
        const targetId = req.params?.id || req.body?.id || req.body?.categoryId;
        const targetName = req.body?.name || req.body?.category;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        let query = { userId };
        if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
            query._id = targetId;
        } else if (targetName) {
            query.name = { $regex: new RegExp(`^${targetName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") };
        } else {
            return res.status(400).json({
                success: false,
                message: "Category ID or name is required"
            });
        }

        let deleted = await CategoryModel.findOneAndDelete(query);
        if (!deleted && targetName) {
            deleted = await CategoryModel.findOneAndDelete({
                userId,
                name: { $regex: new RegExp(`^${targetName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") }
            });
        }

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        return res.json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.error("DELETE CATEGORY ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete category"
        });
    }
};
