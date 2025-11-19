'use strict';

/**
 * 添加更多角色
 * 根据实际业务需求添加各种角色
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 添加更多业务角色
    await queryInterface.bulkInsert('roles', [
      {
        role_code: 'R_FINANCE',
        role_name: '财务管理员',
        description: '管理财务相关权限',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        role_code: 'R_ANALYST',
        role_name: '数据分析师',
        description: '拥有数据分析权限',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        role_code: 'R_SUPPORT',
        role_name: '客服专员',
        description: '处理客户咨询和支持',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        role_code: 'R_MARKETING',
        role_name: '营销经理',
        description: '管理营销活动和推广',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        role_code: 'R_GUEST',
        role_name: '访客',
        description: '仅限浏览权限',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        role_code: 'R_MAINTAINER',
        role_name: '系统维护员',
        description: '负责系统维护和配置',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        role_code: 'R_PM',
        role_name: '项目经理',
        description: '管理项目和团队',
        status: 'active',
        created_at: now,
        updated_at: now
      }
    ], {});

    console.log('✅ 成功添加7个业务角色');
    console.log('现在总共有10个角色:');
    console.log('  1. 超级管理员 (R_SUPER)');
    console.log('  2. 管理员 (R_ADMIN)');
    console.log('  3. 普通用户 (R_USER)');
    console.log('  4. 财务管理员 (R_FINANCE)');
    console.log('  5. 数据分析师 (R_ANALYST)');
    console.log('  6. 客服专员 (R_SUPPORT)');
    console.log('  7. 营销经理 (R_MARKETING)');
    console.log('  8. 访客 (R_GUEST)');
    console.log('  9. 系统维护员 (R_MAINTAINER)');
    console.log(' 10. 项目经理 (R_PM)');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', {
      role_code: {
        [Sequelize.Op.in]: [
          'R_FINANCE',
          'R_ANALYST',
          'R_SUPPORT',
          'R_MARKETING',
          'R_GUEST',
          'R_MAINTAINER',
          'R_PM'
        ]
      }
    }, {});
  }
};
