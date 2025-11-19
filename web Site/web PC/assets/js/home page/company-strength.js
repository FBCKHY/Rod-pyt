/**
 * 公司实力区块脚本 - company-strength.js
 * 
 * 描述：处理公司实力区块的交互功能
 * 用途：实现数字增长动画和其他交互效果
 * 
 * 创建日期：2025-07-11
 * 最后修改：2025-07-11
 */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    // 初始化公司实力区块
    initCompanyStrengthSection();
    
    console.log('✨ 公司实力区块初始化完成');
});

/**
 * 初始化公司实力区块功能
 */
function initCompanyStrengthSection() {
    // 初始化数字增长动画
    initCountUpAnimation();
    
    // 初始化卡片悬停效果
    initCardHoverEffects();
    
    // 初始化滚动动画
    initScrollAnimations();
}

/**
 * 初始化数字增长动画
 */
function initCountUpAnimation() {
    // 获取所有需要动画的数字元素，并限定在#company-strength区块内
    const statNumbers = document.querySelectorAll('#company-strength .stat-number');
    
    // 如果没有数字元素，则退出
    if (!statNumbers.length) return;
    
    // 创建Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 当元素进入视口时
            if (entry.isIntersecting) {
                const statElement = entry.target;
                const targetValue = parseInt(statElement.getAttribute('data-value'));
                const duration = 2000; // 动画持续时间（毫秒）
                const unit = statElement.getAttribute('data-unit') || '';
                
                // 开始数字增长动画
                animateNumber(statElement, targetValue, duration, unit);
                
                // 停止观察该元素
                observer.unobserve(statElement);
            }
        });
    }, {
        threshold: 0.1 // 元素10%进入视口时触发
    });
    
    // 观察所有数字元素
    statNumbers.forEach(statNumber => {
        observer.observe(statNumber);
    });
}

/**
 * 数字增长动画
 * @param {HTMLElement} element - 要动画的元素
 * @param {number} targetValue - 目标数值
 * @param {number} duration - 动画持续时间（毫秒）
 * @param {string} unit - 单位（如%、+等）
 */
function animateNumber(element, targetValue, duration, unit) {
    // 添加动画类
    element.classList.add('animate-count-up');
    
    // 起始值
    let startValue = 0;
    // 开始时间
    const startTime = performance.now();
    
    // 动画函数
    function updateNumber(currentTime) {
        // 计算动画进度（0-1之间）
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // 使用缓动函数使动画更自然
        const easedProgress = easeOutQuart(progress);
        
        // 计算当前值
        const currentValue = Math.floor(startValue + easedProgress * (targetValue - startValue));
        
        // 更新元素文本
        element.textContent = formatNumber(currentValue) + unit;
        
        // 如果动画未完成，继续请求动画帧
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    // 开始动画
    requestAnimationFrame(updateNumber);
}

/**
 * 缓出四次方缓动函数
 * @param {number} x - 进度值（0-1）
 * @returns {number} 缓动后的值
 */
function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
}

/**
 * 格式化数字（添加千位分隔符）
 * @param {number} number - 要格式化的数字
 * @returns {string} 格式化后的字符串
 */
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * 初始化卡片悬停效果
 */
function initCardHoverEffects() {
    // 获取所有实力展示卡片
    const showcaseCards = document.querySelectorAll('.strength-showcase-card');
    
    // 如果没有卡片，则退出
    if (!showcaseCards.length) return;
    
    // 为每个卡片添加悬停效果
    showcaseCards.forEach(card => {
        // 获取卡片内的图片元素
        const cardImage = card.querySelector('.showcase-image');
        
        // 添加鼠标进入效果
        card.addEventListener('mouseenter', function() {
            if (cardImage) {
                cardImage.style.transform = 'scale(1.05)';
            }
            
            // 添加阴影效果
            this.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.15)';
        });
        
        // 添加鼠标离开效果
        card.addEventListener('mouseleave', function() {
            if (cardImage) {
                cardImage.style.transform = '';
            }
            
            // 恢复默认阴影
            this.style.boxShadow = '';
        });
    });
    
    // 获取所有统计卡片
    const statCards = document.querySelectorAll('.strength-stat-card');
    
    // 如果没有统计卡片，则退出
    if (!statCards.length) return;
    
    // 为每个统计卡片添加悬停效果
    statCards.forEach(card => {
        // 获取卡片内的图标元素
        const iconElement = card.querySelector('.stat-icon');
        
        // 添加鼠标进入效果
        card.addEventListener('mouseenter', function() {
            if (iconElement) {
                iconElement.style.transform = 'scale(1.2)';
                iconElement.style.transition = 'transform 0.3s ease';
            }
        });
        
        // 添加鼠标离开效果
        card.addEventListener('mouseleave', function() {
            if (iconElement) {
                iconElement.style.transform = '';
            }
        });
    });
}

/**
 * 初始化滚动动画
 */
function initScrollAnimations() {
    // 获取所有统计卡片
    const statCards = document.querySelectorAll('.strength-stat-card');
    
    // 如果没有统计卡片，则退出
    if (!statCards.length) return;
    
    // 创建Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            // 当元素进入视口时
            if (entry.isIntersecting) {
                // 设置延迟，使卡片依次显示
                setTimeout(() => {
                    entry.target.classList.add('animate-count-up');
                }, index * 150);
                
                // 停止观察该元素
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // 元素10%进入视口时触发
    });
    
    // 观察所有统计卡片
    statCards.forEach(card => {
        observer.observe(card);
    });
    
    // 获取所有展示卡片
    const showcaseCards = document.querySelectorAll('.strength-showcase-card');
    
    // 如果没有展示卡片，则退出
    if (!showcaseCards.length) return;
    
    // 创建Intersection Observer
    const showcaseObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            // 当元素进入视口时
            if (entry.isIntersecting) {
                // 设置延迟，使卡片依次显示
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 200);
                
                // 停止观察该元素
                showcaseObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // 元素10%进入视口时触发
    });
    
    // 设置初始样式并观察所有展示卡片
    showcaseCards.forEach(card => {
        // 设置初始样式
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // 观察卡片
        showcaseObserver.observe(card);
    });
} 