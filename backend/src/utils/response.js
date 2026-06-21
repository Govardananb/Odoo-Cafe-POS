/**
 * Standardized success response
 * @param res Express Response object
 * @param data Data object to return, merged with success: true
 * @param status HTTP status code (default 200)
 */
export function successResponse(res, data, status = 200) {
  return res.status(status).json({
    success: true,
    ...data,
  });
}

/**
 * Standardized error response
 * @param res Express Response object
 * @param message Error message details
 * @param status HTTP status code (default 400)
 */
export function errorResponse(res, message, status = 400) {
  return res.status(status).json({
    success: false,
    message,
  });
}
