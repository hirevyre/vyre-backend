/**
 * Standard success response
 * @param {Object} res - Express response object
 * @param {String} message - Success message
 * @param {Object} data - Response data
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
exports.success = (res, message = 'Success', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

/**
 * Standard error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default: 400)
 * @param {Object} errors - Error details
 */
exports.error = (res, message = 'Error', statusCode = 400, errors = null) => {
  const response = {
    status: 'error',
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Pagination helper
 * @param {Number} total - Total number of items
 * @param {Number} page - Current page number
 * @param {Number} limit - Number of items per page
 * @returns {Object} Pagination object
 */
exports.getPagination = (total, page, limit) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 10;
  const pages = Math.ceil(total / itemsPerPage);
  
  return {
    total,
    pages,
    currentPage,
    hasNext: currentPage < pages,
    hasPrev: currentPage > 1
  };
};
