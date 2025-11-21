const subscriptionService = require('../services/subscriptionService');
const statsService = require('../services/statsService');
const { formatResponse } = require('../utils/response');
const logger = require('../utils/logger');
const ExcelJS = require('exceljs');

class AdminController {
  /**
   * 获取用户信息
   */
  async getUserInfo(req, res) {
    try {
      // 返回开发环境的默认用户信息
      const userInfo = {
        id: req.user?.id || 1,
        username: req.user?.email || 'admin@example.com',
        nickname: '管理员',
        avatar: '/src/assets/img/avatar/avatar.webp',
        role: req.user?.role || 'admin',
        permissions: ['subscription:read', 'subscription:write', 'subscription:delete'],
        lastLoginTime: new Date().toISOString()
      };

      logger.info('获取用户信息成功', { userId: userInfo.id });
      res.json(formatResponse(200, '获取用户信息成功', userInfo));
    } catch (error) {
      logger.error('获取用户信息失败', error);
      res.status(500).json(formatResponse(500, '获取用户信息失败'));
    }
  }

  /**
   * 获取订阅列表
   */
  async getSubscriptions(req, res) {
    try {
      const {
        page = 1,
        size = 20,
        status,
        contactType,
        source,
        contact,
        startDate,
        endDate,
        userSource,
        subject
      } = req.query;

      const result = await subscriptionService.getSubscriptionList({
        page: parseInt(page),
        size: parseInt(size),
        status,
        contactType,
        source,
        contact,
        startDate,
        endDate,
        userSource,
        subject
      });

      res.json(formatResponse(200, '查询成功', result));
    } catch (error) {
      logger.error('获取订阅列表失败', error);
      res.status(500).json(formatResponse(500, '服务器内部错误'));
    }
  }

  /**
   * 切换订阅状态
   */
  async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const subscription = await subscriptionService.updateSubscriptionStatus(
        parseInt(id),
        status
      );

      if (!subscription) {
        return res.status(404).json(formatResponse(404, '订阅记录不存在'));
      }

      logger.info('订阅状态更新成功', { 
        subscriptionId: id,
        newStatus: status 
      });

      res.json(formatResponse(200, '状态更新成功', subscription));
    } catch (error) {
      logger.error('更新订阅状态失败', error);
      res.status(500).json(formatResponse(500, '服务器内部错误'));
    }
  }

  /**
   * 更新订阅信息（完整更新）
   */
  async updateSubscription(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const subscription = await subscriptionService.updateSubscription(
        parseInt(id),
        updateData
      );

      if (!subscription) {
        return res.status(404).json(formatResponse(404, '订阅记录不存在'));
      }

      logger.info('订阅信息更新成功', { 
        subscriptionId: id,
        updatedFields: Object.keys(updateData)
      });

      res.json(formatResponse(200, '更新成功', subscription));
    } catch (error) {
      logger.error('更新订阅信息失败', error);
      res.status(500).json(formatResponse(500, '服务器内部错误'));
    }
  }

  /**
   * 删除订阅
   */
  async deleteSubscription(req, res) {
    try {
      const { id } = req.params;
      
      const deleted = await subscriptionService.deleteSubscription(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json(formatResponse(404, '订阅记录不存在'));
      }

      logger.info('订阅删除成功', { subscriptionId: id });

      res.json(formatResponse(200, '删除成功', { deletedId: parseInt(id) }));
    } catch (error) {
      logger.error('删除订阅失败', error);
      res.status(500).json(formatResponse(500, '服务器内部错误'));
    }
  }

  /**
   * 批量删除订阅
   */
  async batchDelete(req, res) {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json(formatResponse(400, '请提供有效的ID列表'));
      }

      const deletedCount = await subscriptionService.batchDeleteSubscriptions(ids);

      logger.info('批量删除完成', { 
        requestedIds: ids,
        deletedCount 
      });

      res.json(formatResponse(200, '批量删除成功', {
        deletedCount,
        deletedIds: ids
      }));
    } catch (error) {
      logger.error('批量删除失败', error);
      res.status(500).json(formatResponse(500, '服务器内部错误'));
    }
  }

  /**
   * 创建订阅
   */
  async createSubscription(req, res) {
    try {
      const { contactType, contactValue, source = 'manual' } = req.body;

      const subscription = await subscriptionService.createSubscription({
        contactType,
        contactValue,
        source,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      logger.info('管理员创建订阅成功', { 
        subscriptionId: subscription.id,
        contactType,
        contactValue 
      });

      res.status(201).json(formatResponse(200, '添加成功', subscription));
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json(formatResponse(400, error.message));
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json(formatResponse(409, '该联系方式已存在'));
      }
      
      logger.error('管理员创建订阅失败', error);
      res.status(500).json(formatResponse(500, '服务器内部错误'));
    }
  }

  /**
   * 获取统计数据
   */
  async getStats(req, res) {
    try {
      const stats = await statsService.getSubscriptionStats();
      res.json(formatResponse(200, '查询成功', stats));
    } catch (error) {
      logger.error('获取统计数据失败', error);
      res.status(500).json(formatResponse(500, '服务器内部错误'));
    }
  }

  /**
   * 检查联系方式是否存在
   */
  async checkExists(req, res) {
    try {
      const { contactType, contactValue } = req.query;

      if (!contactType || !contactValue) {
        return res.status(400).json(formatResponse(400, '缺少必要参数'));
      }

      const subscription = await subscriptionService.findByContact(
        contactType,
        contactValue
      );

      res.json(formatResponse(200, '查询成功', {
        exists: !!subscription,
        subscription: subscription || null
      }));
    } catch (error) {
      logger.error('检查联系方式失败', error);
      res.status(500).json(formatResponse(500, '服务器内部错误'));
    }
  }

  /**
   * 导出订阅数据为Excel
   */
  async exportSubscriptions(req, res) {
    try {
      const {
        status,
        contactType,
        source,
        contact,
        startDate,
        endDate,
        userSource,
        subject
      } = req.query;

      // 获取所有符合条件的数据（不分页）
      const result = await subscriptionService.getSubscriptionList({
        page: 1,
        size: 10000, // 最多导出10000条
        status,
        contactType,
        source,
        contact,
        startDate,
        endDate,
        userSource,
        subject
      });
      
      // 创建工作簿
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('订阅用户');

      // 设置列
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: '姓名', key: 'fullName', width: 15 },
        { header: '联系方式类型', key: 'contactType', width: 15 },
        { header: '邮箱/微信/电话', key: 'contactValue', width: 30 },
        { header: '公司/平台/其他', key: 'sourceType', width: 15 },
        { header: '公司/平台名称', key: 'sourceOrCompanyName', width: 30 },
        { header: '状态', key: 'status', width: 12 },
        { header: '咨询主题', key: 'subject', width: 25 },
        { header: '留言内容', key: 'message', width: 50 },
        { header: '备注', key: 'note', width: 30 },
        { header: 'IP地址', key: 'ipAddress', width: 18 },
        { header: '订阅时间', key: 'subscribedAt', width: 20 }
      ];

      // 设置表头样式
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // 添加数据
      result.list.forEach(item => {
        // 判断用户来源类型和名称
        let sourceType = '-'
        let sourceOrCompanyName = '-'
        
        if (item.company) {
          // 公司客户
          sourceType = '公司'
          sourceOrCompanyName = item.company
        } else if (item.userSource) {
          // 平台用户
          sourceType = '平台'
          sourceOrCompanyName = item.userSource
        } else {
          // 其他
          sourceType = '其他'
          sourceOrCompanyName = '-'
        }
        
        worksheet.addRow({
          id: item.id,
          fullName: item.fullName || '-',
          contactType: this.getContactTypeText(item.contactType),
          contactValue: item.contactValue,
          sourceType: sourceType,
          sourceOrCompanyName: sourceOrCompanyName,
          status: item.status === 'subscribed' ? '已订阅' : '已取消',
          subject: item.subject || '-',
          message: item.message || '-',
          note: item.note || '-',
          ipAddress: item.ipAddress || '-',
          subscribedAt: new Date(item.subscribedAt).toLocaleString('zh-CN')
        });
      });

      // 设置响应头
      const filename = `订阅用户_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

      // 写入响应
      await workbook.xlsx.write(res);
      
      logger.info('导出订阅数据成功', { count: result.list.length });
      res.end();
    } catch (error) {
      logger.error('导出订阅数据失败', error);
      res.status(500).json(formatResponse(500, '导出失败'));
    }
  }

  // 辅助方法：获取联系方式类型文本
  getContactTypeText(type) {
    const types = {
      'email': '邮箱',
      'wechat': '微信',
      'phone': '电话'
    };
    return types[type] || type;
  }

  // 辅助方法：获取来源文本
  getSourceText(source) {
    const sources = {
      'website_footer': '网站底部',
      'contact_form': '联系表单',
      'manual': '手动添加'
    };
    return sources[source] || source;
  }
}

module.exports = new AdminController();