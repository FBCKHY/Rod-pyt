const express = require('express');
const multer = require('multer');
const productController = require('../controllers/productController');
const { authOptional } = require('../middleware/auth');

const router = express.Router();

// 配置multer用于文件上传（放宽为文件夹多文件上传）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 单文件最大 20MB
    files: 1000 // 最多1000个文件，满足文件夹上传
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         cardImage:
 *           type: string
 *         price:
 *           type: number
 *         shortDesc:
 *           type: string
 *         categoryId:
 *           type: integer
 *         promoPosition:
 *           type: string
 *           enum: [none, homepage_banner, category_top, homepage_recommend]
 *         status:
 *           type: string
 *           enum: [active, inactive, draft]
 *         filePath:
 *           type: string
 *         sortOrder:
 *           type: integer
 *         viewCount:
 *           type: integer
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: 获取产品列表
 *     tags: [Products]
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
 *         name: categoryId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: promoPosition
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取产品列表
 */
router.get('/', productController.getList);

/**
 * @swagger
 * /api/products/stats:
 *   get:
 *     summary: 获取产品统计信息
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取统计信息
 */
router.get('/stats', authOptional, productController.getStats);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: 获取产品详情
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功获取产品详情
 *       404:
 *         description: 产品不存在
 */
router.get('/:id', productController.getById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: 创建产品
 *     tags: [Products]
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
 *               cardImage:
 *                 type: string
 *               price:
 *                 type: number
 *               shortDesc:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               promoPosition:
 *                 type: string
 *               status:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: 产品创建成功
 *       400:
 *         description: 请求参数错误
 */
router.post('/', authOptional, productController.create);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: 更新产品
 *     tags: [Products]
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
 *               name:
 *                 type: string
 *               cardImage:
 *                 type: string
 *               price:
 *                 type: number
 *               shortDesc:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               promoPosition:
 *                 type: string
 *               status:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: 产品更新成功
 *       404:
 *         description: 产品不存在
 */
router.put('/:id', authOptional, productController.update);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: 删除产品
 *     tags: [Products]
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
 *         description: 产品删除成功
 *       404:
 *         description: 产品不存在
 */
router.delete('/:id', authOptional, productController.delete);

/**
 * @swagger
 * /api/products/{id}/files:
 *   post:
 *     summary: 上传产品详情页文件
 *     tags: [Products]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: 文件上传成功
 *       400:
 *         description: 文件格式错误或缺少必需文件
 */
router.post('/:id/files', authOptional, upload.array('files', 1000), productController.uploadFiles);
// 获取产品详情页文件列表
router.get('/:id/files', productController.listFiles);

// 上传卡片主图（单图）
router.post('/card-image', authOptional, multer({ storage: multer.memoryStorage() }).single('image'), productController.uploadCardImage);

/**
 * @swagger
 * /api/products/sort-order:
 *   put:
 *     summary: 批量更新产品排序
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     sortOrder:
 *                       type: integer
 *     responses:
 *       200:
 *         description: 排序更新成功
 */
router.put('/sort-order', authOptional, productController.updateSortOrder);

module.exports = router; 