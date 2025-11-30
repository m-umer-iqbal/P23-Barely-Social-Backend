import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, maxLength: 500 },
    image: String,
    likes: [mongoose.Schema.Types.ObjectId],
    dislikes: [mongoose.Schema.Types.ObjectId],
    createdAt: { type: Date, default: Date.now }
});

export const Post = mongoose.model("Post", postSchema);