const logger = require('../utils/logger');
const { formatResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  logger.error('未捕获的错误', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Sequelize 验证错误
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ');
    return res.status(400).json(formatResponse(400, message));
  }

  // Sequelize 唯一约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json(formatResponse(409, '数据已存在'));
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(formatResponse(401, '无效的访问令牌'));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(formatResponse(401, '访问令牌已过期'));
  }

  // 语法错误
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json(formatResponse(400, '请求数据格式错误'));
  }

  // 默认服务器错误
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误' 
    : err.message;

  res.status(statusCode).json(formatResponse(statusCode, message));
};

module.exports = errorHandler; 