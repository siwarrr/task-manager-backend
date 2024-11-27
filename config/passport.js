const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('Google Profile:', profile); // Log du profil utilisateur retourné par Google
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
            user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                password: 'google-oauth',
            });
            console.log('New User Created:', user);
        }
        return done(null, user);
    } catch (error) {
        console.error('Error in Google Strategy:', error);
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
});
