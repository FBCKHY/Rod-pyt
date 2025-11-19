/**
 * 联系我们 - 支持服务区块脚本
 * 
 * 描述：控制"随时为您提供支持"区块的动画和交互效果
 * 用途：增强用户体验，提供平滑的动画效果
 * 
 * 创建日期：2025-07-15
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化支持区块
    initSupportSection();
});

/**
 * 初始化支持区块功能
 */
function initSupportSection() {
    const supportSection = document.querySelector('.support-section');
    
    if (!supportSection) {
        console.warn('⚠️ 支持区块未找到');
        return;
    }
    
    console.log('✅ 支持区块初始化');
    
    // 初始化卡片动画
    initSupportCards();
    
    // 添加滚动动画（如果AOS库存在）
    if (typeof AOS !== 'undefined') {
        AOS.refreshHard();
    }
    
    // 绑定联系我们按钮事件
    bindSupportButtons();
}

/**
 * 初始化支持服务卡片动画效果
 */
function initSupportCards() {
    const supportCards = document.querySelectorAll('.support-card');
    
    supportCards.forEach((card, index) => {
        // 添加延迟出现的效果
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300 + (index * 150));
    });
}

/**
 * 绑定支持按钮事件
 */
function bindSupportButtons() {
    const supportButtons = document.querySelectorAll('.support-btn');
    
    supportButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // 阻止默认行为，如果按钮是链接的话
            if (button.tagName.toLowerCase() === 'a') {
                e.preventDefault();
            }
            
            const supportType = this.getAttribute('data-support-type');
            
            // 根据不同支持类型执行不同操作
            switch (supportType) {
                case 'chat':
                    openLiveChat();
                    break;
                    
                case 'call':
                    initiateCallRequest();
                    break;
                    
                case 'faq':
                    navigateToFAQ();
                    break;
                    
                case 'email':
                    scrollToContactForm();
                    break;
                    
                default:
                    // 默认滚动到联系表单
                    scrollToContactForm();
            }
        });
    });
}

/**
 * 打开在线客服聊天窗口
 */
function openLiveChat() {
    console.log('📱 打开在线客服聊天');
    
    // 模拟打开在线聊天窗口
    // 实际项目中，这里应该集成第三方在线客服系统的API
    alert('在线客服即将为您服务');
    
    // 示例：如果有集成第三方客服系统
    // if (window.LiveChatWidget) {
    //     window.LiveChatWidget.call('maximize');
    // }
}

/**
 * 发起回电请求
 */
function initiateCallRequest() {
    console.log('📞 发起回电请求');
    
    // 获取电话号码输入
    const phoneNumber = prompt('请输入您的电话号码，我们的客服将尽快与您联系');
    
    if (phoneNumber && phoneNumber.trim() !== '') {
        // 模拟发送请求
        setTimeout(() => {
            alert(`感谢您的等待，我们将尽快联系您: ${phoneNumber}`);
        }, 1000);
    }
}

/**
 * 导航到常见问题页面
 */
function navigateToFAQ() {
    console.log('❓ 导航到常见问题页面');
    
    // 实际项目中应跳转到FAQ页面
    window.location.href = '../pages/faq.html';
}

/**
 * 滚动到联系表单
 */
function scrollToContactForm() {
    console.log('📝 滚动到联系表单');
    
    const contactForm = document.querySelector('.contact-form-section');
    
    if (contactForm) {
        // 平滑滚动到联系表单
        contactForm.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * 处理支持服务统计数据更新
 * 用于展示服务响应时间、满意度等动态数据
 */
function updateSupportStats() {
    // 这里可以添加实时数据更新逻辑
    // 实际项目中可能从API获取数据
    
    const statsElements = document.querySelectorAll('.support-stats-value');
    
    if (statsElements.length === 0) {
        return;
    }
    
    // 模拟数据
    const supportStats = {
        responseTime: '2.5分钟',
        satisfaction: '98%',
        resolution: '95%'
    };
    
    // 更新统计数据显示
    statsElements.forEach(element => {
        const statType = element.getAttribute('data-stat-type');
        if (supportStats[statType]) {
            element.textContent = supportStats[statType];
        }
    });
}

// 初始加载完成后更新统计数据
setTimeout(updateSupportStats, 1000); 