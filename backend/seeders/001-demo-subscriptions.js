'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('subscriptions', [
      {
        contact_type: 'email',
        contact_value: 'user1@example.com',
        source: 'website_footer',
        status: 'subscribed',
        subscribed_at: new Date(),
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        contact_type: 'wechat',
        contact_value: 'wallcze',
        source: 'website_footer',
        status: 'subscribed',
        subscribed_at: new Date(),
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        contact_type: 'phone',
        contact_value: '13812345678',
        source: 'contact_form',
        status: 'unsubscribed',
        subscribed_at: new Date(),
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        contact_type: 'email',
        contact_value: 'business@company.com',
        source: 'manual',
        status: 'subscribed',
        subscribed_at: new Date(),
        ip_address: '192.168.1.103',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('subscriptions', null, {});
  }
}; 