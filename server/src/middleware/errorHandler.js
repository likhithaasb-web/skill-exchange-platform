function errorHandler(err, req, res, next) {
  console.error('API Error:', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `The ${field} '${err.keyValue[field]}' is already in use. Please choose another.`
    });
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum allowed limit (15MB).'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.'
  });
}

module.exports = errorHandler;
