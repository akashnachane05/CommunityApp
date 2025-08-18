const jwt = require('jsonwebtoken');

const auth = (roles = []) => {
  return (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.sendStatus(401); // Access denied.
   
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Token verification error:', err);
        return res.sendStatus(403); // Invalid token.
      }
      console.log("Decoded token user role:", user.role);
      if (roles.length && !roles.includes(user.role)) {
        console.warn(`Access denied for role: ${user.role}`);
        return res.sendStatus(403); // Access denied.
      }

      req.user = user;
      
      console.log(req.user.fullName)
      console.log(req.user.id)
      
      next();
    });
  };
};

module.exports = auth;
