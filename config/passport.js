import passport from 'passport';
import { User } from "../models/user.js"
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';

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

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/barely-social"
},
    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({
            facebookId: profile.id,
            fullname: profile.displayName,
            email: profile.emails?.[0]?.value || ""
        }, function (err, user) {
            return cb(err, user);
        });
    }
));  // This is for login with facebook

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/barely-social"
},
    function (accessToken, refreshToken, profile, done) {
        User.findOrCreate({
            githubId: profile.id,
            fullname: profile.displayName,
            email: profile.emails?.[0]?.value || ""
        }, function (err, user) {
            return done(err, user);
        });
    }
)); // this is for login with github

export default passport;