const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const {
  createSubscriptionValidation,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: 创建订阅
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contactType
 *               - contactValue
 *               - source
 *             properties:
 *               contactType:
 *                 type: string
 *                 enum: [email, wechat, phone]
 *               contactValue:
 *                 type: string
 *               source:
 *                 type: string
 *                 enum: [website_footer, contact_form, manual]
 *     responses:
 *       200:
 *         description: 订阅成功
 *       400:
 *         description: 请求参数错误
 *       409:
 *         description: 联系方式已存在
 */
router.post('/',
  createSubscriptionValidation,
  handleValidationErrors,
  subscriptionController.create
);

module.exports = router; 