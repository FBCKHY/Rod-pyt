/**
 * API 工具函数
 * 用于前端与后端API通信
 */

// API基础配置
const API_CONFIG = {
    baseURL: 'http://localhost:3001/api',
    timeout: 10000
};

/**
 * 通用请求函数
 */
async function request(url, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const config = { ...defaultOptions, ...options };
    
    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    config.signal = controller.signal;

    try {
        const response = await fetch(`${API_CONFIG.baseURL}${url}`, config);
        clearTimeout(timeoutId);
        
        const data = await response.json();
        
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.msg || '请求失败');
        }
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('请求超时，请稍后重试');
        }
        throw error;
    }
}

/**
 * 产品相关API
 */
const ProductAPI = {
    /**
     * 获取产品列表
     * @param {Object} params - 查询参数
     * @param {number} params.page - 页码
     * @param {number} params.limit - 每页数量
     * @param {number} params.categoryId - 分类ID
     * @param {string} params.status - 状态
     * @param {string} params.promoPosition - 推广位置
     * @param {string} params.search - 搜索关键词
     */
    getList(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return request(`/products?${queryString}`);
    },

    /**
     * 获取产品详情
     * @param {number} id - 产品ID
     */
    getById(id) {
        return request(`/products/${id}`);
    },

    /**
     * 获取产品统计信息
     */
    getStats() {
        return request('/products/stats');
    }
};

/**
 * 产品分类相关API
 */
const CategoryAPI = {
    /**
     * 获取分类列表
     */
    getList() {
        return request('/product-categories');
    },

    /**
     * 获取分类详情
     * @param {number} id - 分类ID
     */
    getById(id) {
        return request(`/product-categories/${id}`);
    }
};

/**
 * 订阅相关API
 */
const SubscriptionAPI = {
    /**
     * 提交订阅
     * @param {Object} data - 订阅数据
     * @param {string} data.contactType - 联系方式类型 (email/wechat/phone)
     * @param {string} data.contactValue - 联系方式值
     * @param {string} data.source - 订阅来源
     */
    create(data) {
        return request('/subscriptions', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
};

/**
 * 显示加载提示
 */
function showLoading(message = '加载中...') {
    const loadingEl = document.createElement('div');
    loadingEl.id = 'api-loading';
    loadingEl.className = 'api-loading';
    loadingEl.innerHTML = `
        <div class="loading-content">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">${message}</p>
        </div>
    `;
    document.body.appendChild(loadingEl);
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
    const loadingEl = document.getElementById('api-loading');
    if (loadingEl) {
        loadingEl.remove();
    }
}

/**
 * 显示错误提示
 */
function showError(message, duration = 3000) {
    const errorEl = document.createElement('div');
    errorEl.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    errorEl.style.zIndex = '9999';
    errorEl.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(errorEl);

    setTimeout(() => {
        errorEl.remove();
    }, duration);
}

/**
 * 显示成功提示
 */
function showSuccess(message, duration = 3000) {
    const successEl = document.createElement('div');
    successEl.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    successEl.style.zIndex = '9999';
    successEl.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(successEl);

    setTimeout(() => {
        successEl.remove();
    }, duration);
}

// 导出API对象
window.API = {
    Product: ProductAPI,
    Category: CategoryAPI,
    Subscription: SubscriptionAPI,
    showLoading,
    hideLoading,
    showError,
    showSuccess
};
