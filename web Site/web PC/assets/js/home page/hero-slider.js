/**
 * 英雄区块轮播脚本 - hero-slider.js
 * 
 * 描述：实现首页英雄区块的轮播功能
 * 用途：控制轮播图的自动播放、手动切换和指示器功能
 * 
 * 包含功能：
 * - 自动轮播
 * - 手动切换（前进/后退）
 * - 指示器点击切换（支持直接跳转到指定幻灯片）
 * - 响应式适配
 * 
 * 创建日期：2025-07-08
 * 最后修改：2025-07-10
 */

'use strict';

// 在页面加载前就立即执行，确保最先执行
if (history.scrollRestoration) {
    // 禁用浏览器的自动滚动恢复功能
    history.scrollRestoration = 'manual';
}

// 页面一加载就立即滚动到顶部
window.onload = function() {
    // 使用零延迟确保在所有其他脚本之后执行
    setTimeout(function() {
        window.scrollTo(0, 0);
    }, 0);
};

// 监听页面刷新和回退事件
window.addEventListener('pageshow', function(event) {
    // 当页面从缓存恢复时（如通过浏览器的前进/后退按钮）
    // 或者普通刷新时，都强制回到顶部
    if (event.persisted || window.performance && 
        window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD) {
        console.log('📃 检测到页面刷新或从缓存恢复');
        window.scrollTo(0, 0);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // 强制滚动到顶部，使用更高优先级
    window.scrollTo(0, 0);
    
    // 初始化轮播
    initHeroSlider();
    
    // 监听窗口调整大小事件，确保英雄区块始终保持适当大小
    window.addEventListener('resize', adjustHeroSize);
    
    // 初始调整一次
    adjustHeroSize();
    
    // 在所有内容加载完成后再次调整大小，确保考虑了所有元素的实际尺寸
    window.addEventListener('load', function() {
        // 延迟执行以确保所有内容都已渲染
        setTimeout(function() {
            adjustHeroSize();
            console.log('🔄 页面完全加载后再次调整英雄区块大小');
        }, 100);
    });
    
    // 添加额外检查，确保在滚动时内容不会被截断
    window.addEventListener('scroll', function() {
        // 使用节流函数防止频繁调用
        if (!window.scrollThrottle) {
            window.scrollThrottle = setTimeout(function() {
                // 检查英雄区块是否在视口内
                const heroSection = document.querySelector('.hero-section');
                if (heroSection && isElementInViewport(heroSection)) {
                    adjustHeroSize();
                }
                window.scrollThrottle = null;
            }, 250);
        }
    });
    
    console.log('✨ 英雄区块轮播初始化完成');
    console.log('📜 页面滚动已重置到初始位置');
});

// 检查元素是否在视口内
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * 调整英雄区块大小以适应视口
 */
function adjustHeroSize() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    
    // 获取视口高度
    const viewportHeight = window.innerHeight;
    
    // 获取导航栏
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    
    // 顶部额外空间 - 只设置顶部向上扩展15px
    const topExtraSpace = 15;
    
    // 检查英雄区块内的所有内容
    const slideContent = document.querySelector('.slide-content');
    const contentHeight = slideContent ? slideContent.offsetHeight + 50 : 300; // 额外增加50px的边距
    
    // 设置最小高度，确保内容显示完整
    const minRequiredHeight = Math.max(contentHeight + 180, viewportHeight < 700 ? 580 : 680);
    
    // 应用计算的高度，使用102vh确保适当覆盖下一个区块
    heroSection.style.height = '102vh';
    heroSection.style.minHeight = `${minRequiredHeight}px`;
    
    // 确保顶部负边距始终为15px
    heroSection.style.marginTop = `-${topExtraSpace}px`;
    
    console.log(`🖼️ 英雄区块高度已调整为102vh，最小高度: ${minRequiredHeight}px (导航栏覆盖顶部${topExtraSpace}px)`);
}

/**
 * 初始化英雄区块轮播
 */
function initHeroSlider() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.hero-controls .prev');
    const nextBtn = document.querySelector('.hero-controls .next');
    const indicators = document.querySelectorAll('.hero-indicators .indicator');
    
    let currentSlide = 0;
    let slideInterval;
    const autoIntervalTime = 8000;  // 自动轮播间隔时间（毫秒）- 8秒
    const manualWaitTime = 15000;   // 手动切换后等待时间（毫秒）- 15秒
    let isTransitioning = false;    // 防止连续快速点击
    let userInteracted = false;     // 标记用户是否进行了交互
    
    // 初始化轮播状态
    updateSlideStatus();
    
    // 启动自动轮播
    startSlideInterval();
    
    // 绑定前进按钮事件
    prevBtn.addEventListener('click', () => {
        if (!isTransitioning) {
            isTransitioning = true;
            userInteracted = true;
            prevSlide();
            setTimeout(() => { isTransitioning = false; }, 700); // 设置防抖时间
        }
    });
    
    // 绑定后退按钮事件
    nextBtn.addEventListener('click', () => {
        if (!isTransitioning) {
            isTransitioning = true;
            userInteracted = true;
            nextSlide();
            setTimeout(() => { isTransitioning = false; }, 700); // 设置防抖时间
        }
    });
    
    // 指示器点击事件
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            if (!isTransitioning) {
                isTransitioning = true;
                userInteracted = true;
                goToSlide(index);
                setTimeout(() => { isTransitioning = false; }, 700); // 设置防抖时间
            }
        });
    });
    
    // 移除鼠标悬停暂停轮播的功能
    // slider.addEventListener('mouseenter', () => {
    //     clearInterval(slideInterval);
    // });
    
    // slider.addEventListener('mouseleave', () => {
    //     startSlideInterval();
    // });
    
    /**
     * 更新轮播状态
     */
    function updateSlideStatus() {
        // 先移除所有幻灯片的活动状态
        slides.forEach((slide) => {
            slide.classList.remove('active', 'next-up', 'fade-out');
        });
        
        // 设置当前幻灯片为活动状态
        slides[currentSlide].classList.add('active');
        
        // 设置下一张幻灯片为准备状态
        slides[getNextSlideIndex()].classList.add('next-up');
        
        // 更新指示器状态
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
    }
    
    /**
     * 获取下一张幻灯片索引
     */
    function getNextSlideIndex() {
        return (currentSlide + 1) % slides.length;
    }
    
    /**
     * 获取上一张幻灯片索引
     */
    function getPrevSlideIndex() {
        return (currentSlide - 1 + slides.length) % slides.length;
    }
    
    /**
     * 切换到下一张幻灯片
     * @param {boolean} isAuto - 是否为自动切换
     */
    function nextSlide(isAuto = false) {
        currentSlide = getNextSlideIndex();
        updateSlideStatus();
        
        // 只有在手动切换时才重置计时器
        if (!isAuto) {
            resetInterval();
        }
    }
    
    /**
     * 切换到上一张幻灯片
     */
    function prevSlide() {
        currentSlide = getPrevSlideIndex();
        updateSlideStatus();
        resetInterval();
    }
    
    /**
     * 切换到指定幻灯片
     */
    function goToSlide(index) {
        if (index === currentSlide) return;
        currentSlide = index;
        updateSlideStatus();
        resetInterval();
    }
    
    /**
     * 启动轮播计时器
     * @param {boolean} isAfterManual - 是否在手动切换后调用
     */
    function startSlideInterval(isAfterManual = false) {
        // 清除可能存在的旧计时器
        if (slideInterval) {
            clearInterval(slideInterval);
        }
        
        // 根据是否是手动切换后决定使用哪个时间间隔
        const intervalTime = isAfterManual ? manualWaitTime : autoIntervalTime;
        
        // 创建新的计时器，使用带有isAuto标记的nextSlide
        slideInterval = setInterval(() => {
            // 如果是手动切换后的第一次自动切换，需要重新设置为正常的自动切换间隔
            if (isAfterManual) {
                clearInterval(slideInterval);
                startSlideInterval(false);
            }
            nextSlide(true);
        }, intervalTime);
    }
    
    /**
     * 重置轮播计时器
     */
    function resetInterval() {
        clearInterval(slideInterval);
        startSlideInterval(true); // 传递true表示这是手动切换后的重置
        console.log('🔄 轮播计时器已重置 - 将在15秒后从当前幻灯片(#' + (currentSlide + 1) + ')开始自动切换，之后每8秒切换一次');
    }
} 