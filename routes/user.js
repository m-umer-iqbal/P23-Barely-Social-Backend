import express from "express";
import { User } from "../models/user.js"

const router = express.Router()

router.get("/", async (req, res) => {
    const category = req.query.category;
    const userId = req.query.userId;

    try {
        let users = [];
        let msg = ""

        if (category === "follow") {
            // Strangers: Users you are NOT following
            // Get users who are NOT in your following list AND not yourself
            const currentUser = await User.findById(userId);
            const followingIds = currentUser.following.map(id => id.toString());

            users = await User.find({
                _id: {
                    $ne: userId,
                    $nin: followingIds  // Exclude users you're already following
                }
            });
            msg = "Users fetched successfully"
        }
        
        if (category === "following") {
            // Following: Users you ARE following
            // Get users whose IDs are in your following array
            const currentUser = await User.findById(userId);
            const followingIds = currentUser.following.map(id => id.toString());
            
            users = await User.find({
                _id: { $in: followingIds }
            });
            msg = "Following Users fetched successfully"
        }

        res.status(200).json({
            success: true,
            message: msg,
            usersList: users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occurred while fetching users"
        });
    }
});

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