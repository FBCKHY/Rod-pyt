/**
 * 订阅表单处理
 * 处理页脚订阅表单的提交
 */

class SubscriptionHandler {
    constructor() {
        this.form = null;
        this.isSubmitting = false;
    }

    /**
     * 初始化订阅表单
     */
    init() {
        // 查找所有订阅表单
        const forms = document.querySelectorAll('.subscription-form, #subscriptionForm');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        });
    }

    /**
     * 处理表单提交
     */
    async handleSubmit(event) {
        event.preventDefault();
        
        if (this.isSubmitting) {
            return;
        }

        const form = event.target;
        const formData = new FormData(form);
        
        // 获取表单数据
        const contactType = formData.get('contactType') || 'email';
        const contactValue = formData.get('contactValue') || formData.get('email');
        
        // 验证数据
        if (!contactValue) {
            window.API.showError('请输入联系方式');
            return;
        }

        // 验证格式
        if (!this.validateContact(contactType, contactValue)) {
            return;
        }

        // 提交数据
        this.isSubmitting = true;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>提交中...';

        try {
            const response = await window.API.Subscription.create({
                contactType,
                contactValue,
                source: 'website_footer'
            });

            if (response.code === 200) {
                window.API.showSuccess('订阅成功！我们会及时向您推送最新资讯');
                form.reset();
                
                // 触发自定义事件
                window.dispatchEvent(new CustomEvent('subscriptionSuccess', {
                    detail: response.data
                }));
            } else {
                throw new Error(response.msg || '订阅失败');
            }
        } catch (error) {
            console.error('订阅失败:', error);
            
            // 处理特定错误
            if (error.message.includes('已存在')) {
                window.API.showError('该联系方式已订阅，无需重复订阅');
            } else {
                window.API.showError(error.message || '订阅失败，请稍后重试');
            }
        } finally {
            this.isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    /**
     * 验证联系方式格式
     */
    validateContact(type, value) {
        switch (type) {
            case 'email':
                if (!this.validateEmail(value)) {
                    window.API.showError('请输入正确的邮箱地址');
                    return false;
                }
                break;
            
            case 'phone':
                if (!this.validatePhone(value)) {
                    window.API.showError('请输入正确的手机号码');
                    return false;
                }
                break;
            
            case 'wechat':
                if (!this.validateWechat(value)) {
                    window.API.showError('请输入正确的微信号');
                    return false;
                }
                break;
        }
        
        return true;
    }

    /**
     * 验证邮箱格式
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * 验证手机号格式
     */
    validatePhone(phone) {
        const re = /^1[3-9]\d{9}$/;
        return re.test(phone);
    }

    /**
     * 验证微信号格式
     */
    validateWechat(wechat) {
        const re = /^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/;
        return re.test(wechat);
    }
}

// 创建全局实例
window.subscriptionHandler = new SubscriptionHandler();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.subscriptionHandler.init();
});
