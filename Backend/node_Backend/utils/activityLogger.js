const Activity = require('../models/Activity');

function ipFrom(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip ||
    req.connection?.remoteAddress ||
    ''
  );
}

async function logActivity({ req, userId, role, action, targetType, targetId, meta, method, path }) {
  try {
    await Activity.create({
      user: userId || req?.user?.id || req?.user?._id,
      role: role || req?.user?.role,
      action,
      method: method || req?.method,
      path: path || req?.originalUrl,
      targetType,
      targetId,
      meta,
      ip: ipFrom(req),
      userAgent: req?.headers?.['user-agent'],
    });
  } catch (_) {}
}

function autoLogWrites() {
  return (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      try {
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return;

        const action =
          res.locals.activityAction ||
          `${req.method} ${(req.baseUrl || '')}${(req.route && req.route.path) || ''}`.trim();

        const meta = Object.assign(
          { status: res.statusCode, durationMs: Date.now() - start, params: req.params, query: req.query },
          res.locals.activityMeta || {}
        );

        logActivity({
          req,
          userId: res.locals.activityUserId,   // NEW: override user
          role: res.locals.activityRole,       // NEW: override role
          action,
          targetType: res.locals.activityTargetType,
          targetId: res.locals.activityTargetId,
          meta,
        });
      } catch (_) {}
    });
    next();
  };
}

module.exports = { logActivity, autoLogWrites };