const logger = require('../utils/logger');
const OperationLog = require('../models/OperationLog');
const { Op } = require('sequelize');

/**
 * 操作日志控制器
 */

/**
 * 获取操作日志列表
 * @route GET /api/operation-logs
 */
exports.getOperationLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      size = 20, 
      module = '', 
      action = '', 
      username = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(size);
    const limit = Math.min(parseInt(size), 100); // 限制最大100条，提升性能

    // 构建查询条件
    const where = {};
    
    if (module) {
      where.module = module;
    }
    
    if (action) {
      where.action = action;
    }
    
    if (username) {
      where.username = { [Op.iLike]: `%${username}%` };
    }
    
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // 查询日志列表
    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      offset,
      limit,
      order: [['created_at', 'DESC']]
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
    logger.error('获取操作日志失败', error);
    res.status(500).json({
      code: 500,
      msg: '获取操作日志失败'
    });
  }
};

/**
 * 获取操作统计
 * @route GET /api/operation-logs/stats
 */
exports.getOperationStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // 按模块统计
    const moduleStats = await OperationLog.findAll({
      attributes: [
        'module',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: { [Op.gte]: startDate }
      },
      group: ['module'],
      raw: true
    });

    // 按操作类型统计
    const actionStats = await OperationLog.findAll({
      attributes: [
        'action',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: { [Op.gte]: startDate }
      },
      group: ['action'],
      raw: true
    });

    // 按用户统计
    const userStats = await OperationLog.findAll({
      attributes: [
        'username',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: { [Op.gte]: startDate }
      },
      group: ['username'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    res.json({
      code: 200,
      msg: '获取成功',
      data: {
        moduleStats,
        actionStats,
        userStats
      }
    });
  } catch (error) {
    logger.error('获取操作统计失败', error);
    res.status(500).json({
      code: 500,
      msg: '获取操作统计失败'
    });
  }
};

/**
 * 清理旧日志
 * @route DELETE /api/operation-logs/clean
 */
exports.cleanOldLogs = async (req, res) => {
  try {
    const { days = 90 } = req.body;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await OperationLog.destroy({
      where: {
        created_at: { [Op.lt]: cutoffDate }
      }
    });

    logger.info(`清理了${result}条旧日志`);

    res.json({
      code: 200,
      msg: `成功清理${result}条旧日志`
    });
  } catch (error) {
    logger.error('清理日志失败', error);
    res.status(500).json({
      code: 500,
      msg: '清理日志失败'
    });
  }
};

module.exports = exports;
