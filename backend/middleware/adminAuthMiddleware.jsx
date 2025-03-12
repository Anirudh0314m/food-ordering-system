const adminAuthMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // For now, just check if it's the admin token
    if (token.startsWith('Bearer ')) {
      next();
    } else {
      throw new Error('Invalid token');
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = adminAuthMiddleware;