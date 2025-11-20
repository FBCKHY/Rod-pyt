/**
 * 联系我们 - 表单处理脚本（重新设计版）
 * 
 * 描述：处理联系表单的验证和提交功能，增强用户交互体验
 * 用途：提供表单交互体验和数据验证
 * 
 * 创建日期：2025-07-15
 * 更新日期：2025-07-16
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化联系表单
    initContactForm();
    
    // 添加页面进入动画
    animateFormElements();
});

/**
 * 初始化联系表单功能
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) {
        console.warn('⚠️ 联系表单未找到');
        return;
    }
    
    console.log('✅ 联系表单初始化');
    
    // 绑定表单提交事件
    contactForm.addEventListener('submit', handleFormSubmit);
    
    // 绑定输入验证事件
    setupFormValidation(contactForm);
    
    // 绑定浮动标签效果
    setupFloatingLabels();
    
    // 初始化表单提示信息
    initFormMessage();
    
    // 检查URL参数并自动填写表单
    autoFillFormFromURL();
    
    // 初始化用户来源自定义输入功能
    initCustomSourceInput();
}

/**
 * 处理表单提交
 * @param {Event} event - 提交事件对象
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    
    // 检查表单验证
    if (!validateForm(form)) {
        return;
    }
    
    // 获取表单数据
    const formData = new FormData(form);
    const formValues = Object.fromEntries(formData);
    
    // 处理用户来源"其他"选项的自定义输入
    if (formValues.userSource === '其他' && formValues.customSource) {
        formValues.userSource = formValues.customSource;
        delete formValues.customSource; // 删除临时字段
    }
    
    // 显示加载状态
    showFormLoading(true);
    
    console.log('📤 表单提交:', formValues);
    
    // 提交到订阅系统后端
    submitToSubscriptionSystem(formValues)
        .then(() => {
            // 提交成功
            showFormLoading(false);
            showFormMessage('success', '表单提交成功', '感谢您的留言，我们将在24小时内回复您。同时您的联系方式已添加到我们的订阅列表。');
            
            // 重置表单
            form.reset();
            resetFormValidation(form);
            
            // 重置自定义输入框状态
            const customSourceContainer = document.getElementById('customSourceContainer');
            const customSourceInput = document.getElementById('customSource');
            if (customSourceContainer && customSourceInput) {
                customSourceContainer.style.display = 'none';
                customSourceInput.required = false;
                customSourceInput.value = '';
            }
            
            // 清除浮动标签效果
            resetFloatingLabels();
        })
        .catch((error) => {
            console.error('表单提交失败:', error);
            showFormLoading(false);
            showFormMessage('error', '提交失败', '抱歉，提交失败，请稍后重试或直接联系我们。');
        });
}

/**
 * 提交到订阅系统后端
 * @param {Object} formValues - 表单数据
 * @returns {Promise} 提交结果
 */
async function submitToSubscriptionSystem(formValues) {
    try {
        // 解析联系方式类型
        const contactValue = formValues.email.trim();
        let contactType = 'email'; // 默认为邮箱
        
        // 智能识别联系方式类型
        if (contactValue.includes('@')) {
            contactType = 'email';
        } else if (/^1[3-9]\d{9}$/.test(contactValue)) {
            contactType = 'phone';
        } else if (/^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/.test(contactValue)) {
            contactType = 'wechat';
        }
        
        // 构建完整的订阅数据
        const subscriptionData = {
            contactType: contactType,
            contactValue: contactValue,
            source: 'contact_form',
            fullName: formValues.name || '',
            subject: formValues.subject || '',
            message: formValues.message || '',
            userSource: formValues.userSource || '',
            company: formValues.company || '',
            preferredTime: formValues.preferredTime || '',
            address: formValues.address || '',
            requirements: formValues.requirements || ''
        };
        
        console.log('📤 提交订阅数据:', subscriptionData);
        
        // 发送到订阅系统API
        const response = await fetch('http://localhost:3000/api/subscriptions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscriptionData)
        });
        
        const result = await response.json();
        
        if (result.code === 200) {
            console.log('✅ 订阅添加成功:', result);
            return result;
        } else {
            throw new Error(result.msg || '订阅添加失败');
        }
        
    } catch (error) {
        console.error('❌ 订阅系统连接失败:', error);
        throw error;
    }
}

/**
 * 验证整个表单
 * @param {HTMLFormElement} form - 表单元素
 * @returns {boolean} 是否验证通过
 */
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * 设置表单验证
 * @param {HTMLFormElement} form - 表单元素
 */
function setupFormValidation(form) {
    // 获取所有需要验证的表单元素
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // 添加blur事件验证
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        // 添加输入事件清除错误
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                clearInputError(this);
            }
        });
    });
}

/**
 * 验证单个输入字段
 * @param {HTMLElement} input - 输入元素
 * @returns {boolean} 是否验证通过
 */
function validateInput(input) {
    // 跳过非必填且为空的字段
    if (!input.required && !input.value) {
        return true;
    }
    
    // 检查是否为空
    if (input.required && !input.value) {
        setInputError(input, '此字段为必填项');
        return false;
    }
    
    // 根据输入类型验证
    switch(input.type) {
        case 'email':
            if (!isValidEmail(input.value)) {
                setInputError(input, '请输入有效的电子邮箱');
                return false;
            }
            break;
            
        case 'text':
            // 特殊处理联系方式字段（邮箱/微信号/手机号）
            if (input.id === 'email' || input.name === 'email') {
                if (!isValidContact(input.value)) {
                    setInputError(input, '请输入有效的邮箱、微信号或手机号');
                    return false;
                }
            }
            break;
            
        case 'checkbox':
            if (input.required && !input.checked) {
                setInputError(input, '请勾选此项');
                return false;
            }
            break;
    }
    
    // 检查下拉菜单
    if (input.tagName === 'SELECT' && input.required) {
        if (!input.value || input.value === '') {
            setInputError(input, '请选择一个选项');
            return false;
        }
        
        // 特殊处理用户来源"其他"选项
        if (input.id === 'userSource' && input.value === '其他') {
            const customSourceInput = document.getElementById('customSource');
            if (customSourceInput && (!customSourceInput.value || customSourceInput.value.trim() === '')) {
                setInputError(customSourceInput, '请输入具体的来源信息');
                return false;
            }
        }
    }
    
    // 通过验证
    setInputSuccess(input);
    return true;
}

/**
 * 设置输入错误状态和消息
 * @param {HTMLElement} input - 输入元素
 * @param {string} message - 错误消息
 */
function setInputError(input, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    
    // 创建或更新错误提示
    let errorMessage = input.parentNode.querySelector('.invalid-feedback');
    if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.className = 'invalid-feedback';
        
        if (input.type === 'checkbox') {
            input.parentNode.parentNode.appendChild(errorMessage);
        } else {
            input.parentNode.appendChild(errorMessage);
        }
    }
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // 添加抖动效果
    input.classList.add('shake');
    setTimeout(() => {
        input.classList.remove('shake');
    }, 500);
}

/**
 * 设置输入成功状态
 * @param {HTMLElement} input - 输入元素
 */
function setInputSuccess(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    
    // 移除错误提示
    let errorMessage = input.parentNode.querySelector('.invalid-feedback');
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}

/**
 * 清除输入错误状态
 * @param {HTMLElement} input - 输入元素
 */
function clearInputError(input) {
    input.classList.remove('is-invalid');
    
    // 隐藏错误提示
    let errorMessage = input.parentNode.querySelector('.invalid-feedback');
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}

/**
 * 重置表单验证状态
 * @param {HTMLFormElement} form - 表单元素
 */
function resetFormValidation(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        input.classList.remove('is-invalid', 'is-valid');
    });
    
    // 移除所有错误提示
    const errorMessages = form.querySelectorAll('.invalid-feedback');
    errorMessages.forEach(message => {
        message.style.display = 'none';
    });
}

/**
 * 设置浮动标签效果
 */
function setupFloatingLabels() {
    const floatingInputs = document.querySelectorAll('.form-floating input, .form-floating textarea, .form-floating select');
    
    floatingInputs.forEach(input => {
        // 检查初始状态
        checkFloatingLabelState(input);
        
        // 添加焦点和输入事件
        input.addEventListener('focus', () => {
            checkFloatingLabelState(input);
        });
        
        input.addEventListener('blur', () => {
            checkFloatingLabelState(input);
        });
        
        input.addEventListener('input', () => {
            checkFloatingLabelState(input);
        });
        
        // 为select元素添加change事件
        if (input.tagName === 'SELECT') {
            input.addEventListener('change', () => {
                checkFloatingLabelState(input);
            });
        }
    });
}

/**
 * 检查浮动标签状态
 * @param {HTMLElement} input - 输入元素
 */
function checkFloatingLabelState(input) {
    const label = input.parentNode.querySelector('.form-label');
    
    // 处理不同类型的输入元素
    let hasValue = false;
    
    if (input.tagName === 'SELECT') {
        // select元素：检查是否有选择的值且不是disabled选项
        hasValue = input.value && input.value !== '';
    } else {
        // input和textarea元素：检查是否有值
        hasValue = input.value && input.value.trim() !== '';
    }
    
    if (hasValue || document.activeElement === input) {
        label.classList.add('active');
    } else {
        label.classList.remove('active');
    }
}

/**
 * 重置浮动标签状态
 */
function resetFloatingLabels() {
    const floatingInputs = document.querySelectorAll('.form-floating input, .form-floating textarea, .form-floating select');
    
    floatingInputs.forEach(input => {
        const label = input.parentNode.querySelector('.form-label');
        label.classList.remove('active');
    });
}

/**
 * 添加页面进入动画
 */
function animateFormElements() {
    // 获取表单容器
    const formContainer = document.querySelector('.form-container');
    
    if (!formContainer) {
        return;
    }
    
    // 添加淡入效果
    formContainer.style.opacity = '0';
    formContainer.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        formContainer.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        formContainer.style.opacity = '1';
        formContainer.style.transform = 'translateY(0)';
    }, 300);
    
    // 动画联系信息列表项
    const infoItems = document.querySelectorAll('.contact-info-item');
    
    infoItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.6s ease-out';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 500 + (index * 150));
    });
    
    // 动画社交媒体图标
    const socialLinks = document.querySelectorAll('.social-link');
    
    socialLinks.forEach((link, index) => {
        link.style.opacity = '0';
        link.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            link.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            link.style.opacity = '1';
            link.style.transform = 'scale(1)';
        }, 1000 + (index * 100));
    });
}

/**
 * 初始化表单提示信息
 */
function initFormMessage() {
    const formMessage = document.getElementById('formMessage');
    if (!formMessage) return;
    
    // 添加关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'form-message-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
        hideFormMessage();
    });
    
    formMessage.appendChild(closeBtn);
}

/**
 * 显示表单提示信息
 * @param {string} type - 消息类型（success/error/warning）
 * @param {string} title - 消息标题
 * @param {string} message - 消息内容
 */
function showFormMessage(type, title, message) {
    const formMessage = document.getElementById('formMessage');
    if (!formMessage) return;
    
    // 设置消息类型和内容
    formMessage.className = `form-message form-message-${type}`;
    
    const icon = formMessage.querySelector('.form-message-icon i');
    if (icon) {
        icon.className = getMessageIconClass(type);
    }
    
    const titleEl = formMessage.querySelector('.form-message-title');
    if (titleEl) {
        titleEl.textContent = title;
    }
    
    const textEl = formMessage.querySelector('.form-message-text');
    if (textEl) {
        textEl.textContent = message;
    }
    
    // 显示消息
    formMessage.classList.add('show');
    
    // 成功消息自动隐藏
    if (type === 'success') {
        setTimeout(() => {
            hideFormMessage();
        }, 6000);
    }
}

/**
 * 隐藏表单提示信息
 */
function hideFormMessage() {
    const formMessage = document.getElementById('formMessage');
    if (!formMessage) return;
    
    formMessage.classList.remove('show');
}

/**
 * 获取消息图标类名
 * @param {string} type - 消息类型
 * @returns {string} 图标类名
 */
function getMessageIconClass(type) {
    switch(type) {
        case 'success':
            return 'fas fa-check-circle';
        case 'error':
            return 'fas fa-exclamation-circle';
        case 'warning':
            return 'fas fa-exclamation-triangle';
        default:
            return 'fas fa-info-circle';
    }
}

/**
 * 显示/隐藏表单加载状态
 * @param {boolean} show - 是否显示
 */
function showFormLoading(show) {
    const formLoading = document.getElementById('formLoading');
    if (!formLoading) return;
    
    if (show) {
        formLoading.classList.add('active');
        formLoading.style.display = 'flex';
    } else {
        formLoading.classList.remove('active');
        formLoading.style.display = 'none';
    }
}

/**
 * 验证电子邮箱格式
 * @param {string} email - 电子邮箱
 * @returns {boolean} 是否有效
 */
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * 验证电话号码格式
 * @param {string} phone - 电话号码
 * @returns {boolean} 是否有效
 */
function isValidPhone(phone) {
    // 支持国内手机号和固定电话
    const re = /^((\+?86)|(\(\+86\)))?(1[3-9]\d{9}|([0-9]{3,4}-)?[0-9]{7,8})$/;
    return re.test(phone);
}

/**
 * 验证微信号格式
 * @param {string} wechat - 要验证的微信号
 * @returns {boolean} 是否有效
 */
function isValidWechat(wechat) {
    // 微信号规则：6-20位，字母、数字、下划线、减号，必须以字母开头
    const re = /^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/;
    return re.test(wechat);
}

/**
 * 验证联系方式（邮箱、手机号或微信号）
 * @param {string} contact - 要验证的联系方式
 * @returns {boolean} 是否有效
 */
function isValidContact(contact) {
    if (!contact || contact.length === 0) {
        return false;
    }
    
    return isValidEmail(contact) || isValidPhone(contact) || isValidWechat(contact);
}

/**
 * 获取联系方式类型
 * @param {string} contact - 联系方式
 * @returns {string} 联系方式类型
 */
function getContactType(contact) {
    if (isValidEmail(contact)) {
        return '邮箱';
    } else if (isValidPhone(contact)) {
        return '手机号';
    } else if (isValidWechat(contact)) {
        return '微信号';
    }
    return '未知';
}

/**
 * 从URL参数自动填写表单
 */
function autoFillFormFromURL() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    let fromSubscribe = urlParams.get('from');
    let contact = urlParams.get('contact');
    let contactType = urlParams.get('type');

    // 兜底：如果URL参数缺失，尝试从 sessionStorage 恢复
    try {
        if (!fromSubscribe && sessionStorage.getItem('subscribe_from')) {
            fromSubscribe = sessionStorage.getItem('subscribe_from');
        }
        if (!contact && sessionStorage.getItem('subscribe_contact')) {
            contact = sessionStorage.getItem('subscribe_contact');
        }
        if (!contactType && sessionStorage.getItem('subscribe_type')) {
            contactType = sessionStorage.getItem('subscribe_type');
        }
    } catch (e) {}

    if (fromSubscribe === 'subscribe' && contact) {
        console.log(`📝 自动填写表单 - 联系方式: ${contact} (${contactType})`);
        
        // 获取表单字段
        const emailField = document.getElementById('email');
        const messageField = document.getElementById('message');
        const subjectField = document.getElementById('subject');
        const userSourceField = document.getElementById('userSource');
        
        // 填写联系方式
        if (emailField) {
            emailField.value = decodeURIComponent(contact);
            
            // 触发浮动标签效果
            const label = emailField.closest('.form-floating')?.querySelector('.form-label');
            if (label) {
                label.classList.add('active');
            }
            
            // 验证字段
            validateInput(emailField);
        }
        
        // 显示友好提示（仅提示联系方式已填入）
        showFormMessage('info', '已填入联系方式', `我们已将您的${contactType || '联系方式'}自动填入表单，请完善其余信息后提交。`);
        
        // 滚动到表单区域
        setTimeout(() => {
            const formSection = document.querySelector('.contact-form-section');
            if (formSection) {
                formSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }, 300);
        
        // 清除URL参数（可选）并清理 sessionStorage 兜底数据
        const newUrl = window.location.pathname.replace(/\?.*$/, '');
        window.history.replaceState({}, document.title, newUrl);
        try {
            sessionStorage.removeItem('subscribe_from');
            sessionStorage.removeItem('subscribe_contact');
            sessionStorage.removeItem('subscribe_type');
        } catch (e) {}
    }
}

/**
 * 初始化用户来源自定义输入功能
 */
function initCustomSourceInput() {
    const userSourceSelect = document.getElementById('userSource');
    const customSourceContainer = document.getElementById('customSourceContainer');
    const customSourceInput = document.getElementById('customSource');
    
    if (!userSourceSelect || !customSourceContainer || !customSourceInput) {
        console.warn('⚠️ 用户来源相关元素未找到');
        return;
    }
    
    // 监听下拉菜单变化
    userSourceSelect.addEventListener('change', function() {
        if (this.value === '其他') {
            // 显示自定义输入框
            customSourceContainer.style.display = 'block';
            customSourceInput.required = true;
            
            // 添加动画效果
            setTimeout(() => {
                customSourceContainer.style.opacity = '1';
                customSourceContainer.style.transform = 'translateY(0)';
            }, 10);
        } else {
            // 隐藏自定义输入框
            customSourceContainer.style.opacity = '0';
            customSourceContainer.style.transform = 'translateY(-10px)';
            customSourceInput.required = false;
            customSourceInput.value = '';
            
            setTimeout(() => {
                customSourceContainer.style.display = 'none';
                // 清除验证状态
                clearInputError(customSourceInput);
            }, 300);
        }
    });
    
    // 设置初始样式
    customSourceContainer.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    customSourceContainer.style.opacity = '0';
    customSourceContainer.style.transform = 'translateY(-10px)';
    
    // 为自定义输入框添加浮动标签效果
    customSourceInput.addEventListener('focus', function() {
        const label = this.closest('.form-floating').querySelector('.form-label');
        if (label) {
            label.classList.add('active');
        }
    });
    
    customSourceInput.addEventListener('blur', function() {
        if (!this.value) {
            const label = this.closest('.form-floating').querySelector('.form-label');
            if (label) {
                label.classList.remove('active');
            }
        }
    });
    
    // 如果已有值，激活标签
    if (customSourceInput.value) {
        const label = customSourceInput.closest('.form-floating').querySelector('.form-label');
        if (label) {
            label.classList.add('active');
        }
    }
}

/**
 * 添加CSS动画
 */
(function() {
    // 创建样式元素
    const style = document.createElement('style');
    style.type = 'text/css';
    
    // 添加抖动动画
    const css = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .shake {
            animation: shake 0.5s;
        }
        
        .form-floating .form-label.active {
            opacity: .65;
            transform: scale(.85) translateY(-0.5rem) translateX(0.15rem);
            color: var(--brand-primary-blue);
        }
        
        .form-message-close {
            position: absolute;
            top: 10px;
            right: 10px;
            background: transparent;
            border: none;
            color: inherit;
            font-size: 18px;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.3s;
        }
        
        .form-message-close:hover {
            opacity: 1;
        }
    `;
    
    // 添加样式到页面
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    
    document.head.appendChild(style);
})(); 