import express from "express";
import { Post } from "../models/post.js"

const router = express.Router()
const getFormattedDate = () => {
    const date = new Date();

    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };

    return date.toLocaleDateString('en-GB', options);
};

router.post("/:slug", (req, res) => {
    try {
        console.log(getFormattedDate())
        console.log(req.body)
        console.log(req.params.slug)
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