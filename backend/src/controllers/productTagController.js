const productTagService = require('../services/productTagService');
const { formatResponse } = require('../utils/response');
const logger = require('../utils/logger');

class ProductTagController {
  /**
   * 获取标签列表
   */
  async getList(req, res) {
    try {
      const { status } = req.query;
      const tags = await productTagService.getTagList(status);
      
      res.json(formatResponse.success(tags));
    } catch (error) {
      logger.error('获取标签列表失败:', error);
      res.status(500).json(formatResponse.error('获取标签列表失败'));
    }
  }

  /**
   * 获取标签详情
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const tag = await productTagService.getTagById(id);
      
      if (!tag) {
        return res.status(404).json(formatResponse.error('标签不存在'));
      }

      res.json(formatResponse.success(tag));
    } catch (error) {
      logger.error('获取标签详情失败:', error);
      res.status(500).json(formatResponse.error('获取标签详情失败'));
    }
  }

  /**
   * 创建标签
   */
  async create(req, res) {
    try {
      const tagData = req.body;
      const tag = await productTagService.createTag(tagData);
      
      logger.info('创建标签成功:', { tagId: tag.id, name: tag.name });
      res.json(formatResponse.success(tag, '标签创建成功'));
    } catch (error) {
      logger.error('创建标签失败:', error);
      res.status(500).json(formatResponse.error('创建标签失败: ' + error.message));
    }
  }

  /**
   * 更新标签
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const tagData = req.body;
      
      const tag = await productTagService.updateTag(id, tagData);
      
      if (!tag) {
        return res.status(404).json(formatResponse.error('标签不存在'));
      }

      logger.info('更新标签成功:', { tagId: id });
      res.json(formatResponse.success(tag, '标签更新成功'));
    } catch (error) {
      logger.error('更新标签失败:', error);
      res.status(500).json(formatResponse.error('更新标签失败: ' + error.message));
    }
  }

  /**
   * 删除标签
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await productTagService.deleteTag(id);
      
      if (!result.success) {
        return res.status(400).json(formatResponse.error(result.message));
      }

      logger.info('删除标签成功:', { tagId: id });
      res.json(formatResponse.success(result.data, '标签删除成功'));
    } catch (error) {
      logger.error('删除标签失败:', error);
      res.status(500).json(formatResponse.error('删除标签失败: ' + error.message));
    }
  }

  /**
   * 获取标签统计信息
   */
  async getStats(req, res) {
    try {
      const stats = await productTagService.getTagStats();
      res.json(formatResponse.success(stats));
    } catch (error) {
      logger.error('获取标签统计失败:', error);
      res.status(500).json(formatResponse.error('获取标签统计失败'));
    }
  }
}

module.exports = new ProductTagController(); 