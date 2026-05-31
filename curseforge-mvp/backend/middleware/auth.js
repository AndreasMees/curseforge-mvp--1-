const jwt = require('jsonwebtoken');
const SECRET = 'curseforge_mvp_secret_123';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Logi kõigepealt sisse' });

  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Vigane sessioon, logi uuesti sisse' });
  }
}

module.exports = { authMiddleware, SECRET };
