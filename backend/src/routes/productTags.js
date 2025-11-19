const express = require('express');
const productTagController = require('../controllers/productTagController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/product-tags:
 *   get:
 *     summary: 获取标签列表
 *     tags: [Product Tags]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取标签列表
 */
router.get('/', productTagController.getList);

/**
 * @swagger
 * /api/product-tags/stats:
 *   get:
 *     summary: 获取标签统计信息
 *     tags: [Product Tags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取统计信息
 */
router.get('/stats', auth, productTagController.getStats);

/**
 * @swagger
 * /api/product-tags/{id}:
 *   get:
 *     summary: 获取标签详情
 *     tags: [Product Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功获取标签详情
 *       404:
 *         description: 标签不存在
 */
router.get('/:id', productTagController.getById);

/**
 * @swagger
 * /api/product-tags:
 *   post:
 *     summary: 创建标签
 *     tags: [Product Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               icon:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: 标签创建成功
 */
router.post('/', auth, productTagController.create);

/**
 * @swagger
 * /api/product-tags/{id}:
 *   put:
 *     summary: 更新标签
 *     tags: [Product Tags]
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
 *         description: 标签更新成功
 *       404:
 *         description: 标签不存在
 */
router.put('/:id', auth, productTagController.update);

/**
 * @swagger
 * /api/product-tags/{id}:
 *   delete:
 *     summary: 删除标签
 *     tags: [Product Tags]
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
 *         description: 标签删除成功
 *       404:
 *         description: 标签不存在
 */
router.delete('/:id', auth, productTagController.delete);

module.exports = router; 