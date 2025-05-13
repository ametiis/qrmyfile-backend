const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = parseInt(decoded.userId, 10);
 
    if (!userId || isNaN(userId)) {
      return res.status(403).json({ error: 'invalidTokenPayload' });
    }

    req.user = { id: userId }; // ✅ ici c'est bien un entier
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'invalidToken' });
  }
};

module.exports = authenticate;
