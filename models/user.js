import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose"
import findOrCreate from "mongoose-findorcreate";
const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },
    facebookId: { type: String, unique: true, sparse: true },
    fullname: String,
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    profilePicture: String,  // URL to image
    bio: String,
    followers: [mongoose.Schema.Types.ObjectId],   // Array of user IDs who follow this user
    following: [mongoose.Schema.Types.ObjectId],   // Array of user IDs this user follows
});

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)

export const User = mongoose.model("User", userSchema);