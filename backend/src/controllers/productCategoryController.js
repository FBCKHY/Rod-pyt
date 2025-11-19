const productCategoryService = require('../services/productCategoryService');
const { formatResponse } = require('../utils/response');
const logger = require('../utils/logger');

class ProductCategoryController {
  /**
   * 获取分类列表（树形结构）
   */
  async getList(req, res) {
    try {
      const { includeProducts = false } = req.query;
      const categories = await productCategoryService.getCategoryTree(includeProducts === 'true');
      
      res.json(formatResponse.success(categories));
    } catch (error) {
      logger.error('获取分类列表失败:', error);
      res.status(500).json(formatResponse.error('获取分类列表失败'));
    }
  }

  /**
   * 获取扁平分类列表
   */
  async getFlatList(req, res) {
    try {
      const { status } = req.query;
      const categories = await productCategoryService.getFlatCategoryList(status);
      
      res.json(formatResponse.success(categories));
    } catch (error) {
      logger.error('获取扁平分类列表失败:', error);
      res.status(500).json(formatResponse.error('获取扁平分类列表失败'));
    }
  }

  /**
   * 获取分类详情
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const category = await productCategoryService.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json(formatResponse.error('分类不存在'));
      }

      res.json(formatResponse.success(category));
    } catch (error) {
      logger.error('获取分类详情失败:', error);
      res.status(500).json(formatResponse.error('获取分类详情失败'));
    }
  }

  /**
   * 创建分类
   */
  async create(req, res) {
    try {
      const categoryData = req.body;
      const category = await productCategoryService.createCategory(categoryData);
      
      logger.info('创建分类成功:', { categoryId: category.id, name: category.name });
      res.json(formatResponse.success(category, '分类创建成功'));
    } catch (error) {
      logger.error('创建分类失败:', error);
      res.status(500).json(formatResponse.error('创建分类失败: ' + error.message));
    }
  }

  /**
   * 更新分类
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const categoryData = req.body;
      
      const category = await productCategoryService.updateCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json(formatResponse.error('分类不存在'));
      }

      logger.info('更新分类成功:', { categoryId: id });
      res.json(formatResponse.success(category, '分类更新成功'));
    } catch (error) {
      logger.error('更新分类失败:', error);
      res.status(500).json(formatResponse.error('更新分类失败: ' + error.message));
    }
  }

  /**
   * 删除分类
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const { moveToCategory } = req.body; // 可选：将该分类下的产品移动到其他分类
      
      const result = await productCategoryService.deleteCategory(id, moveToCategory);
      
      if (!result.success) {
        return res.status(400).json(formatResponse.error(result.message));
      }

      logger.info('删除分类成功:', { categoryId: id });
      res.json(formatResponse.success(result.data, '分类删除成功'));
    } catch (error) {
      logger.error('删除分类失败:', error);
      res.status(500).json(formatResponse.error('删除分类失败: ' + error.message));
    }
  }

  /**
   * 批量更新分类排序
   */
  async updateSortOrder(req, res) {
    try {
      const { categories } = req.body; // [{ id: 1, sortOrder: 10 }, ...]
      
      await productCategoryService.updateCategoriesSortOrder(categories);
      
      logger.info('批量更新分类排序成功');
      res.json(formatResponse.success(null, '排序更新成功'));
    } catch (error) {
      logger.error('批量更新分类排序失败:', error);
      res.status(500).json(formatResponse.error('排序更新失败: ' + error.message));
    }
  }

  /**
   * 获取分类统计信息
   */
  async getStats(req, res) {
    try {
      const stats = await productCategoryService.getCategoryStats();
      res.json(formatResponse.success(stats));
    } catch (error) {
      logger.error('获取分类统计失败:', error);
      res.status(500).json(formatResponse.error('获取分类统计失败'));
    }
  }
}

module.exports = new ProductCategoryController(); 