const jwt = require('jsonwebtoken');
const User = require('./models/user');

const secretKey = process.env.JWT_SECRET;

const authenticateUser = async (req, res, next) => {
    // Extract token from headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, secretKey);

        // Check if the user is logged out
        const user = await User.findById(decoded.userId);

        if (user && !user.isLoggedOut) {
            req.user = decoded;
            next(); // User is authenticated
        } else {
            res.status(401).json({ error: 'Unauthorized' });
        }
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ error: 'Token expired' });
        } else {
            res.status(401).json({ error: 'Invalid token' });
        }
    }
};

module.exports = authenticateUser;
