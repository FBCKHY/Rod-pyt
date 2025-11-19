const express = require('express');
const operationLogController = require('../controllers/operationLogController');
const { authOptional } = require('../middleware/auth');

const router = express.Router();

// 操作日志相关接口需要认证
router.use(authOptional);

/**
 * @swagger
 * /api/operation-logs:
 *   get:
 *     summary: 获取操作日志列表
 *     tags: [OperationLog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/', operationLogController.getOperationLogs);

/**
 * @swagger
 * /api/operation-logs/stats:
 *   get:
 *     summary: 获取操作统计
 *     tags: [OperationLog]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/stats', operationLogController.getOperationStats);

/**
 * @swagger
 * /api/operation-logs/clean:
 *   delete:
 *     summary: 清理旧日志
 *     tags: [OperationLog]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 清理成功
 */
router.delete('/clean', operationLogController.cleanOldLogs);

module.exports = router;
