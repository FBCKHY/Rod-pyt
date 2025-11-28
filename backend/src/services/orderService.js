const { Op } = require('sequelize');
const { Order, OrderItem, Product, sequelize } = require('../models');

class OrderService {
  /**
   * 生成订单号
   * 格式: RD + 年月日 + 6位随机数
   * 示例: RD20251121000001
   */
  generateOrderNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    return `RD${year}${month}${day}${random}`;
  }

  /**
   * 获取订单列表
   */
  async getOrderList(params) {
    const {
      page = 1,
      limit = 20,
      status,
      customerPhone,
      startDate,
      endDate,
      search
    } = params;

    const where = {};

    // 条件筛选
    if (status) where.status = status;
    if (customerPhone) where.customerPhone = customerPhone;
    
    // 日期范围
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    // 搜索（订单号、客户姓名、手机号）
    if (search) {
      where[Op.or] = [
        { orderNumber: { [Op.like]: `%${search}%` } },
        { customerName: { [Op.like]: `%${search}%` } },
        { customerPhone: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const result = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'model', 'cardImage']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      items: result.rows,
      total: result.count,
      page,
      limit,
      totalPages: Math.ceil(result.count / limit)
    };
  }

  /**
   * 根据ID获取订单详情
   */
  async getOrderById(id) {
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'model', 'cardImage', 'price']
            }
          ]
        }
      ]
    });
    return order;
  }

  /**
   * 根据订单号获取订单
   */
  async getOrderByNumber(orderNumber) {
    const order = await Order.findOne({
      where: { orderNumber },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'model', 'cardImage']
            }
          ]
        }
      ]
    });
    return order;
  }

  /**
   * 创建订单
   */
  async createOrder(orderData) {
    const transaction = await sequelize.transaction();

    try {
      const { items, ...orderInfo } = orderData;

      // 生成订单号
      let orderNumber;
      let attempts = 0;
      const maxAttempts = 10;

      // 确保订单号唯一
      while (attempts < maxAttempts) {
        orderNumber = this.generateOrderNumber();
        const existing = await Order.findOne({ 
          where: { orderNumber },
          transaction 
        });
        if (!existing) break;
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error('生成订单号失败，请重试');
      }

      // 计算订单总金额
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        // 获取产品信息
        const product = await Product.findByPk(item.productId, { transaction });
        if (!product) {
          throw new Error(`产品不存在: ${item.productId}`);
        }

        const quantity = parseInt(item.quantity) || 1;
        const price = parseFloat(item.price || product.price);
        const subtotal = price * quantity;
        totalAmount += subtotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          productModel: product.model,
          productImage: product.cardImage,
          quantity,
          price,
          subtotal,
          variant: item.variant || null
        });
      }

      // 创建订单
      const order = await Order.create(
        {
          orderNumber,
          ...orderInfo,
          totalAmount,
          status: 'pending'
        },
        { transaction }
      );

      // 创建订单项
      for (const item of orderItems) {
        await OrderItem.create(
          {
            orderId: order.id,
            ...item
          },
          { transaction }
        );
      }

      await transaction.commit();

      // 返回完整订单信息
      return await this.getOrderById(order.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 更新订单
   */
  async updateOrder(id, orderData) {
    const transaction = await sequelize.transaction();

    try {
      const order = await Order.findByPk(id, { transaction });
      if (!order) {
        return null;
      }

      // 不允许修改的字段
      const { orderNumber, totalAmount, items, ...updateData } = orderData;

      await order.update(updateData, { transaction });

      await transaction.commit();

      return await this.getOrderById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(id, status) {
    const transaction = await sequelize.transaction();

    try {
      const order = await Order.findByPk(id, { transaction });
      if (!order) {
        return null;
      }

      const updateData = { status };

      // 根据状态更新时间戳
      if (status === 'confirmed') {
        updateData.confirmedAt = new Date();
      } else if (status === 'shipped') {
        updateData.shippedAt = new Date();
      } else if (status === 'delivered') {
        updateData.deliveredAt = new Date();
      }

      await order.update(updateData, { transaction });

      await transaction.commit();

      return await this.getOrderById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 删除订单
   */
  async deleteOrder(id) {
    const order = await Order.findByPk(id);
    if (!order) {
      return false;
    }

    await order.destroy();
    return true;
  }

  /**
   * 获取订单统计信息
   */
  async getOrderStats(params = {}) {
    const { startDate, endDate } = params;

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const [
      totalCount,
      pendingCount,
      confirmedCount,
      processingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
      totalAmount,
      statusStats
    ] = await Promise.all([
      // 总订单数
      Order.count({ where }),
      
      // 待处理
      Order.count({ where: { ...where, status: 'pending' } }),
      
      // 已确认
      Order.count({ where: { ...where, status: 'confirmed' } }),
      
      // 处理中
      Order.count({ where: { ...where, status: 'processing' } }),
      
      // 已发货
      Order.count({ where: { ...where, status: 'shipped' } }),
      
      // 已送达
      Order.count({ where: { ...where, status: 'delivered' } }),
      
      // 已取消
      Order.count({ where: { ...where, status: 'cancelled' } }),
      
      // 总金额
      Order.sum('totalAmount', { where }),
      
      // 按状态统计
      Order.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('totalAmount')), 'amount']
        ],
        where,
        group: ['status'],
        raw: true
      })
    ]);

    return {
      overview: {
        total: totalCount,
        pending: pendingCount,
        confirmed: confirmedCount,
        processing: processingCount,
        shipped: shippedCount,
        delivered: deliveredCount,
        cancelled: cancelledCount,
        totalAmount: totalAmount || 0
      },
      statusStats
    };
  }

  /**
   * 获取今日订单统计
   */
  async getTodayStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.getOrderStats({
      startDate: today
    });
  }
}

module.exports = new OrderService();
