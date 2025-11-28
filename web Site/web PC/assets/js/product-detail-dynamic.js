/**
 * 产品详情页动态加载脚本
 * 从后端API加载产品详情并应用配置
 */

class ProductDetail {
    constructor() {
        this.productId = null;
        this.product = null;
        this.config = null;
    }

    /**
     * 初始化
     */
    async init() {
        console.log('🚀 产品详情页初始化...');
        
        try {
            // 从URL获取产品ID
            this.productId = this.getProductIdFromURL();
            
            if (!this.productId) {
                throw new Error('未找到产品ID');
            }
            
            console.log('📦 产品ID:', this.productId);
            
            // 显示加载状态
            this.showLoader();
            
            // 并行加载产品详情和配置
            await Promise.all([
                this.loadProductDetail(),
                this.loadProductConfig()
            ]);
            
            // 应用产品数据
            this.applyProductData();
            
            // 应用配置
            if (this.config) {
                this.applyConfig();
            }
            
            // 隐藏加载状态
            this.hideLoader();
            
            console.log('✅ 产品详情页加载完成');
        } catch (error) {
            console.error('❌ 产品详情页加载失败:', error);
            this.showError(error.message);
            this.hideLoader();
        }
    }

    /**
     * 从URL获取产品ID
     */
    getProductIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    /**
     * 加载产品详情
     */
    async loadProductDetail() {
        try {
            const response = await window.API.Product.getDetail(this.productId);
            
            if (response.code === 200) {
                this.product = response.data;
                console.log('✅ 产品详情加载成功:', this.product);
            } else {
                throw new Error(response.message || '加载产品详情失败');
            }
        } catch (error) {
            console.error('加载产品详情失败:', error);
            throw error;
        }
    }

    /**
     * 加载产品配置
     */
    async loadProductConfig() {
        try {
            const response = await window.API.Product.getConfig(this.productId);
            
            if (response.code === 200 && response.data) {
                this.config = response.data.config ? JSON.parse(response.data.config) : null;
                console.log('✅ 产品配置加载成功');
            } else {
                console.log('⚠️ 未找到产品配置，使用默认配置');
                this.config = null;
            }
        } catch (error) {
            console.warn('加载产品配置失败，使用默认配置:', error);
            this.config = null;
        }
    }

    /**
     * 应用产品数据
     */
    applyProductData() {
        if (!this.product) return;

        // 更新页面标题
        document.title = `${this.product.name} - 产品详情`;

        // 更新面包屑
        this.updateBreadcrumb();

        // 更新产品基本信息
        this.updateBasicInfo();

        // 更新产品图片
        this.updateProductImages();

        // 更新产品特性
        this.updateProductFeatures();

        // 更新产品价格
        this.updateProductPrice();
    }

    /**
     * 更新面包屑
     */
    updateBreadcrumb() {
        const breadcrumb = document.querySelector('.breadcrumb');
        if (!breadcrumb) return;

        const categoryName = this.product.category?.name || '产品中心';
        const productName = this.product.name;

        breadcrumb.innerHTML = `
            <li class="breadcrumb-item"><a href="../index.html">首页</a></li>
            <li class="breadcrumb-item"><a href="products.html">产品中心</a></li>
            <li class="breadcrumb-item"><a href="products.html">${categoryName}</a></li>
            <li class="breadcrumb-item active" aria-current="page">${productName}</li>
        `;
    }

    /**
     * 更新基本信息
     */
    updateBasicInfo() {
        // 更新产品名称
        const titleElements = document.querySelectorAll('.product-title, h1.product-name');
        titleElements.forEach(el => {
            el.textContent = this.product.name;
        });

        // 更新产品型号
        const modelElements = document.querySelectorAll('.product-model');
        modelElements.forEach(el => {
            el.textContent = this.product.model || '';
        });

        // 更新产品描述
        const descElements = document.querySelectorAll('.product-description');
        descElements.forEach(el => {
            el.textContent = this.product.shortDesc || this.product.description || '';
        });
    }

    /**
     * 更新产品图片
     */
    updateProductImages() {
        if (!this.product.cardImage) return;

        // 更新主图
        const mainImages = document.querySelectorAll('.product-main-image, .product-image img');
        mainImages.forEach(img => {
            img.src = this.product.cardImage;
            img.alt = this.product.name;
        });
    }

    /**
     * 更新产品特性
     */
    updateProductFeatures() {
        if (!this.product.features || !Array.isArray(this.product.features)) return;

        const featuresContainer = document.querySelector('.product-features-list, .features-list');
        if (!featuresContainer) return;

        featuresContainer.innerHTML = this.product.features.map(feature => `
            <li class="feature-item">
                <i class="${feature.icon || 'fas fa-check'}"></i>
                <span>${feature.text}</span>
            </li>
        `).join('');
    }

    /**
     * 更新产品价格
     */
    updateProductPrice() {
        const priceElements = document.querySelectorAll('.product-price, .price-value');
        const price = this.product.price ? `¥${parseFloat(this.product.price).toFixed(2)}` : '价格面议';
        
        priceElements.forEach(el => {
            el.textContent = price;
        });
    }

    /**
     * 应用配置
     */
    applyConfig() {
        if (!this.config) return;

        console.log('🎨 应用产品配置...');

        // 应用文本配置
        if (this.config.texts) {
            Object.entries(this.config.texts).forEach(([selector, text]) => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    el.textContent = text;
                });
            });
        }

        // 应用图片配置
        if (this.config.images) {
            Object.entries(this.config.images).forEach(([selector, src]) => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (el.tagName === 'IMG') {
                        el.src = src;
                    } else {
                        el.style.backgroundImage = `url(${src})`;
                    }
                });
            });
        }

        // 应用样式配置
        if (this.config.styles) {
            Object.entries(this.config.styles).forEach(([selector, styles]) => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    Object.assign(el.style, styles);
                });
            });
        }

        console.log('✅ 配置应用完成');
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
        
        // 显示错误提示
        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = `
                <div class="error-container" style="text-align: center; padding: 100px 20px;">
                    <i class="bi bi-exclamation-triangle" style="font-size: 64px; color: #f56c6c;"></i>
                    <h2 style="margin-top: 20px;">加载失败</h2>
                    <p style="color: #666; margin-top: 10px;">${message}</p>
                    <a href="products.html" class="btn btn-primary" style="margin-top: 20px;">返回产品中心</a>
                </div>
            `;
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 产品详情页加载完成');
    
    // 创建产品详情实例
    window.productDetail = new ProductDetail();
    
    // 初始化
    window.productDetail.init();
});

// 导出（用于调试）
window.ProductDetail = ProductDetail;
