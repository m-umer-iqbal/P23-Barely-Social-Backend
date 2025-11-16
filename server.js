import 'dotenv/config'
import express from "express"
import cors from "cors"
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import session from "express-session"
import passport from 'passport';
import { User } from "./models/user.js"
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
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
        maxAge: 15 * 60 * 1000 // 15 minutes
    }
})) // by express-session package to make and store sessions
app.use(passport.initialize()) // by passport to initialize the passport functionality or something I am not sure
app.use(passport.session()) // this middleware allow the passport to make and handle the sessions

mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log("Error in connecting database:" + err.message));

// if we use passport-local package then we have to write more code that i given on passport.org website to setup passport but since we are using passport-local-mongoose package it gives us this line that can do the heavylifting for us and give us this line that cantain that much code of passport website [This comment apply on the below 3 lines]
passport.use(User.createStrategy());
// These two lines are used to searilize the user (means making the cookie and storing user authentication data in it) and deserilize means (smashing the cookie to view internal data of the cookie to see how the user is and all of their identifications)
// Serialize user: store user._id in session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user: fetch user from DB
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/barely-social"
    // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({
            googleId: profile.id,
            fullname: profile.displayName,
            email: profile.emails[0].value,
        },
            function (err, user) {
                return cb(err, user);
            });
    }
)); // This is for login with google

// Routes
app.get('/', (req, res) => {
    res.send('Barely Social Backend')
})

app.post('/create-account', (req, res) => {
    console.log(req.body)
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
                    username: user.username,
                    fullname: user.fullname,
                    email: user.email
                }
            });
        });
    })(req, res, next);
});

app.get('/check-auth', (req, res) => {
    console.log("User in check auth:", req.user);

    if (req.isAuthenticated()) {
        res.status(200).json({
            authenticated: true,
            message: "User is Authenticated.",
            user: {
                username: req.user.username,
                fullname: req.user.fullname,
                email: req.user.email
            }
        });
    } else {
        res.status(401).json({
            authenticated: false
        });
    }
});

app.get('/auth/google',
    passport.authenticate('google', {
        scope: ["profile", "email"],
        prompt: 'select_account' // <— this forces Google to show account chooser
    })
);

app.get('/auth/google/barely-social',
    passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }),
    (req, res) => {
        res.redirect("http://localhost:5173/");
    }
);

// See Output on port
app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})