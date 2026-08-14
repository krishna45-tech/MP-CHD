// =============================================================================
// Central error handling + async wrapper.
// =============================================================================

/** Wraps async route handlers so thrown errors reach the error handler. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Standard 404 for unknown routes. */
function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

/** Final error handler. Never leaks internals. */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (res.headersSent) return next(err);
  const status = err.status && err.status < 500 ? err.status : 500;
  if (status >= 500) {
    console.error('Unhandled error:', err.message);
  }
  res.status(status).json({
    success: false,
    message: status < 500 ? err.message : 'Internal server error.',
  });
}

/** Small helper for throwing HTTP errors from controllers. */
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = { asyncHandler, notFound, errorHandler, HttpError };
