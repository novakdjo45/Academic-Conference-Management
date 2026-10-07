function formatMySQLError(err) {
  if (!err) return 'An unexpected error occurred';

  // Foreign key reference constraint when deleting
  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
    return 'Cannot delete this record because it is referenced by another record (e.g., papers, reviews, or decisions).';
  }

  // Foreign key reference constraint when inserting/updating
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
    return 'The referenced record (such as Author, Conference, Paper, or Reviewer) does not exist.';
  }

  // Duplicate entry for UNIQUE constraint
  if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
    const match = err.sqlMessage ? err.sqlMessage.match(/Duplicate entry '(.*)' for key/) : null;
    return match 
      ? `A record with identifier or unique value '${match[1]}' already exists.`
      : 'A record with this unique value already exists.';
  }

  // Missing required column
  if (err.code === 'ER_BAD_NULL_ERROR' || err.errno === 1048) {
    return 'A required field was left blank.';
  }

  // Connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    return 'Database connection failed. Ensure MySQL service is running on the specified port.';
  }

  return err.sqlMessage || err.message || 'Database query error';
}

function errorHandler(err, req, res, next) {
  console.error('[API Error]:', err);
  const friendlyMessage = formatMySQLError(err);
  const status = (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) ? 409 : 400;

  res.status(status).json({
    success: false,
    message: friendlyMessage,
    errorDetails: process.env.NODE_ENV === 'production' ? undefined : err.message,
    errorCode: err.code
  });
}

module.exports = {
  formatMySQLError,
  errorHandler
};
