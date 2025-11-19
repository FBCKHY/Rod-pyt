'use strict';

/**
 * 为新角色分配权限
 * 根据角色职责分配相应的权限
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 获取所有角色和权限的ID
    const roles = await queryInterface.sequelize.query(
      'SELECT id, role_code FROM roles',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const permissions = await queryInterface.sequelize.query(
      'SELECT id, permission_code FROM permissions',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // 创建权限映射
    const permMap = {};
    permissions.forEach(p => {
      permMap[p.permission_code] = p.id;
    });

    // 创建角色映射
    const roleMap = {};
    roles.forEach(r => {
      roleMap[r.role_code] = r.id;
    });

    // 定义每个角色的权限
    const rolePermissions = {
      // 财务管理员 - 订阅、统计、系统查看
      R_FINANCE: [
        'subscription:read',
        'subscription:export',
        'stats:read',
        'system:read'
      ],

      // 数据分析师 - 所有查看权限 + 统计
      R_ANALYST: [
        'user:read',
        'role:read',
        'permission:read',
        'product:read',
        'subscription:read',
        'content:read',
        'system:read',
        'stats:read'
      ],

      // 客服专员 - 订阅管理、内容查看
      R_SUPPORT: [
        'subscription:read',
        'subscription:delete',
        'content:read',
        'product:read'
      ],

      // 营销经理 - 产品、内容、订阅管理
      R_MARKETING: [
        'product:create',
        'product:read',
        'product:update',
        'content:create',
        'content:read',
        'content:update',
        'content:delete',
        'subscription:read',
        'subscription:export',
        'stats:read'
      ],

      // 访客 - 仅查看权限
      R_GUEST: [
        'product:read',
        'content:read'
      ],

      // 系统维护员 - 系统设置、用户管理
      R_MAINTAINER: [
        'user:read',
        'user:update',
        'system:read',
        'system:update',
        'stats:read'
      ],

      // 项目经理 - 产品、内容、用户查看、统计
      R_PM: [
        'user:read',
        'product:create',
        'product:read',
        'product:update',
        'content:create',
        'content:read',
        'content:update',
        'subscription:read',
        'stats:read'
      ]
    };

    // 插入角色权限关联
    const rolePermissionRecords = [];
    
    for (const [roleCode, permCodes] of Object.entries(rolePermissions)) {
      const roleId = roleMap[roleCode];
      if (!roleId) continue;

      for (const permCode of permCodes) {
        const permId = permMap[permCode];
        if (!permId) continue;

        rolePermissionRecords.push({
          role_id: roleId,
          permission_id: permId,
          created_at: now
        });
      }
    }

    if (rolePermissionRecords.length > 0) {
      await queryInterface.bulkInsert('role_permissions', rolePermissionRecords, {});
    }

    console.log('✅ 成功为新角色分配权限');
    console.log('\n权限分配详情:');
    console.log('  财务管理员: 订阅管理、数据统计');
    console.log('  数据分析师: 所有查看权限 + 统计分析');
    console.log('  客服专员: 订阅处理、产品查看');
    console.log('  营销经理: 产品、内容、订阅管理');
    console.log('  访客: 仅产品和内容查看');
    console.log('  系统维护员: 用户管理、系统设置');
    console.log('  项目经理: 产品、内容管理、数据查看');
  },

  down: async (queryInterface, Sequelize) => {
    // 删除新角色的权限分配
    const roles = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE role_code IN ('R_FINANCE', 'R_ANALYST', 'R_SUPPORT', 'R_MARKETING', 'R_GUEST', 'R_MAINTAINER', 'R_PM')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const roleIds = roles.map(r => r.id);
    
    await queryInterface.bulkDelete('role_permissions', {
      role_id: {
        [Sequelize.Op.in]: roleIds
      }
    }, {});
  }
};
