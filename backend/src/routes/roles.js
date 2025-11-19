const express = require('express');
const roleController = require('../controllers/roleController');
const { authOptional } = require('../middleware/auth');

const router = express.Router();

// 角色相关接口需要认证
router.use(authOptional);

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: 获取角色列表
 *     tags: [Role]
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
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/', roleController.getRoleList);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: 获取角色详情
 *     tags: [Role]
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
 *         description: 获取成功
 */
router.get('/:id', roleController.getRoleById);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: 创建角色
 *     tags: [Role]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_code
 *               - role_name
 *             properties:
 *               role_code:
 *                 type: string
 *               role_name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: 创建成功
 */
router.post('/', roleController.createRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: 更新角色
 *     tags: [Role]
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
router.put('/:id', roleController.updateRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: 删除角色
 *     tags: [Role]
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
router.delete('/:id', roleController.deleteRole);

/**
 * @swagger
 * /api/roles/{id}/permissions:
 *   post:
 *     summary: 分配权限给角色
 *     tags: [Role]
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
 *               - permissionIds
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: 分配成功
 */
router.post('/:id/permissions', roleController.assignPermissions);

/**
 * @swagger
 * /api/roles/{id}/users:
 *   get:
 *     summary: 获取角色的用户列表
 *     tags: [Role]
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
 *         description: 获取成功
 */
router.get('/:id/users', roleController.getRoleUsers);

module.exports = router;
