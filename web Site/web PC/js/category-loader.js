/**
 * 分类加载器 - 从后端API动态加载分类并渲染
 * 支持分类展示、分类切换、产品筛选等功能
 */

class CategoryLoader {
  constructor(apiBaseUrl = 'http://localhost:3001/api') {
    this.apiBaseUrl = apiBaseUrl;
    this.currentCategoryId = null;
  }

  /**
   * 加载分类列表
   * @param {boolean} includeProducts - 是否包含产品数量
   * @returns {Promise<Array>} 分类列表
   */
  async loadCategories(includeProducts = true) {
    try {
      const params = includeProducts ? '?includeProducts=true' : '';
      const response = await fetch(`${this.apiBaseUrl}/product-categories${params}`);
      const data = await response.json();
      
      if (data.code === 200) {
        return data.data || [];
      } else {
        console.error('加载分类失败:', data.message);
        return [];
      }
    } catch (error) {
      console.error('加载分类出错:', error);
      return [];
    }
  }

  /**
   * 渲染分类卡片
   * @param {Object} category - 分类数据
   * @param {number} index - 索引(用于动画延迟)
   * @returns {string} HTML字符串
   */
  renderCategoryCard(category, index = 0) {
    const productCount = category.productCount || 0;
    const icon = category.icon || 'default-category.png';
    const description = category.description || '暂无描述';

    return `
      <div class="category-card aos-init aos-animate" 
           data-aos="fade-up" 
           data-aos-delay="${index * 100}" 
           data-category-id="${category.id}">
        <div class="category-image">
          <img src="../assets/images/product center/${icon}" 
               alt="${category.name}" 
               class="img-fluid" 
               onerror="this.src='../assets/images/product center/default-category.png'">
          <div class="category-overlay"></div>
        </div>
        <div class="category-content">
          <h3 class="category-title">${category.name}</h3>
          <p class="category-description">${description}</p>
          <div class="category-features">
            <div class="feature-tag">${productCount} 款产品</div>
          </div>
          <a href="#products-section" 
             class="btn-view-more" 
             data-category-id="${category.id}"
             onclick="window.categoryLoader.filterByCategory(${category.id}); return false;">
            查看更多 <i class="bi bi-arrow-right"></i>
          </a>
        </div>
      </div>
    `;
  }

  /**
   * 渲染分类列表到容器
   * @param {string} containerId - 容器ID
   */
  async renderToContainer(containerId) {
    const container = document.getElementById(containerId) || document.querySelector(`.${containerId}`);
    if (!container) {
      console.error(`容器 ${containerId} 不存在`);
      return;
    }

    // 显示加载中
    container.innerHTML = '<div class="loading">加载中...</div>';

    // 加载分类
    const categories = await this.loadCategories(true);

    if (categories.length === 0) {
      container.innerHTML = '<div class="empty-state">暂无分类</div>';
      return;
    }

    // 渲染分类
    const html = categories.map((cat, index) => this.renderCategoryCard(cat, index)).join('');
    container.innerHTML = html;

    // 绑定点击事件
    this.bindCategoryEvents(container);
  }

  /**
   * 绑定分类点击事件
   * @param {HTMLElement} container - 容器元素
   */
  bindCategoryEvents(container) {
    const buttons = container.querySelectorAll('.btn-view-more');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const categoryId = parseInt(btn.dataset.categoryId);
        this.filterByCategory(categoryId);
      });
    });
  }

  /**
   * 按分类筛选产品
   * @param {number} categoryId - 分类ID
   */
  async filterByCategory(categoryId) {
    this.currentCategoryId = categoryId;

    // 滚动到产品区域
    const productsSection = document.getElementById('products-section') || document.querySelector('.products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }

    // 更新分类按钮状态
    this.updateCategoryButtons(categoryId);

    // 加载该分类的产品
    if (window.productLoader) {
      await window.productLoader.loadCategoryProducts('products-grid', categoryId);
    }
  }

  /**
   * 更新分类按钮状态
   * @param {number} activeCategoryId - 当前激活的分类ID
   */
  updateCategoryButtons(activeCategoryId) {
    // 移除所有激活状态
    document.querySelectorAll('.category-card').forEach(card => {
      card.classList.remove('active');
    });

    // 添加当前激活状态
    const activeCard = document.querySelector(`.category-card[data-category-id="${activeCategoryId}"]`);
    if (activeCard) {
      activeCard.classList.add('active');
    }

    // 更新分类筛选按钮(如果有)
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (parseInt(btn.dataset.categoryId) === activeCategoryId) {
        btn.classList.add('active');
      }
    });
  }

  /**
   * 渲染分类筛选按钮
   * @param {string} containerId - 容器ID
   */
  async renderFilterButtons(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const categories = await this.loadCategories(false);

    const html = `
      <button class="category-filter-btn active" data-category-id="all" onclick="window.categoryLoader.showAllProducts()">
        全部产品
      </button>
      ${categories.map(cat => `
        <button class="category-filter-btn" 
                data-category-id="${cat.id}" 
                onclick="window.categoryLoader.filterByCategory(${cat.id})">
          ${cat.name}
        </button>
      `).join('')}
    `;

    container.innerHTML = html;
  }

  /**
   * 显示所有产品
   */
  async showAllProducts() {
    this.currentCategoryId = null;
    this.updateCategoryButtons(null);

    // 移除所有激活状态
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // 激活"全部产品"按钮
    const allBtn = document.querySelector('.category-filter-btn[data-category-id="all"]');
    if (allBtn) {
      allBtn.classList.add('active');
    }

    // 加载所有产品
    if (window.productLoader) {
      await window.productLoader.renderToContainer('products-grid', { limit: 20 }, 'card');
    }
  }

  /**
   * 获取当前分类信息
   * @param {number} categoryId - 分类ID
   * @returns {Promise<Object>} 分类信息
   */
  async getCategoryInfo(categoryId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/product-categories/${categoryId}`);
      const data = await response.json();
      
      if (data.code === 200) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('获取分类信息出错:', error);
      return null;
    }
  }

  /**
   * 渲染面包屑导航
   * @param {number} categoryId - 分类ID
   * @param {string} containerId - 容器ID
   */
  async renderBreadcrumb(categoryId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!categoryId) {
      container.innerHTML = `
        <nav class="breadcrumb">
          <a href="/">首页</a>
          <span class="separator">/</span>
          <span class="current">所有产品</span>
        </nav>
      `;
      return;
    }

    const category = await this.getCategoryInfo(categoryId);
    if (!category) return;

    container.innerHTML = `
      <nav class="breadcrumb">
        <a href="/">首页</a>
        <span class="separator">/</span>
        <a href="#" onclick="window.categoryLoader.showAllProducts(); return false;">产品中心</a>
        <span class="separator">/</span>
        <span class="current">${category.name}</span>
      </nav>
    `;
  }
}

// 导出全局实例
window.categoryLoader = new CategoryLoader();

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ 分类加载器已初始化');
  
  // 自动加载分类列表
  const categoriesContainer = document.querySelector('.categories-container');
  if (categoriesContainer) {
    window.categoryLoader.renderToContainer('categories-container');
  }

  // 自动加载分类筛选按钮
  const filterContainer = document.getElementById('category-filters');
  if (filterContainer) {
    window.categoryLoader.renderFilterButtons('category-filters');
  }

  // 检查URL参数中是否有分类ID
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get('categoryId');
  if (categoryId) {
    window.categoryLoader.filterByCategory(parseInt(categoryId));
  }
});
