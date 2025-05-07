const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
    const auth = req.headers.authorization;
    
    if (auth?.startsWith("Bearer ")) {
      const token = auth.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id || decoded.userId || decoded.sub };
      } catch (e) {
        console.warn("❌ Erreur de vérification token:", e.message);
        req.user = null;
      }
    }
    next();
  };

  module.exports = optionalAuth;
  