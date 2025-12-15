import 'dotenv/config'
import express from "express"
import cors from "cors"
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import session from "express-session"
import * as path from "path"

import { User } from "./models/user.js"
import passport from "./config/passport.js";
import { auth } from "./routes/auth.js";
import { post } from "./routes/post.js";
import { user } from "./routes/user.js";

import { uploadFromMulter } from "./middleware/multer.js"
import { uploadOnCloudinary } from "./utils/cloudinary.js"

const app = express()
const port = 3000

// Middlewares
app.use(cors({
    origin: "http://localhost:5173", // React app port
    credentials: true
})) // to connect backend and frontend
app.use(bodyParser.urlencoded({ extended: true })) // for body parser to work correctly
app.use(bodyParser.json()) // for body parser to work correctly
app.use(session({
    secret: process.env.SESSION_SECRET_STRING,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to false for HTTP in development
        maxAge: 24 * 60 * 1000 // 24 hours
    }
})) // by express-session package to make and store sessions
app.use(passport.initialize()) // by passport to initialize the passport functionality or something I am not sure
app.use(passport.session()) // this middleware allow the passport to make and handle the sessions
// For serving uploaded files during development
app.use('/temp', express.static(path.join(process.cwd(), 'public/temp')))

// Routes
app.use("/auth", auth);
app.use("/post", post);
app.use("/user", user);

// Routes
app.get('/', (req, res) => {
    res.send('Barely Social Backend')
})

app.post('/create-account', (req, res) => {
    User.register({ username: req.body.username, fullname: req.body.fullname, email: req.body.email }, req.body.password, (err, user) => {
        if (err) {
            let message = "Registration Error";
            if (err.name === "UserExistsError") {
                message = "User Already Exist."
            }
            res.status(400).json({
                success: false,
                message: message
            })
        } else {
            passport.authenticate("local")(req, res, () => {
                res.status(200).json({
                    success: true,
                    message: "User registered and logged in",
                    user: {
                        username: req.user.username,
                        fullname: req.user.fullname,
                        email: req.user.email
                    }
                });
            });
        }
    })
})

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            res.status(400).json({
                success: false,
                message: "Error in authentication process."
            })
        }
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid username or password."
            })
        }
        req.login(user, (err) => {
            if (err) {
                res.status(400).json({
                    success: false,
                    message: "Error creating session."
                })
            }
            res.status(200).json({
                success: true,
                message: "User Logged In.",
                user: {
                    id: req.user._id,
                    username: user.username,
                    fullname: user.fullname,
                    email: user.email,
                    bio: req.user.bio,
                    followers: req.user.followers,
                    following: req.user.following,
                    profilePicture: req.user.profilePicture
                }
            });
        });
    })(req, res, next);
});

app.get('/check-auth', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json({
            authenticated: true,
            message: "User is Authenticated.",
            user: {
                id: req.user._id,
                username: req.user.username,
                fullname: req.user.fullname,
                email: req.user.email,
                bio: req.user.bio,
                followers: req.user.followers,
                following: req.user.following,
                profilePicture: req.user.profilePicture
            }
        });
    } else {
        res.status(401).json({
            authenticated: false
        });
    }
});

app.post("/update/:slug", uploadFromMulter.single("profilePicture"), async (req, res) => {
    try {
        let imageUrl = null;

        // If user uploaded image
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            imageUrl = uploadResult;
        }

        const updateData = {
            fullname: req.body.fullname,
            bio: req.body.bio,
            email: req.body.email,
        };

        // Only add profilePicture if we have a URL
        if (imageUrl) {
            updateData.profilePicture = imageUrl;
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.params.slug },
            updateData,
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Profile Updated",
            user: updatedUser
        });
    } catch (error) {
        console.error("Update error:", error);
        res.status(400).json({
            success: false,
            message: "Update Error: " + error.message
        });
    }
});

app.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("http://localhost:5173");
    });
});

// Connect to database and start server
mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
    .then(() => {
        console.log("Connected to DB");

        // Start server only after successful database connection
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`)
        });
    })
    .catch(err => {
        console.error("Error in connecting database:", err.message);
        process.exit(1); // Exit the process with failure code
    });