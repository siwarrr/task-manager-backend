const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Start OAuth process
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// Callback after Google authentication
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.redirect(`http://localhost:3000/home?token=${token}`);
});

module.exports = router;
