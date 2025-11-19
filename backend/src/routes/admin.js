const express = require('express');
const adminController = require('../controllers/adminController');
const { authOptional } = require('../middleware/auth');
const {
  createSubscriptionValidation,
  queryValidation,
  statusUpdateValidation,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

// 所有管理接口需要认证（开发环境自动通过）
router.use(authOptional);

/**
 * @swagger
 * /api/admin/subscriptions:
 *   get:
 *     summary: 获取订阅列表
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [subscribed, unsubscribed]
 *       - in: query
 *         name: contactType
 *         schema:
 *           type: string
 *           enum: [email, wechat, phone]
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [website_footer, contact_form, manual]
 *       - in: query
 *         name: contact
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: 查询成功
 */
router.get('/subscriptions',
  queryValidation,
  handleValidationErrors,
  adminController.getSubscriptions
);

/**
 * @swagger
 * /api/admin/subscriptions:
 *   post:
 *     summary: 创建订阅
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contactType
 *               - contactValue
 *             properties:
 *               contactType:
 *                 type: string
 *                 enum: [email, wechat, phone]
 *               contactValue:
 *                 type: string
 *               source:
 *                 type: string
 *                 enum: [website_footer, contact_form, manual]
 *                 default: manual
 *     responses:
 *       200:
 *         description: 添加成功
 *       400:
 *         description: 请求参数错误
 *       409:
 *         description: 联系方式已存在
 */
router.post('/subscriptions',
  createSubscriptionValidation,
  handleValidationErrors,
  adminController.createSubscription
);

/**
 * @swagger
 * /api/admin/subscriptions/{id}:
 *   patch:
 *     summary: 更新订阅状态
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [subscribed, unsubscribed]
 *     responses:
 *       200:
 *         description: 状态更新成功
 *       404:
 *         description: 订阅记录不存在
 */
router.patch('/subscriptions/:id',
  statusUpdateValidation,
  handleValidationErrors,
  adminController.toggleStatus
);

/**
 * @swagger
 * /api/admin/subscriptions/{id}:
 *   delete:
 *     summary: 删除订阅
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 *       404:
 *         description: 订阅记录不存在
 */
router.delete('/subscriptions/:id', adminController.deleteSubscription);

/**
 * @swagger
 * /api/admin/subscriptions/batch-delete:
 *   post:
 *     summary: 批量删除订阅
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: 批量删除成功
 */
router.post('/subscriptions/batch-delete', adminController.batchDelete);

/**
 * @swagger
 * /api/admin/subscriptions/stats:
 *   get:
 *     summary: 获取统计数据
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 查询成功
 */
router.get('/subscriptions/stats', adminController.getStats);

/**
 * @swagger
 * /api/admin/subscriptions/check:
 *   get:
 *     summary: 检查联系方式是否存在
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: contactType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [email, wechat, phone]
 *       - in: query
 *         name: contactValue
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 查询成功
 */
router.get('/subscriptions/check', adminController.checkExists);

module.exports = router; 