const request = require('supertest');
const app = require('../src/app');

describe('API基础测试', () => {
  describe('GET /health', () => {
    it('应该返回健康状态', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body).toMatchObject({
        code: 200,
        msg: 'Service is healthy',
        data: expect.objectContaining({
          timestamp: expect.any(String),
          uptime: expect.any(Number),
          environment: expect.any(String),
          version: '1.0.0'
        }),
        timestamp: expect.any(Number)
      });
    });
  });

  describe('POST /api/subscriptions', () => {
    it('应该成功创建邮箱订阅', async () => {
      const subscriptionData = {
        contactType: 'email',
        contactValue: 'test@example.com',
        source: 'website_footer'
      };

      const res = await request(app)
        .post('/api/subscriptions')
        .send(subscriptionData)
        .expect(201);

      expect(res.body).toMatchObject({
        code: 200,
        msg: '订阅成功',
        data: expect.objectContaining({
          contactType: 'email',
          contactValue: 'test@example.com',
          source: 'website_footer',
          status: 'subscribed'
        })
      });
    });

    it('应该拒绝无效的邮箱格式', async () => {
      const invalidData = {
        contactType: 'email',
        contactValue: 'invalid-email',
        source: 'website_footer'
      };

      const res = await request(app)
        .post('/api/subscriptions')
        .send(invalidData)
        .expect(400);

      expect(res.body.code).toBe(400);
      expect(res.body.msg).toContain('邮箱格式不正确');
    });

    it('应该拒绝缺少必需字段', async () => {
      const incompleteData = {
        contactType: 'email'
        // 缺少 contactValue 和 source
      };

      const res = await request(app)
        .post('/api/subscriptions')
        .send(incompleteData)
        .expect(400);

      expect(res.body.code).toBe(400);
    });
  });

  describe('GET /api/admin/subscriptions', () => {
    it('应该返回订阅列表（开发环境）', async () => {
      const res = await request(app)
        .get('/api/admin/subscriptions')
        .expect(200);

      expect(res.body).toMatchObject({
        code: 200,
        msg: '查询成功',
        data: expect.objectContaining({
          list: expect.any(Array),
          pagination: expect.objectContaining({
            page: expect.any(Number),
            size: expect.any(Number),
            total: expect.any(Number),
            pages: expect.any(Number)
          })
        })
      });
    });
  });

  describe('404错误处理', () => {
    it('应该返回404错误对于不存在的路由', async () => {
      const res = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(res.body).toMatchObject({
        code: 404,
        msg: '接口不存在'
      });
    });
  });
}); 