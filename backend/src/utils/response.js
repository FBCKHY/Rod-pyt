/**
 * 统一响应格式化工具
 */

const formatResponse = (code, msg, data = null) => {
  return {
    code,
    msg,
    data,
    timestamp: Date.now()
  };
};

const successResponse = (data, msg = '操作成功') => {
  return formatResponse(200, msg, data);
};

const errorResponse = (code, msg) => {
  return formatResponse(code, msg);
};

// 为 formatResponse 挂载便捷方法，兼容 formatResponse.success()/error()
formatResponse.success = (data, msg = '操作成功') => successResponse(data, msg);
formatResponse.error = (msg = '服务器内部错误', code = 500) => errorResponse(code, msg);

module.exports = {
  formatResponse,
  successResponse,
  errorResponse
};
