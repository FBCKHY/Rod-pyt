const logger = require('../utils/logger');
const { User } = require('../models');
const path = require('path');
const fs = require('fs');

/**
 * 上传控制器
 */

/**
 * 上传头像
 * @route POST /api/upload/avatar
 */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        msg: '请选择要上传的文件'
      });
    }

    // 生成访问URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // 如果是为当前用户上传,更新数据库
    if (req.user && req.body.updateUser !== 'false') {
      await User.update(
        { avatar: avatarUrl },
        { where: { id: req.user.id } }
      );
    }

    logger.info('头像上传成功', { userId: req.user?.id, filename: req.file.filename });

    res.json({
      code: 200,
      msg: '上传成功',
      data: {
        url: avatarUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    logger.error('上传头像失败', error);
    res.status(500).json({
      code: 500,
      msg: '上传失败'
    });
  }
};

/**
 * 删除头像
 * @route DELETE /api/upload/avatar
 */
exports.deleteAvatar = async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({
        code: 400,
        msg: '文件名不能为空'
      });
    }

    const filePath = path.join(__dirname, '../../uploads/avatars', filename);

    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info('头像删除成功', { filename });
    }

    res.json({
      code: 200,
      msg: '删除成功'
    });
  } catch (error) {
    logger.error('删除头像失败', error);
    res.status(500).json({
      code: 500,
      msg: '删除失败'
    });
  }
};

module.exports = exports;
