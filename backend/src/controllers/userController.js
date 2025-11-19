const logger = require('../utils/logger');

/**
 * 用户控制器
 * 处理用户相关操作
 */

/**
 * 获取当前用户信息
 * @route GET /api/user/info
 */
exports.getUserInfo = async (req, res) => {
  try {
    // 从JWT token中获取用户信息
    const user = req.user || {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      role: 'admin',
      avatar: 'https://via.placeholder.com/150'
    };

    res.json({
      code: 200,
      msg: '获取成功',
      data: user
    });
  } catch (error) {
    logger.error('获取用户信息失败', error);
    res.status(500).json({
      code: 500,
      msg: '获取用户信息失败'
    });
  }
};

/**
 * 获取用户列表
 * @route GET /api/user/list
 */
exports.getUserList = async (req, res) => {
  try {
    const { page = 1, size = 10, keyword } = req.query;

    // TODO: 从数据库查询用户列表
    const mockUsers = [
      {
        id: 1,
        username: 'admin',
        nickname: '管理员',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    res.json({
      code: 200,
      msg: '获取成功',
      data: {
        list: mockUsers,
        pagination: {
          page: parseInt(page),
          size: parseInt(size),
          total: mockUsers.length,
          pages: 1
        }
      }
    });
  } catch (error) {
    logger.error('获取用户列表失败', error);
    res.status(500).json({
      code: 500,
      msg: '获取用户列表失败'
    });
  }
};

/**
 * 更新用户信息
 * @route PUT /api/user/:id
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nickname, email, avatar } = req.body;

    // TODO: 更新数据库中的用户信息

    res.json({
      code: 200,
      msg: '更新成功'
    });
  } catch (error) {
    logger.error('更新用户信息失败', error);
    res.status(500).json({
      code: 500,
      msg: '更新用户信息失败'
    });
  }
};

/**
 * 删除用户
 * @route DELETE /api/user/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: 从数据库删除用户

    res.json({
      code: 200,
      msg: '删除成功'
    });
  } catch (error) {
    logger.error('删除用户失败', error);
    res.status(500).json({
      code: 500,
      msg: '删除用户失败'
    });
  }
};
