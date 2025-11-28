/**
 * API配置文件
 * 配置后端API地址和请求方法
 */

// API基础配置
const API_CONFIG = {
    baseURL: 'http://localhost:3001/api',
    timeout: 10000
};

// HTTP请求工具
class HttpClient {
    constructor(config) {
        this.baseURL = config.baseURL;
        this.timeout = config.timeout;
    }

    /**
     * 发送请求
     */
    async request(url, options = {}) {
        const {
            method = 'GET',
            params = {},
            data = null,
            headers = {}
        } = options;

        // 构建完整URL
        let fullURL = `${this.baseURL}${url}`;

        // 添加查询参数
        if (method === 'GET' && Object.keys(params).length > 0) {
            const queryString = Object.entries(params)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
            fullURL += `?${queryString}`;
        }

        // 请求配置
        const fetchOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        // 添加请求体
        if (data && method !== 'GET') {
            fetchOptions.body = JSON.stringify(data);
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(fullURL, {
                ...fetchOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            return {
                code: 200,
                data: result.data || result,
                message: result.message || 'success'
            };
        } catch (error) {
            console.error('请求失败:', error);
            return {
                code: 500,
                data: null,
                message: error.message || '请求失败'
            };
        }
    }

    get(url, params = {}) {
        return this.request(url, { method: 'GET', params });
    }

    post(url, data = {}) {
        return this.request(url, { method: 'POST', data });
    }

    put(url, data = {}) {
        return this.request(url, { method: 'PUT', data });
    }

    delete(url) {
        return this.request(url, { method: 'DELETE' });
    }
}

// 创建HTTP客户端实例
const http = new HttpClient(API_CONFIG);

// API接口定义
window.API = {
    // 产品相关接口
    Product: {
        /**
         * 获取产品列表
         * @param {Object} params - 查询参数
         * @returns {Promise}
         */
        getList(params = {}) {
            return http.get('/products', params);
        },

        /**
         * 获取产品详情
         * @param {string|number} id - 产品ID
         * @returns {Promise}
         */
        getDetail(id) {
            return http.get(`/products/${id}`);
        },

        /**
         * 获取产品配置
         * @param {string|number} id - 产品ID
         * @returns {Promise}
         */
        getConfig(id) {
            return http.get(`/products/${id}/config`);
        },

        /**
         * 获取产品统计
         * @returns {Promise}
         */
        getStats() {
            return http.get('/products/stats');
        }
    },

    // 分类相关接口
    Category: {
        /**
         * 获取分类列表
         * @param {Object} params - 查询参数
         * @returns {Promise}
         */
        getList(params = {}) {
            return http.get('/product-categories', params);
        },

        /**
         * 获取分类详情
         * @param {string|number} id - 分类ID
         * @returns {Promise}
         */
        getDetail(id) {
            return http.get(`/product-categories/${id}`);
        }
    },

    // 订单相关接口
    Order: {
        /**
         * 创建订单
         * @param {Object} data - 订单数据
         * @returns {Promise}
         */
        create(data) {
            return http.post('/orders', data);
        },

        /**
         * 获取订单详情
         * @param {string|number} id - 订单ID
         * @returns {Promise}
         */
        getDetail(id) {
            return http.get(`/orders/${id}`);
        },

        /**
         * 根据订单号查询
         * @param {string} orderNumber - 订单号
         * @returns {Promise}
         */
        getByNumber(orderNumber) {
            return http.get(`/orders/number/${orderNumber}`);
        }
    }
};

// 导出配置（用于调试）
window.API_CONFIG = API_CONFIG;

console.log('✅ API配置已加载');
console.log('📡 API地址:', API_CONFIG.baseURL);
