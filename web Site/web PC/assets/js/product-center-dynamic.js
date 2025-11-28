/**
 * 产品中心动态加载脚本
 * 从后端API加载真实产品数据
 */

class ProductCenter {
    constructor() {
        this.products = [];
        this.allProducts = []; // 保存所有产品用于搜索
        this.categories = [];
        this.currentCategory = null;
        this.currentPage = 1;
        this.pageSize = 12;
        this.totalProducts = 0;
        
        // 搜索和筛选状态
        this.searchKeyword = '';
        this.priceRange = { min: 0, max: Infinity };
        this.sortBy = 'default'; // default, price-asc, price-desc, sales
        
        // 缓存
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5分钟
        
        // 图片懒加载观察器
        this.lazyLoadObserver = null;
    }

    /**
     * 初始化
     */
    async init() {
        console.log('🚀 产品中心初始化...');
        
        try {
            // 显示骨架屏
            this.showSkeleton();
            
            // 初始化图片懒加载
            this.initLazyLoad();
            
            // 并行加载分类和产品
            await Promise.all([
                this.loadCategories(),
                this.loadProducts()
            ]);
            
            // 保存所有产品用于搜索
            this.allProducts = [...this.products];
            
            // 渲染页面
            this.renderCategories();
            this.renderProducts();
            
            // 绑定事件
            this.bindEvents();
            
            // 隐藏骨架屏
            this.hideSkeleton();
            
            console.log('✅ 产品中心加载完成');
        } catch (error) {
            console.error('❌ 产品中心加载失败:', error);
            this.showError('加载失败，请刷新页面重试');
            this.hideSkeleton();
        }
    }

    /**
     * 加载分类数据
     */
    async loadCategories() {
        try {
            const response = await window.API.Category.getList({ includeProducts: true });
            
            if (response.code === 200) {
                this.categories = response.data.data || response.data || [];
                console.log('✅ 分类加载成功:', this.categories.length, '个分类');
            } else {
                throw new Error(response.message || '加载分类失败');
            }
        } catch (error) {
            console.error('加载分类失败:', error);
            this.categories = [];
        }
    }

    /**
     * 加载产品数据（带缓存）
     */
    async loadProducts(params = {}) {
        try {
            const queryParams = {
                page: this.currentPage,
                limit: this.pageSize,
                status: 'active',
                ...params
            };

            if (this.currentCategory) {
                queryParams.categoryId = this.currentCategory;
            }

            // 检查缓存
            const cacheKey = JSON.stringify(queryParams);
            const cached = this.getCache(cacheKey);
            if (cached) {
                console.log('✅ 使用缓存数据');
                this.products = cached.products;
                this.totalProducts = cached.total;
                return;
            }

            const response = await window.API.Product.getList(queryParams);
            
            if (response.code === 200) {
                const data = response.data;
                this.products = data.items || data.data || [];
                this.totalProducts = data.total || this.products.length;
                
                // 保存到缓存
                this.setCache(cacheKey, {
                    products: this.products,
                    total: this.totalProducts
                });
                
                console.log('✅ 产品加载成功:', this.products.length, '个产品');
            } else {
                throw new Error(response.message || '加载产品失败');
            }
        } catch (error) {
            console.error('加载产品失败:', error);
            this.products = [];
            this.totalProducts = 0;
        }
    }

    /**
     * 渲染分类
     */
    renderCategories() {
        const container = document.querySelector('.categories-container');
        if (!container) return;

        // 如果没有分类数据，保持静态内容
        if (this.categories.length === 0) {
            console.log('⚠️ 无分类数据，保持静态内容');
            return;
        }

        // 清空容器
        container.innerHTML = '';

        // 渲染每个分类
        this.categories.forEach((category, index) => {
            const card = this.createCategoryCard(category, index);
            container.appendChild(card);
        });
    }

    /**
     * 创建分类卡片
     */
    createCategoryCard(category, index) {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', index * 100);
        card.setAttribute('data-category-id', category.id);

        // 获取分类图片（使用第一个产品的图片或默认图片）
        const imageUrl = category.icon || '../assets/images/product center/default-category.png';

        card.innerHTML = `
            <div class="category-image">
                <img src="${imageUrl}" alt="${category.name}" class="img-fluid" onerror="this.src='../assets/images/product center/default-category.png'">
                <div class="category-overlay"></div>
            </div>
            <div class="category-content">
                <h3 class="category-title">${category.name}</h3>
                <p class="category-description">${category.description || '优质产品，值得信赖'}</p>
                <div class="category-features">
                    <div class="feature-tag">${category.productCount || 0} 款产品</div>
                </div>
                <a href="#products-section" class="btn-view-more" data-category-id="${category.id}">
                    查看更多 <i class="bi bi-arrow-right"></i>
                </a>
            </div>
        `;

        return card;
    }

    /**
     * 渲染产品列表
     */
    renderProducts() {
        const container = document.querySelector('.products-slider') || document.querySelector('.products-grid');
        if (!container) {
            console.log('⚠️ 未找到产品容器');
            return;
        }

        // 如果没有产品数据，显示提示
        if (this.products.length === 0) {
            container.innerHTML = `
                <div class="no-products">
                    <i class="bi bi-inbox" style="font-size: 48px; color: #ccc;"></i>
                    <p>暂无产品</p>
                </div>
            `;
            return;
        }

        // 清空容器
        container.innerHTML = '';

        // 渲染每个产品
        this.products.forEach((product, index) => {
            const card = this.createProductCard(product, index);
            container.appendChild(card);
        });
    }

    /**
     * 创建产品卡片（优化版）
     */
    createProductCard(product, index) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', (index % 4) * 100);
        card.setAttribute('data-product-id', product.id);

        // 产品标签
        const badge = product.tag ? `<div class="product-badge">${product.tag}</div>` : '';

        // 产品图片（懒加载）
        const imageUrl = product.cardImage || '../assets/images/product center/default-product.png';
        const placeholderUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect fill="%23f0f0f0" width="300" height="200"/%3E%3C/svg%3E';

        // 产品价格
        const price = product.price ? `¥${parseFloat(product.price).toFixed(2)}` : '价格面议';

        // 产品名称（关键词高亮）
        const productName = this.highlightKeyword(product.name);
        const productModel = this.highlightKeyword(product.model || '');

        // 产品特性
        let featuresHTML = '';
        if (product.features && Array.isArray(product.features)) {
            featuresHTML = product.features.slice(0, 3).map(feature => `
                <li><i class="${feature.icon || 'fas fa-check'}"></i> ${this.highlightKeyword(feature.text)}</li>
            `).join('');
        }

        card.innerHTML = `
            ${badge}
            <div class="product-image">
                <img src="${placeholderUrl}" 
                     data-src="${imageUrl}" 
                     alt="${product.name}" 
                     class="img-fluid lazy-load" 
                     onerror="this.src='../assets/images/product center/default-product.png'">
                <div class="product-overlay">
                    <div class="product-actions">
                        <a href="product-detail.html?id=${product.id}" class="action-btn" title="查看详情">
                            <i class="bi bi-eye"></i>
                        </a>
                        <a href="#" class="action-btn" title="收藏" data-action="favorite">
                            <i class="bi bi-heart"></i>
                        </a>
                        <a href="#" class="action-btn" title="分享" data-action="share">
                            <i class="bi bi-share"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="product-content">
                <div class="product-category">${product.category?.name || '未分类'}</div>
                <h3 class="product-title">${productName}</h3>
                <p class="product-model">${productModel}</p>
                <ul class="product-features">
                    ${featuresHTML || '<li><i class="fas fa-check"></i> 优质产品</li>'}
                </ul>
                <div class="product-footer">
                    <div class="product-price">${price}</div>
                    <a href="product-detail.html?id=${product.id}" class="btn btn-primary btn-sm">
                        查看详情
                    </a>
                </div>
            </div>
        `;

        // 启用图片懒加载
        const img = card.querySelector('.lazy-load');
        if (img) {
            this.observeImage(img);
        }

        return card;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 分类筛选
        document.querySelectorAll('.btn-view-more[data-category-id]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const categoryId = parseInt(btn.dataset.categoryId);
                await this.filterByCategory(categoryId);
            });
        });

        // 产品操作
        document.querySelectorAll('.action-btn[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                const productCard = btn.closest('.product-card');
                const productId = productCard?.dataset.productId;
                
                if (action === 'favorite') {
                    this.toggleFavorite(productId);
                } else if (action === 'share') {
                    this.shareProduct(productId);
                }
            });
        });
    }

    /**
     * 按分类筛选
     */
    async filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.currentPage = 1;
        
        this.showLoader();
        await this.loadProducts();
        this.renderProducts();
        this.hideLoader();
        
        // 滚动到产品区域
        const productsSection = document.getElementById('products-section');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * 收藏产品
     */
    toggleFavorite(productId) {
        console.log('收藏产品:', productId);
        // TODO: 实现收藏功能
        alert('收藏功能开发中...');
    }

    /**
     * 分享产品
     */
    shareProduct(productId) {
        console.log('分享产品:', productId);
        const url = `${window.location.origin}/pages/product-detail.html?id=${productId}`;
        
        if (navigator.share) {
            navigator.share({
                title: '产品分享',
                url: url
            }).catch(err => console.log('分享失败:', err));
        } else {
            // 复制链接
            navigator.clipboard.writeText(url).then(() => {
                alert('链接已复制到剪贴板');
            });
        }
    }

    /**
     * 显示加载状态
     */
    showLoader() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.display = 'flex';
            loader.classList.remove('fade-out');
        }
    }

    /**
     * 隐藏加载状态
     */
    hideLoader() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        console.error('错误:', message);
        const container = document.querySelector('.products-slider') || document.querySelector('.products-grid');
        if (container) {
            container.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 40px; color: #dc3545;">
                    <i class="bi bi-exclamation-triangle" style="font-size: 48px;"></i>
                    <p style="margin-top: 20px; font-size: 18px;">${message}</p>
                    <button class="btn btn-primary mt-3" onclick="location.reload()">重新加载</button>
                </div>
            `;
        }
    }

    // ==================== 搜索和筛选功能 ====================

    /**
     * 搜索产品
     */
    searchProducts(keyword) {
        this.searchKeyword = keyword.toLowerCase().trim();
        this.applyFilters();
    }

    /**
     * 价格筛选
     */
    filterByPrice(min, max) {
        this.priceRange = { min: parseFloat(min) || 0, max: parseFloat(max) || Infinity };
        this.applyFilters();
    }

    /**
     * 排序
     */
    sortProducts(sortBy) {
        this.sortBy = sortBy;
        this.applyFilters();
    }

    /**
     * 应用所有筛选
     */
    applyFilters() {
        let filtered = [...this.allProducts];

        // 搜索筛选
        if (this.searchKeyword) {
            filtered = filtered.filter(product => {
                const searchText = `${product.name} ${product.model} ${product.shortDesc || ''}`.toLowerCase();
                return searchText.includes(this.searchKeyword);
            });
        }

        // 分类筛选
        if (this.currentCategory) {
            filtered = filtered.filter(product => product.categoryId === this.currentCategory);
        }

        // 价格筛选
        filtered = filtered.filter(product => {
            const price = parseFloat(product.price) || 0;
            return price >= this.priceRange.min && price <= this.priceRange.max;
        });

        // 排序
        switch (this.sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
                break;
            case 'price-desc':
                filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
                break;
            case 'sales':
                filtered.sort((a, b) => (b.sales || 0) - (a.sales || 0));
                break;
            default:
                // 默认排序（按ID）
                break;
        }

        this.products = filtered;
        this.totalProducts = filtered.length;
        this.renderProducts();
        this.updateFilterInfo();
    }

    /**
     * 更新筛选信息显示
     */
    updateFilterInfo() {
        const infoElement = document.querySelector('.filter-info');
        if (infoElement) {
            let info = `共 ${this.totalProducts} 个产品`;
            if (this.searchKeyword) {
                info += ` | 搜索: "${this.searchKeyword}"`;
            }
            if (this.currentCategory) {
                const category = this.categories.find(c => c.id === this.currentCategory);
                if (category) {
                    info += ` | 分类: ${category.name}`;
                }
            }
            infoElement.textContent = info;
        }
    }

    /**
     * 关键词高亮
     */
    highlightKeyword(text) {
        if (!this.searchKeyword || !text) return text;
        const regex = new RegExp(`(${this.searchKeyword})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // ==================== 缓存功能 ====================

    /**
     * 设置缓存
     */
    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * 获取缓存
     */
    getCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        // 检查是否过期
        if (Date.now() - cached.timestamp > this.cacheExpiry) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this.cache.clear();
        console.log('✅ 缓存已清除');
    }

    // ==================== 图片懒加载 ====================

    /**
     * 初始化懒加载
     */
    initLazyLoad() {
        if ('IntersectionObserver' in window) {
            this.lazyLoadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.dataset.src;
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                            this.lazyLoadObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px'
            });
        }
    }

    /**
     * 观察图片
     */
    observeImage(img) {
        if (this.lazyLoadObserver) {
            this.lazyLoadObserver.observe(img);
        } else {
            // 降级处理
            const src = img.dataset.src;
            if (src) {
                img.src = src;
            }
        }
    }

    // ==================== 骨架屏 ====================

    /**
     * 显示骨架屏
     */
    showSkeleton() {
        const container = document.querySelector('.products-slider') || document.querySelector('.products-grid');
        if (!container) return;

        container.innerHTML = `
            <div class="skeleton-grid">
                ${Array(6).fill(0).map(() => `
                    <div class="skeleton-card">
                        <div class="skeleton-image"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-line"></div>
                            <div class="skeleton-line short"></div>
                            <div class="skeleton-line"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * 隐藏骨架屏
     */
    hideSkeleton() {
        const skeleton = document.querySelector('.skeleton-grid');
        if (skeleton) {
            skeleton.remove();
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 页面加载完成');
    
    // 创建产品中心实例
    window.productCenter = new ProductCenter();
    
    // 初始化
    window.productCenter.init();
    
    // 绑定搜索框
    const searchInput = document.querySelector('#product-search');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                window.productCenter.searchProducts(e.target.value);
            }, 300); // 防抖
        });
    }
    
    // 绑定排序选择
    const sortSelect = document.querySelector('#product-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            window.productCenter.sortProducts(e.target.value);
        });
    }
    
    // 绑定价格筛选
    const priceFilter = document.querySelector('#price-filter-btn');
    if (priceFilter) {
        priceFilter.addEventListener('click', () => {
            const min = document.querySelector('#price-min')?.value || 0;
            const max = document.querySelector('#price-max')?.value || Infinity;
            window.productCenter.filterByPrice(min, max);
        });
    }
});

// 导出（用于调试）
window.ProductCenter = ProductCenter;
