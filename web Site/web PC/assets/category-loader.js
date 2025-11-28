/**
 * 分类加载器 - 从后端API动态加载产品分类
 * 确保前后端分类数据同步
 */

// API配置
const API_BASE_URL = 'http://localhost:3001/api';

// 分类数据缓存
let categoriesCache = null;
let lastLoadTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 从后端API加载分类数据
 */
async function loadCategories(forceRefresh = false) {
  try {
    // 检查缓存
    const now = Date.now();
    if (!forceRefresh && categoriesCache && (now - lastLoadTime < CACHE_DURATION)) {
      console.log('使用缓存的分类数据');
      return categoriesCache;
    }

    console.log('从API加载分类数据...');
    const response = await fetch(`${API_BASE_URL}/product-categories?includeProducts=true`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      categoriesCache = result.data;
      lastLoadTime = now;
      console.log('分类数据加载成功:', categoriesCache);
      return categoriesCache;
    } else {
      throw new Error('API返回数据格式错误');
    }
  } catch (error) {
    console.error('加载分类失败:', error);
    // 返回空数组而不是抛出错误，避免页面崩溃
    return [];
  }
}

/**
 * 渲染分类到页面
 */
function renderCategories(categories) {
  const container = document.querySelector('.filter-category-list');
  if (!container) {
    console.warn('未找到分类容器元素 .filter-category-list');
    return;
  }

  if (!categories || categories.length === 0) {
    container.innerHTML = '<div class="no-categories">暂无分类</div>';
    return;
  }

  // 只渲染启用状态的分类
  const activeCategories = categories.filter(cat => cat.status === 'active');

  container.innerHTML = activeCategories.map(category => {
    const productCount = category.productCount || 0;
    const hasChildren = category.children && category.children.length > 0;
    const activeChildren = hasChildren ? category.children.filter(child => child.status === 'active') : [];

    return `
      <div class="filter-category" data-category-id="${category.id}">
        <div class="category-header">
          <input type="checkbox" 
                 id="cat-${category.id}" 
                 data-category="${category.id}"
                 onchange="handleCategoryChange(${category.id})">
          <label for="cat-${category.id}">${escapeHtml(category.name)}</label>
          <span class="category-count">${productCount}</span>
        </div>
        ${activeChildren.length > 0 ? `
          <div class="category-children">
            ${activeChildren.map(child => {
              const childCount = child.productCount || 0;
              return `
                <div class="filter-subcategory" data-subcategory-id="${child.id}">
                  <input type="checkbox" 
                         id="subcat-${child.id}" 
                         data-subcategory="${child.id}"
                         onchange="handleSubcategoryChange(${child.id}, ${category.id})">
                  <label for="subcat-${child.id}">${escapeHtml(child.name)}</label>
                  <span class="subcategory-count">${childCount}</span>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  console.log(`已渲染 ${activeCategories.length} 个分类`);
}

/**
 * HTML转义，防止XSS攻击
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 处理分类选择变化
 */
function handleCategoryChange(categoryId) {
  const checkbox = document.getElementById(`cat-${categoryId}`);
  const isChecked = checkbox.checked;
  
  console.log(`分类 ${categoryId} ${isChecked ? '已选中' : '已取消'}`);
  
  // 如果选中父分类，自动选中所有子分类
  const categoryElement = document.querySelector(`[data-category-id="${categoryId}"]`);
  if (categoryElement && isChecked) {
    const subcategoryCheckboxes = categoryElement.querySelectorAll('.filter-subcategory input[type="checkbox"]');
    subcategoryCheckboxes.forEach(cb => {
      cb.checked = true;
    });
  }
  
  // 触发产品筛选
  filterProducts();
}

/**
 * 处理子分类选择变化
 */
function handleSubcategoryChange(subcategoryId, parentCategoryId) {
  const checkbox = document.getElementById(`subcat-${subcategoryId}`);
  const isChecked = checkbox.checked;
  
  console.log(`子分类 ${subcategoryId} ${isChecked ? '已选中' : '已取消'}`);
  
  // 如果所有子分类都被选中，自动选中父分类
  const categoryElement = document.querySelector(`[data-category-id="${parentCategoryId}"]`);
  if (categoryElement) {
    const subcategoryCheckboxes = categoryElement.querySelectorAll('.filter-subcategory input[type="checkbox"]');
    const allChecked = Array.from(subcategoryCheckboxes).every(cb => cb.checked);
    const parentCheckbox = document.getElementById(`cat-${parentCategoryId}`);
    if (parentCheckbox) {
      parentCheckbox.checked = allChecked;
    }
  }
  
  // 触发产品筛选
  filterProducts();
}

/**
 * 根据选中的分类筛选产品
 */
function filterProducts() {
  // 获取所有选中的分类和子分类ID
  const selectedCategories = [];
  const selectedSubcategories = [];
  
  document.querySelectorAll('.filter-category input[type="checkbox"]:checked').forEach(checkbox => {
    const categoryId = checkbox.dataset.category;
    if (categoryId) {
      selectedCategories.push(parseInt(categoryId));
    }
  });
  
  document.querySelectorAll('.filter-subcategory input[type="checkbox"]:checked').forEach(checkbox => {
    const subcategoryId = checkbox.dataset.subcategory;
    if (subcategoryId) {
      selectedSubcategories.push(parseInt(subcategoryId));
    }
  });
  
  console.log('选中的分类:', selectedCategories);
  console.log('选中的子分类:', selectedSubcategories);
  
  // 这里可以添加产品筛选逻辑
  // 例如：调用产品加载函数，传入选中的分类ID
  if (typeof loadProductsByCategories === 'function') {
    loadProductsByCategories(selectedCategories, selectedSubcategories);
  }
}

/**
 * 初始化分类加载器
 */
async function initCategoryLoader() {
  console.log('初始化分类加载器...');
  
  try {
    const categories = await loadCategories();
    renderCategories(categories);
    
    // 添加刷新按钮（可选）
    addRefreshButton();
  } catch (error) {
    console.error('初始化分类加载器失败:', error);
  }
}

/**
 * 添加刷新按钮
 */
function addRefreshButton() {
  const filterSection = document.querySelector('.filter-section');
  if (!filterSection) return;
  
  // 检查是否已存在刷新按钮
  if (document.getElementById('refresh-categories-btn')) return;
  
  const refreshBtn = document.createElement('button');
  refreshBtn.id = 'refresh-categories-btn';
  refreshBtn.className = 'refresh-categories-btn';
  refreshBtn.innerHTML = '🔄 刷新分类';
  refreshBtn.style.cssText = `
    margin: 10px 0;
    padding: 8px 16px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
  `;
  
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '⏳ 刷新中...';
    
    try {
      const categories = await loadCategories(true); // 强制刷新
      renderCategories(categories);
      refreshBtn.innerHTML = '✓ 刷新成功';
      setTimeout(() => {
        refreshBtn.innerHTML = '🔄 刷新分类';
        refreshBtn.disabled = false;
      }, 2000);
    } catch (error) {
      refreshBtn.innerHTML = '✗ 刷新失败';
      setTimeout(() => {
        refreshBtn.innerHTML = '🔄 刷新分类';
        refreshBtn.disabled = false;
      }, 2000);
    }
  });
  
  refreshBtn.addEventListener('mouseenter', () => {
    refreshBtn.style.background = '#2563eb';
    refreshBtn.style.transform = 'translateY(-2px)';
  });
  
  refreshBtn.addEventListener('mouseleave', () => {
    refreshBtn.style.background = '#3b82f6';
    refreshBtn.style.transform = 'translateY(0)';
  });
  
  // 插入到分类列表之前
  const categoryList = document.querySelector('.filter-category-list');
  if (categoryList && categoryList.parentElement) {
    categoryList.parentElement.insertBefore(refreshBtn, categoryList);
  }
}

// 页面加载完成后自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCategoryLoader);
} else {
  initCategoryLoader();
}

// 导出函数供外部使用
window.CategoryLoader = {
  loadCategories,
  renderCategories,
  filterProducts,
  refresh: () => loadCategories(true)
};
