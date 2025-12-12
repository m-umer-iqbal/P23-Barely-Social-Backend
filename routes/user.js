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

router.get("/follow", async (req, res) => {
    try {
        const loggedInUserId = req.query.userId;
        const followingUserId = req.query.id;
        const action = req.query.following;

        const followingUser = await User.findById(followingUserId);
        const currentUser = await User.findById(loggedInUserId);

        // ✅ Convert ObjectId arrays → strings
        const currentFollowing = currentUser.following.map(String);
        const targetFollowers = followingUser.followers.map(String);

        if (action === "follow") {
            if (!currentFollowing.includes(followingUserId)) {
                await User.findByIdAndUpdate(loggedInUserId, {
                    $push: { following: followingUserId },
                });
                await User.findByIdAndUpdate(followingUserId, {
                    $push: { followers: loggedInUserId },
                });

                return res.json({
                    success: true,
                    message: "User followed successfully",
                });
            }

            return res.json({
                success: false,
                message: "Already following this user",
            });
        }

        if (action === "remove") {
            if (currentFollowing.includes(followingUserId)) {
                await User.findByIdAndUpdate(loggedInUserId, {
                    $pull: { following: followingUserId },
                });
                await User.findByIdAndUpdate(followingUserId, {
                    $pull: { followers: loggedInUserId },
                });

                return res.json({
                    success: true,
                    message: "User unfollowed successfully",
                });
            }

            return res.json({
                success: false,
                message: "You are not following this user",
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating follow state",
        });
    }
});

export { router as user };