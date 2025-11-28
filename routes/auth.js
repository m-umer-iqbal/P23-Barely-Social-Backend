import express from "express";
import passport from "../config/passport.js";

const router = express.Router()

router.get('/google',
    passport.authenticate('google', {
        scope: ["profile", "email"],
        prompt: 'select_account'
    })
);

router.get('/google/barely-social',
    passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }),
    (req, res) => {
        res.redirect("http://localhost:5173/home")
    }
);

router.get('/facebook',
    passport.authenticate('facebook', {
        scope: ['email', 'public_profile']
    })
);

router.get('/facebook/barely-social',
    passport.authenticate('facebook', { failureRedirect: 'http://localhost:5173/login' }),
    function (req, res) {
        res.redirect("http://localhost:5173/home");
    }
);

router.get('/github',
    passport.authenticate('github', {
        scope: ['user:email'],
        customState: 'some-state',
        authorizationParams: {
            prompt: 'select_account'
        }
    })
);

router.get('/github/barely-social',
    passport.authenticate('github', { failureRedirect: 'http://localhost:5173/login' }),
    function (req, res) {
        res.redirect('http://localhost:5173/home');
    }
);

export { router as auth };