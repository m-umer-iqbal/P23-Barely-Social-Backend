import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    author: ObjectId,        // Reference to Users collection
    content: String,         // Post text content
    image: String,           // URL to uploaded image (optional)
    likes: [ObjectId],       // Array of user IDs who liked this post
    comments: [ObjectId],    // Array of comment IDs (Reference to Comments collection)
    createdAt: Date,
    updatedAt: Date
});

export const Post = mongoose.model("Post", postSchema);