const { Op } = require('sequelize');
const { Product, ProductCategory, ProductTag, ProductConfig, sequelize } = require('../models');
const path = require('path');
const fs = require('fs-extra');

// 获取某分类及其所有子分类ID（包含自身）
async function getCategoryAndDescendantIds(rootCategoryId) {
  const rootId = Number(rootCategoryId)
  if (!rootId || Number.isNaN(rootId)) return []
  const visited = new Set()
  const result = []
  const queue = [rootId]
  while (queue.length > 0) {
    const currentId = queue.shift()
    if (visited.has(currentId)) continue
    visited.add(currentId)
    result.push(currentId)
    const children = await ProductCategory.findAll({
      attributes: ['id'],
      where: { parentId: currentId }
    })
    for (const row of children) {
      const childId = Number(row.id)
      if (!visited.has(childId)) queue.push(childId)
    }
  }
  return result
}

// 将 base64 data URL 保存为文件，返回URL
async function saveBase64ImageIfNeeded(cardImage) {
  if (!cardImage || typeof cardImage !== 'string') return cardImage
  if (cardImage.startsWith('/uploads/') || cardImage.startsWith('http://') || cardImage.startsWith('https://')) {
    return cardImage
  }
  if (!cardImage.startsWith('data:image/')) return cardImage

  const match = cardImage.match(/^data:(image\/(png|jpeg|jpg));base64,(.+)$/i)
  if (!match) return cardImage

  const mime = match[1]
  const base64 = match[3]
  const buffer = Buffer.from(base64, 'base64')

  // 简单大小限制（例如 5MB），避免意外超大图片
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error('图片过大，建议不超过5MB')
  }

  const ext = mime.includes('png') ? '.png' : '.jpg'
  const name = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`
  const folder = path.join(process.cwd(), 'public', 'uploads', 'card_images')
  await fs.ensureDir(folder)
  await fs.writeFile(path.join(folder, name), buffer)
  return `/uploads/card_images/${name}`
}

// 生成产品ID (格式: RD-001, RD-002, ...)
async function generateProductId() {
  // 查找所有符合 RD-数字 格式的产品型号
  const products = await Product.findAll({
    where: {
      model: {
        [Op.regexp]: '^RD-[0-9]+$'  // 只匹配 RD-数字 格式
      }
    },
    attributes: ['model'],
    raw: true
  });
  
  // 提取所有序号
  const numbers = products
    .map(p => {
      const match = p.model.match(/^RD-(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    })
    .filter(n => n > 0);
  
  // 找到最大序号
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = maxNumber + 1;
  
  // 格式化为3位数字 (1 -> 001, 2 -> 002)
  const productId = `RD-${String(nextNumber).padStart(3, '0')}`;
  
  console.log(' 产品型号生成:', {
    已有型号: products.map(p => p.model),
    提取序号: numbers,
    最大序号: maxNumber,
    新序号: nextNumber,
    生成型号: productId
  });
  
  return productId;
}

// 标准化产品输出：确保 features 为数组
function normalizeProductOutput(productOrPlain) {
  const plain = productOrPlain?.get ? productOrPlain.get({ plain: true }) : { ...(productOrPlain || {}) }
  const f = plain.features
  if (typeof f === 'string') {
    try { plain.features = JSON.parse(f) } catch { plain.features = [] }
  } else if (!Array.isArray(f)) {
    plain.features = []
  }
  return plain
}

class ProductService {
  /**
   * 获取产品列表
   */
  async getProductList(params) {
    const {
      page = 1,
      limit = 20,
      categoryId,
      status,
      promoPosition,
      search,
      sortBy,
      sortDir
    } = params;

    const where = {};

    // 条件筛选
    if (categoryId) {
      const ids = await getCategoryAndDescendantIds(categoryId)
      where.categoryId = ids && ids.length > 0 ? { [Op.in]: ids } : Number(categoryId)
    }
    if (status) where.status = status;
    if (promoPosition && promoPosition !== 'all') where.promoPosition = promoPosition;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { shortDesc: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    // 排序字段映射与默认排序
    const order = []
    const dir = String(sortDir || '').toLowerCase() === 'asc' ? 'ASC' : 'DESC'
    const by = String(sortBy || '').trim()
    const allow = new Set(['createdAt', 'price', 'sales', 'sortOrder'])
    if (allow.has(by)) {
      order.push([by, dir])
    }
    // 追加稳定排序：权重、创建时间
    if (!order.length || by !== 'sortOrder') order.push(['sortOrder', 'DESC'])
    if (!order.length || by !== 'createdAt') order.push(['createdAt', 'DESC'])

    const result = await Product.findAndCountAll({
      where,
      include: [
        {
          model: ProductCategory,
          as: 'category',
          attributes: ['id', 'name', 'icon']
        },
        {
          model: ProductTag,
          as: 'tags',
          attributes: ['id', 'name', 'color', 'icon'],
          through: { attributes: [] }
        }
      ],
      order,
      limit,
      offset
    });

    return {
      items: result.rows.map(normalizeProductOutput),
      total: result.count,
      page,
      limit,
      totalPages: Math.ceil(result.count / limit)
    };
  }

  /**
   * 根据ID获取产品详情
   */
  async getProductById(id) {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: ProductCategory,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'description']
        },
        {
          model: ProductTag,
          as: 'tags',
          attributes: ['id', 'name', 'color', 'icon', 'description'],
          through: { attributes: [] }
        }
      ]
    });
    return product ? normalizeProductOutput(product) : null
  }

  /**
   * 创建产品
   */
  async createProduct(productData) {
    const transaction = await sequelize.transaction();

    try {
      const { tags, ...productInfo } = productData;

      // 自动生成产品ID (model字段): RD-001, RD-002, ...
      if (!productInfo.model) {
        productInfo.model = await generateProductId();
      }

      // 生成产品编码：RD-xxx，如果未传入且提供了型号
      if (!productInfo.product_code) {
        // 使用model作为product_code
        productInfo.product_code = productInfo.model;
      }

      // 规范数据类型
      if (productInfo.price != null) productInfo.price = Number(productInfo.price)
      if (productInfo.sales != null) productInfo.sales = Number(productInfo.sales)
      if (productInfo.features && typeof productInfo.features === 'string') {
        try { productInfo.features = JSON.parse(productInfo.features) } catch { productInfo.features = [] }
      }
      // 若cardImage为base64，转存为文件并仅保存URL
      if (productInfo.cardImage) {
        productInfo.cardImage = await saveBase64ImageIfNeeded(productInfo.cardImage)
      }

      // 新增：按分类自动分配排序权重到末尾（最大+1）
      if (productInfo.categoryId != null && (productInfo.sortOrder == null || productInfo.sortOrder === '')) {
        const maxOrder = await Product.max('sortOrder', { where: { categoryId: productInfo.categoryId }, transaction })
        const nextOrder = (typeof maxOrder === 'number' && Number.isFinite(maxOrder) ? maxOrder : 0) + 1
        productInfo.sortOrder = nextOrder
      }

      // 创建产品
      const product = await Product.create(productInfo, { transaction });

      // 关联标签（如果有）
      if (tags && tags.length > 0) {
        await product.setTags(tags, { transaction });
      }

      await transaction.commit();

      return await this.getProductById(product.id);
    } catch (error) {
      try { await transaction.rollback() } catch {}
      throw error;
    }
  }

  /**
   * 更新产品
   */
  async updateProduct(id, productData) {
    const transaction = await sequelize.transaction();

    try {
      const product = await Product.findByPk(id);
      if (!product) {
        await transaction.rollback();
        return null;
      }

      const { tags, ...incoming } = productData;
      const productInfo = { ...incoming };
      if (productInfo.price != null) productInfo.price = Number(productInfo.price)
      if (productInfo.sales != null) productInfo.sales = Number(productInfo.sales)
      if (productInfo.features && typeof productInfo.features === 'string') {
        try { productInfo.features = JSON.parse(productInfo.features) } catch { productInfo.features = [] }
      }
      if (productInfo.cardImage) {
        productInfo.cardImage = await saveBase64ImageIfNeeded(productInfo.cardImage)
      }

      // 排序与分类重排逻辑
      const oldCategoryId = product.categoryId
      const oldOrder = Number(product.sortOrder || 0)
      const newCategoryId = productInfo.categoryId != null ? productInfo.categoryId : oldCategoryId
      let desiredOrder = productInfo.sortOrder != null && productInfo.sortOrder !== '' ? Number(productInfo.sortOrder) : null
      const categoryChanged = newCategoryId !== oldCategoryId

      // 若更换分类：
      if (categoryChanged) {
        // 1) 旧分类中，腾出原位置（>oldOrder 的全部上移一位）
        if (oldCategoryId != null) {
          await Product.update(
            { sortOrder: sequelize.literal('sort_order - 1') },
            { where: { categoryId: oldCategoryId, sortOrder: { [Op.gt]: oldOrder }, id: { [Op.ne]: product.id } }, transaction }
          )
        }

        // 2) 新分类中，若未指定排序则插入到末尾
        if (desiredOrder == null) {
          const maxOrder = await Product.max('sortOrder', { where: { categoryId: newCategoryId }, transaction })
          desiredOrder = (typeof maxOrder === 'number' && Number.isFinite(maxOrder) ? maxOrder : 0) + 1
        } else {
          // 若指定排序，需为该位置及之后的全部后移一位
          await Product.update(
            { sortOrder: sequelize.literal('sort_order + 1') },
            { where: { categoryId: newCategoryId, sortOrder: { [Op.gte]: desiredOrder } }, transaction }
          )
        }
      } else {
        // 同分类内调整排序
        if (desiredOrder == null) {
          desiredOrder = oldOrder // 未指定则保持原排序
        } else if (desiredOrder !== oldOrder) {
          if (desiredOrder < oldOrder) {
            // 向前移动：区间 [desiredOrder, oldOrder-1] 后移一位
            await Product.update(
              { sortOrder: sequelize.literal('sort_order + 1') },
              { where: { categoryId: oldCategoryId, sortOrder: { [Op.gte]: desiredOrder, [Op.lt]: oldOrder }, id: { [Op.ne]: product.id } }, transaction }
            )
          } else {
            // 向后移动：区间 [oldOrder+1, desiredOrder] 前移一位
            await Product.update(
              { sortOrder: sequelize.literal('sort_order - 1') },
              { where: { categoryId: oldCategoryId, sortOrder: { [Op.gt]: oldOrder, [Op.lte]: desiredOrder }, id: { [Op.ne]: product.id } }, transaction }
            )
          }
        }
      }

      // 组装最终更新数据
      const finalUpdate = { ...productInfo, categoryId: newCategoryId, sortOrder: desiredOrder }
      await product.update(finalUpdate, { transaction });

      if (tags !== undefined) {
        await product.setTags(tags, { transaction });
      }

      await transaction.commit();

      return await this.getProductById(product.id);
    } catch (error) {
      try { await transaction.rollback() } catch {}
      throw error;
    }
  }

  /**
   * 删除产品
   */
  async deleteProduct(id) {
    const transaction = await sequelize.transaction();

    try {
      const product = await Product.findByPk(id);
      if (!product) {
        await transaction.rollback();
        return false;
      }

      // 删除产品详情页文件
      if (product.filePath) {
        const filePath = path.join(process.cwd(), 'public', product.filePath);
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
        }
      }

      // 删除标签关联
      await product.setTags([], { transaction });

      // 删除产品
      await product.destroy({ transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 上传产品详情页文件
   */
  async uploadProductFiles(productId, files, relativePaths = [], baseRoot = '') {
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error('产品不存在');
    }

    // 使用产品model(RD-001)作为文件夹名
    const productFolder = `products/${product.model}`;
    const fullPath = path.join(process.cwd(), 'public', productFolder);

    // 确保文件夹存在
    await fs.ensureDir(fullPath);

    // 删除旧文件（如果存在且不同路径）
    if (product.filePath && product.filePath !== productFolder) {
      const oldPath = path.join(process.cwd(), 'public', product.filePath);
      if (await fs.pathExists(oldPath)) {
        await fs.remove(oldPath);
      }
    }

    // 统一路径分隔符
    const normPaths = (relativePaths || []).map((p) => String(p || '').replace(/\\/g, '/'));

    if (!normPaths.length) {
      // 未提供相对路径时，退化为扁平保存
      for (const file of files) {
        const filePath = path.join(fullPath, file.originalname);
        await fs.writeFile(filePath, file.buffer);
      }
    } else {
      // 去掉根目录前缀，保留内部结构
      const root = baseRoot || (() => {
        if (!normPaths[0]) return '';
        const parts = normPaths[0].split('/');
        if (parts[0] === '@' && parts.length >= 2) return `${parts[0]}/${parts[1]}`;
        return parts[0];
      })();

      for (let i = 0; i < files.length; i++) {
        const src = normPaths[i] || files[i].originalname;
        let inside = src;
        if (root && inside.startsWith(root + '/')) {
          inside = inside.slice(root.length + 1);
        }
        const targetPath = path.join(fullPath, inside);
        await fs.ensureDir(path.dirname(targetPath));
        await fs.writeFile(targetPath, files[i].buffer);
      }
    }

    // 更新产品的文件路径
    await product.update({
      filePath: productFolder
    });

    return {
      filePath: productFolder,
      files: (normPaths.length ? normPaths : files.map((f) => f.originalname))
    };
  }

  /**
   * 批量更新产品排序
   */
  async updateProductsSortOrder(products) {
    const transaction = await sequelize.transaction();

    try {
      for (const item of products) {
        await Product.update(
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
   * 获取产品统计信息
   */
  async getProductStats() {
    const [
      totalCount,
      activeCount,
      draftCount,
      inactiveCount,
      categoryStats,
      tagStats,
      promoStats
    ] = await Promise.all([
      // 总数
      Product.count(),
      
      // 已发布
      Product.count({ where: { status: 'active' } }),
      
      // 草稿
      Product.count({ where: { status: 'draft' } }),
      
      // 已下架
      Product.count({ where: { status: 'inactive' } }),
      
      // 按分类统计
      Product.findAll({
        attributes: [
          [sequelize.col('category.name'), 'categoryName'],
          [sequelize.fn('COUNT', sequelize.col('Product.id')), 'count']
        ],
        include: [{
          model: ProductCategory,
          as: 'category',
          attributes: []
        }],
        group: ['category.id', 'category.name'],
        raw: true
      }),
      
      // 按标签统计
      sequelize.query(`
        SELECT pt.name as tagName, COUNT(ptr.product_id) as count
        FROM product_tags pt
        LEFT JOIN product_tag_relations ptr ON pt.id = ptr.tag_id
        GROUP BY pt.id, pt.name
        ORDER BY count DESC
        LIMIT 10
      `, { type: sequelize.QueryTypes.SELECT }),
      
      // 按推广位置统计
      Product.findAll({
        attributes: [
          'promoPosition',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['promoPosition'],
        raw: true
      })
    ]);

    return {
      overview: {
        total: totalCount,
        active: activeCount,
        draft: draftCount,
        inactive: inactiveCount
      },
      categoryStats,
      tagStats,
      promoStats
    };
  }

  /**
   * 获取推荐产品（用于前端显示）
   */
  async getRecommendedProducts(position = 'homepage_recommend', limit = 10) {
    return await Product.findAll({
      where: {
        status: 'active',
        promoPosition: position
      },
      include: [{
        model: ProductCategory,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['sortOrder', 'DESC'], ['createdAt', 'DESC']],
      limit
    });
  }

  /**
   * 按分类获取产品
   */
  async getProductsByCategory(categoryId, params = {}) {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;
    const ids = await getCategoryAndDescendantIds(categoryId)
    return await Product.findAndCountAll({
      where: {
        categoryId: ids && ids.length > 0 ? { [Op.in]: ids } : Number(categoryId),
        status: 'active'
      },
      include: [{
        model: ProductTag,
        as: 'tags',
        attributes: ['id', 'name', 'color'],
        through: { attributes: [] }
      }],
      order: [['sortOrder', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset
    });
  }

  /**
   * 列出产品详情页文件
   */
  async listProductFiles(productId) {
    const product = await Product.findByPk(productId)
    if (!product) {
      throw new Error('产品不存在')
    }
    if (!product.filePath) {
      return { filePath: null, files: [] }
    }

    const baseFolder = path.join(process.cwd(), 'public', product.filePath)
    const result = []

    const walk = async (dir, root) => {
      const entries = await fs.readdir(dir)
      for (const name of entries) {
        const full = path.join(dir, name)
        const stat = await fs.stat(full)
        if (stat.isDirectory()) {
          await walk(full, root)
        } else {
          const rel = path.relative(root, full).replace(/\\/g, '/')
          result.push(rel)
        }
      }
    }

    if (await fs.pathExists(baseFolder)) {
      await walk(baseFolder, baseFolder)
    }

    return { filePath: product.filePath, files: result.sort() }
  }

  /**
   * 获取产品配置（当前活跃版本）
   */
  async getProductConfig(productId) {
    const config = await ProductConfig.findOne({
      where: {
        productId,
        isActive: true
      },
      order: [['version', 'DESC']]
    });
    return config;
  }

  /**
   * 保存产品配置
   */
  async saveProductConfig(productId, configData) {
    const transaction = await sequelize.transaction();

    try {
      // 检查产品是否存在
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('产品不存在');
      }

      // 获取当前最高版本号
      const latestConfig = await ProductConfig.findOne({
        where: { productId },
        order: [['version', 'DESC']],
        transaction
      });

      const newVersion = latestConfig ? latestConfig.version + 1 : 1;

      // 将所有旧配置设为非活跃
      await ProductConfig.update(
        { isActive: false },
        {
          where: { productId },
          transaction
        }
      );

      // 创建新配置
      const config = await ProductConfig.create(
        {
          productId,
          configData,
          version: newVersion,
          isActive: true
        },
        { transaction }
      );

      await transaction.commit();
      return config;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取产品配置历史版本
   */
  async getProductConfigHistory(productId) {
    const configs = await ProductConfig.findAll({
      where: { productId },
      order: [['version', 'DESC']],
      attributes: ['id', 'version', 'isActive', 'createdAt', 'updatedAt']
    });
    return configs;
  }
}

module.exports = new ProductService();