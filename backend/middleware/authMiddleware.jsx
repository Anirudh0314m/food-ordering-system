const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Make sure we have both id properties
    if (!decoded.id && decoded._id) {
      decoded.id = decoded._id;
    } else if (!decoded._id && decoded.id) {
      decoded._id = decoded.id;
    }
    
    console.log("Auth middleware - Decoded user:", decoded);
    
    // Add user to request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
