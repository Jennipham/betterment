const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET; // Retrieve the JWT secret key from environment variables

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = verifyToken;
