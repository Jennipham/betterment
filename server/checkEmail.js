const express = require('express');
const router = express.Router();
const User = require('./models/user');

// Check if an email exists
router.get('/check-email', async (req, res) => {
    const { email } = req.query;

    try {
        const user = await User.findOne({ email });

        if (user) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error checking email' });
    }
});

module.exports = router;
