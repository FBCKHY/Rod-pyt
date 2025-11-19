const logger = require('../utils/logger');
const { Role, Permission, User } = require('../models');
const { Op } = require('sequelize');

/**
 * 角色控制器
 * 处理角色相关操作
 */

/**
 * 获取角色列表
 * @route GET /api/roles
 */
exports.getRoleList = async (req, res) => {
  try {
    const { page = 1, size = 100, keyword = '', status = '' } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(size);
    const limit = parseInt(size);

    // 构建查询条件
    const where = {};
    
    if (keyword) {
      where[Op.or] = [
        { role_code: { [Op.iLike]: `%${keyword}%` } },
        { role_name: { [Op.iLike]: `%${keyword}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    // 查询角色列表
    const { count, rows } = await Role.findAndCountAll({
      where,
      include: [{
        model: Permission,
        as: 'permissions',
        attributes: ['id', 'permission_code', 'permission_name'],
        through: { attributes: [] }
      }],
      offset,
      limit,
      order: [['created_at', 'DESC']]
    });

    // 格式化返回数据
    const list = rows.map(role => ({
      id: role.id,
      role_code: role.role_code,
      role_name: role.role_name,
      description: role.description,
      status: role.status,
      permission_count: role.permissions.length,
      permissions: role.permissions.map(p => ({
        id: p.id,
        code: p.permission_code,
        name: p.permission_name
      })),
      created_at: role.created_at,
      updated_at: role.updated_at
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
    logger.error('获取角色列表失败', error);
    res.status(500).json({
      code: 500,
      msg: '获取角色列表失败'
    });
  }
};

/**
 * 获取角色详情
 * @route GET /api/roles/:id
 */
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id, {
      include: [{
        model: Permission,
        as: 'permissions',
        attributes: ['id', 'permission_code', 'permission_name', 'resource', 'action'],
        through: { attributes: [] }
      }]
    });

    if (!role) {
      return res.status(404).json({
        code: 404,
        msg: '角色不存在'
      });
    }

    res.json({
      code: 200,
      msg: '获取成功',
      data: role
    });
  } catch (error) {
    logger.error('获取角色详情失败', error);
    res.status(500).json({
      code: 500,
      msg: '获取角色详情失败'
    });
  }
};

/**
 * 创建角色
 * @route POST /api/roles
 */
exports.createRole = async (req, res) => {
  try {
    const { role_code, role_name, description, permissionIds } = req.body;

    // 验证必填字段
    if (!role_code || !role_name) {
      return res.status(400).json({
        code: 400,
        msg: '角色代码和名称不能为空'
      });
    }

    // 检查角色代码是否已存在
    const existingRole = await Role.findOne({ where: { role_code } });
    if (existingRole) {
      return res.status(400).json({
        code: 400,
        msg: '角色代码已存在'
      });
    }

    // 创建角色
    const role = await Role.create({
      role_code,
      role_name,
      description,
      status: 'active'
    });

    // 分配权限
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await Permission.findAll({ where: { id: permissionIds } });
      await role.setPermissions(permissions);
    }

    logger.info('创建角色成功', { role_code, roleId: role.id });

    res.json({
      code: 200,
      msg: '创建成功',
      data: { role }
    });
  } catch (error) {
    logger.error('创建角色失败', error);
    res.status(500).json({
      code: 500,
      msg: '创建角色失败'
    });
  }
};

/**
 * 更新角色
 * @route PUT /api/roles/:id
 */
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_name, description, permissionIds } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({
        code: 404,
        msg: '角色不存在'
      });
    }

    // 更新角色信息
    await role.update({
      role_name,
      description
    });

    // 更新权限
    if (permissionIds) {
      const permissions = await Permission.findAll({ where: { id: permissionIds } });
      await role.setPermissions(permissions);
    }

    logger.info('更新角色成功', { roleId: id });

    res.json({
      code: 200,
      msg: '更新成功'
    });
  } catch (error) {
    logger.error('更新角色失败', error);
    res.status(500).json({
      code: 500,
      msg: '更新角色失败'
    });
  }
};

/**
 * 删除角色
 * @route DELETE /api/roles/:id
 */
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({
        code: 404,
        msg: '角色不存在'
      });
    }

    // 检查是否有用户使用该角色
    const users = await role.getUsers();
    if (users.length > 0) {
      return res.status(400).json({
        code: 400,
        msg: `该角色下还有${users.length}个用户，无法删除`
      });
    }

    // 软删除:修改状态为inactive
    await role.update({ status: 'inactive' });

    logger.info('删除角色成功', { roleId: id });

    res.json({
      code: 200,
      msg: '删除成功'
    });
  } catch (error) {
    logger.error('删除角色失败', error);
    res.status(500).json({
      code: 500,
      msg: '删除角色失败'
    });
  }
};

/**
 * 分配权限给角色
 * @route POST /api/roles/:id/permissions
 */
exports.assignPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;

    if (!permissionIds || !Array.isArray(permissionIds)) {
      return res.status(400).json({
        code: 400,
        msg: '权限ID列表不能为空'
      });
    }

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({
        code: 404,
        msg: '角色不存在'
      });
    }

    // 分配权限
    const permissions = await Permission.findAll({ where: { id: permissionIds } });
    await role.setPermissions(permissions);

    logger.info('分配权限成功', { roleId: id, permissionCount: permissions.length });

    res.json({
      code: 200,
      msg: '分配成功'
    });
  } catch (error) {
    logger.error('分配权限失败', error);
    res.status(500).json({
      code: 500,
      msg: '分配权限失败'
    });
  }
};

/**
 * 获取角色的用户列表
 * @route GET /api/roles/:id/users
 */
exports.getRoleUsers = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id, {
      include: [{
        model: User,
        as: 'users',
        attributes: ['id', 'username', 'nickname', 'email', 'status'],
        through: { attributes: [] }
      }]
    });

    if (!role) {
      return res.status(404).json({
        code: 404,
        msg: '角色不存在'
      });
    }

    res.json({
      code: 200,
      msg: '获取成功',
      data: {
        role_name: role.role_name,
        users: role.users
      }
    });
  } catch (error) {
    logger.error('获取角色用户失败', error);
    res.status(500).json({
      code: 500,
      msg: '获取角色用户失败'
    });
  }
};

module.exports = exports;
