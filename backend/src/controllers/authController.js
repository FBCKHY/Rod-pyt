const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { User, Role } = require('../models');

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
    // 兼容 username 和 userName 两种格式
    const { username, userName, password } = req.body;
    const loginName = username || userName;

    // 验证必填字段
    if (!loginName || !password) {
      return res.status(400).json({
        code: 400,
        msg: '用户名和密码不能为空'
      });
    }

    // 从数据库查询用户
    const user = await User.findOne({
      where: { username: loginName },
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['id', 'role_code', 'role_name'],
        through: { attributes: [] }
      }]
    });

    // 用户不存在
    if (!user) {
      return res.status(401).json({
        code: 401,
        msg: '用户名或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        msg: '用户名或密码错误'
      });
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(403).json({
        code: 403,
        msg: '账号已被禁用，请联系管理员'
      });
    }

    // 获取用户角色
    const roles = user.roles || [];
    const roleCodes = roles.map(r => r.role_code);

    // 生成JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        roles: roleCodes
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    );

    // 生成refresh token (有效期更长)
    const refreshToken = jwt.sign(
      {
        id: user.id,
        type: 'refresh'
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      {
        expiresIn: '30d'
      }
    );

    // 更新最后登录时间
    await user.update({ last_login_at: new Date() });

    logger.info('用户登录成功', { username: loginName, userId: user.id });

    res.json({
      code: 200,
      msg: '登录成功',
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          email: user.email,
          avatar: user.avatar,
          department: user.department,
          roles: roleCodes
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
    const { username, password, email, nickname, mobile, department } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        msg: '用户名和密码不能为空'
      });
    }

    // 验证密码强度
    if (password.length < 6) {
      return res.status(400).json({
        code: 400,
        msg: '密码长度不能少于6位'
      });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        msg: '用户名已存在'
      });
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({
          code: 400,
          msg: '邮箱已被使用'
        });
      }
    }

    // 创建用户 (密码会在模型的hook中自动加密)
    const user = await User.create({
      username,
      password,
      email,
      nickname: nickname || username,
      mobile,
      department,
      status: 'active'
    });

    // 分配默认角色(普通用户)
    const userRole = await Role.findOne({ where: { role_code: 'R_USER' } });
    if (userRole) {
      await user.addRole(userRole);
    }

    logger.info('用户注册成功', { username, userId: user.id });

    res.json({
      code: 200,
      msg: '注册成功',
      data: {
        user: user.toSafeJSON()
      }
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
 * 刷新Token
 * @route POST /api/auth/refresh
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        code: 400,
        msg: 'Refresh token不能为空'
      });
    }

    // 验证refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'dev-secret-key');
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        code: 401,
        msg: '无效的refresh token'
      });
    }

    // 查询用户
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['role_code'],
        through: { attributes: [] }
      }]
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        code: 401,
        msg: '用户不存在或已被禁用'
      });
    }

    // 生成新的access token
    const roleCodes = user.roles.map(r => r.role_code);
    const newToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        roles: roleCodes
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    );

    res.json({
      code: 200,
      msg: 'Token刷新成功',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        msg: 'Refresh token无效或已过期'
      });
    }
    logger.error('刷新Token失败', error);
    res.status(500).json({
      code: 500,
      msg: '刷新Token失败'
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
