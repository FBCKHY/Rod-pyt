/**
 * 产品目录页面动态加载脚本
 * 支持筛选、排序、搜索等功能
 */

class ProductCatalog {
    constructor() {
        this.products = [];
        this.categories = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.pageSize = 12;
        this.totalProducts = 0;
        
        // 筛选条件
        this.filters = {
            category: null,
            priceRange: null,
            search: '',
            sort: 'default'
        };
        
        // 视图模式
        this.viewMode = 'grid'; // grid 或 list
    }

    /**
     * 初始化
     */
    async init() {
        console.log('🚀 产品目录初始化...');
        
        try {
            // 显示加载状态
            this.showLoader();
            
            // 加载数据
            await Promise.all([
                this.loadCategories(),
                this.loadProducts()
            ]);
            
            // 渲染页面
            this.renderCategories();
            this.renderProducts();
            this.updateProductCount();
            
            // 绑定事件
            this.bindEvents();
            
            // 隐藏加载状态
            this.hideLoader();
            
            console.log('✅ 产品目录加载完成');
        } catch (error) {
            console.error('❌ 产品目录加载失败:', error);
            this.showError('加载失败，请刷新页面重试');
            this.hideLoader();
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
            }
        } catch (error) {
            console.error('加载分类失败:', error);
            this.categories = [];
        }
    }

    /**
     * 加载产品数据
     */
    async loadProducts() {
        try {
            const params = {
                page: 1,
                limit: 100, // 加载所有产品，前端筛选
                status: 'active'
            };

            const response = await window.API.Product.getList(params);
            
            if (response.code === 200) {
                const data = response.data;
                this.products = data.items || data.data || [];
                this.filteredProducts = [...this.products];
                this.totalProducts = this.products.length;
                console.log('✅ 产品加载成功:', this.products.length, '个产品');
            }
        } catch (error) {
            console.error('加载产品失败:', error);
            this.products = [];
            this.filteredProducts = [];
        }
    }

    /**
     * 渲染分类筛选
     */
    renderCategories() {
        const container = document.querySelector('.filter-category-list');
        if (!container) {
            console.warn('未找到分类容器 .filter-category-list');
            return;
        }

        if (this.categories.length === 0) {
            console.warn('没有分类数据');
            return;
        }

        // 清空现有内容
        container.innerHTML = '';

        // 渲染分类树（支持父分类和子分类）
        this.categories.forEach(category => {
            this.renderCategoryItem(container, category, 0);
        });
        
        console.log('✅ 分类渲染完成，共', this.categories.length, '个父分类');
    }

    /**
     * 递归渲染分类项（支持树形结构）
     * @param {HTMLElement} container - 容器元素
     * @param {Object} category - 分类数据
     * @param {number} level - 层级（0=父分类，1=子分类）
     */
    renderCategoryItem(container, category, level = 0) {
        // 计算该分类下的产品数量
        const count = this.getCategoryProductCount(category);
        
        // 如果是父分类，即使没有产品也显示（可能有子分类有产品）
        // 如果是子分类，没有产品就不显示
        if (level > 0 && count === 0) return;

        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'filter-category';
        
        // 检查是否有子分类
        const hasChildren = category.children && category.children.length > 0;
        
        // 父分类的头部
        const headerDiv = document.createElement('div');
        headerDiv.className = 'category-header';
        headerDiv.dataset.categoryId = category.id;
        
        // 如果有子分类，添加展开/收起按钮
        let toggleBtn = null;
        if (hasChildren) {
            console.log('✅ 为分类添加展开按钮:', category.name, '子分类数量:', category.children.length);
            toggleBtn = document.createElement('span');
            toggleBtn.className = 'category-toggle';
            toggleBtn.innerHTML = '▼'; // 下箭头
            toggleBtn.dataset.expanded = 'true'; // 默认展开
            
            headerDiv.appendChild(toggleBtn);
        }
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `cat-${category.id}`;
        checkbox.dataset.category = category.id;
        
        const label = document.createElement('label');
        label.htmlFor = `cat-${category.id}`;
        label.textContent = category.name;
        
        const countSpan = document.createElement('span');
        countSpan.className = 'category-count';
        countSpan.textContent = count;
        
        headerDiv.appendChild(checkbox);
        headerDiv.appendChild(label);
        headerDiv.appendChild(countSpan);
        categoryDiv.appendChild(headerDiv);

        // 如果有子分类，渲染子分类
        if (hasChildren) {
            const childrenDiv = document.createElement('div');
            childrenDiv.className = 'category-children';
            
            category.children.forEach(child => {
                const childCount = this.getCategoryProductCount(child);
                if (childCount === 0) return; // 跳过没有产品的子分类
                
                const subDiv = document.createElement('div');
                subDiv.className = 'filter-subcategory';
                subDiv.dataset.categoryId = child.id;
                
                const subCheckbox = document.createElement('input');
                subCheckbox.type = 'checkbox';
                subCheckbox.id = `subcat-${child.id}`;
                subCheckbox.dataset.subcategory = child.id;
                
                const subLabel = document.createElement('label');
                subLabel.htmlFor = `subcat-${child.id}`;
                subLabel.textContent = child.name;
                
                const subCountSpan = document.createElement('span');
                subCountSpan.className = 'subcategory-count';
                subCountSpan.textContent = childCount;
                
                subDiv.appendChild(subCheckbox);
                subDiv.appendChild(subLabel);
                subDiv.appendChild(subCountSpan);
                childrenDiv.appendChild(subDiv);
            });
            
            if (childrenDiv.children.length > 0) {
                categoryDiv.appendChild(childrenDiv);
                
                // 在子分类渲染后绑定展开按钮事件
                if (toggleBtn) {
                    toggleBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const isExpanded = toggleBtn.dataset.expanded === 'true';
                        
                        if (isExpanded) {
                            // 收起
                            toggleBtn.innerHTML = '▶'; // 右箭头
                            toggleBtn.dataset.expanded = 'false';
                            childrenDiv.style.display = 'none';
                        } else {
                            // 展开
                            toggleBtn.innerHTML = '▼'; // 下箭头
                            toggleBtn.dataset.expanded = 'true';
                            childrenDiv.style.display = 'block';
                        }
                    });
                }
            }
        }
        
        container.appendChild(categoryDiv);
    }

    /**
     * 计算分类下的产品数量（包括子分类）
     * @param {Object} category - 分类数据
     * @returns {number} 产品数量
     */
    getCategoryProductCount(category) {
        // 当前分类的产品数量
        let count = this.products.filter(p => p.categoryId === category.id).length;
        
        // 加上子分类的产品数量
        if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
                count += this.getCategoryProductCount(child);
            });
        }
        
        return count;
    }

    /**
     * 渲染产品列表
     */
    renderProducts() {
        const container = document.getElementById('products-grid');
        if (!container) return;

        // 应用筛选和排序
        this.applyFilters();
        this.applySort();

        // 如果没有产品
        if (this.filteredProducts.length === 0) {
            container.innerHTML = `
                <div class="no-products">
                    <i class="bi bi-inbox" style="font-size: 64px; color: #ccc;"></i>
                    <p style="margin-top: 20px; color: #666;">没有找到符合条件的产品</p>
                    <button class="btn btn-primary" onclick="window.productCatalog.clearFilters()">
                        清除筛选条件
                    </button>
                </div>
            `;
            return;
        }

        // 清空容器
        container.innerHTML = '';

        // 分页
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const pageProducts = this.filteredProducts.slice(startIndex, endIndex);

        // 渲染产品卡片
        pageProducts.forEach((product, index) => {
            const card = this.createProductCard(product, index);
            container.appendChild(card);
        });

        // 更新分页
        this.renderPagination();
    }

    /**
     * 创建产品卡片
     */
    createProductCard(product, index) {
        const link = document.createElement('a');
        link.href = `./product-detail.html?id=${product.id}`;
        link.className = 'product-card-link fade-in';
        link.style.setProperty('--card-index', index);

        const badge = product.tag ? `<div class="product-badge">${product.tag}</div>` : '';
        const imageUrl = product.cardImage || '../assets/images/product center/default-product.png';
        const price = product.price ? `¥${parseFloat(product.price).toFixed(2)}` : '价格面议';

        // 产品特性
        let featuresHTML = '';
        if (product.features && Array.isArray(product.features)) {
            featuresHTML = product.features.slice(0, 3).map(feature => `
                <li><i class="${feature.icon || 'fas fa-check'}"></i> ${feature.text}</li>
            `).join('');
        }

        link.innerHTML = `
            <div class="product-card">
                ${badge}
                <div class="product-image">
                    <img src="${imageUrl}" alt="${product.name}" 
                         onerror="this.src='../assets/images/product center/default-product.png'">
                    <div class="product-overlay">
                        <div class="overlay-actions">
                            <button class="action-btn" title="查看详情">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="action-btn" title="收藏" onclick="event.preventDefault(); alert('收藏功能开发中');">
                                <i class="bi bi-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category?.name || '未分类'}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-model">${product.model || ''}</p>
                    <ul class="product-features">
                        ${featuresHTML || '<li><i class="fas fa-check"></i> 优质产品</li>'}
                    </ul>
                    <div class="product-footer">
                        <div class="product-price">${price}</div>
                        <div class="product-sales">已售 ${product.sales || 0}</div>
                    </div>
                </div>
            </div>
        `;

        return link;
    }

    /**
     * 应用筛选
     */
    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            // 分类筛选
            if (this.filters.category && product.categoryId !== this.filters.category) {
                return false;
            }

            // 价格筛选
            if (this.filters.priceRange) {
                const price = parseFloat(product.price) || 0;
                const [min, max] = this.filters.priceRange;
                if (price < min || (max && price > max)) {
                    return false;
                }
            }

            // 搜索筛选
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                const nameMatch = product.name.toLowerCase().includes(searchLower);
                const modelMatch = product.model?.toLowerCase().includes(searchLower);
                if (!nameMatch && !modelMatch) {
                    return false;
                }
            }

            return true;
        });

        this.totalProducts = this.filteredProducts.length;
    }

    /**
     * 应用排序
     */
    applySort() {
        switch (this.filters.sort) {
            case 'sales':
                this.filteredProducts.sort((a, b) => (b.sales || 0) - (a.sales || 0));
                break;
            case 'price':
                this.filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'newest':
                this.filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            default:
                // 默认排序（综合）
                break;
        }
    }

    /**
     * 渲染分页
     */
    renderPagination() {
        const container = document.querySelector('.pagination-container');
        if (!container) return;

        const totalPages = Math.ceil(this.totalProducts / this.pageSize);
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '<div class="pagination">';
        
        // 上一页
        if (this.currentPage > 1) {
            html += `<button class="page-btn" onclick="window.productCatalog.goToPage(${this.currentPage - 1})">上一页</button>`;
        }

        // 页码
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                const active = i === this.currentPage ? 'active' : '';
                html += `<button class="page-btn ${active}" onclick="window.productCatalog.goToPage(${i})">${i}</button>`;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<span class="page-ellipsis">...</span>';
            }
        }

        // 下一页
        if (this.currentPage < totalPages) {
            html += `<button class="page-btn" onclick="window.productCatalog.goToPage(${this.currentPage + 1})">下一页</button>`;
        }

        html += '</div>';
        container.innerHTML = html;
    }

    /**
     * 跳转到指定页
     */
    goToPage(page) {
        this.currentPage = page;
        this.renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * 更新产品数量显示
     */
    updateProductCount() {
        const countElement = document.querySelector('.products-count');
        if (countElement) {
            countElement.textContent = `共 ${this.totalProducts} 个产品`;
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 分类筛选
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                const categoryId = item.dataset.categoryId;
                this.filters.category = categoryId ? parseInt(categoryId) : null;
                this.currentPage = 1;
                this.renderProducts();
                this.updateProductCount();
            });
        });

        // 价格筛选
        document.querySelectorAll('.price-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.price-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                const range = item.dataset.range;
                if (range === 'all') {
                    this.filters.priceRange = null;
                } else {
                    const [min, max] = range.split('-').map(Number);
                    this.filters.priceRange = [min, max || Infinity];
                }
                
                this.currentPage = 1;
                this.renderProducts();
                this.updateProductCount();
            });
        });

        // 排序
        document.querySelectorAll('.sort-option').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.sort-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.filters.sort = btn.dataset.sort;
                this.renderProducts();
            });
        });

        // 视图切换
        document.querySelectorAll('.view-option').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const view = btn.dataset.view;
                const grid = document.getElementById('products-grid');
                if (grid) {
                    grid.className = `products-grid ${view}-view`;
                }
            });
        });

        // 搜索
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.currentPage = 1;
                this.renderProducts();
                this.updateProductCount();
            });
        }
    }

    /**
     * 清除筛选条件
     */
    clearFilters() {
        this.filters = {
            category: null,
            priceRange: null,
            search: '',
            sort: 'default'
        };
        this.currentPage = 1;
        
        // 重置UI
        document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
        document.querySelector('.category-item[data-category-id=""]')?.classList.add('active');
        document.querySelectorAll('.price-item').forEach(i => i.classList.remove('active'));
        document.querySelector('.price-item[data-range="all"]')?.classList.add('active');
        
        const searchInput = document.querySelector('.search-input');
        if (searchInput) searchInput.value = '';
        
        this.renderProducts();
        this.updateProductCount();
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
        const container = document.getElementById('products-grid');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <i class="bi bi-exclamation-triangle" style="font-size: 48px; color: #f56c6c;"></i>
                    <p style="margin-top: 20px;">${message}</p>
                </div>
            `;
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 产品目录页面加载完成');
    
    // 创建产品目录实例
    window.productCatalog = new ProductCatalog();
    
    // 初始化
    window.productCatalog.init();
});

// 导出（用于调试）
window.ProductCatalog = ProductCatalog;
