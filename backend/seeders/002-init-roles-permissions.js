'use strict';
const bcrypt = require('bcrypt');

/**
 * 初始化角色、权限和管理员用户
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 1. 插入角色
    const roles = await queryInterface.bulkInsert('roles', [
      {
        role_code: 'R_SUPER',
        role_name: '超级管理员',
        description: '拥有系统全部权限',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        role_code: 'R_ADMIN',
        role_name: '管理员',
        description: '拥有系统管理权限',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        role_code: 'R_USER',
        role_name: '普通用户',
        description: '拥有系统普通权限',
        status: 'active',
        created_at: now,
        updated_at: now
      }
    ], { returning: true });

    // 2. 插入权限
    const permissions = await queryInterface.bulkInsert('permissions', [
      // 用户管理权限
      { permission_code: 'user:create', permission_name: '创建用户', resource: 'user', action: 'create', description: '创建新用户', created_at: now },
      { permission_code: 'user:read', permission_name: '查看用户', resource: 'user', action: 'read', description: '查看用户信息', created_at: now },
      { permission_code: 'user:update', permission_name: '更新用户', resource: 'user', action: 'update', description: '更新用户信息', created_at: now },
      { permission_code: 'user:delete', permission_name: '删除用户', resource: 'user', action: 'delete', description: '删除用户', created_at: now },
      
      // 角色管理权限
      { permission_code: 'role:create', permission_name: '创建角色', resource: 'role', action: 'create', description: '创建新角色', created_at: now },
      { permission_code: 'role:read', permission_name: '查看角色', resource: 'role', action: 'read', description: '查看角色信息', created_at: now },
      { permission_code: 'role:update', permission_name: '更新角色', resource: 'role', action: 'update', description: '更新角色信息', created_at: now },
      { permission_code: 'role:delete', permission_name: '删除角色', resource: 'role', action: 'delete', description: '删除角色', created_at: now },
      
      // 权限管理权限
      { permission_code: 'permission:read', permission_name: '查看权限', resource: 'permission', action: 'read', description: '查看权限列表', created_at: now },
      
      // 产品管理权限
      { permission_code: 'product:create', permission_name: '创建产品', resource: 'product', action: 'create', description: '创建新产品', created_at: now },
      { permission_code: 'product:read', permission_name: '查看产品', resource: 'product', action: 'read', description: '查看产品信息', created_at: now },
      { permission_code: 'product:update', permission_name: '更新产品', resource: 'product', action: 'update', description: '更新产品信息', created_at: now },
      { permission_code: 'product:delete', permission_name: '删除产品', resource: 'product', action: 'delete', description: '删除产品', created_at: now },
      
      // 订阅管理权限
      { permission_code: 'subscription:read', permission_name: '查看订阅', resource: 'subscription', action: 'read', description: '查看订阅信息', created_at: now },
      { permission_code: 'subscription:delete', permission_name: '删除订阅', resource: 'subscription', action: 'delete', description: '删除订阅', created_at: now },
      { permission_code: 'subscription:export', permission_name: '导出订阅', resource: 'subscription', action: 'export', description: '导出订阅数据', created_at: now },
      
      // 内容管理权限
      { permission_code: 'content:create', permission_name: '创建内容', resource: 'content', action: 'create', description: '创建新内容', created_at: now },
      { permission_code: 'content:read', permission_name: '查看内容', resource: 'content', action: 'read', description: '查看内容信息', created_at: now },
      { permission_code: 'content:update', permission_name: '更新内容', resource: 'content', action: 'update', description: '更新内容信息', created_at: now },
      { permission_code: 'content:delete', permission_name: '删除内容', resource: 'content', action: 'delete', description: '删除内容', created_at: now },
      
      // 系统设置权限
      { permission_code: 'system:read', permission_name: '查看设置', resource: 'system', action: 'read', description: '查看系统设置', created_at: now },
      { permission_code: 'system:update', permission_name: '更新设置', resource: 'system', action: 'update', description: '更新系统设置', created_at: now },
      
      // 统计查看权限
      { permission_code: 'stats:read', permission_name: '查看统计', resource: 'stats', action: 'read', description: '查看统计数据', created_at: now }
    ], { returning: true });

    // 3. 为超级管理员分配所有权限
    const superRoleId = 1; // R_SUPER
    const allPermissionIds = Array.from({ length: permissions.length }, (_, i) => i + 1);
    const superRolePermissions = allPermissionIds.map(permId => ({
      role_id: superRoleId,
      permission_id: permId,
      created_at: now
    }));
    await queryInterface.bulkInsert('role_permissions', superRolePermissions);

    // 4. 为管理员分配部分权限(除了角色和权限管理)
    const adminRoleId = 2; // R_ADMIN
    const adminPermissionIds = allPermissionIds.filter(id => id > 9); // 排除角色和权限管理
    const adminRolePermissions = adminPermissionIds.map(permId => ({
      role_id: adminRoleId,
      permission_id: permId,
      created_at: now
    }));
    await queryInterface.bulkInsert('role_permissions', adminRolePermissions);

    // 5. 为普通用户分配基础权限(只读)
    const userRoleId = 3; // R_USER
    const userPermissionIds = [2, 6, 9, 11, 14, 18, 21, 23]; // 只读权限
    const userRolePermissions = userPermissionIds.map(permId => ({
      role_id: userRoleId,
      permission_id: permId,
      created_at: now
    }));
    await queryInterface.bulkInsert('role_permissions', userRolePermissions);

    // 6. 创建默认管理员用户
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const users = await queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        password: hashedPassword,
        nickname: '系统管理员',
        email: 'admin@example.com',
        avatar: '',
        department: '技术部',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        username: 'Super',
        password: await bcrypt.hash('123456', 10),
        nickname: '超级管理员',
        email: 'super@example.com',
        avatar: '',
        department: '技术部',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        username: 'Admin',
        password: await bcrypt.hash('123456', 10),
        nickname: '管理员',
        email: 'admin2@example.com',
        avatar: '',
        department: '运营部',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        username: 'User',
        password: await bcrypt.hash('123456', 10),
        nickname: '普通用户',
        email: 'user@example.com',
        avatar: '',
        department: '市场部',
        status: 'active',
        created_at: now,
        updated_at: now
      }
    ], { returning: true });

    // 7. 分配用户角色
    await queryInterface.bulkInsert('user_roles', [
      { user_id: 1, role_id: 1, created_at: now }, // admin -> R_SUPER
      { user_id: 2, role_id: 1, created_at: now }, // Super -> R_SUPER
      { user_id: 3, role_id: 2, created_at: now }, // Admin -> R_ADMIN
      { user_id: 4, role_id: 3, created_at: now }  // User -> R_USER
    ]);

    console.log('✅ 角色、权限和用户初始化完成');
    console.log('📝 默认账号:');
    console.log('   - admin / admin123 (超级管理员)');
    console.log('   - Super / 123456 (超级管理员)');
    console.log('   - Admin / 123456 (管理员)');
    console.log('   - User / 123456 (普通用户)');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  }
};
