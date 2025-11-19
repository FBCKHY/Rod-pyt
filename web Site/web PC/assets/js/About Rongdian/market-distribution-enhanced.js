/**
 * 关于容电 - 市场分布图表增强动画效果
 * 
 * 描述：为增强版市场分布图表添加交互效果和动画
 * 用途：提升用户体验和数据可视化效果
 * 
 * 创建日期：2025-07-26
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化增强版市场分布图表
    initEnhancedMarketDistribution();
    
    // 初始化滚动触发动画
    initScrollTriggerAnimation();
});

/**
 * 初始化增强版市场分布图表
 */
function initEnhancedMarketDistribution() {
    // 查找市场分布卡片
    const marketCard = document.querySelector('.market-distribution-card');
    
    if (!marketCard) return;
    
    // 初始化世界地图
    initWorldMap(marketCard);
    
    // 初始化分布点
    initDistributionPoints(marketCard);
    
    // 添加交互效果
    addInteractionEffects(marketCard);
}

/**
 * 初始化世界地图
 * @param {HTMLElement} card - 市场分布卡片元素
 */
function initWorldMap(card) {
    const mapContainer = card.querySelector('.world-map-container');
    
    if (!mapContainer) return;
    
    // 创建简化的世界地图SVG
    const worldMapSVG = `
        <svg class="world-map" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
            <path fill="#ffffff" d="M181.7,102.4c-1.5,0.3-3.1,0.6-4.6,0.9c0.2,1.1,0.5,2.2,0.7,3.3c1.3-0.3,2.6-0.5,3.9-0.8C181.7,104.6,181.7,103.5,181.7,102.4z"/>
            <path fill="#ffffff" d="M844.2,191c-1,0.3-2,0.6-3,0.9c0.2,1.1,0.5,2.2,0.7,3.3c1-0.3,2-0.5,3-0.8C844.7,193.2,844.4,192.1,844.2,191z"/>
            <path fill="#ffffff" d="M832.2,180c-1,0.3-2,0.6-3,0.9c0.2,1.1,0.5,2.2,0.7,3.3c1-0.3,2-0.5,3-0.8C832.7,182.2,832.4,181.1,832.2,180z"/>
            <path fill="#ffffff" d="M291.7,163.4c-1.5,0.3-3.1,0.6-4.6,0.9c0.2,1.1,0.5,2.2,0.7,3.3c1.3-0.3,2.6-0.5,3.9-0.8C291.7,165.6,291.7,164.5,291.7,163.4z"/>
            <path fill="#ffffff" d="M304.7,175.4c-1.5,0.3-3.1,0.6-4.6,0.9c0.2,1.1,0.5,2.2,0.7,3.3c1.3-0.3,2.6-0.5,3.9-0.8C304.7,177.6,304.7,176.5,304.7,175.4z"/>
            <path fill="#ffffff" d="M124.7,236.4c-1.5,0.3-3.1,0.6-4.6,0.9c0.2,1.1,0.5,2.2,0.7,3.3c1.3-0.3,2.6-0.5,3.9-0.8C124.7,238.6,124.7,237.5,124.7,236.4z"/>
            <path fill="#ffffff" d="M798.7,242.4c-1.5,0.3-3.1,0.6-4.6,0.9c0.2,1.1,0.5,2.2,0.7,3.3c1.3-0.3,2.6-0.5,3.9-0.8C798.7,244.6,798.7,243.5,798.7,242.4z"/>
            <path fill="#ffffff" d="M889.7,227.4c-1.5,0.3-3.1,0.6-4.6,0.9c0.2,1.1,0.5,2.2,0.7,3.3c1.3-0.3,2.6-0.5,3.9-0.8C889.7,229.6,889.7,228.5,889.7,227.4z"/>
            <path fill="#ffffff" d="M500.7,227.4c-1.5,0.3-3.1,0.6-4.6,0.9c0.2,1.1,0.5,2.2,0.7,3.3c1.3-0.3,2.6-0.5,3.9-0.8C500.7,229.6,500.7,228.5,500.7,227.4z"/>
            <path fill="#ffffff" d="M250,150 Q400,50 550,150 T850,150 T950,250 T850,350 T550,350 T250,350 T150,250 T250,150" stroke="#ffffff" stroke-width="1" fill="none"/>
            <path fill="#ffffff" d="M150,250 Q200,200 250,250 T350,250 T450,250 T550,250 T650,250 T750,250 T850,250" stroke="#ffffff" stroke-width="1" fill="none"/>
        </svg>
    `;
    
    // 添加世界地图到容器
    mapContainer.innerHTML += worldMapSVG;
}

/**
 * 初始化分布点
 * @param {HTMLElement} card - 市场分布卡片元素
 */
function initDistributionPoints(card) {
    const mapContainer = card.querySelector('.world-map-container');
    
    if (!mapContainer) return;
    
    // 国内市场分布点位置（相对于容器的百分比）
    const domesticPoints = [
        { x: 75, y: 35 },
        { x: 78, y: 40 },
        { x: 80, y: 38 },
        { x: 76, y: 42 },
        { x: 79, y: 36 },
        { x: 77, y: 39 },
        { x: 81, y: 41 },
        { x: 82, y: 37 }
    ];
    
    // 海外市场分布点位置（相对于容器的百分比）
    const overseasPoints = [
        { x: 20, y: 35 },
        { x: 30, y: 40 },
        { x: 40, y: 30 },
        { x: 50, y: 45 },
        { x: 60, y: 35 },
        { x: 70, y: 25 },
        { x: 85, y: 50 },
        { x: 25, y: 60 },
        { x: 45, y: 65 },
        { x: 65, y: 60 },
        { x: 15, y: 45 },
        { x: 90, y: 30 }
    ];
    
    // 添加国内市场分布点
    domesticPoints.forEach((point, index) => {
        const pointElement = document.createElement('div');
        pointElement.className = 'distribution-point domestic';
        pointElement.style.left = `${point.x}%`;
        pointElement.style.top = `${point.y}%`;
        pointElement.style.animationDelay = `${index * 0.2}s`;
        mapContainer.appendChild(pointElement);
    });
    
    // 添加海外市场分布点
    overseasPoints.forEach((point, index) => {
        const pointElement = document.createElement('div');
        pointElement.className = 'distribution-point overseas';
        pointElement.style.left = `${point.x}%`;
        pointElement.style.top = `${point.y}%`;
        pointElement.style.animationDelay = `${index * 0.15}s`;
        mapContainer.appendChild(pointElement);
    });
}

/**
 * 添加交互效果
 * @param {HTMLElement} card - 市场分布卡片元素
 */
function addInteractionEffects(card) {
    const dataItems = card.querySelectorAll('.market-data-item');
    
    dataItems.forEach(item => {
        // 鼠标进入效果
        item.addEventListener('mouseenter', function() {
            const value = this.querySelector('.market-data-value');
            
            if (value) {
                value.style.transform = 'scale(1.1)';
                value.style.textShadow = '0 2px 15px rgba(255, 215, 0, 0.7)';
            }
            
            // 突出显示相应的分布点
            const isDomestic = this.classList.contains('domestic');
            const pointsToHighlight = isDomestic ? 
                card.querySelectorAll('.distribution-point.domestic') : 
                card.querySelectorAll('.distribution-point.overseas');
            
            pointsToHighlight.forEach(point => {
                point.style.transform = 'translate(-50%, -50%) scale(1.5)';
                point.style.opacity = '1';
                point.style.boxShadow = isDomestic ? 
                    '0 0 15px rgba(7, 78, 156, 0.8)' : 
                    '0 0 15px rgba(255, 215, 0, 0.8)';
            });
        });
        
        // 鼠标离开效果
        item.addEventListener('mouseleave', function() {
            const value = this.querySelector('.market-data-value');
            
            if (value) {
                value.style.transform = 'scale(1)';
                value.style.textShadow = '0 2px 10px rgba(255, 215, 0, 0.4)';
            }
            
            // 恢复分布点样式
            const isDomestic = this.classList.contains('domestic');
            const pointsToReset = isDomestic ? 
                card.querySelectorAll('.distribution-point.domestic') : 
                card.querySelectorAll('.distribution-point.overseas');
            
            pointsToReset.forEach(point => {
                point.style.transform = '';
                point.style.opacity = '';
                point.style.boxShadow = '';
            });
        });
    });
}

/**
 * 初始化滚动触发动画
 */
function initScrollTriggerAnimation() {
    // 检测元素是否在视口内
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    // 获取市场分布卡片
    const marketCard = document.querySelector('.market-distribution-card');
    
    if (!marketCard) return;
    
    // 标记是否已经触发动画
    let animated = false;
    
    // 滚动事件处理函数
    function onScroll() {
        if (!animated && isElementInViewport(marketCard)) {
            animated = true;
            
            // 获取数据值元素
            const domesticValue = marketCard.querySelector('.domestic .market-data-value');
            const overseasValue = marketCard.querySelector('.overseas .market-data-value');
            const countriesValue = marketCard.querySelector('.countries-regions-value');
            
            // 添加数值计数动画
            if (domesticValue) {
                const targetValue = parseInt(domesticValue.getAttribute('data-value') || '65');
                animateCounter(domesticValue, targetValue);
            }
            
            if (overseasValue) {
                const targetValue = parseInt(overseasValue.getAttribute('data-value') || '35');
                animateCounter(overseasValue, targetValue);
                
                // 延迟显示海外分布点
                setTimeout(() => {
                    const overseasPoints = marketCard.querySelectorAll('.distribution-point.overseas');
                    overseasPoints.forEach((point, index) => {
                        setTimeout(() => {
                            point.style.opacity = '0.7';
                        }, index * 100);
                    });
                }, 500);
            }
            
            if (countriesValue) {
                const targetValue = parseInt(countriesValue.getAttribute('data-value') || '50');
                animateCounter(countriesValue, targetValue);
            }
            
            // 延迟显示国内分布点
            setTimeout(() => {
                const domesticPoints = marketCard.querySelectorAll('.distribution-point.domestic');
                domesticPoints.forEach((point, index) => {
                    setTimeout(() => {
                        point.style.opacity = '0.7';
                    }, index * 100);
                });
            }, 300);
        }
    }
    
    // 添加滚动事件监听
    window.addEventListener('scroll', onScroll);
    
    // 初始检查（页面加载时）
    setTimeout(onScroll, 500);
}

/**
 * 数值计数动画
 * @param {HTMLElement} element - 显示数值的元素
 * @param {number} targetValue - 目标数值
 */
function animateCounter(element, targetValue) {
    // 设置初始值
    let startValue = 0;
    let currentValue = startValue;
    const duration = 1500; // 动画持续时间（毫秒）
    const startTime = performance.now();
    
    // 更新函数
    function updateCounter(timestamp) {
        // 计算动画进度
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数使动画更自然
        const easedProgress = easeOutQuart(progress);
        
        // 计算当前值
        currentValue = Math.round(startValue + (targetValue - startValue) * easedProgress);
        
        // 更新DOM
        element.textContent = currentValue;
        
        // 如果动画未完成，继续请求动画帧
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            // 动画完成后添加百分号（如果需要）
            if (element.nextElementSibling && element.nextElementSibling.classList.contains('market-data-percent')) {
                element.textContent = targetValue;
            }
        }
    }
    
    // 启动动画
    requestAnimationFrame(updateCounter);
}

/**
 * 缓出四次方缓动函数
 * @param {number} x - 进度值（0-1）
 * @returns {number} 缓动后的值
 */
function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
} 