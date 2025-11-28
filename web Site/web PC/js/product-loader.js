/**
 * 产品加载器 - 从后端API动态加载产品并渲染
 * 支持多种展示位置: 产品列表、分类页、首页推荐等
 */

class ProductLoader {
  constructor(apiBaseUrl = 'http://localhost:3001/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * 加载产品列表
   * @param {Object} options - 查询选项
   * @param {number} options.categoryId - 分类ID
   * @param {string} options.promoPosition - 推广位置
   * @param {string} options.status - 产品状态
   * @param {number} options.page - 页码
   * @param {number} options.limit - 每页数量
   * @returns {Promise<Object>} 产品列表数据
   */
  async loadProducts(options = {}) {
    const {
      categoryId = null,
      promoPosition = null,
      status = 'active',
      page = 1,
      limit = 20
    } = options;

    const params = new URLSearchParams({
      status,
      page,
      limit
    });

    if (categoryId) {
      params.append('categoryId', categoryId);
    }

    if (promoPosition) {
      params.append('promoPosition', promoPosition);
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/products?${params}`);
      const data = await response.json();
      
      if (data.code === 200) {
        return data.data;
      } else {
        console.error('加载产品失败:', data.message);
        return { items: [], total: 0 };
      }
    } catch (error) {
      console.error('加载产品出错:', error);
      return { items: [], total: 0 };
    }
  }

  /**
   * 渲染产品卡片 (用于产品列表页)
   * @param {Object} product - 产品数据
   * @returns {string} HTML字符串
   */
  renderProductCard(product) {
    const features = Array.isArray(product.features) ? product.features : [];
    const featuresHtml = features.map(f => `
      <li><i class="${f.icon}"></i><span>${f.text}</span></li>
    `).join('');

    return `
      <a class="product-card-link fade-in" href="/products/${product.model}/产品详情.html" style="--card-index: 0; display: block; opacity: 1; transform: scale(1);">
        <div class="product-card" data-id="${product.id}" data-category-id="${product.categoryId || ''}">
          ${product.tag ? `<div class="product-tag">${product.tag}</div>` : ''}
          <div class="product-image">
            <img src="${product.cardImage || '../assets/images/product center/default-product.png'}" 
                 alt="${product.name}" 
                 loading="lazy"
                 onerror="this.src='../assets/images/product center/default-product.png'">
          </div>
          <div class="product-content">
            <h3 class="product-name">${product.name}</h3>
            <ul class="product-features">
              ${featuresHtml || '<li><i class="fas fa-check"></i><span>暂无特性</span></li>'}
            </ul>
            <div class="product-details-footer">
              <div class="product-price-container">
                <span class="product-price">${parseFloat(product.price || 0).toFixed(2)}</span>
                <span class="product-sales">已售 ${product.sales || 0}</span>
              </div>
              <button class="btn-details">查看详情</button>
            </div>
          </div>
        </div>
      </a>
    `;
  }

  /**
   * 渲染推荐产品卡片 (用于首页推荐区域)
   * @param {Object} product - 产品数据
   * @returns {string} HTML字符串
   */
  renderRecommendCard(product) {
    const features = Array.isArray(product.features) ? product.features : [];
    const featuresHtml = features.slice(0, 4).map(f => `
      <li><i class="${f.icon}"></i>${f.text}</li>
    `).join('');

    return `
      <div class="product-card aos-init aos-animate" data-aos="fade-up" data-aos-delay="100">
        ${product.tag ? `<div class="product-tag">${product.tag}</div>` : ''}
        <div class="product-image-container">
          <img src="${product.cardImage || 'assets/images/home page/core-products/default.png'}" 
               alt="${product.name}" 
               class="product-image"
               onerror="this.src='assets/images/home page/core-products/default.png'">
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.shortDesc || '暂无描述'}</p>
          <ul class="product-features">
            ${featuresHtml || '<li><i class="fas fa-check"></i>暂无特性</li>'}
          </ul>
          <div class="product-footer">
            <span class="product-price">¥${parseFloat(product.price || 0).toFixed(2)}</span>
            <a href="/products/${product.model}/产品详情.html" class="btn-view-product">查看详情</a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染到指定容器
   * @param {string} containerId - 容器ID
   * @param {Object} options - 加载选项
   * @param {string} renderType - 渲染类型: 'card' | 'recommend'
   */
  async renderToContainer(containerId, options = {}, renderType = 'card') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`容器 #${containerId} 不存在`);
      return;
    }

    // 显示加载中
    container.innerHTML = '<div class="loading">加载中...</div>';

    // 加载产品
    const result = await this.loadProducts(options);
    const products = result.items || [];

    if (products.length === 0) {
      container.innerHTML = '<div class="empty-state">暂无产品</div>';
      return;
    }

    // 渲染产品
    const renderMethod = renderType === 'recommend' ? 'renderRecommendCard' : 'renderProductCard';
    const html = products.map(p => this[renderMethod](p)).join('');
    container.innerHTML = html;

    // 触发动画
    this.triggerAnimation(container);
  }

  /**
   * 触发卡片动画
   * @param {HTMLElement} container - 容器元素
   */
  triggerAnimation(container) {
    const cards = container.querySelectorAll('.product-card-link, .product-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      }, index * 50);
    });
  }

  /**
   * 加载首页Banner位产品
   * @param {string} containerId - 容器ID
   */
  async loadBannerProducts(containerId) {
    await this.renderToContainer(containerId, {
      promoPosition: 'homepage_banner',
      limit: 5
    }, 'recommend');
  }

  /**
   * 加载首页推荐产品
   * @param {string} containerId - 容器ID
   */
  async loadRecommendProducts(containerId) {
    await this.renderToContainer(containerId, {
      promoPosition: 'homepage_recommend',
      limit: 6
    }, 'recommend');
  }

  /**
   * 加载分类页置顶产品
   * @param {string} containerId - 容器ID
   * @param {number} categoryId - 分类ID
   */
  async loadCategoryTopProducts(containerId, categoryId) {
    await this.renderToContainer(containerId, {
      categoryId,
      promoPosition: 'category_top',
      limit: 3
    }, 'card');
  }

  /**
   * 加载分类下的所有产品
   * @param {string} containerId - 容器ID
   * @param {number} categoryId - 分类ID
   * @param {number} page - 页码
   */
  async loadCategoryProducts(containerId, categoryId, page = 1) {
    await this.renderToContainer(containerId, {
      categoryId,
      page,
      limit: 20
    }, 'card');
  }

  /**
   * 搜索产品
   * @param {string} containerId - 容器ID
   * @param {string} keyword - 搜索关键词
   */
  async searchProducts(containerId, keyword) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<div class="loading">搜索中...</div>';

    try {
      const response = await fetch(`${this.apiBaseUrl}/products?search=${encodeURIComponent(keyword)}&status=active`);
      const data = await response.json();
      
      if (data.code === 200) {
        const products = data.data.items || [];
        
        if (products.length === 0) {
          container.innerHTML = `<div class="empty-state">未找到与 "${keyword}" 相关的产品</div>`;
          return;
        }

        const html = products.map(p => this.renderProductCard(p)).join('');
        container.innerHTML = html;
        this.triggerAnimation(container);
      }
    } catch (error) {
      console.error('搜索产品出错:', error);
      container.innerHTML = '<div class="error-state">搜索失败,请稍后重试</div>';
    }
  }
}

// 导出全局实例
window.productLoader = new ProductLoader();

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ 产品加载器已初始化');
  
  // 自动加载首页推荐产品
  const coreProductsContainer = document.querySelector('#core-products .products-showcase');
  if (coreProductsContainer) {
    window.productLoader.loadRecommendProducts('core-products');
  }
  
  // 自动加载产品列表
  const productsGrid = document.getElementById('products-grid');
  if (productsGrid) {
    window.productLoader.renderToContainer('products-grid', { limit: 20 }, 'card');
  }
});
