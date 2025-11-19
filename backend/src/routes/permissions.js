const express = require('express');
const permissionController = require('../controllers/permissionController');
const { authOptional } = require('../middleware/auth');

const router = express.Router();

// 权限相关接口需要认证
router.use(authOptional);

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: 获取权限列表
 *     tags: [Permission]
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
 *         name: keyword
 *         schema:
 *           type: string
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/', permissionController.getPermissionList);

/**
 * @swagger
 * /api/permissions/tree:
 *   get:
 *     summary: 获取权限树形结构
 *     tags: [Permission]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/tree', permissionController.getPermissionTree);

/**
 * @swagger
 * /api/permissions:
 *   post:
 *     summary: 创建权限
 *     tags: [Permission]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permission_code
 *               - permission_name
 *             properties:
 *               permission_code:
 *                 type: string
 *               permission_name:
 *                 type: string
 *               resource:
 *                 type: string
 *               action:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: 创建成功
 */
router.post('/', permissionController.createPermission);

/**
 * @swagger
 * /api/permissions/{id}:
 *   put:
 *     summary: 更新权限
 *     tags: [Permission]
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
 *         description: 更新成功
 */
router.put('/:id', permissionController.updatePermission);

/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     summary: 删除权限
 *     tags: [Permission]
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
 */
router.delete('/:id', permissionController.deletePermission);

module.exports = router;
