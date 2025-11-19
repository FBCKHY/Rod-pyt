/**
 * 公司新闻区块脚本 - news.js
 * 
 * 描述：处理公司新闻区块的交互和动画效果
 * 用途：增强用户体验，提高交互趣味性
 * 
 * 创建日期：2025-07-11
 * 最后修改：2025-07-11
 */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    // 初始化新闻区块
    initNewsSection();
    
    // 初始化新闻卡片微动画
    initNewsCardAnimations();
    
    console.log('✨ 公司新闻区块初始化完成');
});

/**
 * 初始化新闻区块
 */
function initNewsSection() {
    // 创建装饰粒子
    createParticles();
    
    // 初始化"查看更多"按钮效果
    initViewMoreButton();
}

/**
 * 创建装饰粒子
 */
function createParticles() {
    const particlesContainer = document.querySelector('.news-section .particles');
    
    if (!particlesContainer) return;
    
    // 创建15个粒子
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particlesContainer.appendChild(particle);
    }
}

/**
 * 初始化"查看更多"按钮效果
 */
function initViewMoreButton() {
    const viewAllBtn = document.querySelector('.btn-view-all');
    
    if (!viewAllBtn) return;
    
    viewAllBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 8px 20px rgba(255, 215, 0, 0.5)';
        
        const arrow = this.querySelector('.arrow-icon');
        if (arrow) {
            arrow.style.transform = 'translateX(5px)';
        }
    });
    
    viewAllBtn.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
        
        const arrow = this.querySelector('.arrow-icon');
        if (arrow) {
            arrow.style.transform = '';
        }
    });
}

/**
 * ===== 新闻卡片微动画效果 =====
 * 从news-card-animations.js合并而来
 */

/**
 * 初始化新闻卡片微动画效果
 */
function initNewsCardAnimations() {
    // 添加3D倾斜效果
    initCardTiltEffect();
    
    // 添加分隔线动画效果
    initDividerAnimation();
    
    // 添加卡片内容动画效果
    initContentAnimation();
    
    // 添加卡片点击波纹效果
    initRippleEffect();
}

/**
 * 初始化卡片3D倾斜效果
 */
function initCardTiltEffect() {
    // 获取所有新闻卡片
    const newsCards = document.querySelectorAll('.news-card');
    
    // 为每个卡片添加倾斜效果类
    newsCards.forEach(card => {
        card.classList.add('tilt-effect');
        
        // 添加鼠标移动事件
        card.addEventListener('mousemove', handleCardTilt);
        
        // 添加鼠标离开事件
        card.addEventListener('mouseleave', resetCardTilt);
    });
}

/**
 * 处理卡片倾斜效果
 * @param {MouseEvent} e - 鼠标事件对象
 */
function handleCardTilt(e) {
    const card = e.currentTarget;
    const cardRect = card.getBoundingClientRect();
    
    // 计算鼠标在卡片上的相对位置 (0-1)
    const x = (e.clientX - cardRect.left) / cardRect.width;
    const y = (e.clientY - cardRect.top) / cardRect.height;
    
    // 计算倾斜角度 (-10 到 10 度)
    const tiltX = (y - 0.5) * 10;
    const tiltY = (0.5 - x) * 10;
    
    // 应用3D变换
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    
    // 添加光泽效果
    addGlareEffect(card, x, y);
}

/**
 * 重置卡片倾斜效果
 * @param {MouseEvent} e - 鼠标事件对象
 */
function resetCardTilt(e) {
    const card = e.currentTarget;
    
    // 重置卡片变换
    card.style.transform = '';
    
    // 移除光泽效果
    removeGlareEffect(card);
}

/**
 * 添加卡片光泽效果
 * @param {HTMLElement} card - 卡片元素
 * @param {number} x - 鼠标X坐标比例
 * @param {number} y - 鼠标Y坐标比例
 */
function addGlareEffect(card, x, y) {
    // 查找或创建光泽元素
    let glare = card.querySelector('.card-glare');
    
    if (!glare) {
        glare = document.createElement('div');
        glare.className = 'card-glare';
        glare.style.position = 'absolute';
        glare.style.top = '0';
        glare.style.left = '0';
        glare.style.width = '100%';
        glare.style.height = '100%';
        glare.style.pointerEvents = 'none';
        glare.style.background = 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 80%)';
        glare.style.opacity = '0';
        glare.style.transition = 'opacity 0.3s ease-out';
        glare.style.borderRadius = 'inherit';
        glare.style.zIndex = '2';
        card.appendChild(glare);
    }
    
    // 计算光泽位置
    const glareX = x * 100;
    const glareY = y * 100;
    
    // 更新光泽效果
    glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 80%)`;
    glare.style.opacity = '0.15';
}

/**
 * 移除卡片光泽效果
 * @param {HTMLElement} card - 卡片元素
 */
function removeGlareEffect(card) {
    const glare = card.querySelector('.card-glare');
    
    if (glare) {
        glare.style.opacity = '0';
    }
}

/**
 * 初始化分隔线动画效果
 */
function initDividerAnimation() {
    // 获取所有分隔线
    const dividers = document.querySelectorAll('.news-card-divider');
    
    // 为每个分隔线添加初始样式
    dividers.forEach(divider => {
        // 添加初始样式
        divider.style.position = 'relative';
        divider.style.overflow = 'hidden';
    });
}

/**
 * 初始化卡片内容动画效果
 */
function initContentAnimation() {
    // 获取所有新闻卡片
    const newsCards = document.querySelectorAll('.news-card');
    
    // 为每个卡片添加内容动画
    newsCards.forEach(card => {
        // 获取卡片内的元素
        const title = card.querySelector('.news-card-title');
        const divider = card.querySelector('.news-card-divider');
        const summary = card.querySelector('.news-card-summary');
        const footer = card.querySelector('.news-card-footer');
        const tags = card.querySelectorAll('.news-card-tag, .card-badge');
        
        // 添加鼠标进入事件
        card.addEventListener('mouseenter', function() {
            // 为各元素添加动画类
            if (title) title.classList.add('animate-title');
            if (divider) divider.classList.add('animate-divider');
            if (summary) summary.classList.add('animate-summary');
            if (footer) footer.classList.add('animate-footer');
            
            // 为标签添加动画
            tags.forEach((tag, index) => {
                setTimeout(() => {
                    tag.classList.add('animate-tag');
                }, index * 50);
            });
        });
        
        // 添加鼠标离开事件
        card.addEventListener('mouseleave', function() {
            // 移除各元素的动画类
            if (title) title.classList.remove('animate-title');
            if (divider) divider.classList.remove('animate-divider');
            if (summary) summary.classList.remove('animate-summary');
            if (footer) footer.classList.remove('animate-footer');
            
            // 移除标签动画
            tags.forEach(tag => {
                tag.classList.remove('animate-tag');
            });
        });
    });
}

/**
 * 初始化卡片点击波纹效果
 */
function initRippleEffect() {
    // 获取所有新闻卡片
    const newsCards = document.querySelectorAll('.news-card');
    
    // 为每个卡片添加点击波纹效果
    newsCards.forEach(card => {
        card.addEventListener('click', createRippleEffect);
    });
}

/**
 * 创建波纹效果
 * @param {MouseEvent} e - 鼠标事件对象
 */
function createRippleEffect(e) {
    // 如果点击的是链接或其子元素，不创建波纹
    if (e.target.closest('.news-card-link') || e.target.closest('.news-card-stats')) {
        return;
    }
    
    const card = e.currentTarget;
    
    // 创建波纹元素
    const ripple = document.createElement('div');
    ripple.className = 'card-ripple';
    
    // 设置波纹样式
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    ripple.style.transform = 'scale(0)';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '1';
    ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
    
    // 计算波纹位置
    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 设置波纹位置和大小
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    
    // 添加到卡片
    card.appendChild(ripple);
    
    // 触发波纹动画
    setTimeout(() => {
        ripple.style.transform = 'scale(1)';
        ripple.style.opacity = '0';
    }, 10);
    
    // 动画结束后移除波纹
    setTimeout(() => {
        card.removeChild(ripple);
    }, 600);
} 