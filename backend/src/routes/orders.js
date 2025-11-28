const express = require('express');
const orderController = require('../controllers/orderController');
const { authOptional } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         orderNumber:
 *           type: string
 *         customerName:
 *           type: string
 *         customerEmail:
 *           type: string
 *         customerPhone:
 *           type: string
 *         province:
 *           type: string
 *         city:
 *           type: string
 *         district:
 *           type: string
 *         address:
 *           type: string
 *         totalAmount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled, refunded]
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: 获取订单列表
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerPhone
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取订单列表
 */
router.get('/', authOptional, orderController.getList);

/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     summary: 获取订单统计信息
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: 成功获取统计信息
 */
router.get('/stats', authOptional, orderController.getStats);

/**
 * @swagger
 * /api/orders/number/{orderNumber}:
 *   get:
 *     summary: 根据订单号查询订单
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取订单
 *       404:
 *         description: 订单不存在
 */
router.get('/number/:orderNumber', orderController.getByOrderNumber);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: 获取订单详情
 *     tags: [Orders]
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
 *         description: 成功获取订单详情
 *       404:
 *         description: 订单不存在
 */
router.get('/:id', authOptional, orderController.getById);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: 创建订单
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - customerPhone
 *               - province
 *               - city
 *               - address
 *               - items
 *             properties:
 *               customerName:
 *                 type: string
 *               customerEmail:
 *                 type: string
 *               customerPhone:
 *                 type: string
 *               province:
 *                 type: string
 *               city:
 *                 type: string
 *               district:
 *                 type: string
 *               address:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               note:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *                     variant:
 *                       type: object
 *     responses:
 *       200:
 *         description: 订单创建成功
 *       400:
 *         description: 请求参数错误
 */
router.post('/', orderController.create);

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: 更新订单
 *     tags: [Orders]
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
 *             properties:
 *               customerName:
 *                 type: string
 *               customerPhone:
 *                 type: string
 *               address:
 *                 type: string
 *               note:
 *                 type: string
 *               adminNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: 订单更新成功
 *       404:
 *         description: 订单不存在
 */
router.put('/:id', authOptional, orderController.update);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: 更新订单状态
 *     tags: [Orders]
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
 *                 enum: [pending, confirmed, processing, shipped, delivered, cancelled, refunded]
 *     responses:
 *       200:
 *         description: 状态更新成功
 *       400:
 *         description: 无效的状态
 *       404:
 *         description: 订单不存在
 */
router.put('/:id/status', authOptional, orderController.updateStatus);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: 删除订单
 *     tags: [Orders]
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
 *         description: 订单删除成功
 *       404:
 *         description: 订单不存在
 */
router.delete('/:id', authOptional, orderController.delete);

module.exports = router;
