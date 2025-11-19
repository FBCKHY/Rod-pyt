/**
 * 产品目录筛选页面脚本 - product-catalog.js
 * 
 * 描述：处理产品筛选、排序和视图切换等交互功能
 * 
 * 功能：
 * - 产品筛选功能
 * - 价格范围滑块
 * - 排序控制
 * - 视图切换（网格/列表）
 * - 分页控制
 * - 横幅搜索功能
 * 
 * 创建日期：2023-08-15
 */

// 创建一个新的CSS样式，用于处理分页控件
const style = document.createElement('style');
style.textContent = `
.pagination-container {
  position: sticky;
  bottom: 20px;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  transition: all 0.3s ease;
}

.pagination {
  margin: 0;
}

.products-grid {
  transition: opacity 0.3s ease;
}
`;
document.head.appendChild(style);

// 动态数据：分类与产品（来自后端）
let BACKEND_CATEGORIES = [];
let CATEGORY_DESC_MAP = new Map(); // Map<number, Set<number>>
let ALL_PRODUCTS = [];

// API 基址（若当前不在3000端口，则指向后端3000）
const API_BASE = (window.location.origin.includes(':3000') ? '' : 'http://localhost:3000');

// 规范化后端静态资源URL（修正端口与路径）
function normalizeBackendUrl(url) {
    if (!url || typeof url !== 'string') return url;
    let s = url.trim();
    // 修正误写的目录与空格
    s = s.replace(/card images/gi, 'card_images');
    s = s.replace(/\s+/g, '_');
    // 统一前缀到后端端口
    if (s.startsWith('/uploads') || s.startsWith('/products')) {
        return API_BASE + s;
    }
    return s;
}

// 简单请求封装
async function fetchJSON(url) {
    try {
        const full = url.startsWith('/api') ? (API_BASE + url) : url;
        const res = await fetch(full, { credentials: 'include' });
        // 仅当响应为JSON再解析，否则抛出以触发回退
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) {
            throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        return data && data.data !== undefined ? data.data : data;
    } catch (e) {
        console.error('请求失败:', url, e);
        return null;
    }
}

// 构建"包含自身的后代ID集合"映射
function buildCategoryDescendantMap(tree) {
    const map = new Map();
    const visit = (node) => {
        const set = new Set([node.id]);
        if (Array.isArray(node.children)) {
            node.children.forEach(child => {
                const childSet = visit(child);
                childSet.forEach(id => set.add(id));
            });
        }
        map.set(node.id, set);
        return set;
    };
    (tree || []).forEach(root => visit(root));
    return map;
}

// 渲染筛选（保持样式结构不变）
function renderCategoryFilters(tree, productCounts = new Map()) {
    const list = document.querySelector('.filter-category-list');
    if (!list) return;
    list.innerHTML = '';
    const getCount = (id) => productCounts.get(id) || 0;
    const getAggCount = (node) => {
        const set = CATEGORY_DESC_MAP.get(node.id);
        let sum = 0;
        if (set) set.forEach(id => { sum += getCount(id); });
        return sum;
    };

    (tree || []).forEach(node => {
        const wrapper = document.createElement('div');
        wrapper.className = 'filter-category';

        const headerId = `cat-${node.id}`;
        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = `
            <input type="checkbox" id="${headerId}" data-category-id="${node.id}">
            <label for="${headerId}">${node.name}</label>
            <span class="category-count">${getAggCount(node)}</span>
        `;
        wrapper.appendChild(header);

        if (Array.isArray(node.children) && node.children.length > 0) {
            const childrenWrap = document.createElement('div');
            childrenWrap.className = 'category-children';

            node.children.forEach(child => {
                const childId = `subcat-${child.id}`;
                const childDiv = document.createElement('div');
                childDiv.className = 'filter-subcategory';
                childDiv.innerHTML = `
                    <input type="checkbox" id="${childId}" data-subcategory-id="${child.id}">
                    <label for="${childId}">${child.name}</label>
                    <span class="subcategory-count">${getCount(child.id)}</span>
                `;
                childrenWrap.appendChild(childDiv);
            });

            wrapper.appendChild(childrenWrap);
        }

        list.appendChild(wrapper);
    });
}

// 渲染产品网格（来自后端）
function renderProductsGrid(products) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    grid.innerHTML = '';

    (products || []).forEach((p, idx) => {
        const a = document.createElement('a');
        a.className = 'product-card-link';
        a.style.setProperty('--card-index', String(idx));
        const detailHref = p.filePath ? normalizeBackendUrl(`/${p.filePath}/产品详情.html`) : './product-detail.html';
        a.href = detailHref;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-id', String(p.id));
        if (p.categoryId != null) {
            card.setAttribute('data-category-id', String(p.categoryId));
        }

        const resolvedTag = (typeof p.tag === 'string' && p.tag.trim()) ? p.tag.trim() : (p.status === 'active' ? '热销' : (p.status === 'draft' ? '草稿' : '上架'));
        const tagClass = (typeof p.tag === 'string' && /新/.test(p.tag)) ? 'product-tag new' : 'product-tag';
        const imgSrc = normalizeBackendUrl(p.cardImage) || '../assets/images/product center/range-hood/云魔方 抽油烟机.png';
        const nameText = p.name || p.model || `产品 ${p.id}`;
        const priceText = p.price != null ? String(p.price) : '';
        const salesText = p.sales != null ? `已售 ${p.sales}` : '';

        const featureTexts = Array.isArray(p.features) ? p.features.map(f => (typeof f === 'string' ? f : (f && f.text) || '')).filter(Boolean).slice(0, 3) : [];
        const featuresHtml = featureTexts.map(t => `<li><i class=\"fas fa-check\"></i><span>${t}</span></li>`).join('');

        card.innerHTML = `
            <div class=\"${tagClass}\">${resolvedTag}</div>
            <div class=\"product-image\">
                <img src=\"${imgSrc}\" alt=\"${nameText}\" loading=\"lazy\">
            </div>
            <div class=\"product-content\">
                <h3 class=\"product-name\">${nameText}</h3>
                <ul class=\"product-features\">
                    ${featuresHtml}
                </ul>
                <div class=\"product-details-footer\">
                    <div class=\"product-price-container\">
                        <span class=\"product-price\">${priceText}</span>
                        <span class=\"product-sales\">${salesText}</span>
                    </div>
                    <button class=\"btn-details\">查看详情</button>
                </div>
            </div>
        `;
        a.appendChild(card);
        grid.appendChild(a);
    });
}

// 初始化：从后端拉取分类与产品，并渲染（失败则保留静态内容）
async function initDynamicData() {
    try {
        const tree = await fetchJSON('/api/product-categories');
        if (Array.isArray(tree) && tree.length > 0) {
            BACKEND_CATEGORIES = tree;
            CATEGORY_DESC_MAP = buildCategoryDescendantMap(BACKEND_CATEGORIES);
        }

        const productResp = await fetchJSON('/api/products?page=1&limit=2000&sortBy=sales&sortDir=DESC');
        const items = productResp && Array.isArray(productResp.items) ? productResp.items : (Array.isArray(productResp) ? productResp : []);
        if (Array.isArray(items) && items.length > 0) {
            ALL_PRODUCTS = items;
        }

        // 仅在拿到后端数据时才覆盖页面静态内容
        if (BACKEND_CATEGORIES.length > 0) {
            const directCount = new Map();
            ALL_PRODUCTS.forEach(p => {
                const cid = p.categoryId;
                if (cid != null) directCount.set(cid, (directCount.get(cid) || 0) + 1);
            });
            renderCategoryFilters(BACKEND_CATEGORIES, directCount);
            // 渲染后需要重新初始化筛选与标签
            initFiltering();
            initFilterTags();
        }

        if (ALL_PRODUCTS.length > 0) {
            renderProductsGrid(ALL_PRODUCTS);
        }
    } catch (e) {
        console.error('初始化动态数据失败', e);
        // 出错时保持页面原有静态内容
    }
}

// ... existing code ...

document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM加载完成，初始化产品目录页面');
    await initDynamicData();
    
    // 先确保所有产品卡片可见
    document.querySelectorAll('.product-card-link').forEach(card => {
        // 移除所有可能的过滤标记
        card.removeAttribute('data-filtered-out');
        // 设置显示
        card.style.display = 'block';
    });
    
    // 初始化筛选面板折叠/展开功能
    initFilterSections();
    
    // 处理URL参数，自动选中对应的筛选条件
    processUrlParameters();
    
    // 初始化价格滑块
    initPriceSlider();
    
    // 初始化排序功能
    initSortOptions();
    
    // 初始化视图切换
    initViewOptions();
    
    // 初始化筛选标签
    initFilterTags();
    
    // 初始化筛选功能
    initFiltering();
    
    // 初始化筛选面板滚动行为
    initFilterPanelScroll();
    
    // 将分页控件包装在容器中以支持固定定位
    wrapPaginationInContainer();
    
    // 初始化分页控件 (这个必须放在最后，因为它会处理产品的显示)
    initPagination();
    
    // 初始化横幅搜索功能
    initBannerSearch();
    
    // 初始化横幅图标动画
    initBannerIcons();
});

// ... existing code ...

function processUrlParameters() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    let hasFilterParams = false;
    let selectedCategories = [];
    let selectedSubcategories = [];
    
    // 支持基于后端ID的参数（categoryId / subcategoryId）
    if (urlParams.has('categoryId')) {
        const cid = urlParams.get('categoryId');
        const categoryCheckbox = document.querySelector(`input[data-category-id="${cid}"]`);
        if (categoryCheckbox) {
            categoryCheckbox.checked = true;
            selectedCategories.push(parseInt(cid));
            hasFilterParams = true;
            console.log(`已自动选中类别ID: ${cid}`);
        }
    }

    if (urlParams.has('subcategoryId')) {
        const sid = urlParams.get('subcategoryId');
        const subcategoryCheckbox = document.querySelector(`input[data-subcategory-id="${sid}"]`);
        if (subcategoryCheckbox) {
            subcategoryCheckbox.checked = true;
            selectedSubcategories.push(parseInt(sid));
            // 同时选中其父类别
            const parentCategory = subcategoryCheckbox.closest('.filter-category');
            if (parentCategory) {
                const parentCheckbox = parentCategory.querySelector('.category-header input[type="checkbox"]');
                if (parentCheckbox) {
                    parentCheckbox.checked = true;
                    const catId = parentCheckbox.getAttribute('data-category-id');
                    if (catId) selectedCategories.push(parseInt(catId));
                }
            }
            hasFilterParams = true;
            console.log(`已自动选中子类别ID: ${sid}`);
            const filterSection = subcategoryCheckbox.closest('.filter-section');
            if (filterSection && !filterSection.classList.contains('active')) {
                filterSection.classList.add('active');
            }
        }
    }

    // 兼容旧的字符串参数（category / subcategory）
    if (urlParams.has('category')) {
        const category = urlParams.get('category');
        const categoryCheckbox = document.querySelector(`input[data-category="${category}"]`);
        if (categoryCheckbox) {
            categoryCheckbox.checked = true;
            selectedCategories.push(category);
            hasFilterParams = true;
            console.log(`已自动选中类别: ${category}`);
        }
    }
    
    if (urlParams.has('subcategory')) {
        const subcategory = urlParams.get('subcategory');
        const subcategoryCheckbox = document.querySelector(`input[data-subcategory="${subcategory}"]`);
        if (subcategoryCheckbox) {
            subcategoryCheckbox.checked = true;
            selectedSubcategories.push(subcategory);
            const parentCategory = subcategoryCheckbox.closest('.filter-category');
            if (parentCategory) {
                const parentCheckbox = parentCategory.querySelector('.category-header input[type="checkbox"]');
                if (parentCheckbox) {
                    parentCheckbox.checked = true;
                    const category = parentCheckbox.getAttribute('data-category');
                    if (category) {
                        selectedCategories.push(category);
                    }
                }
            }
            hasFilterParams = true;
            console.log(`已自动选中子类别: ${subcategory}`);
            const filterSection = subcategoryCheckbox.closest('.filter-section');
            if (filterSection && !filterSection.classList.contains('active')) {
                filterSection.classList.add('active');
            }
        }
    }
    
    if (hasFilterParams) {
        console.log('检测到URL筛选参数，开始筛选产品');
        const filters = {
            categories: selectedCategories,
            subcategories: selectedSubcategories,
            features: [],
            services: [],
            price: { min: null, max: null }
        };
        setTimeout(() => {
            filterProducts(filters);
            updateFilterTags();
            smoothScrollToProducts();
        }, 300);
    }
}

// ... existing code ...

function getActiveFilters() {
    const filters = {
        categories: [],
        subcategories: [],
            features: [],
            services: [],
            price: {
                min: null,
                max: null
            }
        };
        
    // 获取选中的类别（优先使用基于ID的属性）
    document.querySelectorAll('.category-header input[type="checkbox"]:checked').forEach(checkbox => {
        const id = checkbox.getAttribute('data-category-id');
        if (id) {
            filters.categories.push(parseInt(id));
        } else {
            const legacy = checkbox.getAttribute('data-category');
            if (legacy) filters.categories.push(legacy);
        }
    });
    
    // 获取选中的子类别（优先使用基于ID的属性）
    document.querySelectorAll('.filter-subcategory input[type="checkbox"]:checked').forEach(checkbox => {
        const id = checkbox.getAttribute('data-subcategory-id');
        if (id) {
            filters.subcategories.push(parseInt(id));
        } else {
            const legacy = checkbox.getAttribute('data-subcategory');
            if (legacy) filters.subcategories.push(legacy);
        }
    });
    
    // 获取选中的特性
    document.querySelectorAll('.feature-item input[type="checkbox"]:checked').forEach(checkbox => {
        filters.features.push(checkbox.getAttribute('data-feature'));
    });
    
    // 获取选中的服务
    document.querySelectorAll('.service-item input[type="checkbox"]:checked').forEach(checkbox => {
        filters.services.push(checkbox.getAttribute('data-service'));
    });
    
    // 获取价格范围
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;
    
    if (minPrice) filters.price.min = parseInt(minPrice);
    if (maxPrice) filters.price.max = parseInt(maxPrice);
    
    return filters;
}

// ... existing code ...

function filterProducts(filters) {
    console.log('执行筛选，筛选条件:', filters);
    const productCards = document.querySelectorAll('.product-card');
    const noResults = document.querySelector('.no-results');
    let visibleCount = 0;
    
    productCards.forEach(card => {
        const cardLink = card.closest('.product-card-link');
        let shouldShow = true;
        
        // 检查类别与子类别（使用后端分类ID；父类包含子类）
        if (filters.categories.length > 0 || filters.subcategories.length > 0) {
            const catIdAttr = card.getAttribute('data-category-id');
            const catId = catIdAttr ? parseInt(catIdAttr) : null;

            // 父类匹配：任一选中父类的后代集合包含当前产品分类
            if (filters.categories.length > 0) {
                const matchParent = filters.categories.some(parentId => {
                    const set = CATEGORY_DESC_MAP.get(parentId);
                    return set ? set.has(catId) : false;
                });
                if (!matchParent) {
                    shouldShow = false;
                }
            }

            // 子类匹配：产品分类必须在选中的子类列表中
            if (shouldShow && filters.subcategories.length > 0) {
                if (!filters.subcategories.includes(catId)) {
                    shouldShow = false;
                }
            }
        }
        
        // 检查价格筛选
        if (shouldShow && (filters.price.min !== null || filters.price.max !== null)) {
            const priceElement = card.querySelector('.product-price');
            if (priceElement) {
                const priceText = priceElement.textContent.trim();
                const price = parseInt(priceText.replace(/[^\d]/g, ''));
                
                if (filters.price.min !== null && price < filters.price.min) {
                    shouldShow = false;
                }
                
                if (filters.price.max !== null && price > filters.price.max) {
                    shouldShow = false;
                }
            }
        }
        
        // 检查特性筛选
        if (shouldShow && filters.features.length > 0) {
            const productFeatures = Array.from(card.querySelectorAll('.product-features li span')).map(el => el.textContent);
            if (!filters.features.some(feature => productFeatures.includes(feature))) {
                shouldShow = false;
            }
        }
        
        // 检查服务筛选（保持原有逻辑）
        if (shouldShow && filters.services.length > 0) {
            const productId = card.dataset.id;
            const productServices = getProductServices(productId);
            if (!filters.services.some(service => productServices.includes(service))) {
                shouldShow = false;
            }
        }
        
        // 更新产品显示状态
        if (shouldShow) {
            cardLink.removeAttribute('data-filtered-out');
            visibleCount++;
        } else {
            cardLink.setAttribute('data-filtered-out', '');
        }
    });
    
    // 应用分页显示产品
    showProductsForPage(1);
    
    // 更新分页控件以反映筛选后的产品数量
    updatePagination(visibleCount, 1);
    
    // 如果没有可见产品，显示"无结果"提示
    if (visibleCount === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        console.log(`筛选结果：共找到 ${visibleCount} 个匹配产品`);
    }
}

// ... existing code ...

/**
 * 初始化价格滑块
 */
function initPriceSlider() {
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const range = document.querySelector('.slider-range');
    const thumbMin = document.querySelector('.thumb-min');
    const thumbMax = document.querySelector('.thumb-max');
    const track = document.querySelector('.slider-track');
    const pricePresets = document.querySelectorAll('.price-preset');
    
    // 价格范围
    const minPrice = 0;
    const maxPrice = 10000;
    let currentMinPrice = minPrice;
    let currentMaxPrice = maxPrice;
    
    // 更新滑块位置和范围
    function updateSlider() {
        const minPercent = ((currentMinPrice - minPrice) / (maxPrice - minPrice)) * 100;
        const maxPercent = ((currentMaxPrice - minPrice) / (maxPrice - minPrice)) * 100;
        
        range.style.left = minPercent + '%';
        range.style.width = (maxPercent - minPercent) + '%';
        thumbMin.style.left = minPercent + '%';
        thumbMax.style.left = maxPercent + '%';
    }
    
    // 更新输入框值
    function updateInputs() {
        minPriceInput.value = currentMinPrice;
        maxPriceInput.value = currentMaxPrice;
    }
    
    // 处理最小价格输入变化
    minPriceInput.addEventListener('input', function() {
        const value = parseInt(this.value) || minPrice;
        currentMinPrice = Math.min(value, currentMaxPrice - 100);
        updateSlider();
        
        // 更新筛选标签并触发筛选
        updateFilterTags();
        triggerFiltering();
    });
    
    // 处理最大价格输入变化
    maxPriceInput.addEventListener('input', function() {
        const value = parseInt(this.value) || maxPrice;
        currentMaxPrice = Math.max(value, currentMinPrice + 100);
        updateSlider();
        
        // 更新筛选标签并触发筛选
        updateFilterTags();
        triggerFiltering();
    });
    
    // 处理价格预设点击
    pricePresets.forEach(preset => {
        preset.addEventListener('click', function() {
            const minVal = parseInt(this.getAttribute('data-min')) || minPrice;
            const maxVal = parseInt(this.getAttribute('data-max')) || maxPrice;
            
            currentMinPrice = minVal;
            currentMaxPrice = maxVal;
            
            updateInputs();
            updateSlider();
            
            // 触发筛选
            triggerFiltering();
        });
    });
    
    // 简化版滑块拖动（实际项目中可能需要更复杂的实现）
    let isDragging = false;
    let currentThumb = null;
    
    // 鼠标按下事件
    thumbMin.addEventListener('mousedown', function(e) {
        isDragging = true;
        currentThumb = 'min';
        e.preventDefault();
    });
    
    thumbMax.addEventListener('mousedown', function(e) {
        isDragging = true;
        currentThumb = 'max';
        e.preventDefault();
    });
    
    // 鼠标移动事件
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const trackRect = track.getBoundingClientRect();
        const percent = Math.min(Math.max(0, (e.clientX - trackRect.left) / trackRect.width), 1);
        const value = Math.round(minPrice + percent * (maxPrice - minPrice));
        
        if (currentThumb === 'min') {
            currentMinPrice = Math.min(value, currentMaxPrice - 100);
            updateSlider();
            updateInputs();
            
            // 更新筛选标签
            updateFilterTags();
        } else if (currentThumb === 'max') {
            currentMaxPrice = Math.max(value, currentMinPrice + 100);
            updateSlider();
            updateInputs();
            
            // 更新筛选标签
            updateFilterTags();
        }
    });
    
    // 鼠标释放事件
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            currentThumb = null;
            
            // 触发筛选
            triggerFiltering();
        }
    });
}

/**
 * 初始化排序功能
 */
function initSortOptions() {
    const sortOptions = document.querySelectorAll('.sort-option');
    
    sortOptions.forEach(option => {
        option.addEventListener('click', function() {
            // 移除所有活动状态
            sortOptions.forEach(opt => opt.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            
            // 获取排序类型
            const sortType = this.getAttribute('data-sort');
            
            // 执行排序
            sortProducts(sortType);
        });
    });
}

/**
 * 初始化视图切换功能
 */
function initViewOptions() {
    const viewOptions = document.querySelectorAll('.view-option');
    const productsGrid = document.getElementById('products-grid');
    
    viewOptions.forEach(option => {
        option.addEventListener('click', function() {
            // 移除所有活动状态
            viewOptions.forEach(opt => opt.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            
            // 获取视图类型
            const viewType = this.getAttribute('data-view');
            
            // 切换视图类
            if (viewType === 'grid') {
                productsGrid.classList.add('grid-view');
                productsGrid.classList.remove('list-view');
            } else {
                productsGrid.classList.add('list-view');
                productsGrid.classList.remove('grid-view');
            }
        });
    });
}

/**
 * 初始化筛选标签
 */
function initFilterTags() {
    const activeFilters = document.getElementById('active-filters');
    const clearAllBtn = document.querySelector('.filter-clear-all');
    
    // 清除所有筛选器
    clearAllBtn.addEventListener('click', function() {
        // 清除所有复选框
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // 清除价格输入
        document.getElementById('min-price').value = '';
        document.getElementById('max-price').value = '';
        
        // 重置价格滑块
        document.querySelector('.slider-range').style.left = '0%';
        document.querySelector('.slider-range').style.width = '100%';
        document.querySelector('.thumb-min').style.left = '0%';
        document.querySelector('.thumb-max').style.left = '100%';
        
        // 清除标签
        activeFilters.innerHTML = '';
        
        // 隐藏清除按钮
        clearAllBtn.classList.remove('btn-in-view');
        clearAllBtn.classList.add('btn-not-in-view');
        
        // 重置筛选
        resetFiltering();
    });
}

/**
 * 初始化筛选功能
 */
function initFiltering() {
    // 类别和子类别复选框
    const categoryCheckboxes = document.querySelectorAll('.category-header input[type="checkbox"]');
    const subcategoryCheckboxes = document.querySelectorAll('.filter-subcategory input[type="checkbox"]');
    
    // 特性复选框
    const featureCheckboxes = document.querySelectorAll('.feature-item input[type="checkbox"]');
    
    // 服务复选框
    const serviceCheckboxes = document.querySelectorAll('.service-item input[type="checkbox"]');
    
    // 添加事件监听器
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // 如果类别被选中，选中所有子类别
            const category = this.closest('.filter-category');
            const childCheckboxes = category.querySelectorAll('.category-children input[type="checkbox"]');
            
            // 当父类别被选中或取消选中时，所有子类别状态也应随之改变
            childCheckboxes.forEach(child => {
                child.checked = this.checked;
            });
            
            // 更新筛选标签
            updateFilterTags();
            
            // 触发筛选
            triggerFiltering();
        });
    });
    
    subcategoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // 更新父类别状态
            const category = this.closest('.filter-category');
            const parentCheckbox = category.querySelector('.category-header input[type="checkbox"]');
            const siblingCheckboxes = category.querySelectorAll('.category-children input[type="checkbox"]');
            
            // 如果当前子类别被选中，父类别也应该被选中
            if (this.checked) {
                parentCheckbox.checked = true;
            } else {
                // 检查是否所有子类别都被取消选中，如果是则取消选中父类别
                let anyChecked = false;
            siblingCheckboxes.forEach(sibling => {
                    if (sibling.checked) anyChecked = true;
            });
                parentCheckbox.checked = anyChecked;
            }
            
            // 更新筛选标签
            updateFilterTags();
            
            // 触发筛选
            triggerFiltering();
        });
    });
    
    featureCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // 更新筛选标签
            updateFilterTags();
            
            // 触发筛选
            triggerFiltering();
        });
    });
    
    serviceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // 更新筛选标签
            updateFilterTags();
            
            // 触发筛选
            triggerFiltering();
        });
    });
}

/**
 * 更新筛选标签
 */
function updateFilterTags() {
    const activeFilters = document.getElementById('active-filters');
    const clearAllBtn = document.querySelector('.filter-clear-all');
    
    // 清空当前标签
    activeFilters.innerHTML = '';
    
    // 获取所有选中的复选框
    const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
    
    // 获取价格范围
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;
    
    let hasFilters = false;
    
    // 创建一个已处理的子类别集合，用于避免重复添加
    const processedSubcategories = new Set();
    
    // 先处理父类别
    checkedBoxes.forEach(checkbox => {
        if (checkbox.closest('.category-header')) {
            const category = checkbox.closest('.filter-category');
            const categoryName = checkbox.nextElementSibling.textContent;
            const childCheckboxes = category.querySelectorAll('.category-children input[type="checkbox"]');
            
            // 获取已选中的子类别
            const checkedChildren = Array.from(category.querySelectorAll('.category-children input[type="checkbox"]:checked'));
            
            // 记录所有已处理的子类别ID
            checkedChildren.forEach(child => {
                processedSubcategories.add(child.id);
            });
            
            // 如果父类别被选中且有子类别，显示父类别标签
            if (checkbox.checked && childCheckboxes.length > 0) {
                createFilterTag(categoryName, () => {
                    // 取消选中所有子类别
                    childCheckboxes.forEach(child => {
                        child.checked = false;
                    });
                    checkbox.checked = false;
                    updateFilterTags();
                    triggerFiltering();
                });
                hasFilters = true;
            }
        }
    });
    
    // 再处理未被父类别处理的子类别
    checkedBoxes.forEach(checkbox => {
        // 处理子类别
        if (checkbox.closest('.filter-subcategory') && !processedSubcategories.has(checkbox.id)) {
                createFilterTag(checkbox.nextElementSibling.textContent, () => {
                    checkbox.checked = false;
                // 更新父类别状态
                const category = checkbox.closest('.filter-category');
                const parentCheckbox = category.querySelector('.category-header input[type="checkbox"]');
                const siblingCheckboxes = category.querySelectorAll('.category-children input[type="checkbox"]');
                
                let anyChecked = false;
                siblingCheckboxes.forEach(sibling => {
                    if (sibling.checked) anyChecked = true;
                });
                parentCheckbox.checked = anyChecked;
                
                    updateFilterTags();
                    triggerFiltering();
                });
                hasFilters = true;
            }
            
            // 添加特性标签
            if (checkbox.closest('.feature-item')) {
                createFilterTag(checkbox.nextElementSibling.textContent, () => {
                    checkbox.checked = false;
                    updateFilterTags();
                    triggerFiltering();
                });
                hasFilters = true;
            }
            
            // 添加服务标签
            if (checkbox.closest('.service-item')) {
                createFilterTag(checkbox.nextElementSibling.textContent, () => {
                    checkbox.checked = false;
                    updateFilterTags();
                    triggerFiltering();
                });
                hasFilters = true;
        }
    });
    
    // 添加价格范围标签
    if (minPrice || maxPrice) {
        let priceLabel = '价格: ';
        
        if (minPrice && maxPrice) {
            priceLabel += `¥${minPrice} - ¥${maxPrice}`;
        } else if (minPrice) {
            priceLabel += `¥${minPrice} 以上`;
        } else if (maxPrice) {
            priceLabel += `¥${maxPrice} 以下`;
        }
        
        createFilterTag(priceLabel, () => {
            document.getElementById('min-price').value = '';
            document.getElementById('max-price').value = '';
            
            // 重置价格滑块
            document.querySelector('.slider-range').style.left = '0%';
            document.querySelector('.slider-range').style.width = '100%';
            document.querySelector('.thumb-min').style.left = '0%';
            document.querySelector('.thumb-max').style.left = '100%';
            
            updateFilterTags();
            triggerFiltering();
        });
        
        hasFilters = true;
    }
    
    // 显示或隐藏清除全部按钮
    if (hasFilters) {
        clearAllBtn.classList.add('btn-in-view');
        clearAllBtn.classList.remove('btn-not-in-view');
    } else {
        clearAllBtn.classList.remove('btn-in-view');
        clearAllBtn.classList.add('btn-not-in-view');
    }
}

/**
 * 创建筛选标签
 * @param {string} text - 标签文本
 * @param {Function} removeCallback - 移除标签的回调函数
 */
function createFilterTag(text, removeCallback) {
    const activeFilters = document.getElementById('active-filters');
    
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    
    const tagText = document.createElement('span');
    tagText.className = 'filter-tag-text';
    tagText.textContent = text;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'filter-tag-remove';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', removeCallback);
    
    tag.appendChild(tagText);
    tag.appendChild(removeBtn);
    activeFilters.appendChild(tag);
}

/**
 * 触发筛选操作
 */
function triggerFiltering() {
    const filters = getActiveFilters();
    
    // 更新筛选标签
    updateFilterTags();
    
    // 应用筛选
    filterProducts(filters);
    
    // 更新分页 - 筛选后重置到第一页
    const visibleProducts = Array.from(document.querySelectorAll('.product-card-link')).filter(
        card => window.getComputedStyle(card).display !== 'none'
    );
    updatePagination(visibleProducts.length, 1);
}

/**
 * 获取当前活动的筛选条件
 * @returns {Object} 筛选条件对象
 */
function getActiveFilters() {
    const filters = {
        categories: [],
        subcategories: [],
        features: [],
        services: [],
        price: {
            min: null,
            max: null
        }
    };
    
    // 获取选中的类别（优先使用基于ID的属性）
    document.querySelectorAll('.category-header input[type="checkbox"]:checked').forEach(checkbox => {
        const id = checkbox.getAttribute('data-category-id');
        if (id) {
            filters.categories.push(parseInt(id));
        } else {
            const legacy = checkbox.getAttribute('data-category');
            if (legacy) filters.categories.push(legacy);
        }
    });
    
    // 获取选中的子类别（优先使用基于ID的属性）
    document.querySelectorAll('.filter-subcategory input[type="checkbox"]:checked').forEach(checkbox => {
        const id = checkbox.getAttribute('data-subcategory-id');
        if (id) {
            filters.subcategories.push(parseInt(id));
        } else {
            const legacy = checkbox.getAttribute('data-subcategory');
            if (legacy) filters.subcategories.push(legacy);
        }
    });
    
    // 获取选中的特性
    document.querySelectorAll('.feature-item input[type="checkbox"]:checked').forEach(checkbox => {
        filters.features.push(checkbox.getAttribute('data-feature'));
    });
    
    // 获取选中的服务
    document.querySelectorAll('.service-item input[type="checkbox"]:checked').forEach(checkbox => {
        filters.services.push(checkbox.getAttribute('data-service'));
    });
    
    // 获取价格范围
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;
    
    if (minPrice) filters.price.min = parseInt(minPrice);
    if (maxPrice) filters.price.max = parseInt(maxPrice);
    
    return filters;
}

/**
 * 根据筛选条件筛选产品
 * @param {object} filters - 筛选条件
 */
function filterProducts(filters) {
    console.log('执行筛选，筛选条件:', filters);
    const productCards = document.querySelectorAll('.product-card');
    const noResults = document.querySelector('.no-results');
    let visibleCount = 0;
    
    productCards.forEach(card => {
        const cardLink = card.closest('.product-card-link');
        let shouldShow = true;
        
        // 检查类别与子类别（使用后端分类ID；父类包含子类）
        if (filters.categories.length > 0 || filters.subcategories.length > 0) {
            const catIdAttr = card.getAttribute('data-category-id');
            const catId = catIdAttr ? parseInt(catIdAttr) : null;

            // 父类匹配：任一选中父类的后代集合包含当前产品分类
            if (filters.categories.length > 0) {
                const matchParent = filters.categories.some(parentId => {
                    const set = CATEGORY_DESC_MAP.get(parentId);
                    return set ? set.has(catId) : false;
                });
                if (!matchParent) {
                shouldShow = false;
                }
            }
            
            // 子类匹配：产品分类必须在选中的子类列表中
            if (shouldShow && filters.subcategories.length > 0) {
                if (!filters.subcategories.includes(catId)) {
                shouldShow = false;
                }
            }
        }
        
        // 检查价格筛选
        if (shouldShow && (filters.price.min !== null || filters.price.max !== null)) {
            const priceElement = card.querySelector('.product-price');
            if (priceElement) {
                const priceText = priceElement.textContent.trim();
                const price = parseInt(priceText.replace(/[^\d]/g, ''));
                
                if (filters.price.min !== null && price < filters.price.min) {
                    shouldShow = false;
                }
                
                if (filters.price.max !== null && price > filters.price.max) {
                    shouldShow = false;
                }
            }
        }
        
        // 检查特性筛选
        if (shouldShow && filters.features.length > 0) {
            const productFeatures = Array.from(card.querySelectorAll('.product-features li span')).map(el => el.textContent);
            if (!filters.features.some(feature => productFeatures.includes(feature))) {
                shouldShow = false;
            }
        }
        
        // 检查服务筛选（保持原有逻辑）
        if (shouldShow && filters.services.length > 0) {
            const productId = card.dataset.id;
            const productServices = getProductServices(productId);
            if (!filters.services.some(service => productServices.includes(service))) {
                shouldShow = false;
            }
        }
        
        // 更新产品显示状态
        if (shouldShow) {
            cardLink.removeAttribute('data-filtered-out');
            visibleCount++;
        } else {
            cardLink.setAttribute('data-filtered-out', '');
        }
    });
    
    // 应用分页显示产品
    showProductsForPage(1);
    
    // 更新分页控件以反映筛选后的产品数量
    updatePagination(visibleCount, 1);
    
    // 如果没有可见产品，显示"无结果"提示
    if (visibleCount === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        console.log(`筛选结果：共找到 ${visibleCount} 个匹配产品`);
    }
}

/**
 * 获取产品的类别信息
 * @param {string} productId - 产品ID
 * @returns {object} - 产品所属的类别和子类别
 */
function getProductCategories(productId) {
    // 这里应该从数据库或API获取产品类别
    // 以下是模拟数据
    const productCategoriesMap = {
        'rd-h88': { categories: ['bathroom'], subcategories: ['water-heater'] },
        'rd-b86': { categories: ['kitchen'], subcategories: ['gas-stove'] },
        'rd-j66': { categories: ['kitchen'], subcategories: ['range-hood'] },
        'rd-c98': { categories: ['kitchen'], subcategories: ['integrated-stove'] },
        'rd-h76': { categories: ['bathroom'], subcategories: ['water-heater'] },
        'rd-j58': { categories: ['kitchen'], subcategories: ['range-hood'] },
        'rd-b52': { categories: ['kitchen'], subcategories: ['gas-stove'] },
        'rd-j108': { categories: ['kitchen'], subcategories: ['range-hood'] },
        'rd-d45': { categories: ['kitchen'], subcategories: ['sterilizer'] },
        'rd-h92': { categories: ['bathroom'], subcategories: ['water-heater'] },
        'rd-b78': { categories: ['kitchen'], subcategories: ['gas-stove'] },
        'rd-j42': { categories: ['kitchen'], subcategories: ['range-hood'] },
        'rd-h65': { categories: ['bathroom'], subcategories: ['water-heater'] },
        'rd-c120': { categories: ['kitchen'], subcategories: ['integrated-stove'] },
        'rd-b35': { categories: ['kitchen'], subcategories: ['gas-stove'] },
        'rd-j95': { categories: ['kitchen'], subcategories: ['range-hood'] },
        'rd-h55': { categories: ['bathroom'], subcategories: ['water-heater'] },
        'rd-d68': { categories: ['kitchen'], subcategories: ['sterilizer'] },
        'rd-b92': { categories: ['kitchen'], subcategories: ['gas-stove'] },
        'rd-h48': { categories: ['bathroom'], subcategories: ['water-heater'] },
        'rd-b105': { categories: ['kitchen'], subcategories: ['gas-stove'] },
        'rd-d32': { categories: ['kitchen'], subcategories: ['sterilizer'] }
    };
    
    return productCategoriesMap[productId] || { categories: [], subcategories: [] };
}

/**
 * 获取产品的服务信息
 * @param {string} productId - 产品ID
 * @returns {array} - 产品的服务信息
 */
function getProductServices(productId) {
    // 这里应该从数据库或API获取产品服务信息
    // 以下是模拟数据
    const productServicesMap = {
        'rd-h88': ['free-shipping', 'installation', 'warranty'],
        'rd-b86': ['free-shipping', 'installation', 'warranty'],
        'rd-j66': ['free-shipping', 'installation', 'warranty', 'return'],
        'rd-c98': ['free-shipping', 'installation', 'warranty'],
        'rd-h76': ['free-shipping', 'installation', 'warranty'],
        'rd-j58': ['free-shipping', 'installation', 'warranty'],
        'rd-b52': ['free-shipping', 'installation', 'warranty', 'return'],
        'rd-j108': ['free-shipping', 'installation', 'warranty'],
        'rd-d45': ['free-shipping', 'installation', 'warranty', 'return'],
        'rd-h92': ['free-shipping', 'installation', 'warranty'],
        'rd-b78': ['free-shipping', 'installation', 'warranty'],
        'rd-j42': ['free-shipping', 'installation', 'warranty', 'return'],
        'rd-h65': ['free-shipping', 'installation', 'warranty'],
        'rd-c120': ['free-shipping', 'installation', 'warranty'],
        'rd-b35': ['free-shipping', 'installation', 'warranty', 'return'],
        'rd-j95': ['free-shipping', 'installation', 'warranty'],
        'rd-h55': ['free-shipping', 'installation', 'warranty'],
        'rd-d68': ['free-shipping', 'installation', 'warranty', 'return'],
        'rd-b92': ['free-shipping', 'installation', 'warranty'],
        'rd-h48': ['free-shipping', 'installation', 'warranty', 'return'],
        'rd-b105': ['free-shipping', 'installation', 'warranty'],
        'rd-d32': ['free-shipping', 'installation', 'warranty', 'return']
    };
    
    return productServicesMap[productId] || [];
}

/**
 * 重置筛选条件
 */
function resetFiltering() {
    // 重置类别复选框
    document.querySelectorAll('.filter-category-list input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // 重置价格范围
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';
    
    // 重置价格滑块
    const range = document.querySelector('.slider-range');
    const thumbMin = document.querySelector('.thumb-min');
    const thumbMax = document.querySelector('.thumb-max');
    range.style.left = '0%';
    range.style.width = '100%';
    thumbMin.style.left = '0%';
    thumbMax.style.left = '100%';
    
    // 重置特性复选框
    document.querySelectorAll('.filter-features input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // 重置服务复选框
    document.querySelectorAll('.filter-services input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // 清除筛选标签
    document.getElementById('active-filters').innerHTML = '';
    
    // 显示所有产品
    document.querySelectorAll('.product-card-link').forEach(card => {
        card.style.display = 'block';
    });
    
    // 隐藏"无结果"提示
    document.querySelector('.no-results').style.display = 'none';
    
    // 恢复默认排序
    sortProducts('default');
    
    // 更新分页
    const productCards = document.querySelectorAll('.product-card-link');
    updatePagination(productCards.length, 1);
}

/**
 * 排序产品
 * @param {string} sortType - 排序类型
 */
function sortProducts(sortType) {
    const productsGrid = document.getElementById('products-grid');
    const productCards = Array.from(productsGrid.querySelectorAll('.product-card-link'));
    
    // 根据排序类型对产品进行排序
    switch (sortType) {
        case 'price':
            // 按价格从低到高排序
            productCards.sort((a, b) => {
                const priceA = parseInt(a.querySelector('.product-price').textContent);
                const priceB = parseInt(b.querySelector('.product-price').textContent);
                return priceA - priceB;
            });
            break;
            
        case 'sales':
            // 按销量从高到低排序
            productCards.sort((a, b) => {
                const salesA = parseInt(a.querySelector('.product-sales').textContent.match(/\d+/)[0]);
                const salesB = parseInt(b.querySelector('.product-sales').textContent.match(/\d+/)[0]);
                return salesB - salesA;
            });
            break;
            
        case 'newest':
            // 按新品排序（这里假设新品有"新品"标签）
            productCards.sort((a, b) => {
                const isNewA = a.querySelector('.product-tag.new') !== null;
                const isNewB = b.querySelector('.product-tag.new') !== null;
                return isNewB - isNewA;
            });
            break;
            
        default:
            // 综合排序（默认排序）
            productCards.sort((a, b) => {
                return parseInt(a.style.getPropertyValue('--card-index')) - parseInt(b.style.getPropertyValue('--card-index'));
            });
    }
    
    // 重新排序DOM元素
    productCards.forEach(card => {
        productsGrid.appendChild(card);
    });
}

/**
 * 跳转到指定页面
 * @param {number} pageNumber - 页码
 */
function goToPage(pageNumber) {
    console.log(`准备跳转到第${pageNumber}页`);
    
    // 获取可见产品数量
    const visibleProducts = Array.from(document.querySelectorAll('.product-card-link')).filter(
        card => !card.hasAttribute('data-filtered-out')
    );
    
    // 计算总页数
    const itemsPerPage = 18;
    const totalPages = Math.max(Math.ceil(visibleProducts.length / itemsPerPage), 1);
    
    // 确保页码在有效范围内
    const validPageNumber = Math.min(Math.max(1, pageNumber), totalPages);
    console.log(`有效页码: ${validPageNumber}, 总页数: ${totalPages}`);
    
    // 重要: 获取并锁定产品区域的宽度
    const productsArea = document.querySelector("body > main > div > div.catalog-main > div.products-area");
    let productsAreaWidth = 0;
    
    if (productsArea) {
        // 获取当前宽度
        productsAreaWidth = productsArea.offsetWidth;
        // 锁定宽度，防止在页面切换过程中变化
        productsArea.style.width = `${productsAreaWidth}px`;
        console.log(`锁定产品区域宽度: ${productsAreaWidth}px`);
    }
    
    // 获取分页容器，为其添加动画效果
    const paginationContainer = document.querySelector("body > main > div > div.catalog-main > div.products-area > div.pagination");
    
    // 如果找不到分页容器，检查是否已包装在container中
    if (!paginationContainer) {
        // 尝试获取已包装的分页容器
        const wrappedPagination = document.querySelector("body > main > div > div.catalog-main > div.products-area > div.pagination-container");
        if (wrappedPagination) {
            // 为包装的分页容器添加动画效果
            wrappedPagination.style.transition = "opacity 0.3s ease, transform 0.3s ease";
            wrappedPagination.style.opacity = "0.2";
            wrappedPagination.style.transform = "translateY(10px)";
        }
    } else {
        // 如果找到了常规分页容器，为其添加动画效果
        paginationContainer.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        paginationContainer.style.opacity = "0.2";
        paginationContainer.style.transform = "translateY(10px)";
    }
    
    // 移除所有页码的活动状态，并为当前激活的按钮添加过渡动画
    document.querySelectorAll('.page-number').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('pulse-animation'); // 移除可能存在的脉冲动画
    });
    
    // 找到对应页码按钮并添加活动状态
    let targetButton = null;
    document.querySelectorAll('.page-number').forEach(btn => {
        if (parseInt(btn.textContent) === validPageNumber) {
            btn.classList.add('active');
            btn.classList.add('pulse-animation'); // 添加脉冲动画效果
            targetButton = btn;
        }
    });
    
    // 如果没找到对应页码按钮，需要重建分页
    if (!targetButton) {
        console.log(`未找到页码按钮 ${validPageNumber}，重建分页控件`);
        rebuildPagination(validPageNumber);
    }
    
    // 更新上一页/下一页按钮状态
    updatePrevNextButtons(validPageNumber);
    
    // 创建页面过渡动画效果
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid) {
        // 添加淡出效果
        productsGrid.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        productsGrid.style.opacity = "0.2";
        productsGrid.style.transform = "translateY(20px)";
    }
    
    // 使用较小的延迟来显示新的产品
    setTimeout(() => {
        // 显示该页的产品
        showProductsForPage(validPageNumber, itemsPerPage);
        
        // 滚动到页面顶部，使用更自然的缓动动画
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // 产品列表和分页容器淡入动画
        setTimeout(() => {
            if (productsGrid) {
                productsGrid.style.opacity = "1";
                productsGrid.style.transform = "translateY(0)";
            }
            
            // 恢复分页容器的显示状态
            const paginationContainer = document.querySelector("body > main > div > div.catalog-main > div.products-area > div.pagination");
            if (!paginationContainer) {
                // 尝试获取已包装的分页容器
                const wrappedPagination = document.querySelector("body > main > div > div.catalog-main > div.products-area > div.pagination-container");
                if (wrappedPagination) {
                    wrappedPagination.style.opacity = "1";
                    wrappedPagination.style.transform = "translateY(0)";
                }
            } else {
                paginationContainer.style.opacity = "1";
                paginationContainer.style.transform = "translateY(0)";
            }
            
            // 动画完成后释放产品区域宽度锁定
            setTimeout(() => {
                if (productsArea) {
                    // 恢复自动宽度调整，但保持最小宽度以防收缩
                    productsArea.style.width = '';
                    productsArea.style.minWidth = `${productsAreaWidth}px`;
                }
            }, 300); // 延迟释放，确保动画完全结束
            
        }, 50); // 等待产品内容加载后再执行淡入动画
        
    }, 250); // 短暂延迟，让淡出动画有时间显示
}

/**
 * 平滑滚动到产品区域
 */
function smoothScrollToProducts() {
    const productsArea = document.querySelector('.products-area');
    if (productsArea) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 0;
        const scrollOffset = productsArea.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        
        window.scrollTo({
            top: scrollOffset,
            behavior: 'smooth'
        });
    }
}

/**
 * 重建分页控件
 * @param {number} currentPage - 当前页码
 */
function rebuildPagination(currentPage) {
    console.log(`重建分页控件，当前页: ${currentPage}`);
    
    // 获取可见产品数量
    const visibleProducts = Array.from(document.querySelectorAll('.product-card-link')).filter(
        card => !card.hasAttribute('data-filtered-out')
    );
    
    // 更新分页控件并传递强制页码
    updatePagination(visibleProducts.length, currentPage);
    
    // 确保上一页/下一页按钮状态正确
    setTimeout(() => {
        updatePrevNextButtons(currentPage);
    }, 0);
}

/**
 * 更新上一页/下一页按钮状态
 * @param {number} currentPage - 当前页码
 */
function updatePrevNextButtons(currentPage) {
    const prevBtn = document.querySelector('.page-prev');
    const nextBtn = document.querySelector('.page-next');
    
    if (!prevBtn || !nextBtn) return;
    
    // 计算总页数 - 注意：我们需要获取所有未过滤的产品，而不仅仅是当前显示的
    const visibleProducts = Array.from(document.querySelectorAll('.product-card-link')).filter(
        card => !card.hasAttribute('data-filtered-out')
    );
    const itemsPerPage = 18;
    const totalPages = Math.max(Math.ceil(visibleProducts.length / itemsPerPage), 1);
    
    // 更新按钮状态
    prevBtn.disabled = currentPage <= 1;
    prevBtn.classList.toggle('disabled', currentPage <= 1);
    
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.classList.toggle('disabled', currentPage >= totalPages);
    
    // 控制台输出调试信息
    console.log(`页面状态：当前页=${currentPage}，总页数=${totalPages}，上一页按钮=${prevBtn.disabled}，下一页按钮=${nextBtn.disabled}`);
}

/**
 * 更新分页
 * @param {number} totalItems - 总项目数
 * @param {number} forcePage - 强制指定当前页码（可选）
 */
function updatePagination(totalItems, forcePage = null) {
    const pageNumbers = document.querySelector('.page-numbers');
    const prevBtn = document.querySelector('.page-prev');
    const nextBtn = document.querySelector('.page-next');
    
    // 每页显示的项目数
    const itemsPerPage = 18;
    
    // 计算总页数
    const totalPages = Math.max(Math.ceil(totalItems / itemsPerPage), 1);
    
    // 获取当前活动页码
    let currentPage;
    if (forcePage !== null) {
        currentPage = forcePage;
    } else {
        const activePageElement = document.querySelector('.page-number.active');
        currentPage = activePageElement ? parseInt(activePageElement.textContent) : 1;
    }
    
    // 确保当前页码有效
    currentPage = Math.min(Math.max(currentPage, 1), totalPages);
    
    // 清空页码
    pageNumbers.innerHTML = '';
    
    // 添加页码按钮（最多显示5个页码按钮）
    const maxVisiblePages = 5;
    let startPage = 1;
    let endPage = totalPages;
    
    if (totalPages > maxVisiblePages) {
        startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
    }
    
    // 添加第一页按钮（如果不在可见范围内）
    if (startPage > 1) {
        const firstPageBtn = document.createElement('button');
        firstPageBtn.className = 'page-number';
        firstPageBtn.textContent = '1';
        pageNumbers.appendChild(firstPageBtn);
        
        // 添加省略号
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
    }
    
    // 添加中间页码
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-number';
        pageBtn.textContent = i;
        
        // 如果是当前页，添加活动状态
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        
        pageNumbers.appendChild(pageBtn);
    }
    
    // 添加最后一页按钮（如果不在可见范围内）
    if (endPage < totalPages) {
        // 添加省略号
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
        
        const lastPageBtn = document.createElement('button');
        lastPageBtn.className = 'page-number';
        lastPageBtn.textContent = totalPages;
        pageNumbers.appendChild(lastPageBtn);
    }
    
    // 更新上一页/下一页按钮状态
    updatePrevNextButtons(currentPage);
    
    // 重新绑定分页事件
    bindPaginationEvents();
    
    // 如果强制指定页码，显示该页的产品
    if (forcePage !== null) {
        showProductsForPage(currentPage, itemsPerPage);
    }
} 

/**
 * 显示指定页面的产品
 * @param {number} pageNumber - 页码
 * @param {number} itemsPerPage - 每页显示的产品数量
 */
function showProductsForPage(pageNumber, itemsPerPage = 18) {
    console.log(`显示第${pageNumber}页产品`);
    
    // 获取所有可显示的产品（不包括那些被筛选掉的）
    const visibleProducts = Array.from(document.querySelectorAll('.product-card-link')).filter(
        card => !card.hasAttribute('data-filtered-out')
    );
    
    console.log(`可见产品数量: ${visibleProducts.length}`);
    
    // 计算当前页应显示的产品范围
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, visibleProducts.length);
    
    // 显示加载动画
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid) productsGrid.classList.add('loading');
    
    // 先隐藏所有产品
    document.querySelectorAll('.product-card-link').forEach(card => {
        card.style.display = 'none';
        card.classList.remove('fade-in');
        card.style.opacity = "0";
        card.style.transform = "scale(0.95)";
    });
    
    // 显示当前页面的产品
    for (let i = startIndex; i < endIndex; i++) {
        if (i < visibleProducts.length) {
            const card = visibleProducts[i];
            card.style.display = 'block';
            
            // 使用渐进式动画
            setTimeout(() => {
                card.style.opacity = "1";
                card.style.transform = "scale(1)";
                card.classList.add('fade-in');
            }, (i - startIndex) * 30); // 每个卡片延迟30ms
        }
    }
    
    // 如果没有产品可显示，显示无结果提示
    const noResults = document.querySelector('.no-results');
    if (noResults) {
        if (visibleProducts.length === 0) {
            noResults.style.display = 'block';
            console.log('没有找到匹配的产品');
            
            // 添加重置按钮点击事件
            const resetButton = document.getElementById('show-all-products');
            if (resetButton) {
                resetButton.onclick = resetFiltering;
            }
        } else {
            noResults.style.display = 'none';
        }
    }
    
    // 移除加载动画
    setTimeout(() => {
        if (productsGrid) productsGrid.classList.remove('loading');
    }, Math.min(visibleProducts.length * 30, 500));
} 

/**
 * 初始化筛选面板的滚动行为，防止滚动事件影响整个页面
 */
function initFilterPanelScroll() {
    const filterPanel = document.querySelector('.filter-panel');
    
    if (filterPanel) {
        // 处理滚轮事件
        filterPanel.addEventListener('wheel', function(event) {
            // 检查是否在顶部或底部边界
            const isAtTop = this.scrollTop === 0;
            const isAtBottom = this.scrollTop + this.clientHeight >= this.scrollHeight;
            
            // 如果在顶部并且向上滚动，或者在底部并且向下滚动，就阻止默认行为
            if ((isAtTop && event.deltaY < 0) || (isAtBottom && event.deltaY > 0)) {
                // 不做任何处理，允许页面滚动
            } else {
                // 其他情况，阻止事件冒泡和默认行为，确保只有面板滚动
                event.preventDefault();
                event.stopPropagation();
                
                // 手动滚动筛选面板
                this.scrollTop += event.deltaY;
            }
        }, { passive: false }); // passive: false 允许我们调用 preventDefault()
    }
} 

/**
 * 初始化分页控件
 */
function initPagination() {
    console.log('初始化分页控件');
    
    // 获取所有可见产品
    const visibleProducts = Array.from(document.querySelectorAll('.product-card-link'));
    
    // 移除可能存在的data-filtered-out属性
    visibleProducts.forEach(card => {
        card.removeAttribute('data-filtered-out');
    });
    
    // 更新分页控件
    updatePagination(visibleProducts.length);
    
    // 绑定分页事件
    bindPaginationEvents();
    
    // 确保显示第一页产品 - 立即调用而不是等待事件
    showProductsForPage(1);
    
    // 确保第一页按钮处于激活状态
    const pageOneBtn = document.querySelector('.page-number:first-child');
    if (pageOneBtn) {
        document.querySelectorAll('.page-number').forEach(btn => {
            btn.classList.remove('active');
        });
        pageOneBtn.classList.add('active');
    }
    
    // 更新按钮状态
    updatePrevNextButtons(1);
}

/**
 * 绑定分页控件事件
 */
function bindPaginationEvents() {
    // 清除之前可能存在的事件监听器
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
    // 创建一个新的分页容器，替换旧的
    const newPagination = pagination.cloneNode(false);
    
    // 复制原始内容
    const pageNumbers = pagination.querySelector('.page-numbers');
    const prevBtn = pagination.querySelector('.page-prev');
    const nextBtn = pagination.querySelector('.page-next');
    
    // 创建新元素
    const newPageNumbers = pageNumbers.cloneNode(false);
    const newPrevBtn = prevBtn ? prevBtn.cloneNode(true) : null;
    const newNextBtn = nextBtn ? nextBtn.cloneNode(true) : null;
    
    // 复制页码按钮
    Array.from(pageNumbers.children).forEach(child => {
        const newChild = child.cloneNode(true);
        newPageNumbers.appendChild(newChild);
    });
    
    // 添加新元素到新的分页容器
    if (newPrevBtn) newPagination.appendChild(newPrevBtn);
    newPagination.appendChild(newPageNumbers);
    if (newNextBtn) newPagination.appendChild(newNextBtn);
    
    // 替换旧的分页容器
    pagination.parentNode.replaceChild(newPagination, pagination);
    
    // 重新获取元素
    const freshPageNumbers = document.querySelectorAll('.page-number');
    const freshPrevBtn = document.querySelector('.page-prev');
    const freshNextBtn = document.querySelector('.page-next');
    
    // 添加点击动画效果
    function addClickAnimation(element) {
        if (!element) return;
        
        element.addEventListener('click', function(e) {
            // 如果按钮禁用，不添加动画
            if (this.classList.contains('disabled')) return;
            
            // 创建波纹效果
            const ripple = document.createElement('span');
            ripple.classList.add('pagination-ripple');
            ripple.style.left = `${e.offsetX}px`;
            ripple.style.top = `${e.offsetY}px`;
            this.appendChild(ripple);
            
            // 动画完成后移除元素
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }
    
    // 绑定页码按钮点击事件
    freshPageNumbers.forEach(button => {
        addClickAnimation(button);
        button.addEventListener('click', function() {
            if (this.classList.contains('active')) return;
            
            const pageNumber = parseInt(this.textContent);
            goToPage(pageNumber);
        });
    });
    
    // 绑定上一页按钮事件
    if (freshPrevBtn) {
        addClickAnimation(freshPrevBtn);
        freshPrevBtn.addEventListener('click', function() {
            if (this.classList.contains('disabled')) return;
            
            const activePageElement = document.querySelector('.page-number.active');
            if (!activePageElement) return;
            
            const currentPage = parseInt(activePageElement.textContent);
            goToPage(currentPage - 1);
        });
    }
    
    // 绑定下一页按钮事件
    if (freshNextBtn) {
        addClickAnimation(freshNextBtn);
        freshNextBtn.addEventListener('click', function() {
            if (this.classList.contains('disabled')) return;
            
            const activePageElement = document.querySelector('.page-number.active');
            if (!activePageElement) return;
            
            const currentPage = parseInt(activePageElement.textContent);
            goToPage(currentPage + 1);
            
            // 添加日志，帮助调试
            console.log('点击下一页 - 当前页:', currentPage, '下一页:', currentPage + 1);
        });
    }
} 

/**
 * 初始化横幅搜索功能
 */
function initBannerSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    const bannerSearch = document.querySelector('.banner-search');
    
    if (!searchInput || !searchButton) return;
    
    // 监听搜索按钮点击事件
    searchButton.addEventListener('click', function() {
        // 检查搜索按钮是否处于无结果状态或搜索框是否为空
        if (searchButton.getAttribute('data-no-results') === 'true' || !searchInput.value.trim()) {
            // 如果是无结果状态或搜索框为空，点击将重置页面
            resetToAllProducts();
        } else {
            // 正常搜索
            performSearch(searchInput.value);
        }
    });
    
    // 监听回车键事件
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            // 检查搜索按钮是否处于无结果状态或搜索框是否为空
            if (searchButton.getAttribute('data-no-results') === 'true' || !searchInput.value.trim()) {
                // 如果是无结果状态或搜索框为空，按回车将重置页面
                resetToAllProducts();
            } else {
                // 正常搜索
                performSearch(searchInput.value);
            }
        }
    });
    
    // 搜索输入框获得焦点时的动画效果
    searchInput.addEventListener('focus', function() {
        if (bannerSearch) {
            bannerSearch.style.transform = 'scale(1.02)';
        }
        this.style.boxShadow = '0 5px 25px rgba(253, 214, 48, 0.3)';
    });
    
    // 搜索输入框失去焦点时的动画效果
    searchInput.addEventListener('blur', function() {
        if (bannerSearch) {
            bannerSearch.style.transform = '';
        }
        this.style.boxShadow = '';
    });
}

/**
 * 执行搜索
 * @param {string} query - 搜索关键词
 * @returns {number} - 返回匹配的产品数量
 */
function performSearch(query) {
    if (!query || query.trim() === '') return 0;
    
    query = query.trim().toLowerCase();
    console.log(`执行搜索: ${query}`);
    
    const productCards = document.querySelectorAll('.product-card');
    const noResults = document.querySelector('.no-results');
    let visibleCount = 0;
    
    // 遍历所有产品卡片
    productCards.forEach(card => {
        const cardLink = card.closest('.product-card-link');
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        const productId = card.dataset.id.toLowerCase();
        const productFeatures = Array.from(card.querySelectorAll('.product-features li span')).map(el => el.textContent.toLowerCase());
        
        // 检查产品是否匹配搜索词
        const isMatch = productName.includes(query) || 
                        productId.includes(query) || 
                        productFeatures.some(feature => feature.includes(query));
        
        // 更新产品显示状态
        if (isMatch) {
            // 移除筛选标记
            cardLink.removeAttribute('data-filtered-out');
            visibleCount++;
            // 添加一个匹配高亮效果
            card.classList.add('search-match');
            setTimeout(() => {
                card.classList.remove('search-match');
            }, 2000);
        } else {
            // 标记为被筛选掉
            cardLink.setAttribute('data-filtered-out', '');
        }
    });
    
    // 应用分页显示产品
    showProductsForPage(1);
    
    // 如果没有可见产品，显示"无结果"提示
    if (visibleCount === 0) {
        noResults.style.display = 'block';
        noResults.querySelector('h3').textContent = `未找到与"${query}"匹配的产品`;
        
        // 为"显示全部产品"按钮添加点击事件
        const showAllBtn = document.getElementById('show-all-products');
        if (showAllBtn) {
            // 移除可能存在的旧事件监听器
            const newShowAllBtn = showAllBtn.cloneNode(true);
            showAllBtn.parentNode.replaceChild(newShowAllBtn, showAllBtn);
            
            // 添加新的事件监听器
            newShowAllBtn.addEventListener('click', function() {
                resetToAllProducts();
            });
        }
        
        // 标记搜索按钮状态，使其可以重置页面
        const searchButton = document.querySelector('.search-button');
        if (searchButton) {
            searchButton.setAttribute('data-no-results', 'true');
        }
    } else {
        noResults.style.display = 'none';
        
        // 更新筛选标签
        const activeFilters = document.getElementById('active-filters');
        const searchTag = document.createElement('div');
        searchTag.className = 'filter-tag';
        searchTag.innerHTML = `
            <span class="filter-tag-text">搜索: ${query}</span>
            <button class="filter-tag-remove"><i class="fas fa-times"></i></button>
        `;
        
        // 清除其他搜索标签
        Array.from(activeFilters.querySelectorAll('.filter-tag')).forEach(tag => {
            if (tag.querySelector('.filter-tag-text').textContent.includes('搜索:')) {
                tag.remove();
            }
        });
        
        activeFilters.appendChild(searchTag);
        
        // 添加移除标签事件
        searchTag.querySelector('.filter-tag-remove').addEventListener('click', function() {
            resetFiltering();
            searchTag.remove();
        });
        
        // 更新分页
        updatePagination(visibleCount, 1);
        
        // 重置搜索按钮状态
        const searchButton = document.querySelector('.search-button');
        if (searchButton) {
            searchButton.removeAttribute('data-no-results');
        }
    }
    
    // 显示清除全部按钮
    document.querySelector('.filter-clear-all').classList.add('btn-in-view');
    document.querySelector('.filter-clear-all').classList.remove('btn-not-in-view');
    
    // 返回匹配的产品数量
    return visibleCount;
}

/**
 * 初始化横幅图标动画
 */
function initBannerIcons() {
    const bannerIcons = document.querySelectorAll('.banner-icon');
    
    if (bannerIcons.length === 0) return;
    
    // 为每个图标添加随机的初始位置和动画延迟
    bannerIcons.forEach((icon, index) => {
        // 只有在没有明确设置样式的情况下才设置随机样式
        if (!icon.style.top) {
            const randomTop = 10 + Math.random() * 60; // 10% - 70%
            const randomLeft = 10 + Math.random() * 80; // 10% - 90%
            const randomDelay = Math.random() * 5; // 0 - 5s
            const randomSize = 50 + Math.random() * 40; // 50px - 90px
            
            icon.style.top = `${randomTop}%`;
            icon.style.left = `${randomLeft}%`;
            icon.style.animationDelay = `${randomDelay}s`;
            icon.style.width = `${randomSize}px`;
            icon.style.height = `${randomSize}px`;
        }
    });
    
    // 添加鼠标悬停交互效果
    document.querySelector('.catalog-banner').addEventListener('mousemove', function(e) {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        bannerIcons.forEach((icon) => {
            const moveX = (mouseX - 0.5) * 20;
            const moveY = (mouseY - 0.5) * 20;
            icon.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });
}

/**
 * 重置到全部产品的函数
 */
function resetToAllProducts() {
    // 重置搜索框
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = '';
        searchInput.blur();
    }
    
    // 重置搜索按钮状态
    const searchButton = document.querySelector('.search-button');
    if (searchButton) {
        searchButton.removeAttribute('data-no-results');
    }
    
    // 重置所有产品卡片，显示所有产品
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const cardLink = card.closest('.product-card-link');
        cardLink.removeAttribute('data-filtered-out');
    });
    
    // 隐藏无结果提示
    const noResults = document.querySelector('.no-results');
    if (noResults) {
        noResults.style.display = 'none';
    }
    
    // 重置筛选标签
    resetFiltering();
    
    // 重新应用分页
    updatePagination(document.querySelectorAll('.product-card').length, 1);
    showProductsForPage(1);
    
    console.log('已重置页面到初始状态，显示所有产品');
}

// 为分页按钮添加动画样式
const animationStyles = document.createElement('style');
animationStyles.textContent = `
.pagination-ripple {
    position: absolute;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    pointer-events: none;
    transform: scale(0);
    animation: ripple 0.6s ease-out;
}

.pulse-animation {
    animation: pulse 0.8s ease-in-out;
}

@keyframes ripple {
    0% {
        transform: scale(0);
        opacity: 1;
    }
    100% {
        transform: scale(2);
        opacity: 0;
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }
    25% {
        transform: scale(1.15);
    }
    50% {
        transform: scale(1);
    }
    75% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}

.product-card-link {
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.pagination button {
    transition: all 0.3s ease;
}

.pagination button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.pagination button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
`;
document.head.appendChild(animationStyles); 

// ... existing code ...
function wrapPaginationInContainer() {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    if (pagination.parentElement.classList.contains('pagination-container')) {
        return;
    }

    const container = document.createElement('div');
    container.className = 'pagination-container';

    pagination.parentNode.insertBefore(container, pagination);
    container.appendChild(pagination);

    console.log('✓ 分页控件已包装在固定定位容器中');
}

function initFilterSections() {
    const filterHeaders = document.querySelectorAll('.filter-section-header');

    filterHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const section = this.closest('.filter-section');
            section.classList.toggle('active');
        });
    });
}

// ... existing code ...