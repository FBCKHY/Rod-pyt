/**
 * 关于容电 - 公司介绍区块脚本
 * 
 * 描述：处理公司介绍区块的交互功能
 * 用途：为公司介绍区块提供动画和交互效果
 * 
 * 包含功能：
 * - 数据计数动画
 * - 图片懒加载
 * - 地图标记交互
 * - 全球业务布局效果
 * 
 * 创建日期：2025-07-12
 * 最后修改：2025-07-12
 */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏢 公司介绍区块脚本已加载');
    
    // 初始化数据计数动画
    initCountAnimation();
    
    // 初始化图片懒加载
    initLazyLoading();
    
    // 初始化进度条动画
    initProgressBarAnimation();
    
    // 初始化地图标记动画
    initMapMarkerAnimation();
    
    // 初始化全球数据统计动画
    initGlobalStatsAnimation();
    
    // 初始化全球业务布局卡片
    initGlobalPresenceCards();
    
    // 初始化新版全球业务布局
    initGlobalPresenceRedesign();
});

/**
 * 初始化全新全球业务布局
 */
function initGlobalPresenceRedesign() {
    const globalPresenceRedesign = document.querySelector('.global-presence-redesigned');
    
    if (!globalPresenceRedesign) return;
    
    console.log('✓ 初始化全新全球业务布局');
    
    // 初始化数据卡片动画
    initGpStatCards();
    
    // 初始化地图标记动画
    initGpMapMarkers();
    
    // 初始化数据标签动画
    initGpDataTags();
}

/**
 * 初始化全球业务布局数据卡片动画
 */
function initGpStatCards() {
    const statCards = document.querySelectorAll('.gp-stat-card');
    
    if (!statCards.length) return;
    
    // 创建一个Intersection Observer来检测卡片是否在视口中
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                
                // 如果已经执行过动画，则不再执行
                if (card.classList.contains('animated')) return;
                
                // 添加已动画标记
                card.classList.add('animated');
                
                // 执行入场动画
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    card.style.transition = 'all 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
                
                // 数字计数动画
                const statNumber = card.querySelector('.stat-number');
                if (statNumber) {
                    const numberText = statNumber.textContent;
                    const hasPlus = numberText.includes('+');
                    let targetValue = parseInt(numberText.replace(/\D/g, ''));
                    
                    if (isNaN(targetValue)) return;
                    
                    // 重置数字
                    if (hasPlus) {
                        statNumber.innerHTML = '0<span class="plus">+</span>';
                    } else {
                        statNumber.textContent = '0';
                    }
                    
                    // 执行计数动画
                    animateGpNumber(statNumber, targetValue, 1500, hasPlus);
                }
                
                // 停止观察此元素
                observer.unobserve(card);
            }
        });
    }, {
        threshold: 0.2
    });
    
    // 开始观察卡片
    statCards.forEach(card => {
        observer.observe(card);
    });
}

/**
 * 初始化全球业务布局地图标记动画
 */
function initGpMapMarkers() {
    const mapMarkers = document.querySelectorAll('.gp-marker');
    const mapContainer = document.querySelector('.gp-map-wrapper');
    
    if (!mapMarkers.length || !mapContainer) return;
    
    // 创建一个Intersection Observer来检测地图容器是否在视口中
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            // 依次显示地图标记
            mapMarkers.forEach((marker, index) => {
                setTimeout(() => {
                    marker.style.opacity = '1';
                    marker.style.transform = 'scale(1)';
                }, 500 + (index * 300));
            });
            
            // 停止观察
            observer.unobserve(mapContainer);
        }
    }, {
        threshold: 0.3
    });
    
    // 初始隐藏所有标记
    mapMarkers.forEach(marker => {
        marker.style.opacity = '0';
        marker.style.transform = 'scale(0.5)';
        marker.style.transition = 'all 0.5s ease';
    });
    
    // 开始观察地图容器
    observer.observe(mapContainer);
    
    // 添加鼠标悬停效果
    mapMarkers.forEach(marker => {
        marker.addEventListener('mouseenter', function() {
            const label = this.querySelector('.marker-label');
            const info = this.querySelector('.marker-info');
            
            if (label) label.style.opacity = '1';
            if (info) info.style.opacity = '1';
            
            // 放大点击效果
            const dot = this.querySelector('.marker-dot');
            if (dot) dot.style.transform = 'translate(-50%, -50%) scale(1.2)';
        });
        
        marker.addEventListener('mouseleave', function() {
            const label = this.querySelector('.marker-label');
            const info = this.querySelector('.marker-info');
            
            if (label) label.style.opacity = '0';
            if (info) info.style.opacity = '0';
            
            // 恢复原始大小
            const dot = this.querySelector('.marker-dot');
            if (dot) dot.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });
}

/**
 * 初始化全球业务布局数据标签动画
 */
function initGpDataTags() {
    const dataTags = document.querySelectorAll('.gp-data-tag');
    const mapContainer = document.querySelector('.gp-map-wrapper');
    
    if (!dataTags.length || !mapContainer) return;
    
    // 创建一个Intersection Observer来检测地图容器是否在视口中
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            // 延迟显示数据标签
            setTimeout(() => {
                dataTags.forEach((tag, index) => {
                    setTimeout(() => {
                        tag.style.opacity = '1';
                        tag.style.transform = tag.getAttribute('data-original-transform') || 'rotate(0)';
                    }, 1000 + (index * 200));
                });
            }, 1500);
            
            // 停止观察
            observer.unobserve(mapContainer);
        }
    }, {
        threshold: 0.3
    });
    
    // 初始隐藏所有数据标签
    dataTags.forEach(tag => {
        // 保存原始transform
        const computedStyle = window.getComputedStyle(tag);
        const originalTransform = computedStyle.transform !== 'none' ? computedStyle.transform : 'rotate(0)';
        tag.setAttribute('data-original-transform', originalTransform);
        
        // 设置初始样式
        tag.style.opacity = '0';
        tag.style.transform = 'translateY(20px)';
        tag.style.transition = 'all 0.5s ease';
    });
    
    // 开始观察地图容器
    observer.observe(mapContainer);
    
    // 添加悬停效果
    dataTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) ' + (this.getAttribute('data-original-transform') || 'rotate(0)');
            this.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
            this.style.zIndex = '20';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = this.getAttribute('data-original-transform') || 'rotate(0)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
            this.style.zIndex = '9';
        });
    });
    
    // 添加全球覆盖统计显示效果
    const coverage = document.querySelector('.gp-coverage');
    if (coverage) {
        coverage.style.opacity = '0';
        coverage.style.transform = 'translateY(20px)';
        coverage.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            coverage.style.opacity = '1';
            coverage.style.transform = 'translateY(0)';
        }, 2000);
    }
}

/**
 * 全球业务布局数字动画
 * @param {HTMLElement} element - 要动画的元素
 * @param {number} targetValue - 目标数值
 * @param {number} duration - 动画持续时间（毫秒）
 * @param {boolean} hasPlus - 是否有+号
 */
function animateGpNumber(element, targetValue, duration, hasPlus) {
    let startTime = null;
    const startValue = 0;
    
    function updateCount(timestamp) {
        if (!startTime) startTime = timestamp;
        
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentValue = Math.floor(progress * (targetValue - startValue) + startValue);
        
        // 更新元素内容
        if (hasPlus) {
            element.innerHTML = currentValue + '<span class="plus">+</span>';
        } else {
            element.textContent = currentValue;
        }
        
        // 如果动画未完成，继续请求下一帧
        if (progress < 1) {
            requestAnimationFrame(updateCount);
        }
    }
    
    requestAnimationFrame(updateCount);
}

/**
 * 初始化数据计数动画
 * 数字从0增长到目标值
 */
function initCountAnimation() {
    const dataNumbers = document.querySelectorAll('.counter');
    
    if (!dataNumbers.length) return;
    
    // 创建一个Intersection Observer来检测元素是否在视口中
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 当元素进入视口时
            if (entry.isIntersecting) {
                const element = entry.target;
                const targetValue = parseInt(element.getAttribute('data-count'));
                const duration = 2000; // 动画持续时间（毫秒）
                
                // 如果已经执行过动画，则不再执行
                if (element.classList.contains('counted')) return;
                
                // 标记为已执行动画
                element.classList.add('counted');
                
                // 执行计数动画
                animateCount(element, targetValue, duration);
                
                // 停止观察此元素
                observer.unobserve(element);
            }
        });
    }, {
        threshold: 0.1 // 当元素有10%进入视口时触发
    });
    
    // 开始观察所有数据数字元素
    dataNumbers.forEach(number => {
        observer.observe(number);
    });
}

/**
 * 执行计数动画
 * @param {HTMLElement} element - 要动画的元素
 * @param {number} targetValue - 目标数值
 * @param {number} duration - 动画持续时间（毫秒）
 */
function animateCount(element, targetValue, duration) {
    let startTime = null;
    const startValue = 0;
    
    function updateCount(timestamp) {
        if (!startTime) startTime = timestamp;
        
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentValue = Math.floor(progress * (targetValue - startValue) + startValue);
        
        // 更新元素内容
        element.textContent = currentValue;
        
        // 如果动画未完成，继续请求下一帧
        if (progress < 1) {
            requestAnimationFrame(updateCount);
        }
    }
    
    requestAnimationFrame(updateCount);
}

/**
 * 初始化进度条动画
 */
function initProgressBarAnimation() {
    const progressBars = document.querySelectorAll('.metric-progress .progress-bar');
    
    if (!progressBars.length) return;
    
    // 创建一个Intersection Observer来检测进度条是否在视口中
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 当进度条进入视口时
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                
                // 如果已经执行过动画，则不再执行
                if (progressBar.classList.contains('animated')) return;
                
                // 标记为已执行动画
                progressBar.classList.add('animated');
                
                // 设置初始宽度为0
                progressBar.style.width = '0';
                
                // 延迟一点时间再开始动画，以便用户可以看到动画效果
                setTimeout(() => {
                    // 获取目标宽度
                    const targetWidth = progressBar.getAttribute('style').split('width:')[1].trim();
                    
                    // 重置宽度为0
                    progressBar.style.width = '0';
                    
                    // 设置过渡效果
                    progressBar.style.transition = 'width 1.5s ease';
                    
                    // 延迟一帧再设置目标宽度，以确保过渡效果生效
                    requestAnimationFrame(() => {
                        progressBar.style.width = targetWidth;
                    });
                }, 200);
                
                // 停止观察此元素
                observer.unobserve(progressBar);
            }
        });
    }, {
        threshold: 0.1
    });
    
    // 开始观察所有进度条
    progressBars.forEach(progressBar => {
        observer.observe(progressBar);
    });
}

/**
 * 初始化地图标记动画
 */
function initMapMarkerAnimation() {
    const mapMarkers = document.querySelectorAll('.map-marker');
    
    if (!mapMarkers.length) return;
    
    // 创建一个Intersection Observer来检测地图是否在视口中
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            // 延迟显示标记，以便地图先加载
            setTimeout(() => {
                mapMarkers.forEach((marker, index) => {
                    // 设置延迟，使标记依次显示
                    setTimeout(() => {
                        marker.style.opacity = '1';
                    }, index * 300);
                });
            }, 500);
            
            // 停止观察
            observer.unobserve(entries[0].target);
        }
    }, {
        threshold: 0.5
    });
    
    // 开始观察地图容器
    const presenceMap = document.querySelector('.presence-map');
    if (presenceMap) {
        // 初始隐藏所有标记
        mapMarkers.forEach(marker => {
            marker.style.opacity = '0';
            marker.style.transition = 'opacity 0.5s ease';
        });
        
        observer.observe(presenceMap);
    }
}

/**
 * 初始化全球数据统计动画
 */
function initGlobalStatsAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (!statNumbers.length) return;
    
    // 创建一个Intersection Observer来检测元素是否在视口中
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            statNumbers.forEach((statNumber, index) => {
                // 获取目标数值
                const targetValue = parseInt(statNumber.textContent);
                
                // 重置为0
                statNumber.textContent = '0';
                
                // 延迟开始动画，使数字依次增长
                setTimeout(() => {
                    // 执行计数动画
                    animateStatCount(statNumber, targetValue, 1500);
                }, index * 200);
            });
            
            // 显示卡片
            const statItems = document.querySelectorAll('.stat-item');
            statItems.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 150);
            });
            
            // 停止观察
            observer.unobserve(entries[0].target);
        }
    }, {
        threshold: 0.5
    });
    
    // 开始观察统计容器
    const presenceStats = document.querySelector('.presence-stats');
    if (presenceStats) {
        // 初始隐藏统计卡片
        const statItems = document.querySelectorAll('.stat-item');
        statItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
        });
        
        observer.observe(presenceStats);
    }
}

/**
 * 执行统计数字计数动画
 * @param {HTMLElement} element - 要动画的元素
 * @param {number} targetValue - 目标数值
 * @param {number} duration - 动画持续时间（毫秒）
 */
function animateStatCount(element, targetValue, duration) {
    let startTime = null;
    const startValue = 0;
    
    function updateCount(timestamp) {
        if (!startTime) startTime = timestamp;
        
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentValue = Math.floor(progress * (targetValue - startValue) + startValue);
        
        // 更新元素内容
        if (targetValue > 1000) {
            // 如果是大数字，添加"+"号
            element.textContent = currentValue + '+';
        } else {
            element.textContent = currentValue;
        }
        
        // 如果动画未完成，继续请求下一帧
        if (progress < 1) {
            requestAnimationFrame(updateCount);
        }
    }
    
    requestAnimationFrame(updateCount);
}

/**
 * 初始化图片懒加载
 */
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('.company-info-image img');
    
    if (!lazyImages.length) return;
    
    // 创建一个Intersection Observer来检测图片是否在视口中
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                    
                    // 图片加载完成后添加淡入效果
                    img.addEventListener('load', () => {
                        img.classList.add('loaded');
                    });
                }
                
                // 停止观察此元素
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.1
    });
    
    // 开始观察所有懒加载图片
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}

/**
 * 添加窗口滚动事件监听
 * 用于处理视差效果和其他滚动相关效果
 */
window.addEventListener('scroll', function() {
    // 获取滚动位置
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // 视差效果
    const parallaxElements = document.querySelectorAll('.parallax-element');
    parallaxElements.forEach(element => {
        const speed = element.getAttribute('data-parallax-speed') || 0.2;
        element.style.transform = `translateY(${scrollTop * speed}px)`;
    });
}); 

/**
 * 初始化全球业务布局卡片
 * 确保卡片在页面加载时立即可见
 */
function initGlobalPresenceCards() {
    const presenceContent = document.querySelector('.presence-content');
    const statItems = document.querySelectorAll('.stat-item');
    
    if (!presenceContent || !statItems.length) {
        console.log('⚠️ 未找到全球业务布局元素');
        return;
    }
    
    console.log('✓ 初始化全球业务布局卡片');
    console.log(`找到 ${statItems.length} 个卡片元素`);
    
    // 检查DOM结构
    debugGlobalPresenceCards();
    
    // 确保容器可见
    presenceContent.style.display = 'block';
    
    // 确保卡片元素可见
    statItems.forEach((item, index) => {
        item.style.opacity = '1';
        item.style.visibility = 'visible';
        item.style.display = 'inline-block';
        
        // 添加动态效果
        setTimeout(() => {
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

/**
 * 调试全球业务布局卡片
 * 检查卡片的DOM结构和样式
 */
function debugGlobalPresenceCards() {
    console.log('正在调试全球业务布局卡片...');
    
    // 获取全局业务布局元素
    const globalPresence = document.querySelector('#company-intro .global-presence');
    if (!globalPresence) {
        console.error('未找到 .global-presence 元素');
        return;
    }
    
    // 检查容器
    const presenceContent = globalPresence.querySelector('.presence-content');
    if (!presenceContent) {
        console.error('未找到 .presence-content 元素');
        return;
    }
    
    // 检查统计卡片
    const presenceStats = presenceContent.querySelector('.presence-stats');
    if (!presenceStats) {
        console.error('未找到 .presence-stats 元素');
        return;
    }
    
    // 检查卡片元素
    const statItems = presenceStats.querySelectorAll('.stat-item');
    if (!statItems.length) {
        console.error('未找到 .stat-item 元素');
        return;
    }
    
    console.log(`找到 ${statItems.length} 个卡片元素`);
    
    // 检查每个卡片的内部结构
    statItems.forEach((item, index) => {
        console.log(`卡片 ${index + 1}:`);
        const statNumber = item.querySelector('.stat-number');
        const statText = item.querySelector('.stat-text');
        
        if (!statNumber) {
            console.error(`卡片 ${index + 1} 缺少 .stat-number 元素`);
        }
        
        if (!statText) {
            console.error(`卡片 ${index + 1} 缺少 .stat-text 元素`);
        }
        
        // 检查卡片的样式
        const computedStyle = window.getComputedStyle(item);
        console.log(`  - 显示状态: ${computedStyle.display}`);
        console.log(`  - 可见性: ${computedStyle.visibility}`);
        console.log(`  - 透明度: ${computedStyle.opacity}`);
    });
    
    console.log('调试完成');
    
    // 强制应用样式
    statItems.forEach(item => {
        item.setAttribute('style', 'display: inline-block !important; visibility: visible !important; opacity: 1 !important;');
    });
} 