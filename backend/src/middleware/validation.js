const { body, query, validationResult } = require('express-validator');
const { formatResponse } = require('../utils/response');

// 创建订阅验证规则
const createSubscriptionValidation = [
  body('contactType')
    .isIn(['email', 'wechat', 'phone'])
    .withMessage('联系方式类型无效'),
  
  body('contactValue')
    .trim()
    .notEmpty()
    .withMessage('联系方式不能为空')
    .isLength({ max: 255 })
    .withMessage('联系方式长度不能超过255个字符')
    .custom((value, { req }) => {
      const { contactType } = req.body;
      
      switch (contactType) {
        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            throw new Error('邮箱格式不正确');
          }
          break;
        case 'phone':
          if (!/^1[3-9]\d{9}$/.test(value)) {
            throw new Error('手机号格式不正确');
          }
          break;
        case 'wechat':
          if (!/^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/.test(value)) {
            throw new Error('微信号格式不正确');
          }
          break;
      }
      return true;
    }),
  
  body('source')
    .isIn(['website_footer', 'contact_form', 'manual'])
    .withMessage('订阅来源无效'),

  body('fullName')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 100 })
    .withMessage('用户姓名长度不能超过100个字符'),

  body('subject')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 200 })
    .withMessage('咨询主题长度不能超过200个字符'),

  body('message')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('留言内容格式不正确'),

  body('userSource')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 100 })
    .withMessage('用户来源长度不能超过100个字符'),

  body('preferredTime')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 200 })
    .withMessage('期望服务时间长度不能超过200个字符'),

  body('address')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('服务地址长度不能超过500个字符'),

  body('requirements')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('特殊需求格式不正确'),

  body('company')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 200 })
    .withMessage('公司名称长度不能超过200个字符')
];

// 查询验证规则
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是大于0的整数'),
  
  query('size')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页条数必须是1-100之间的整数'),
  
  query('status')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['subscribed', 'unsubscribed'])
    .withMessage('状态值无效'),
  
  query('contactType')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['email', 'wechat', 'phone'])
    .withMessage('联系方式类型无效'),
  
  query('source')
    .optional({ nullable: true, checkFalsy: true })
    .isIn(['website_footer', 'contact_form', 'manual'])
    .withMessage('订阅来源无效'),
  
  query('contact')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('搜索关键字必须是字符串'),
  
  query('startDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('开始日期格式无效'),
  
  query('endDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('结束日期格式无效')
];

// 状态更新验证规则
const statusUpdateValidation = [
  body('status')
    .isIn(['subscribed', 'unsubscribed'])
    .withMessage('状态值无效')
];

// 验证结果处理
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json(formatResponse(400, firstError.msg));
  }
  
  next();
};

module.exports = {
  createSubscriptionValidation,
  queryValidation,
  statusUpdateValidation,
  handleValidationErrors
}; 