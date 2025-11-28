import express from "express";
import { Post } from "../models/post.js"

const router = express.Router()

router.post("/:slug", async (req, res) => {
    try {
        const post = new Post({
            author: req.params.slug,
            content: req.body.content,
            createdAt: Date.now()
        })
        await post.save()
        res.status(200).json({
            success: true,
            message: "Posted Successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in Posting"
        })
    }
})

export { router as post };