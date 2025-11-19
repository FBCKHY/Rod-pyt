const express = require('express');
const productCategoryController = require('../controllers/productCategoryController');
const { authOptional } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/product-categories:
 *   get:
 *     summary: 获取分类树形列表
 *     tags: [Product Categories]
 *     parameters:
 *       - in: query
 *         name: includeProducts
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: 成功获取分类列表
 */
router.get('/', productCategoryController.getList);

/**
 * @swagger
 * /api/product-categories/flat:
 *   get:
 *     summary: 获取扁平分类列表
 *     tags: [Product Categories]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取扁平分类列表
 */
router.get('/flat', productCategoryController.getFlatList);

/**
 * @swagger
 * /api/product-categories/stats:
 *   get:
 *     summary: 获取分类统计信息
 *     tags: [Product Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取统计信息
 */
router.get('/stats', authOptional, productCategoryController.getStats);

/**
 * @swagger
 * /api/product-categories/{id}:
 *   get:
 *     summary: 获取分类详情
 *     tags: [Product Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功获取分类详情
 *       404:
 *         description: 分类不存在
 */
router.get('/:id', productCategoryController.getById);

/**
 * @swagger
 * /api/product-categories:
 *   post:
 *     summary: 创建分类
 *     tags: [Product Categories]
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
 *               parentId:
 *                 type: integer
 *               icon:
 *                 type: string
 *               description:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: 分类创建成功
 */
router.post('/', authOptional, productCategoryController.create);

/**
 * @swagger
 * /api/product-categories/{id}:
 *   put:
 *     summary: 更新分类
 *     tags: [Product Categories]
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
 *         description: 分类更新成功
 *       404:
 *         description: 分类不存在
 */
router.put('/:id', authOptional, productCategoryController.update);

/**
 * @swagger
 * /api/product-categories/{id}:
 *   delete:
 *     summary: 删除分类
 *     tags: [Product Categories]
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
 *         description: 分类删除成功
 *       404:
 *         description: 分类不存在
 */
router.delete('/:id', authOptional, productCategoryController.delete);

/**
 * @swagger
 * /api/product-categories/sort-order:
 *   put:
 *     summary: 批量更新分类排序
 *     tags: [Product Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 排序更新成功
 */
router.put('/sort-order', authOptional, productCategoryController.updateSortOrder);

module.exports = router; 