const logger = require('../utils/logger');
const { User, Role } = require('../models');
const { Op } = require('sequelize');

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
    // 从JWT token中获取用户ID
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        msg: '未登录或token已过期'
      });
    }

    // 从数据库查询用户信息
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['id', 'role_code', 'role_name'],
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return res.status(404).json({
        code: 404,
        msg: '用户不存在'
      });
    }

    const userInfo = {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      mobile: user.mobile,
      avatar: user.avatar,
      department: user.department,
      status: user.status,
      roles: user.roles.map(r => r.role_code),
      created_at: user.created_at,
      last_login_at: user.last_login_at
    };

    res.json({
      code: 200,
      msg: '获取成功',
      data: userInfo
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
    const { 
      page = 1, 
      size = 10, 
      keyword = '',
      status = '',
      department = '',
      role = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(size);
    const limit = parseInt(size);

    // 构建查询条件
    const where = {};
    
    // 关键词搜索(用户名、昵称、邮箱)
    if (keyword) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${keyword}%` } },
        { nickname: { [Op.iLike]: `%${keyword}%` } },
        { email: { [Op.iLike]: `%${keyword}%` } }
      ];
    }

    // 状态筛选
    if (status) {
      where.status = status;
    }

    // 部门筛选
    if (department) {
      where.department = department;
    }

    // 角色筛选
    const include = [{
      model: Role,
      as: 'roles',
      attributes: ['id', 'role_code', 'role_name'],
      through: { attributes: [] }
    }];

    if (role) {
      include[0].where = { role_code: role };
      include[0].required = true;
    }

    // 查询用户列表
    const { count, rows } = await User.findAndCountAll({
      where,
      include,
      attributes: { exclude: ['password'] },
      distinct: true, // 使用distinct避免关联查询时count重复计数
      offset,
      limit,
      order: [['created_at', 'DESC']]
    });

    // 格式化返回数据
    const list = rows.map(user => ({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      mobile: user.mobile,
      avatar: user.avatar,
      department: user.department,
      status: user.status,
      roles: user.roles.map(r => ({
        code: r.role_code,
        name: r.role_name
      })),
      last_login_at: user.last_login_at,
      created_at: user.created_at
    }));

    res.json({
      code: 200,
      msg: '获取成功',
      data: {
        list,
        total: count,
        page: parseInt(page),
        size: parseInt(size)
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
 * 创建用户
 * @route POST /api/users
 */
exports.createUser = async (req, res) => {
  try {
    const { username, password, nickname, email, mobile, avatar, department, roleIds } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        msg: '用户名和密码不能为空'
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

    // 创建用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      nickname,
      email,
      mobile,
      avatar,
      department,
      status: 'active'
    });

    // 分配角色
    if (roleIds && roleIds.length > 0) {
      const roles = await Role.findAll({ where: { id: roleIds } });
      await user.setRoles(roles);
    } else {
      // 默认分配普通用户角色
      const userRole = await Role.findOne({ where: { role_code: 'R_USER' } });
      if (userRole) {
        await user.addRole(userRole);
      }
    }

    logger.info('创建用户成功', { username, userId: user.id });

    res.json({
      code: 200,
      msg: '创建成功',
      data: {
        user: user.toSafeJSON()
      }
    });
  } catch (error) {
    logger.error('创建用户失败', error);
    res.status(500).json({
      code: 500,
      msg: '创建用户失败'
    });
  }
};

/**
 * 获取用户详情
 * @route GET /api/users/:id
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['id', 'role_code', 'role_name'],
        through: { attributes: [] }
      }]
    });

    if (!user) {
      return res.status(404).json({
        code: 404,
        msg: '用户不存在'
      });
    }

    res.json({
      code: 200,
      msg: '获取成功',
      data: user
    });
  } catch (error) {
    logger.error('获取用户详情失败', error);
    res.status(500).json({
      code: 500,
      msg: '获取用户详情失败'
    });
  }
};

/**
 * 更新用户信息
 * @route PUT /api/users/:id
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nickname, email, mobile, avatar, department, roleIds } = req.body;

    logger.info('更新用户请求', { id, body: req.body });

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        code: 404,
        msg: '用户不存在'
      });
    }

    // 检查邮箱是否被其他用户使用
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: id }
        } 
      });
      if (existingEmail) {
        return res.status(400).json({
          code: 400,
          msg: '邮箱已被使用'
        });
      }
    }

    // 更新用户信息
    await user.update({
      nickname,
      email,
      mobile,
      avatar,
      department
    });

    // 更新角色
    if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
      logger.info('更新角色', { roleIds });
      const roles = await Role.findAll({ where: { id: roleIds } });
      logger.info('找到的角色', { roles: roles.map(r => r.id) });
      await user.setRoles(roles);
    } else if (roleIds && Array.isArray(roleIds) && roleIds.length === 0) {
      // 如果roleIds是空数组,清空角色
      await user.setRoles([]);
    }

    logger.info('更新用户成功', { userId: id });

    res.json({
      code: 200,
      msg: '更新成功'
    });
  } catch (error) {
    logger.error('更新用户失败', error);
    logger.error('错误详情', { message: error.message, stack: error.stack });
    res.status(500).json({
      code: 500,
      msg: '更新用户失败: ' + error.message
    });
  }
};

/**
 * 删除用户
 * @route DELETE /api/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 不能删除自己
    if (parseInt(id) === req.user?.id) {
      return res.status(400).json({
        code: 400,
        msg: '不能删除当前登录用户'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        code: 404,
        msg: '用户不存在'
      });
    }

    // 软删除:修改状态为deleted
    await user.update({ status: 'deleted' });

    logger.info('删除用户成功', { userId: id });

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

/**
 * 切换用户状态
 * @route PATCH /api/users/:id/status
 */
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        code: 400,
        msg: '无效的状态值'
      });
    }

    // 不能禁用自己
    if (parseInt(id) === req.user?.id && status === 'inactive') {
      return res.status(400).json({
        code: 400,
        msg: '不能禁用当前登录用户'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        code: 404,
        msg: '用户不存在'
      });
    }

    await user.update({ status });

    logger.info('切换用户状态成功', { userId: id, status });

    res.json({
      code: 200,
      msg: '操作成功'
    });
  } catch (error) {
    logger.error('切换用户状态失败', error);
    res.status(500).json({
      code: 500,
      msg: '操作失败'
    });
  }
};

/**
 * 重置用户密码
 * @route POST /api/users/:id/reset-password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        code: 400,
        msg: '密码长度不能少于6位'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        code: 404,
        msg: '用户不存在'
      });
    }

    await user.update({ password: newPassword });

    logger.info('重置用户密码成功', { userId: id });

    res.json({
      code: 200,
      msg: '密码重置成功'
    });
  } catch (error) {
    logger.error('重置密码失败', error);
    res.status(500).json({
      code: 500,
      msg: '重置密码失败'
    });
  }
};
