import express from "express";
import { Post } from "../models/post.js"
import { User } from "../models/user.js";

import { uploadFromMulter } from "../middleware/multer.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const router = express.Router()

router.post("/update-content", uploadFromMulter.single("image"), async (req, res) => {
    const postId = req.query.postId;
    const userId = req.query.userId;
    let imageUrl = null
    if (req.file) {
        imageUrl = await uploadOnCloudinary(req.file.path);
    }
    try {
        const post = await Post.findByIdAndUpdate(postId, {
            author: userId,
            content: req.body.content,
            image: imageUrl
        })
        res.status(200).json({
            success: true,
            message: "Post Updated Successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in Updating Post"
        })
    }
})

router.post("/:slug", uploadFromMulter.single("image"), async (req, res) => {
    try {
        let imageUrl = null;
        // If user uploaded image
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            imageUrl = uploadResult;
        }
        const post = new Post({
            author: req.params.slug,
            content: req.body.content,
        })
        if (imageUrl) {
            post.image = imageUrl
        }
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
            }).populate("author", "fullname username profilePicture");
            res.status(200).json({
                success: true,
                message: "User's Posts Fetched Successfully",
                posts: posts
            })
        } else if (category === "myPosts") {
            const posts = await Post.find({ author: userId }).populate("author", "fullname username profilePicture")
            res.status(200).json({
                success: true,
                message: "User's Posts Fetched Successfully",
                posts: posts
            })
        } else {
            const loggedInUserProfile = await User.findById(userId)
            const posts = await Post.find({
                author: { $nin: [...loggedInUserProfile.following, userId] }
            }).populate("author", "fullname username profilePicture");
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

router.get("/delete", async (req, res) => {
    const postId = req.query.id
    try {
        await Post.findByIdAndDelete(postId)
        res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            success: true,
            message: "Error occur in deleting post."
        })
    }
})
export { router as post };