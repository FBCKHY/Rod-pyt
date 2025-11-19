/**
 * 关于容电 - 企业文化区块脚本
 * 
 * 描述：处理企业文化区块的交互功能
 * 用途：为企业文化区块提供动画和交互效果
 * 
 * 包含功能：
 * - 核心价值观动画
 * - 文化卡片交互
 * 
 * 创建日期：2025-07-12
 * 最后修改：2025-07-12
 */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏛️ 企业文化区块脚本已加载');
    
    // 初始化核心价值观动画
    initCoreValuesAnimation();
    
    // 初始化文化卡片交互
    initCultureCardInteraction();
});

/**
 * 初始化核心价值观动画
 */
function initCoreValuesAnimation() {
    const valueItems = document.querySelectorAll('.value-item');
    
    if (!valueItems.length) return;
    
    // 创建一个Intersection Observer来检测价值观项是否在视口中
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 当价值观项进入视口时
            if (entry.isIntersecting) {
                entry.target.classList.add('value-visible');
                
                // 停止观察此元素
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2, // 当元素有20%进入视口时触发
    });
    
    // 开始观察所有价值观项
    valueItems.forEach((item, index) => {
        // 设置初始状态
        item.classList.add('value-hidden');
        
        // 设置延迟，使价值观项按顺序显示
        item.style.transitionDelay = `${index * 0.2}s`;
        
        // 开始观察
        observer.observe(item);
    });
}

/**
 * 初始化文化卡片交互
 */
function initCultureCardInteraction() {
    const cultureCards = document.querySelectorAll('.culture-card');
    
    if (!cultureCards.length) return;
    
    cultureCards.forEach(card => {
        // 鼠标悬停效果
        card.addEventListener('mouseenter', () => {
            card.classList.add('card-hover');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('card-hover');
        });
        
        // 点击效果
        card.addEventListener('click', () => {
            // 移除其他卡片的活跃状态
            cultureCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.remove('card-active');
                }
            });
            
            // 切换当前卡片的活跃状态
            card.classList.toggle('card-active');
        });
    });
}

/**
 * 添加品牌理念动画
 */
function initPhilosophyAnimation() {
    const philosophyText = document.querySelector('.brand-philosophy-text');
    
    if (!philosophyText) return;
    
    // 创建一个Intersection Observer来检测理念文本是否在视口中
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            philosophyText.classList.add('text-visible');
            observer.unobserve(philosophyText);
        }
    }, {
        threshold: 0.5
    });
    
    // 开始观察理念文本
    observer.observe(philosophyText);
} 