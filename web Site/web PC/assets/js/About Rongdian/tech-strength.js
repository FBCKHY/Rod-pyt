/**
 * 关于容电 - 技术实力区块脚本
 * 
 * 描述：处理技术实力区块的交互功能
 * 用途：为技术实力区块提供动画和交互效果
 * 
 * 包含功能：
 * - 技术优势卡片动画
 * - 专利数据动画
 * 
 * 创建日期：2025-07-12
 * 最后修改：2025-07-12
 */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔬 技术实力区块脚本已加载');
    
    // 初始化技术优势卡片动画
    initAdvantageCardsAnimation();
    
    // 初始化专利数据动画
    initPatentsAnimation();
});

/**
 * 初始化技术优势卡片动画
 */
function initAdvantageCardsAnimation() {
    const advantageCards = document.querySelectorAll('.advantage-card');
    
    if (!advantageCards.length) return;
    
    // 创建一个Intersection Observer来检测卡片是否在视口中
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 当卡片进入视口时
            if (entry.isIntersecting) {
                entry.target.classList.add('card-visible');
                
                // 停止观察此元素
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2, // 当元素有20%进入视口时触发
        rootMargin: '0px 0px -50px 0px' // 底部偏移50px，提前触发
    });
    
    // 开始观察所有卡片
    advantageCards.forEach((card, index) => {
        // 设置初始状态
        card.classList.add('card-hidden');
        
        // 设置延迟，使卡片按顺序显示
        card.style.transitionDelay = `${index * 0.15}s`;
        
        // 开始观察
        observer.observe(card);
    });
}

/**
 * 初始化专利数据动画
 */
function initPatentsAnimation() {
    const patentsNumber = document.querySelector('.patents-number');
    
    if (!patentsNumber) return;
    
    // 创建一个Intersection Observer来检测专利数据是否在视口中
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            // 获取目标数值
            const targetValue = parseInt(patentsNumber.getAttribute('data-count') || '300');
            
            // 执行计数动画
            animatePatentsCount(patentsNumber, targetValue);
            
            // 停止观察
            observer.unobserve(patentsNumber);
        }
    }, {
        threshold: 0.5
    });
    
    // 开始观察专利数据
    observer.observe(patentsNumber);
}

/**
 * 执行专利数量计数动画
 * @param {HTMLElement} element - 要动画的元素
 * @param {number} targetValue - 目标数值
 */
function animatePatentsCount(element, targetValue) {
    const duration = 2000; // 动画持续时间（毫秒）
    const startValue = 0;
    let startTime = null;
    
    function updateCount(timestamp) {
        if (!startTime) startTime = timestamp;
        
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentValue = Math.floor(progress * (targetValue - startValue) + startValue);
        
        // 更新元素内容
        element.textContent = currentValue + '+';
        
        // 如果动画未完成，继续请求下一帧
        if (progress < 1) {
            requestAnimationFrame(updateCount);
        }
    }
    
    requestAnimationFrame(updateCount);
}

/**
 * 初始化研发能力图片效果
 */
function initRDImageEffect() {
    const rdImage = document.querySelector('.rd-intro-image img');
    
    if (!rdImage) return;
    
    // 添加鼠标悬停效果
    rdImage.parentElement.addEventListener('mouseenter', () => {
        rdImage.style.transform = 'scale(1.05)';
    });
    
    rdImage.parentElement.addEventListener('mouseleave', () => {
        rdImage.style.transform = 'scale(1)';
    });
}

// 初始化研发能力图片效果
document.addEventListener('DOMContentLoaded', initRDImageEffect); 