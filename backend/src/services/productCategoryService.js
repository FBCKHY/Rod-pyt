const { Op } = require('sequelize');
const { ProductCategory, Product, sequelize } = require('../models');

class ProductCategoryService {
  /**
   * 获取分类树形结构
   */
  async getCategoryTree(includeProducts = false) {
    const include = [];
    if (includeProducts) {
      include.push({
        model: Product,
        as: 'products',
        attributes: ['id', 'name', 'status'],
        where: { status: 'active' },
        required: false
      });
    }

    const categories = await ProductCategory.findAll({
      where: { status: 'active' },
      include,
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']]
    });

    // 新增：统计每个分类的产品数量（仅统计active产品）
    const rows = await Product.findAll({
      attributes: ['categoryId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['categoryId'],
      raw: true
    });
    const countMap = Object.create(null);
    for (const r of rows) {
      // r.categoryId 可能为 null（未分类），仅记录有分类的
      if (r.categoryId != null) countMap[r.categoryId] = Number(r.count || 0);
    }

    return this.buildCategoryTree(categories, null, countMap);
  }

  /**
   * 构建树形结构
   */
  buildCategoryTree(categories, parentId = null, countMap = {}) {
    const tree = [];
    
    for (const category of categories) {
      if (category.parentId === parentId) {
        const children = this.buildCategoryTree(categories, category.id, countMap);
        const categoryData = category.toJSON();

        // 注入产品数量
        categoryData.productCount = countMap[category.id] || 0;
        
        if (children.length > 0) {
          categoryData.children = children;
        }
        
        tree.push(categoryData);
      }
    }
    
    return tree;
  }

  /**
   * 获取扁平分类列表
   */
  async getFlatCategoryList(status = null) {
    const where = {};
    if (status) where.status = status;

    return await ProductCategory.findAll({
      where,
      include: [{
        model: Product,
        as: 'products',
        attributes: ['id'],
        required: false
      }],
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });
  }

  /**
   * 根据ID获取分类详情
   */
  async getCategoryById(id) {
    return await ProductCategory.findByPk(id, {
      include: [
        {
          model: ProductCategory,
          as: 'parent',
          attributes: ['id', 'name']
        },
        {
          model: ProductCategory,
          as: 'children',
          attributes: ['id', 'name', 'status']
        },
        {
          model: Product,
          as: 'products',
          attributes: ['id', 'name', 'status']
        }
      ]
    });
  }

  /**
   * 创建分类
   */
  async createCategory(categoryData) {
    // 验证父分类是否存在
    if (categoryData.parentId) {
      const parent = await ProductCategory.findByPk(categoryData.parentId);
      if (!parent) {
        throw new Error('父分类不存在');
      }
    }

    return await ProductCategory.create(categoryData);
  }

  /**
   * 更新分类
   */
  async updateCategory(id, categoryData) {
    const category = await ProductCategory.findByPk(id);
    if (!category) {
      return null;
    }

    // 验证父分类（如果有变更）
    if (categoryData.parentId && categoryData.parentId !== category.parentId) {
      // 不能将分类设置为自己的子分类
      if (await this.isDescendantOf(categoryData.parentId, id)) {
        throw new Error('不能将分类设置为自己的子分类');
      }

      const parent = await ProductCategory.findByPk(categoryData.parentId);
      if (!parent) {
        throw new Error('父分类不存在');
      }
    }

    await category.update(categoryData);
    return await this.getCategoryById(id);
  }

  /**
   * 删除分类
   */
  async deleteCategory(id, moveToCategory = null) {
    const transaction = await sequelize.transaction();

    try {
      const category = await ProductCategory.findByPk(id);
      if (!category) {
        await transaction.rollback();
        return { success: false, message: '分类不存在' };
      }

      // 检查是否有子分类
      const children = await ProductCategory.findAll({
        where: { parentId: id },
        transaction
      });

      if (children.length > 0) {
        await transaction.rollback();
        return { 
          success: false, 
          message: '该分类下还有子分类，请先删除或移动子分类' 
        };
      }

      // 检查是否有产品
      const products = await Product.findAll({
        where: { categoryId: id },
        transaction
      });

      if (products.length > 0) {
        if (moveToCategory) {
          // 将产品移动到指定分类
          await Product.update(
            { categoryId: moveToCategory },
            { 
              where: { categoryId: id },
              transaction
            }
          );
        } else {
          // 将产品设置为未分类
          await Product.update(
            { categoryId: null },
            { 
              where: { categoryId: id },
              transaction
            }
          );
        }
      }

      await category.destroy({ transaction });
      await transaction.commit();

      return { 
        success: true, 
        data: { 
          deletedCategory: category.name,
          movedProducts: products.length 
        }
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 检查分类A是否是分类B的后代
   */
  async isDescendantOf(ancestorId, descendantId) {
    const category = await ProductCategory.findByPk(descendantId);
    if (!category || !category.parentId) {
      return false;
    }

    if (category.parentId === ancestorId) {
      return true;
    }

    return await this.isDescendantOf(ancestorId, category.parentId);
  }

  /**
   * 批量更新分类排序
   */
  async updateCategoriesSortOrder(categories) {
    const transaction = await sequelize.transaction();

    try {
      for (const item of categories) {
        await ProductCategory.update(
          { sortOrder: item.sortOrder },
          { 
            where: { id: item.id },
            transaction
          }
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取分类统计信息
   */
  async getCategoryStats() {
    const [
      totalCategories,
      activeCategories,
      inactiveCategories,
      categoriesWithProducts,
      topCategories
    ] = await Promise.all([
      // 总分类数
      ProductCategory.count(),
      
      // 活跃分类数
      ProductCategory.count({ where: { status: 'active' } }),
      
      // 非活跃分类数
      ProductCategory.count({ where: { status: 'inactive' } }),
      
      // 有产品的分类数
      ProductCategory.count({
        include: [{
          model: Product,
          as: 'products',
          where: { status: 'active' },
          required: true
        }]
      }),
      
      // 产品数量最多的分类
      ProductCategory.findAll({
        attributes: [
          'id',
          'name',
          [sequelize.fn('COUNT', sequelize.col('products.id')), 'productCount']
        ],
        include: [{
          model: Product,
          as: 'products',
          attributes: [],
          where: { status: 'active' },
          required: false
        }],
        group: ['ProductCategory.id'],
        order: [[sequelize.fn('COUNT', sequelize.col('products.id')), 'DESC']],
        limit: 5
      })
    ]);

    return {
      overview: {
        total: totalCategories,
        active: activeCategories,
        inactive: inactiveCategories,
        withProducts: categoriesWithProducts
      },
      topCategories
    };
  }

  /**
   * 获取分类路径（面包屑导航用）
   */
  async getCategoryPath(categoryId) {
    const path = [];
    let currentId = categoryId;

    while (currentId) {
      const category = await ProductCategory.findByPk(currentId, {
        attributes: ['id', 'name', 'parentId']
      });

      if (!category) break;

      path.unshift({
        id: category.id,
        name: category.name
      });

      currentId = category.parentId;
    }

    return path;
  }
}

module.exports = new ProductCategoryService(); 