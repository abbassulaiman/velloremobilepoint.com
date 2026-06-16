const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Short-lived in-process cache to avoid a DB round-trip on every request.
// TTL is 30 s — short enough that a deactivated account is blocked within half a minute.
const USER_CACHE_TTL_MS = 30_000;
const _userCache = new Map(); // id → { user, expiresAt }

function _getCachedUser(id) {
  const entry = _userCache.get(id);
  if (entry && entry.expiresAt > Date.now()) return entry.user;
  _userCache.delete(id);
  return null;
}

function _setCachedUser(user) {
  _userCache.set(user.id, { user, expiresAt: Date.now() + USER_CACHE_TTL_MS });
}

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    let user = _getCachedUser(payload.id);
    if (!user) {
      user = await User.findByPk(payload.id);
      if (user) _setCachedUser(user);
    }

    if (!user || !user.active) {
      return res.status(401).json({ message: 'User not found or inactive.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = { authenticate };
