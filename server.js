import 'dotenv/config'
import express from "express"
import cors from "cors"
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import session from "express-session"

import { User } from "./models/user.js"
import passport from "./config/passport.js";
import { auth } from "./routes/auth.js";

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
        maxAge: 24 * 60 * 1000 // 15 minutes
    }
})) // by express-session package to make and store sessions
app.use(passport.initialize()) // by passport to initialize the passport functionality or something I am not sure
app.use(passport.session()) // this middleware allow the passport to make and handle the sessions

// Routes
app.use("/auth", auth);

mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log("Error in connecting database:" + err.message));

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
                    bio: req.user.bio
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
                bio: req.user.bio
            }
        });
    } else {
        res.status(401).json({
            authenticated: false
        });
    }
});

app.post("/update/:slug", async (req, res) => {
    try {
        await User.findOneAndUpdate(
            { _id: req.params.slug },
            { fullname: req.body.fullname, bio: req.body.bio, email: req.body.email }
        )
        res.status(200).json({
            success: true,
            message: "Profile Updated.",
            user: {
                id: req.user._id,
                username: req.user.username,
                fullname: req.user.fullname,
                email: req.user.email,
                bio: req.user.bio
            }
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Update Error."
        })
    }
})

app.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("http://localhost:5173");
    });
});

// See Output on port
app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})