const express = require('express');
const router = express.Router();
const User = require('./models/user');

// Route to fetch user information
router.get('/user-info', async (req, res) => {
    try {
        // Assuming you have some form of authentication in place to identify the user
        const userId = req.user.id; // You should adapt this to your authentication method
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Send the user information to the client
        res.status(200).json({ fname: user.fname, sname: user.sname, email: user.email, userType: user.userType  });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user information' });
    }
});

module.exports = router;
