function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${status}] ${req.method} ${req.path} — ${message}`);
  }

  res.status(status).json({ message, ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }) });
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { errorHandler, asyncHandler };
