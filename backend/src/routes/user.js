const express = require('express');
const userController = require('../controllers/userController');
const { authOptional } = require('../middleware/auth');

const router = express.Router();

// 用户相关接口需要认证
router.use(authOptional);

/**
 * @swagger
 * /api/user/info:
 *   get:
 *     summary: 获取当前用户信息
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 msg:
 *                   type: string
 *                   example: 获取成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     nickname:
 *                       type: string
 *                     role:
 *                       type: string
 *                     avatar:
 *                       type: string
 */
router.get('/info', userController.getUserInfo);

/**
 * @swagger
 * /api/user/list:
 *   get:
 *     summary: 获取用户列表
 *     tags: [User]
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
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/list', userController.getUserList);

/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     summary: 更新用户信息
 *     tags: [User]
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
 *               nickname:
 *                 type: string
 *               email:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put('/:id', userController.updateUser);

/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     summary: 删除用户
 *     tags: [User]
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
router.delete('/:id', userController.deleteUser);

module.exports = router;
