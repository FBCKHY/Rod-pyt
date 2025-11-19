const jwt = require('jsonwebtoken');
const { formatResponse } = require('../utils/response');

// 简单的JWT认证中间件（开发阶段使用）
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json(formatResponse(401, '访问令牌缺失'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(formatResponse(401, '访问令牌已过期'));
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(formatResponse(401, '无效的访问令牌'));
    }
    
    return res.status(401).json(formatResponse(401, '身份验证失败'));
  }
};

// 开发环境跳过认证的中间件
const authOptional = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    // 开发环境直接通过，设置默认用户信息
    req.user = {
      id: 1,
      email: 'admin@example.com',
      role: 'admin'
    };
    return next();
  }
  
  // 生产环境使用正常认证
  return auth(req, res, next);
};

// 生成JWT Token的工具函数
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

module.exports = {
  auth,
  authOptional,
  generateToken
}; 