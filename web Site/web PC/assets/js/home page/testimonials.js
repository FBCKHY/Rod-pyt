/**
 * 用户评价区块脚本 - testimonials.js
 * 
 * 描述：处理用户评价区块的交互功能
 * 用途：实现评价轮播、动画效果和交互
 * 
 * 创建日期：2025-07-10
 * 最后修改：2025-07-10
 */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    // 初始化用户评价轮播
    initTestimonialsCarousel();
    
    console.log('✨ 用户评价区块初始化完成');
});

/**
 * 初始化用户评价轮播功能
 */
function initTestimonialsCarousel() {
    // 获取轮播元素
    const carousel = document.querySelector('.testimonials-carousel');
    if (!carousel) return;
    
    const track = carousel.querySelector('.testimonials-track');
    const cards = Array.from(track.querySelectorAll('.testimonial-card'));
    const indicators = Array.from(document.querySelectorAll('.testimonial-indicator'));
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    
    // 如果没有卡片，则退出
    if (!cards.length) return;
    
    // 设置初始状态
    let currentPage = 0;
    let cardsPerPage = getCardsPerPage();
    let totalPages = Math.ceil(cards.length / cardsPerPage);
    
    // 更新指示器数量以匹配页数
    updateIndicators();
    
    // 初始化轮播显示
    updateCarouselDisplay();
    
    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize);
    
    // 添加按钮事件监听器
    if (prevBtn) {
        prevBtn.addEventListener('click', goToPrevPage);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', goToNextPage);
    }
    
    // 添加指示器事件监听器
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToPage(index);
        });
    });
    
    // 添加滚动监听器，确保当用户滚动到评价区块时立即显示第一页
    initScrollDetection();
    
    // 启动自动轮播 - 延迟启动，让用户有足够时间查看第一页
    let autoplayInterval;
    setTimeout(() => {
        autoplayInterval = setInterval(goToNextPage, 5000);
    }, 8000); // 8秒后开始自动轮播，给用户足够时间阅读第一页
    
    // 鼠标悬停时暂停自动轮播（扩展到卡片也能触发暂停）
    carousel.addEventListener('mouseenter', pauseAutoplay);
    track.addEventListener('mouseenter', pauseAutoplay);
    cards.forEach(card => {
        card.addEventListener('mouseenter', pauseAutoplay);
    });
    
    // 鼠标离开时恢复自动轮播
    carousel.addEventListener('mouseleave', resumeAutoplay);
    track.addEventListener('mouseleave', resumeAutoplay);
    cards.forEach(card => {
        card.addEventListener('mouseleave', resumeAutoplay);
    });
    
    /**
     * 初始化滚动检测，确保当用户滚动到评价区块时立即显示第一页
     */
    function initScrollDetection() {
        const testimonialSection = document.getElementById('testimonials');
        if (!testimonialSection) return;
        
        // 创建一个Intersection Observer来监视评价区块是否进入视口
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 如果评价区块进入视口，确保显示第一页
                    goToPage(0);
                    // 只触发一次，之后解除观察
                    observer.unobserve(testimonialSection);
                }
            });
        }, {
            // 当评价区块有20%进入视口时触发
            threshold: 0.2
        });
        
        // 开始观察评价区块
        observer.observe(testimonialSection);
    }
    
    /**
     * 暂停自动轮播
     */
    function pauseAutoplay() {
        clearInterval(autoplayInterval);
        // 添加暂停状态类，可用于视觉反馈
        carousel.classList.add('carousel-paused');
    }
    
    /**
     * 恢复自动轮播
     */
    function resumeAutoplay() {
        // 确保没有其他元素仍处于悬停状态
        if (!isAnyCardHovered()) {
            clearInterval(autoplayInterval);
            autoplayInterval = setInterval(goToNextPage, 5000);
            carousel.classList.remove('carousel-paused');
        }
    }
    
    /**
     * 检查是否有任何卡片处于悬停状态
     */
    function isAnyCardHovered() {
        return cards.some(card => card.matches(':hover')) || 
               carousel.matches(':hover') || 
               track.matches(':hover');
    }
    
    // 添加触摸滑动支持
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    /**
     * 处理触摸滑动
     */
    function handleSwipe() {
        const swipeThreshold = 50;
        
        if (touchStartX - touchEndX > swipeThreshold) {
            // 向左滑动，显示下一页
            goToNextPage();
        } else if (touchEndX - touchStartX > swipeThreshold) {
            // 向右滑动，显示上一页
            goToPrevPage();
        }
    }
    
    /**
     * 处理窗口大小变化
     */
    function handleResize() {
        const newCardsPerPage = getCardsPerPage();
        
        // 如果每页卡片数量改变，需要重新计算页数
        if (newCardsPerPage !== cardsPerPage) {
            cardsPerPage = newCardsPerPage;
            totalPages = Math.ceil(cards.length / cardsPerPage);
            
            // 确保当前页在有效范围内
            if (currentPage >= totalPages) {
                currentPage = totalPages - 1;
            }
            
            // 更新指示器
            updateIndicators();
            
            // 更新显示
            updateCarouselDisplay();
        }
    }
    
    /**
     * 根据屏幕宽度获取每页显示的卡片数量
     */
    function getCardsPerPage() {
        const windowWidth = window.innerWidth;
        
        if (windowWidth < 768) {
            return 1; // 手机屏幕显示1个
        } else if (windowWidth < 992) {
            return 2; // 平板显示2个
        } else {
            return 3; // 桌面显示3个
        }
    }
    
    /**
     * 更新轮播显示
     */
    function updateCarouselDisplay() {
        // 计算当前页应该显示哪些卡片
        const startIndex = currentPage * cardsPerPage;
        const endIndex = Math.min(startIndex + cardsPerPage, cards.length);
        
        // 保存当前轮播容器的高度
        const currentHeight = carousel.offsetHeight;
        
        // 隐藏所有卡片
        cards.forEach(card => {
            card.style.display = 'none';
        });
        
        // 显示当前页的卡片
        for (let i = startIndex; i < endIndex; i++) {
            cards[i].style.display = 'flex';
        }
        
        // 确保轮播容器高度不变
        if (currentHeight > 0) {
            carousel.style.minHeight = `${currentHeight}px`;
        }
        
        // 更新指示器状态
        updateIndicatorState();
        
        // 防止页面布局抖动
        preventLayoutShift();
    }
    
    /**
     * 防止页面布局抖动
     */
    function preventLayoutShift() {
        // 确保轮播区域和卡片有稳定的高度
        const testimonialSection = document.getElementById('testimonials');
        if (testimonialSection) {
            // 设置一个足够的延迟，确保DOM更新完成
            setTimeout(() => {
                // 强制重新计算布局
                window.dispatchEvent(new Event('resize'));
            }, 100);
        }
    }
    
    /**
     * 更新指示器状态
     */
    function updateIndicatorState() {
        indicators.forEach((indicator, index) => {
            if (index === currentPage) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    /**
     * 更新指示器数量
     */
    function updateIndicators() {
        // 清除现有指示器
        const indicatorsContainer = document.querySelector('.testimonials-indicators');
        if (!indicatorsContainer) return;
        
        indicatorsContainer.innerHTML = '';
        
        // 创建新的指示器
        for (let i = 0; i < totalPages; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('testimonial-indicator');
            if (i === currentPage) {
                indicator.classList.add('active');
            }
            indicator.dataset.index = i;
            indicator.addEventListener('click', () => {
                goToPage(i);
            });
            
            indicatorsContainer.appendChild(indicator);
        }
        
        // 更新指示器引用
        indicators.length = 0;
        document.querySelectorAll('.testimonial-indicator').forEach(indicator => {
            indicators.push(indicator);
        });
    }
    
    /**
     * 前往上一页
     */
    function goToPrevPage() {
        currentPage = (currentPage - 1 + totalPages) % totalPages;
        updateCarouselDisplay();
    }
    
    /**
     * 前往下一页
     */
    function goToNextPage() {
        currentPage = (currentPage + 1) % totalPages;
        updateCarouselDisplay();
    }
    
    /**
     * 前往指定页
     */
    function goToPage(pageIndex) {
        if (pageIndex >= 0 && pageIndex < totalPages) {
            currentPage = pageIndex;
            updateCarouselDisplay();
        }
    }
} 