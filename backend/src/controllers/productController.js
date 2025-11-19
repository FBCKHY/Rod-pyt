const productService = require('../services/productService');
const { formatResponse } = require('../utils/response');
const logger = require('../utils/logger');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

class ProductController {
  /**
   * 获取产品列表
   */
  async getList(req, res) {
    try {
      const { page = 1, limit = 20, categoryId, status, promoPosition, search, sortBy, sortDir } = req.query;
      
      const result = await productService.getProductList({
        page: parseInt(page),
        limit: parseInt(limit),
        categoryId: categoryId ? parseInt(categoryId) : null,
        status,
        promoPosition,
        search,
        sortBy,
        sortDir
      });

      res.json(formatResponse.success(result));
    } catch (error) {
      logger.error('获取产品列表失败:', error);
      res.status(500).json(formatResponse.error('获取产品列表失败'));
    }
  }

  /**
   * 获取产品详情
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      
      if (!product) {
        return res.status(404).json(formatResponse.error('产品不存在'));
      }

      res.json(formatResponse.success(product));
    } catch (error) {
      logger.error('获取产品详情失败:', error);
      res.status(500).json(formatResponse.error('获取产品详情失败'));
    }
  }

  /**
   * 创建产品
   */
  async create(req, res) {
    try {
      const productData = req.body;
      const product = await productService.createProduct(productData);
      
      logger.info('创建产品成功:', { productId: product.id, name: product.name });
      res.json(formatResponse.success(product, '产品创建成功'));
    } catch (error) {
      logger.error('创建产品失败:', error);
      if (error?.name === 'SequelizeUniqueConstraintError') {
        const isModel = Array.isArray(error.errors) && error.errors.some((e) => e.path === 'model')
        if (isModel) {
          return res.status(400).json(formatResponse.error('产品型号已存在，请更换后再试'))
        }
      }
      if (error?.name === 'SequelizeValidationError') {
        return res.status(400).json(formatResponse.error('参数校验失败：' + (error.errors?.[0]?.message || '无效参数')))
      }
      res.status(500).json(formatResponse.error('创建产品失败: ' + error.message));
    }
  }

  /**
   * 更新产品
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const productData = req.body;
      
      const product = await productService.updateProduct(id, productData);
      
      if (!product) {
        return res.status(404).json(formatResponse.error('产品不存在'));
      }

      logger.info('更新产品成功:', { productId: id });
      res.json(formatResponse.success(product, '产品更新成功'));
    } catch (error) {
      logger.error('更新产品失败:', error);
      if (error?.name === 'SequelizeUniqueConstraintError') {
        const isModel = Array.isArray(error.errors) && error.errors.some((e) => e.path === 'model')
        if (isModel) {
          return res.status(400).json(formatResponse.error('产品型号已存在，请更换后再试'))
        }
      }
      if (error?.name === 'SequelizeValidationError') {
        return res.status(400).json(formatResponse.error('参数校验失败：' + (error.errors?.[0]?.message || '无效参数')))
      }
      res.status(500).json(formatResponse.error('更新产品失败: ' + error.message));
    }
  }

  /**
   * 删除产品
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await productService.deleteProduct(id);
      
      if (!result) {
        return res.status(404).json(formatResponse.error('产品不存在'));
      }

      logger.info('删除产品成功:', { productId: id });
      res.json(formatResponse.success(null, '产品删除成功'));
    } catch (error) {
      logger.error('删除产品失败:', error);
      res.status(500).json(formatResponse.error('删除产品失败: ' + error.message));
    }
  }

  /**
   * 上传产品详情页文件
   */
  async uploadFiles(req, res) {
    try {
      const { id } = req.params;
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json(formatResponse.error('请选择要上传的文件夹'));
      }

      // 从表单中获取相对路径数组，与 files 顺序一一对应
      let rel = req.body['relativePaths[]'] || req.body.relativePaths || [];
      if (!Array.isArray(rel)) rel = [rel];
      const relativePaths = rel.map((p) => String(p || '').replace(/\\/g, '/'));

      if (relativePaths.length !== req.files.length) {
        return res.status(400).json(formatResponse.error('缺少相对路径信息，无法还原目录结构'));
      }

      // 计算根目录（支持 "@/RD-001" 或 "RD-001"）
      const getBaseRoot = (p) => {
        const parts = p.split('/');
        if (parts[0] === '@' && parts.length >= 2) return `${parts[0]}/${parts[1]}`;
        return parts[0];
      };
      const baseRoots = Array.from(new Set(relativePaths.map(getBaseRoot))).filter(Boolean);
      const baseRoot = baseRoots[0] || '';

      const rootPartsLen = baseRoot ? baseRoot.split('/').length : 0;

      // 校验：图片/ 子目录是否存在
      const hasImages = relativePaths.some((p) => p.startsWith(`${baseRoot}/图片/`));

      // 校验：样式逻辑/ 子目录下（直接子级）是否恰好1个CSS与1个JS
      const styleLogicFiles = relativePaths.filter((p) => p.startsWith(`${baseRoot}/样式逻辑/`));
      const immediateInStyleLogic = styleLogicFiles.filter((p) => {
        const segs = p.split('/');
        return segs.length === rootPartsLen + 2; // baseRoot/样式逻辑/文件
      });
      const cssCount = immediateInStyleLogic.filter((p) => p.toLowerCase().endsWith('.css')).length;
      const jsCount = immediateInStyleLogic.filter((p) => p.toLowerCase().endsWith('.js')).length;

      // 校验：根目录HTML（直接位于根目录）
      const rootHtmlFiles = relativePaths.filter((p) => {
        const segs = p.split('/');
        return segs.length === rootPartsLen + 1 && p.toLowerCase().endsWith('.html');
      });

      if (!hasImages) {
        return res.status(400).json(formatResponse.error('文件夹结构不合法：缺少“图片/”子目录'));
      }
      if (cssCount !== 1 || jsCount !== 1) {
        return res.status(400).json(formatResponse.error('文件夹结构不合法：“样式逻辑/”下需且仅有 1 个CSS 和 1 个JS（直接位于该文件夹）'));
      }
      if (rootHtmlFiles.length !== 1) {
        return res.status(400).json(formatResponse.error('文件夹结构不合法：根目录需且仅有 1 个HTML文件'));
      }

      const result = await productService.uploadProductFiles(id, req.files, relativePaths, baseRoot);
      
      logger.info('上传产品文件成功:', { productId: id });
      res.json(formatResponse.success(result, '文件夹上传成功'));
    } catch (error) {
      logger.error('上传产品文件失败:', error);
      res.status(500).json(formatResponse.error('文件上传失败: ' + error.message));
    }
  }

  /**
   * 批量更新产品排序
   */
  async updateSortOrder(req, res) {
    try {
      const { products } = req.body; // [{ id: 1, sortOrder: 10 }, ...]
      
      await productService.updateProductsSortOrder(products);
      
      logger.info('批量更新产品排序成功');
      res.json(formatResponse.success(null, '排序更新成功'));
    } catch (error) {
      logger.error('批量更新产品排序失败:', error);
      res.status(500).json(formatResponse.error('排序更新失败: ' + error.message));
    }
  }

  /**
   * 获取产品统计信息
   */
  async getStats(req, res) {
    try {
      const stats = await productService.getProductStats();
      res.json(formatResponse.success(stats));
    } catch (error) {
      logger.error('获取产品统计失败:', error);
      res.status(500).json(formatResponse.error('获取产品统计失败'));
    }
  }

  /**
   * 查看产品详情页文件（列表）
   */
  async listFiles(req, res) {
    try {
      const { id } = req.params
      const data = await productService.listProductFiles(id)
      res.json(formatResponse.success(data))
    } catch (error) {
      res.status(500).json(formatResponse.error('获取文件列表失败: ' + error.message))
    }
  }

  /**
   * 上传产品卡片主图（单图）
   */
  async uploadCardImage(req, res) {
    try {
      const file = req.file
      if (!file) return res.status(400).json(formatResponse.error('请上传图片文件'))

      const allowed = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowed.includes(file.mimetype)) {
        return res.status(400).json(formatResponse.error('仅支持 JPG/PNG/WebP 格式'))
      }

      const extname = path.extname(file.originalname)
      const mime = file.mimetype
      const fallbackExt = mime === 'image/png' ? '.png' : (mime === 'image/webp' ? '.webp' : '.jpg')
      const ext = extname || fallbackExt
      const name = `${Date.now()}_${Math.random().toString(36).slice(2,8)}${ext}`
      const folder = path.join(process.cwd(), 'public', 'uploads', 'card_images')
      await fs.ensureDir(folder)
      await fs.writeFile(path.join(folder, name), file.buffer)

      const url = `/uploads/card_images/${name}`
      return res.json(formatResponse.success({ url }, '上传成功'))
    } catch (error) {
      return res.status(500).json(formatResponse.error('上传失败: ' + error.message))
    }
  }
}

module.exports = new ProductController(); 