const express = require('express');
const uploadController = require('../controllers/uploadController');
const { upload } = require('../config/upload');
const { authOptional } = require('../middleware/auth');

const router = express.Router();

// 上传接口需要认证
router.use(authOptional);

/**
 * @swagger
 * /api/upload/avatar:
 *   post:
 *     summary: 上传头像
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 上传成功
 */
router.post('/avatar', upload.single('avatar'), uploadController.uploadAvatar);

/**
 * @swagger
 * /api/upload/avatar:
 *   delete:
 *     summary: 删除头像
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 删除成功
 */
router.delete('/avatar', uploadController.deleteAvatar);

module.exports = router;
