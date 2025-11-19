/**
 * 产品详情页加载器
 * 从URL参数获取产品ID，加载产品详情并渲染
 */

class ProductDetailLoader {
    constructor() {
        this.productId = null;
        this.product = null;
    }

    /**
     * 初始化
     */
    async init() {
        // 从URL获取产品ID
        const urlParams = new URLSearchParams(window.location.search);
        this.productId = urlParams.get('id');

        if (!this.productId) {
            this.showError('未指定产品ID');
            return;
        }

        // 加载产品详情
        await this.loadProduct();
    }

    /**
     * 加载产品详情
     */
    async loadProduct() {
        try {
            window.API.showLoading('加载产品详情中...');
            
            const response = await window.API.Product.getById(this.productId);
            
            if (response.code === 200) {
                this.product = response.data;
                await this.renderProduct();
            } else {
                throw new Error(response.msg || '加载失败');
            }
        } catch (error) {
            console.error('加载产品详情失败:', error);
            this.showError('加载产品详情失败');
        } finally {
            window.API.hideLoading();
        }
    }

    /**
     * 渲染产品详情
     */
    async renderProduct() {
        // 更新页面标题
        document.title = `${this.product.name} - 产品详情`;

        // 如果产品有详情页文件路径，加载该HTML文件
        if (this.product.filePath) {
            await this.loadProductDetailPage();
        } else {
            // 否则使用默认模板渲染
            this.renderDefaultTemplate();
        }

        // 更新面包屑
        this.updateBreadcrumb();
    }

    /**
     * 加载产品详情页HTML文件
     */
    async loadProductDetailPage() {
        try {
            // 产品详情页路径格式: /products/RD-001/产品详情.html
            const detailPageUrl = this.product.filePath;
            
            // 获取详情页容器
            const container = document.getElementById('product-detail-container');
            if (!container) {
                console.warn('未找到产品详情容器');
                return;
            }

            // 加载HTML内容
            const response = await fetch(detailPageUrl);
            if (response.ok) {
                const html = await response.text();
                
                // 创建临时DOM解析HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // 提取主要内容（通常在body中）
                const content = doc.body.innerHTML;
                container.innerHTML = content;

                // 执行页面中的脚本
                this.executeScripts(doc);
            } else {
                console.warn('详情页加载失败，使用默认模板');
                this.renderDefaultTemplate();
            }
        } catch (error) {
            console.error('加载详情页失败:', error);
            this.renderDefaultTemplate();
        }
    }

    /**
     * 执行HTML中的脚本
     */
    executeScripts(doc) {
        const scripts = doc.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.src) {
                // 外部脚本
                const newScript = document.createElement('script');
                newScript.src = script.src;
                document.body.appendChild(newScript);
            } else {
                // 内联脚本
                try {
                    eval(script.textContent);
                } catch (error) {
                    console.error('脚本执行失败:', error);
                }
            }
        });
    }

    /**
     * 渲染默认模板
     */
    renderDefaultTemplate() {
        const container = document.getElementById('product-detail-container');
        if (!container) return;

        const imageUrl = this.product.cardImage || '/assets/images/placeholder.jpg';
        const price = this.product.price ? `¥${parseFloat(this.product.price).toFixed(2)}` : '价格面议';
        
        const html = `
            <div class="row">
                <div class="col-lg-6">
                    <div class="product-image-gallery">
                        <img src="${imageUrl}" alt="${this.product.name}" class="img-fluid rounded">
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="product-detail-info">
                        <h1 class="product-title">${this.product.name}</h1>
                        ${this.product.model ? `<p class="product-model">型号: ${this.product.model}</p>` : ''}
                        <div class="product-price-box">
                            <span class="price">${price}</span>
                            ${this.product.sales ? `<span class="sales">已售 ${this.product.sales} 件</span>` : ''}
                        </div>
                        ${this.product.shortDesc ? `<div class="product-description"><p>${this.product.shortDesc}</p></div>` : ''}
                        
                        ${this.renderFeatures()}
                        
                        <div class="product-actions mt-4">
                            <a href="contact.html" class="btn btn-primary btn-lg me-2">
                                <i class="bi bi-chat-dots me-2"></i>立即咨询
                            </a>
                            <a href="products.html" class="btn btn-outline-secondary btn-lg">
                                <i class="bi bi-arrow-left me-2"></i>返回列表
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-5">
                <div class="col-12">
                    <div class="product-tabs">
                        <ul class="nav nav-tabs" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link active" data-bs-toggle="tab" href="#details">产品详情</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" data-bs-toggle="tab" href="#specs">规格参数</a>
                            </li>
                        </ul>
                        <div class="tab-content p-4">
                            <div id="details" class="tab-pane fade show active">
                                <p>产品详细信息加载中...</p>
                            </div>
                            <div id="specs" class="tab-pane fade">
                                <p>规格参数信息加载中...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * 渲染产品特性
     */
    renderFeatures() {
        if (!this.product.features || !Array.isArray(this.product.features)) {
            return '';
        }

        const featuresHTML = this.product.features.map(feature => `
            <div class="feature-item">
                <i class="${feature.icon || 'bi bi-check-circle'}"></i>
                <span>${feature.text}</span>
            </div>
        `).join('');

        return `
            <div class="product-features mt-4">
                <h5>产品特性</h5>
                <div class="features-list">
                    ${featuresHTML}
                </div>
            </div>
        `;
    }

    /**
     * 更新面包屑导航
     */
    updateBreadcrumb() {
        const breadcrumb = document.querySelector('.breadcrumb');
        if (breadcrumb && this.product) {
            const productItem = breadcrumb.querySelector('.breadcrumb-item:last-child');
            if (productItem) {
                productItem.textContent = this.product.name;
            }
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const container = document.getElementById('product-detail-container');
        if (container) {
            container.innerHTML = `
                <div class="error-state text-center py-5">
                    <i class="bi bi-exclamation-triangle" style="font-size: 4rem; color: #dc3545;"></i>
                    <h3 class="mt-3">${message}</h3>
                    <p class="text-muted">请检查产品ID是否正确</p>
                    <a href="products.html" class="btn btn-primary mt-3">
                        <i class="bi bi-arrow-left me-2"></i>返回产品列表
                    </a>
                </div>
            `;
        }
    }
}

// 创建全局实例
window.productDetailLoader = new ProductDetailLoader();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('product-detail-container')) {
        window.productDetailLoader.init();
    }
});
