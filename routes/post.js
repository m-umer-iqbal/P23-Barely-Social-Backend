import express from "express";
import { Post } from "../models/post.js"

const router = express.Router()

router.post("/:slug", async (req, res) => {
    try {
        const post = new Post({
            author: req.params.slug,
            content: req.body.content
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

router.get("/", async (req, res) => {
    try {
        const posts = await Post.find({}).populate("author", "fullname username")
        res.status(200).json({
            success: true,
            message: "Posts Fetched Successfully",
            posts: posts
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in Posting"
        })
    }
})

router.get("/update", async (req, res) => {
    try {
        const id = req.query.id
        const reacted = req.query.reacted
        const userId = req.query.userId
        if (reacted === "like") {
            const remove = await Post.findByIdAndUpdate(id, { $pull: { dislikes: userId } })
            await remove.save()
            const updation = await Post.findByIdAndUpdate(id, { $push: { likes: userId } })
            await updation.save()
            res.status(200).json({
                success: true,
                message: "Likes Updated Successfully"
            })
        } else {
            const remove = await Post.findByIdAndUpdate(id, { $pull: { likes: userId } })
            await remove.save()
            const updation = await Post.findByIdAndUpdate(id, { $push: { dislikes: userId } })
            await updation.save()
            res.status(200).json({
                success: true,
                message: "Dislikes Updated Successfully"
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in Like or Dislike Count Updation"
        })
    }
})

export { router as post };