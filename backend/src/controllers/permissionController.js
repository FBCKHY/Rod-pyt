const logger = require('../utils/logger');
const { Permission, Role } = require('../models');
const { Op } = require('sequelize');

/**
 * 权限控制器
 * 处理权限相关操作
 */

/**
 * 获取权限列表
 * @route GET /api/permissions
 */
exports.getPermissionList = async (req, res) => {
  try {
    const { page = 1, size = 100, keyword = '', resource = '' } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(size);
    const limit = parseInt(size);

    // 构建查询条件
    const where = {};
    
    if (keyword) {
      where[Op.or] = [
        { permission_code: { [Op.iLike]: `%${keyword}%` } },
        { permission_name: { [Op.iLike]: `%${keyword}%` } }
      ];
    }

    if (resource) {
      where.resource = resource;
    }

    // 查询权限列表
    const { count, rows } = await Permission.findAndCountAll({
      where,
      offset,
      limit,
      order: [['resource', 'ASC'], ['action', 'ASC']]
    });

    res.json({
      code: 200,
      msg: '获取成功',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        size: parseInt(size)
      }
    });
  } catch (error) {
    logger.error('获取权限列表失败', error);
    res.status(500).json({
      code: 500,
      msg: '获取权限列表失败'
    });
  }
};

/**
 * 获取权限树形结构
 * @route GET /api/permissions/tree
 */
exports.getPermissionTree = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      order: [['resource', 'ASC'], ['action', 'ASC']]
    });

    // 按资源分组
    const tree = {};
    permissions.forEach(permission => {
      const resource = permission.resource || 'other';
      if (!tree[resource]) {
        tree[resource] = {
          resource,
          label: getResourceLabel(resource),
          children: []
        };
      }
      tree[resource].children.push({
        id: permission.id,
        code: permission.permission_code,
        name: permission.permission_name,
        action: permission.action,
        description: permission.description
      });
    });

    // 转换为数组
    const treeArray = Object.values(tree);

    res.json({
      code: 200,
      msg: '获取成功',
      data: treeArray
    });
  } catch (error) {
    logger.error('获取权限树失败', error);
    res.status(500).json({
      code: 500,
      msg: '获取权限树失败'
    });
  }
};

/**
 * 创建权限
 * @route POST /api/permissions
 */
exports.createPermission = async (req, res) => {
  try {
    const { permission_code, permission_name, resource, action, description } = req.body;

    // 验证必填字段
    if (!permission_code || !permission_name) {
      return res.status(400).json({
        code: 400,
        msg: '权限代码和名称不能为空'
      });
    }

    // 检查权限代码是否已存在
    const existingPermission = await Permission.findOne({ where: { permission_code } });
    if (existingPermission) {
      return res.status(400).json({
        code: 400,
        msg: '权限代码已存在'
      });
    }

    // 创建权限
    const permission = await Permission.create({
      permission_code,
      permission_name,
      resource,
      action,
      description
    });

    logger.info('创建权限成功', { permission_code, permissionId: permission.id });

    res.json({
      code: 200,
      msg: '创建成功',
      data: { permission }
    });
  } catch (error) {
    logger.error('创建权限失败', error);
    res.status(500).json({
      code: 500,
      msg: '创建权限失败'
    });
  }
};

/**
 * 更新权限
 * @route PUT /api/permissions/:id
 */
exports.updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { permission_name, resource, action, description } = req.body;

    const permission = await Permission.findByPk(id);
    if (!permission) {
      return res.status(404).json({
        code: 404,
        msg: '权限不存在'
      });
    }

    // 更新权限信息
    await permission.update({
      permission_name,
      resource,
      action,
      description
    });

    logger.info('更新权限成功', { permissionId: id });

    res.json({
      code: 200,
      msg: '更新成功'
    });
  } catch (error) {
    logger.error('更新权限失败', error);
    res.status(500).json({
      code: 500,
      msg: '更新权限失败'
    });
  }
};

/**
 * 删除权限
 * @route DELETE /api/permissions/:id
 */
exports.deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const permission = await Permission.findByPk(id);
    if (!permission) {
      return res.status(404).json({
        code: 404,
        msg: '权限不存在'
      });
    }

    // 检查是否有角色使用该权限
    const roles = await permission.getRoles();
    if (roles.length > 0) {
      return res.status(400).json({
        code: 400,
        msg: `该权限被${roles.length}个角色使用，无法删除`
      });
    }

    // 删除权限
    await permission.destroy();

    logger.info('删除权限成功', { permissionId: id });

    res.json({
      code: 200,
      msg: '删除成功'
    });
  } catch (error) {
    logger.error('删除权限失败', error);
    res.status(500).json({
      code: 500,
      msg: '删除权限失败'
    });
  }
};

/**
 * 获取资源标签
 */
function getResourceLabel(resource) {
  const labels = {
    user: '用户管理',
    role: '角色管理',
    permission: '权限管理',
    product: '产品管理',
    subscription: '订阅管理',
    content: '内容管理',
    system: '系统设置',
    stats: '数据统计'
  };
  return labels[resource] || resource;
}

module.exports = exports;
