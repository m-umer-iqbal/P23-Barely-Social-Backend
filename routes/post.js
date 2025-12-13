import express from "express";
import { Post } from "../models/post.js"
import { User } from "../models/user.js";

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
    const userId = req.query.userId;
    const category = req.query.category;

    try {
        if (category === "following") {
            const loggedInUserProfile = await User.findById(userId)
            const posts = await Post.find({
                author: { $in: loggedInUserProfile.following }
            }).populate("author", "fullname username");
            res.status(200).json({
                success: true,
                message: "User's Posts Fetched Successfully",
                posts: posts
            })
        } else {
            const posts = await Post.find({ author: userId }).populate("author", "fullname username")
            res.status(200).json({
                success: true,
                message: "User's Posts Fetched Successfully",
                posts: posts
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in Fetching Posts"
        })
    }
})

router.get("/update", async (req, res) => {
    try {
        const id = req.query.id
        const reacted = req.query.reacted
        const userId = req.query.userId

        if (reacted === "like") {
            await Post.findByIdAndUpdate(id, { $pull: { dislikes: userId } })

            const post = await Post.findById(id)

            if (!post.likes.includes(userId)) {
                await Post.findByIdAndUpdate(id, { $push: { likes: userId } })
            }

            return res.status(200).json({
                success: true,
                message: "Likes Updated Successfully"
            })

        } else if (reacted === "dislike") {
            await Post.findByIdAndUpdate(id, { $pull: { likes: userId } })

            const post = await Post.findById(id)

            if (!post.dislikes.includes(userId)) {
                await Post.findByIdAndUpdate(id, { $push: { dislikes: userId } })
            }

            return res.status(200).json({
                success: true,
                message: "Dislikes Updated Successfully"
            })

        } else {
            await Post.findByIdAndUpdate(id, { $pull: { likes: userId, dislikes: userId } })

            return res.status(200).json({
                success: true,
                message: "Reaction Removed Successfully"
            })
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in Like/Dislike Updation"
        })
    }
})

export { router as post };