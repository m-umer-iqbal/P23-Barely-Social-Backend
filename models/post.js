import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    author: mongoose.Schema.Types.ObjectId,        // Reference to Users collection
    content: { type: String, maxLength: 500 },         // Post text content
    image: String,           // URL to uploaded image (optional)
    likes: [mongoose.Schema.Types.ObjectId],       // Array of user IDs who liked this post
    dislikes: [mongoose.Schema.Types.ObjectId],    // Array of comment IDs (Reference to Comments collection)
    createdAt: Date
});

export const Post = mongoose.model("Post", postSchema);