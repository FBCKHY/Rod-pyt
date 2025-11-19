const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * 认证控制器
 * 处理登录、注册等认证相关操作
 */

/**
 * 用户登录
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        msg: '用户名和密码不能为空'
      });
    }

    // 临时方案：使用固定的管理员账号
    // TODO: 后续需要从数据库查询用户信息
    const adminUsername = 'admin';
    const adminPassword = 'admin123';

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({
        code: 401,
        msg: '用户名或密码错误'
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      {
        id: 1,
        username: adminUsername,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    );

    logger.info('用户登录成功', { username });

    res.json({
      code: 200,
      msg: '登录成功',
      data: {
        token,
        user: {
          id: 1,
          username: adminUsername,
          nickname: '管理员',
          role: 'admin',
          avatar: 'https://via.placeholder.com/150'
        }
      }
    });
  } catch (error) {
    logger.error('登录失败', error);
    res.status(500).json({
      code: 500,
      msg: '登录失败，请稍后重试'
    });
  }
};

/**
 * 用户注册
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        msg: '用户名和密码不能为空'
      });
    }

    // TODO: 实现用户注册逻辑
    // 1. 检查用户名是否已存在
    // 2. 密码加密
    // 3. 保存到数据库

    res.json({
      code: 200,
      msg: '注册功能暂未开放'
    });
  } catch (error) {
    logger.error('注册失败', error);
    res.status(500).json({
      code: 500,
      msg: '注册失败，请稍后重试'
    });
  }
};

/**
 * 退出登录
 * @route POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    // TODO: 可以在这里实现token黑名单机制
    
    logger.info('用户退出登录', { userId: req.user?.id });

    res.json({
      code: 200,
      msg: '退出成功'
    });
  } catch (error) {
    logger.error('退出登录失败', error);
    res.status(500).json({
      code: 500,
      msg: '退出失败'
    });
  }
};
