/**
 * 订购页面脚本
 * 处理订单提交和表单验证
 */

class OrderPage {
    constructor() {
        this.productId = null;
        this.product = null;
        this.form = document.getElementById('orderForm');
    }

    /**
     * 初始化
     */
    async init() {
        console.log('🛒 订购页面初始化...');
        
        try {
            // 从URL获取产品ID
            this.productId = this.getProductIdFromURL();
            
            if (!this.productId) {
                throw new Error('未指定产品');
            }
            
            // 加载产品信息
            await this.loadProduct();
            
            // 渲染产品预览
            this.renderProductPreview();
            
            // 初始化省市区选择器
            this.initRegionSelector();
            
            // 绑定事件
            this.bindEvents();
            
            console.log('✅ 订购页面初始化完成');
        } catch (error) {
            console.error('❌ 订购页面初始化失败:', error);
            alert(error.message || '页面加载失败，请返回重试');
            setTimeout(() => {
                window.history.back();
            }, 2000);
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
     * 加载产品信息
     */
    async loadProduct() {
        try {
            const response = await window.API.Product.getDetail(this.productId);
            
            if (response.code === 200) {
                this.product = response.data;
                console.log('✅ 产品信息加载成功:', this.product);
            } else {
                throw new Error(response.message || '加载产品信息失败');
            }
        } catch (error) {
            console.error('加载产品信息失败:', error);
            throw error;
        }
    }

    /**
     * 渲染产品预览
     */
    renderProductPreview() {
        const container = document.getElementById('productPreview');
        if (!container || !this.product) return;

        const imageUrl = this.product.cardImage || '../assets/images/product center/default-product.png';
        const price = this.product.price ? parseFloat(this.product.price).toFixed(2) : '0.00';

        container.innerHTML = `
            <img src="${imageUrl}" alt="${this.product.name}" class="product-image"
                 onerror="this.src='../assets/images/product center/default-product.png'">
            <div class="product-info">
                <div class="product-name">${this.product.name}</div>
                <div class="product-model">${this.product.model || ''}</div>
                <div class="product-price">¥${price}</div>
            </div>
        `;

        // 更新价格显示
        document.getElementById('productPrice').textContent = `¥${price}`;
        document.getElementById('totalPrice').textContent = `¥${price}`;
    }

    /**
     * 初始化省市区选择器
     */
    initRegionSelector() {
        const provinceSelect = document.getElementById('provinceSelect');
        const citySelect = document.getElementById('citySelect');
        const districtSelect = document.getElementById('districtSelect');

        if (!window.chinaRegions) {
            console.warn('⚠️ 省市区数据未加载');
            return;
        }

        // 加载省份
        const provinces = window.chinaRegions.provinces;
        provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province.name;
            option.textContent = province.name;
            option.dataset.code = province.code;
            provinceSelect.appendChild(option);
        });

        // 省份变化
        provinceSelect.addEventListener('change', (e) => {
            const provinceName = e.target.value;
            citySelect.innerHTML = '<option value="">请选择城市</option>';
            districtSelect.innerHTML = '<option value="">请先选择城市</option>';
            districtSelect.disabled = true;

            if (provinceName) {
                const province = provinces.find(p => p.name === provinceName);
                if (province && province.cities) {
                    province.cities.forEach(city => {
                        const option = document.createElement('option');
                        option.value = city.name;
                        option.textContent = city.name;
                        citySelect.appendChild(option);
                    });
                    citySelect.disabled = false;
                }
            } else {
                citySelect.disabled = true;
            }
        });

        // 城市变化
        citySelect.addEventListener('change', (e) => {
            const provinceName = provinceSelect.value;
            const cityName = e.target.value;
            districtSelect.innerHTML = '<option value="">请选择区县</option>';

            if (cityName && provinceName) {
                const province = provinces.find(p => p.name === provinceName);
                const city = province?.cities.find(c => c.name === cityName);
                
                if (city && city.districts) {
                    city.districts.forEach(district => {
                        const option = document.createElement('option');
                        option.value = district;
                        option.textContent = district;
                        districtSelect.appendChild(option);
                    });
                    districtSelect.disabled = false;
                }
            } else {
                districtSelect.disabled = true;
            }
        });
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 提交订单按钮
        const submitBtn = document.getElementById('submitOrderBtn');
        submitBtn.addEventListener('click', () => this.handleSubmit());

        // 表单验证
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
        });
    }

    /**
     * 验证单个字段
     */
    validateField(field) {
        if (field.hasAttribute('required') && !field.value.trim()) {
            field.classList.add('is-invalid');
            return false;
        }

        // 手机号验证
        if (field.name === 'customerPhone') {
            const phonePattern = /^1[3-9]\d{9}$/;
            if (!phonePattern.test(field.value)) {
                field.classList.add('is-invalid');
                return false;
            }
        }

        // 邮箱验证
        if (field.type === 'email' && field.value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(field.value)) {
                field.classList.add('is-invalid');
                return false;
            }
        }

        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        return true;
    }

    /**
     * 验证表单
     */
    validateForm() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        // 必填字段验证
        const requiredFields = [
            'customerName',
            'customerPhone',
            'province',
            'city',
            'district',
            'address'
        ];

        for (const field of requiredFields) {
            if (!data[field] || !data[field].trim()) {
                alert(`请填写${this.getFieldLabel(field)}`);
                return false;
            }
        }

        // 手机号验证
        const phonePattern = /^1[3-9]\d{9}$/;
        if (!phonePattern.test(data.customerPhone)) {
            alert('请输入正确的手机号码');
            return false;
        }

        // 邮箱验证（如果填写了）
        if (data.customerEmail) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(data.customerEmail)) {
                alert('请输入正确的邮箱地址');
                return false;
            }
        }

        // 协议验证
        const agreeCheckbox = document.getElementById('agreeCheckbox');
        if (!agreeCheckbox.checked) {
            alert('请阅读并同意用户协议和隐私政策');
            return false;
        }

        return true;
    }

    /**
     * 获取字段标签
     */
    getFieldLabel(fieldName) {
        const labels = {
            'customerName': '姓名',
            'customerPhone': '手机号码',
            'customerEmail': '电子邮箱',
            'province': '省份',
            'city': '城市',
            'district': '区县',
            'address': '详细地址',
            'postalCode': '邮政编码',
            'note': '备注信息'
        };
        return labels[fieldName] || fieldName;
    }

    /**
     * 处理订单提交
     */
    async handleSubmit() {
        console.log('📝 提交订单...');

        // 验证表单
        if (!this.validateForm()) {
            return;
        }

        // 显示加载状态
        const submitBtn = document.getElementById('submitOrderBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>提交中...';

        try {
            // 收集表单数据
            const formData = new FormData(this.form);
            const orderData = {
                // 客户信息
                customerName: formData.get('customerName'),
                customerPhone: formData.get('customerPhone'),
                customerEmail: formData.get('customerEmail') || '',
                
                // 地址信息
                province: formData.get('province'),
                city: formData.get('city'),
                district: formData.get('district'),
                address: formData.get('address'),
                postalCode: formData.get('postalCode') || '',
                
                // 订单信息
                totalAmount: this.product.price,
                status: 'pending',
                note: formData.get('note') || '',
                
                // 订单项目（必须是数组）
                items: [
                    {
                        productId: this.productId,
                        productName: this.product.name,
                        productModel: this.product.model,
                        productImage: this.product.cardImage,
                        quantity: 1,
                        price: this.product.price,
                        subtotal: this.product.price
                    }
                ]
            };

            console.log('订单数据:', orderData);

            // 提交订单
            const response = await window.API.Order.create(orderData);

            if (response.code === 200) {
                console.log('✅ 订单提交成功:', response.data);
                this.showSuccess(response.data);
            } else {
                throw new Error(response.message || '订单提交失败');
            }
        } catch (error) {
            console.error('❌ 订单提交失败:', error);
            alert(error.message || '订单提交失败，请稍后重试');
            
            // 恢复按钮状态
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    /**
     * 显示成功提示
     */
    showSuccess(orderData) {
        // 更新步骤状态
        document.querySelectorAll('.step-item').forEach((item, index) => {
            if (index < 2) {
                item.classList.add('completed');
                item.classList.remove('active');
            } else if (index === 2) {
                item.classList.add('active');
            }
        });

        // 显示订单号
        const orderNumber = orderData.orderNumber || orderData.order_number || 'N/A';
        document.getElementById('orderNumber').textContent = orderNumber;

        // 显示成功模态框
        const modal = document.getElementById('successModal');
        modal.classList.add('show');

        // 清空表单
        this.form.reset();
        document.getElementById('agreeCheckbox').checked = false;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 订购页面加载完成');
    
    // 创建订购页面实例
    window.orderPage = new OrderPage();
    
    // 初始化
    window.orderPage.init();
});

// 导出（用于调试）
window.OrderPage = OrderPage;
