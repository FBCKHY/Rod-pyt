const orderService = require('../services/orderService');
const { formatResponse } = require('../utils/response');
const logger = require('../utils/logger');

class OrderController {
  /**
   * 获取订单列表
   */
  async getList(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        customerPhone,
        startDate,
        endDate,
        search 
      } = req.query;
      
      const result = await orderService.getOrderList({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        customerPhone,
        startDate,
        endDate,
        search
      });

      res.json(formatResponse.success(result));
    } catch (error) {
      logger.error('获取订单列表失败:', error);
      res.status(500).json(formatResponse.error('获取订单列表失败'));
    }
  }

  /**
   * 获取订单详情
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);
      
      if (!order) {
        return res.status(404).json(formatResponse.error('订单不存在'));
      }

      res.json(formatResponse.success(order));
    } catch (error) {
      logger.error('获取订单详情失败:', error);
      res.status(500).json(formatResponse.error('获取订单详情失败'));
    }
  }

  /**
   * 创建订单（前端提交）
   */
  async create(req, res) {
    try {
      const orderData = req.body;
      
      // 验证必填字段
      const required = ['customerName', 'customerPhone', 'province', 'city', 'address', 'items'];
      for (const field of required) {
        if (!orderData[field]) {
          return res.status(400).json(formatResponse.error(`缺少必填字段: ${field}`));
        }
      }

      // 验证订单项
      if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
        return res.status(400).json(formatResponse.error('订单至少需要一个商品'));
      }

      const order = await orderService.createOrder(orderData);
      
      logger.info('创建订单成功:', { orderId: order.id, orderNumber: order.orderNumber });
      res.json(formatResponse.success(order, '订单创建成功'));
    } catch (error) {
      logger.error('创建订单失败:', error);
      res.status(500).json(formatResponse.error('创建订单失败: ' + error.message));
    }
  }

  /**
   * 更新订单
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const orderData = req.body;
      
      const order = await orderService.updateOrder(id, orderData);
      
      if (!order) {
        return res.status(404).json(formatResponse.error('订单不存在'));
      }

      logger.info('更新订单成功:', { orderId: id });
      res.json(formatResponse.success(order, '订单更新成功'));
    } catch (error) {
      logger.error('更新订单失败:', error);
      res.status(500).json(formatResponse.error('更新订单失败: ' + error.message));
    }
  }

  /**
   * 更新订单状态
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json(formatResponse.error('缺少状态参数'));
      }

      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json(formatResponse.error('无效的订单状态'));
      }

      const order = await orderService.updateOrderStatus(id, status);
      
      if (!order) {
        return res.status(404).json(formatResponse.error('订单不存在'));
      }

      logger.info('更新订单状态成功:', { orderId: id, status });
      res.json(formatResponse.success(order, '订单状态更新成功'));
    } catch (error) {
      logger.error('更新订单状态失败:', error);
      res.status(500).json(formatResponse.error('更新订单状态失败: ' + error.message));
    }
  }

  /**
   * 删除订单
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await orderService.deleteOrder(id);
      
      if (!result) {
        return res.status(404).json(formatResponse.error('订单不存在'));
      }

      logger.info('删除订单成功:', { orderId: id });
      res.json(formatResponse.success(null, '订单删除成功'));
    } catch (error) {
      logger.error('删除订单失败:', error);
      res.status(500).json(formatResponse.error('删除订单失败: ' + error.message));
    }
  }

  /**
   * 获取订单统计信息
   */
  async getStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const stats = await orderService.getOrderStats({ startDate, endDate });
      res.json(formatResponse.success(stats));
    } catch (error) {
      logger.error('获取订单统计失败:', error);
      res.status(500).json(formatResponse.error('获取订单统计失败'));
    }
  }

  /**
   * 根据订单号查询订单
   */
  async getByOrderNumber(req, res) {
    try {
      const { orderNumber } = req.params;
      const order = await orderService.getOrderByNumber(orderNumber);
      
      if (!order) {
        return res.status(404).json(formatResponse.error('订单不存在'));
      }

      res.json(formatResponse.success(order));
    } catch (error) {
      logger.error('查询订单失败:', error);
      res.status(500).json(formatResponse.error('查询订单失败'));
    }
  }
}

module.exports = new OrderController();
