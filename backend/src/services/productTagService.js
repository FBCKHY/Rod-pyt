const { Op } = require('sequelize');
const { ProductTag, Product, sequelize } = require('../models');

class ProductTagService {
  /**
   * 获取标签列表
   */
  async getTagList(status = null) {
    const where = {};
    if (status) where.status = status;

    return await ProductTag.findAll({
      where,
      include: [{
        model: Product,
        as: 'products',
        attributes: ['id'],
        through: { attributes: [] },
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * 根据ID获取标签详情
   */
  async getTagById(id) {
    return await ProductTag.findByPk(id, {
      include: [{
        model: Product,
        as: 'products',
        attributes: ['id', 'name', 'status'],
        through: { attributes: [] }
      }]
    });
  }

  /**
   * 创建标签
   */
  async createTag(tagData) {
    // 检查标签名称是否已存在
    const existingTag = await ProductTag.findOne({
      where: { name: tagData.name }
    });

    if (existingTag) {
      throw new Error('标签名称已存在');
    }

    return await ProductTag.create(tagData);
  }

  /**
   * 更新标签
   */
  async updateTag(id, tagData) {
    const tag = await ProductTag.findByPk(id);
    if (!tag) {
      return null;
    }

    // 如果修改了名称，检查是否与其他标签重名
    if (tagData.name && tagData.name !== tag.name) {
      const existingTag = await ProductTag.findOne({
        where: { 
          name: tagData.name,
          id: { [Op.ne]: id }
        }
      });

      if (existingTag) {
        throw new Error('标签名称已存在');
      }
    }

    await tag.update(tagData);
    return await this.getTagById(id);
  }

  /**
   * 删除标签
   */
  async deleteTag(id) {
    const transaction = await sequelize.transaction();

    try {
      const tag = await ProductTag.findByPk(id);
      if (!tag) {
        await transaction.rollback();
        return { success: false, message: '标签不存在' };
      }

      // 检查是否有产品使用此标签
      const productCount = await Product.count({
        include: [{
          model: ProductTag,
          as: 'tags',
          where: { id },
          through: { attributes: [] }
        }]
      });

      if (productCount > 0) {
        await transaction.rollback();
        return { 
          success: false, 
          message: `还有 ${productCount} 个产品使用此标签，请先移除标签关联` 
        };
      }

      await tag.destroy({ transaction });
      await transaction.commit();

      return { 
        success: true, 
        data: { deletedTag: tag.name }
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取标签统计信息
   */
  async getTagStats() {
    const [
      totalTags,
      activeTags,
      inactiveTags,
      tagsWithProducts,
      popularTags
    ] = await Promise.all([
      // 总标签数
      ProductTag.count(),
      
      // 活跃标签数
      ProductTag.count({ where: { status: 'active' } }),
      
      // 非活跃标签数
      ProductTag.count({ where: { status: 'inactive' } }),
      
      // 有产品的标签数
      ProductTag.count({
        include: [{
          model: Product,
          as: 'products',
          through: { attributes: [] },
          required: true
        }]
      }),
      
      // 最受欢迎的标签
      sequelize.query(`
        SELECT 
          pt.id,
          pt.name,
          pt.color,
          COUNT(ptr.product_id) as productCount
        FROM product_tags pt
        LEFT JOIN product_tag_relations ptr ON pt.id = ptr.tag_id
        LEFT JOIN products p ON ptr.product_id = p.id AND p.status = 'active'
        WHERE pt.status = 'active'
        GROUP BY pt.id, pt.name, pt.color
        ORDER BY productCount DESC
        LIMIT 10
      `, { type: sequelize.QueryTypes.SELECT })
    ]);

    return {
      overview: {
        total: totalTags,
        active: activeTags,
        inactive: inactiveTags,
        withProducts: tagsWithProducts
      },
      popularTags
    };
  }

  /**
   * 搜索标签
   */
  async searchTags(keyword, limit = 10) {
    return await ProductTag.findAll({
      where: {
        status: 'active',
        name: {
          [Op.like]: `%${keyword}%`
        }
      },
      attributes: ['id', 'name', 'color', 'icon'],
      limit
    });
  }

  /**
   * 获取热门标签（用于前端标签云）
   */
  async getPopularTags(limit = 20) {
    return await sequelize.query(`
      SELECT 
        pt.id,
        pt.name,
        pt.color,
        pt.icon,
        COUNT(ptr.product_id) as productCount
      FROM product_tags pt
      INNER JOIN product_tag_relations ptr ON pt.id = ptr.tag_id
      INNER JOIN products p ON ptr.product_id = p.id AND p.status = 'active'
      WHERE pt.status = 'active'
      GROUP BY pt.id, pt.name, pt.color, pt.icon
      HAVING productCount > 0
      ORDER BY productCount DESC, pt.created_at DESC
      LIMIT ?
    `, { 
      replacements: [limit],
      type: sequelize.QueryTypes.SELECT 
    });
  }
}

module.exports = new ProductTagService(); 