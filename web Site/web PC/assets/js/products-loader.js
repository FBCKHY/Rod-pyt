/**
 * 产品动态加载器
 * 用于从后端API加载产品数据并渲染到页面
 */

class ProductsLoader {
    constructor() {
        this.products = [];
        this.categories = [];
        this.currentPage = 1;
        this.pageSize = 12;
        this.totalPages = 1;
    }

    /**
     * 初始化 - 加载分类和产品
     */
    async init() {
        try {
            // 并行加载分类和产品
            await Promise.all([
                this.loadCategories(),
                this.loadProducts()
            ]);
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('加载数据失败，请刷新页面重试');
        }
    }

    /**
     * 加载产品分类
     */
    async loadCategories() {
        try {
            const response = await window.API.Category.getList();
            if (response.code === 200) {
                this.categories = response.data || [];
                this.renderCategories();
            }
        } catch (error) {
            console.error('加载分类失败:', error);
        }
    }

    /**
     * 加载产品列表
     */
    async loadProducts(params = {}) {
        try {
            const queryParams = {
                page: this.currentPage,
                limit: this.pageSize,
                status: 'active',
                ...params
            };

            const response = await window.API.Product.getList(queryParams);
            
            if (response.code === 200) {
                this.products = response.data.list || [];
                this.totalPages = response.data.pagination?.pages || 1;
                this.renderProducts();
                this.renderPagination();
            }
        } catch (error) {
            console.error('加载产品失败:', error);
            this.showError('加载产品失败');
        }
    }

    /**
     * 渲染分类列表
     */
    renderCategories() {
        const container = document.getElementById('categories-container');
        if (!container) return;

        const html = `
            <button class="category-btn active" data-category="all">
                全部产品
            </button>
            ${this.categories.map(cat => `
                <button class="category-btn" data-category="${cat.id}">
                    ${cat.name}
                </button>
            `).join('')}
        `;

        container.innerHTML = html;

        // 绑定分类点击事件
        container.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleCategoryClick(e.target);
            });
        });
    }

    /**
     * 渲染产品列表
     */
    renderProducts() {
        const container = document.getElementById('products-container');
        if (!container) return;

        if (this.products.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="bi bi-inbox"></i>
                        <h3>暂无产品</h3>
                        <p>该分类下暂时没有产品</p>
                    </div>
                </div>
            `;
            return;
        }

        const html = this.products.map(product => this.createProductCard(product)).join('');
        container.innerHTML = html;

        // 添加动画效果
        this.animateProducts();
    }

    /**
     * 创建产品卡片HTML
     */
    createProductCard(product) {
        const imageUrl = product.cardImage || '/assets/images/placeholder.jpg';
        const price = product.price ? `¥${parseFloat(product.price).toFixed(2)}` : '价格面议';
        const tag = product.tag ? `<span class="product-tag">${product.tag}</span>` : '';
        
        return `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="product-card" data-aos="fade-up">
                    ${tag}
                    <div class="product-image">
                        <img src="${imageUrl}" alt="${product.name}" onerror="this.src='/assets/images/placeholder.jpg'">
                        <div class="product-overlay">
                            <a href="product-detail.html?id=${product.id}" class="btn btn-primary">
                                查看详情
                            </a>
                        </div>
                    </div>
                    <div class="product-info">
                        <h5 class="product-name">${product.name}</h5>
                        ${product.model ? `<p class="product-model">型号: ${product.model}</p>` : ''}
                        ${product.shortDesc ? `<p class="product-desc">${product.shortDesc}</p>` : ''}
                        <div class="product-footer">
                            <span class="product-price">${price}</span>
                            ${product.sales ? `<span class="product-sales">销量: ${product.sales}</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染分页
     */
    renderPagination() {
        const container = document.getElementById('pagination-container');
        if (!container || this.totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        let html = '<nav><ul class="pagination justify-content-center">';

        // 上一页
        html += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.currentPage - 1}">上一页</a>
            </li>
        `;

        // 页码
        for (let i = 1; i <= this.totalPages; i++) {
            if (
                i === 1 ||
                i === this.totalPages ||
                (i >= this.currentPage - 2 && i <= this.currentPage + 2)
            ) {
                html += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // 下一页
        html += `
            <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.currentPage + 1}">下一页</a>
            </li>
        `;

        html += '</ul></nav>';
        container.innerHTML = html;

        // 绑定分页点击事件
        container.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    this.loadProducts();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }

    /**
     * 处理分类点击
     */
    handleCategoryClick(btn) {
        // 更新激活状态
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 重置页码并加载产品
        this.currentPage = 1;
        const categoryId = btn.dataset.category;
        
        if (categoryId === 'all') {
            this.loadProducts();
        } else {
            this.loadProducts({ categoryId });
        }
    }

    /**
     * 添加产品动画
     */
    animateProducts() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    card.style.transition = 'all 0.3s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            }, index * 50);
        });
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const container = document.getElementById('products-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="error-state">
                        <i class="bi bi-exclamation-triangle"></i>
                        <h3>加载失败</h3>
                        <p>${message}</p>
                        <button class="btn btn-primary" onclick="location.reload()">
                            重新加载
                        </button>
                    </div>
                </div>
            `;
        }
    }

    /**
     * 显示加载骨架屏
     */
    showSkeleton() {
        const container = document.getElementById('products-container');
        if (!container) return;

        const skeletonHTML = Array(8).fill(0).map(() => `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="product-skeleton">
                    <div class="skeleton-image"></div>
                    <div class="p-3">
                        <div class="skeleton-text"></div>
                        <div class="skeleton-text short"></div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = skeletonHTML;
    }
}

// 创建全局实例
window.productsLoader = new ProductsLoader();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('products-container')) {
        window.productsLoader.init();
    }
});
