const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Start OAuth process
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// Callback after Google authentication
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    (req, res) => {
        if (!req.user) {
            return res.redirect("http://localhost:3000/?error=Authentication%20Failed");
        }

        const token = jwt.sign(
            { id: req.user._id, name: req.user.name, email: req.user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        console.log("Token généré :", token);

        // Redirection to the frontend with the token in the URL
        res.redirect(`https://task-manager-front-neon.vercel.app/oauth-callback?token=${token}`);
    }
);


module.exports = router;
