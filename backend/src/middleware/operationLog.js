const OperationLog = require('../models/OperationLog');
const logger = require('../utils/logger');

/**
 * 操作日志中间件
 * 记录用户的操作行为
 */
const operationLogMiddleware = (module, action) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // 保存原始的res.json方法
    const originalJson = res.json.bind(res);
    
    // 重写res.json方法以捕获响应
    res.json = function(data) {
      const duration = Date.now() - startTime;
      
      // 异步记录日志,不阻塞响应
      setImmediate(async () => {
        try {
          const logData = {
            user_id: req.user?.id || null,
            username: req.user?.username || 'anonymous',
            module,
            action,
            description: generateDescription(module, action, req),
            ip: req.ip || req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            request_method: req.method,
            request_url: req.originalUrl,
            request_params: JSON.stringify({
              body: req.body,
              query: req.query,
              params: req.params
            }),
            response_status: res.statusCode,
            error_message: data.code !== 200 ? data.msg : null,
            duration
          };
          
          await OperationLog.create(logData);
        } catch (error) {
          logger.error('记录操作日志失败:', error);
        }
      });
      
      // 调用原始的json方法
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * 生成操作描述
 */
function generateDescription(module, action, req) {
  const descriptions = {
    user: {
      create: `创建用户: ${req.body.username}`,
      update: `更新用户: ${req.params.id}`,
      delete: `删除用户: ${req.params.id}`,
      toggleStatus: `切换用户状态: ${req.params.id}`,
      resetPassword: `重置用户密码: ${req.params.id}`
    },
    role: {
      create: `创建角色: ${req.body.role_name}`,
      update: `更新角色: ${req.params.id}`,
      delete: `删除角色: ${req.params.id}`,
      assignPermissions: `分配权限: ${req.params.id}`
    },
    permission: {
      create: `创建权限: ${req.body.permission_name}`,
      update: `更新权限: ${req.params.id}`,
      delete: `删除权限: ${req.params.id}`
    },
    auth: {
      login: `用户登录: ${req.body.userName || req.body.username}`,
      register: `用户注册: ${req.body.username}`,
      logout: `用户登出`
    }
  };
  
  return descriptions[module]?.[action] || `${module} - ${action}`;
}

module.exports = operationLogMiddleware;
