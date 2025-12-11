import express from "express";
import { User } from "../models/user.js"

const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const users = await User.find({})
        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            usersList: users
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error Occur in Fetching Users"
        })
    }
})

export { router as user };