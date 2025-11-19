/**
 * 关于容电 - 年度营收增长趋势卡片增强脚本
 * 
 * 描述：为年度营收增长趋势卡片提供交互功能和动画效果
 * 用途：实现图表动画、工具提示和交互效果
 * 
 * 创建日期：2025-07-25
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化年度营收增长图表
    initRevenueGrowthChart();
    
    // 监听窗口调整大小事件，重新绘制趋势线
    window.addEventListener('resize', function() {
        drawTrendLine();
    });
});

/**
 * 初始化年度营收增长图表
 */
function initRevenueGrowthChart() {
    // 创建工具提示元素
    createTooltip();
    
    // 设置柱状图初始状态和事件监听
    setupBarChart();
    
    // 创建趋势线SVG
    createTrendLineSVG();
    
    // 监听图表容器的可见性
    observeChartVisibility();
}

/**
 * 创建工具提示元素
 */
function createTooltip() {
    // 检查工具提示是否已存在
    if (!document.querySelector('.revenue-growth-tooltip')) {
        const tooltip = document.createElement('div');
        tooltip.className = 'revenue-growth-tooltip';
        tooltip.style.position = 'fixed'; // 使用固定定位而不是绝对定位
        tooltip.style.display = 'none';
        tooltip.style.zIndex = '9999';
        tooltip.style.background = 'rgba(255, 255, 255, 0.95)';
        tooltip.style.borderRadius = '8px';
        tooltip.style.padding = '10px 15px';
        tooltip.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
        tooltip.style.color = '#333';
        tooltip.style.fontSize = '14px';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.minWidth = '180px';
        tooltip.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        document.body.appendChild(tooltip);
    }
}

/**
 * 设置柱状图初始状态和事件监听
 */
function setupBarChart() {
    const bars = document.querySelectorAll('.revenue-bar');
    
    bars.forEach(bar => {
        // 设置初始高度为0
        bar.style.height = '0';
        
        // 添加鼠标悬停事件
        bar.addEventListener('mouseenter', showTooltip);
        bar.addEventListener('mouseleave', hideTooltip);
        bar.addEventListener('mousemove', moveTooltip);
    });
}

/**
 * 创建趋势线SVG
 */
function createTrendLineSVG() {
    const chartContainer = document.querySelector('.revenue-chart-container');
    if (!chartContainer) return;
    
    // 检查是否已存在趋势线SVG
    let trendLine = document.querySelector('.revenue-trend-line');
    if (!trendLine) {
        // 创建SVG元素
        trendLine = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        trendLine.setAttribute('class', 'revenue-trend-line');
        trendLine.setAttribute('width', '100%');
        trendLine.setAttribute('height', '100%');
        
        // 创建路径元素
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'revenue-trend-path');
        trendLine.appendChild(path);
        
        // 添加到图表容器
        chartContainer.appendChild(trendLine);
        
        // 创建趋势点
        const bars = document.querySelectorAll('.revenue-bar');
        bars.forEach(() => {
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('class', 'revenue-trend-dot');
            dot.setAttribute('r', '5');
            trendLine.appendChild(dot);
        });
    }
    
    // 绘制趋势线
    drawTrendLine();
}

/**
 * 绘制趋势线
 */
function drawTrendLine() {
    const bars = document.querySelectorAll('.revenue-bar');
    if (bars.length === 0) return;
    
    const path = document.querySelector('.revenue-trend-path');
    const dots = document.querySelectorAll('.revenue-trend-dot');
    if (!path || dots.length === 0) return;
    
    // 计算每个柱状图顶部的坐标
    const points = [];
    bars.forEach((bar, index) => {
        const barRect = bar.getBoundingClientRect();
        const containerRect = bar.parentElement.getBoundingClientRect();
        
        // 计算相对于容器的坐标
        const x = barRect.left - containerRect.left + barRect.width / 2;
        const y = barRect.top - containerRect.top;
        
        points.push({ x, y });
        
        // 更新趋势点位置
        if (dots[index]) {
            dots[index].setAttribute('cx', x);
            dots[index].setAttribute('cy', y);
        }
    });
    
    // 生成SVG路径
    let pathData = '';
    points.forEach((point, index) => {
        if (index === 0) {
            pathData += `M ${point.x} ${point.y}`;
        } else {
            pathData += ` L ${point.x} ${point.y}`;
        }
    });
    
    // 更新路径
    path.setAttribute('d', pathData);
}

/**
 * 显示工具提示
 * @param {Event} e - 鼠标事件
 */
function showTooltip(e) {
    const bar = e.currentTarget;
    const tooltip = document.querySelector('.revenue-growth-tooltip');
    if (!tooltip) return;
    
    // 获取数据
    const year = bar.querySelector('.revenue-bar-label').textContent;
    const growth = bar.querySelector('.revenue-bar-value').textContent;
    const previousGrowth = getPreviousGrowth(bar);
    const change = calculateChange(growth, previousGrowth);
    
    // 设置工具提示内容
    tooltip.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 5px; color: #074e9c; border-bottom: 1px solid rgba(7, 78, 156, 0.1); padding-bottom: 5px;">
            ${year}年营收增长数据
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #666;">增长率:</span>
            <span style="font-weight: 600; color: #074e9c;">${growth}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="color: #666;">较上年:</span>
            <span style="color: #28a745; font-weight: 600; display: flex; align-items: center;">
                <i class="bi bi-arrow-up-right" style="margin-right: 3px; font-size: 12px;"></i>${change}%
            </span>
        </div>
    `;
    
    // 显示工具提示
    tooltip.style.display = 'block';
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateY(0)';
    
    // 定位工具提示
    moveTooltip(e);
}

/**
 * 隐藏工具提示
 */
function hideTooltip() {
    const tooltip = document.querySelector('.revenue-growth-tooltip');
    if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(10px)';
        
        // 延迟后隐藏元素
        setTimeout(() => {
            tooltip.style.display = 'none';
        }, 300);
    }
}

/**
 * 移动工具提示到鼠标位置
 * @param {Event} e - 鼠标事件
 */
function moveTooltip(e) {
    const tooltip = document.querySelector('.revenue-growth-tooltip');
    if (!tooltip) return;
    
    // 计算位置，避免超出视口
    const x = e.clientX;
    const y = e.clientY;
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // 水平位置
    let left = x + 15;
    if (left + tooltipWidth > windowWidth) {
        left = x - tooltipWidth - 15;
    }
    
    // 垂直位置
    let top = y - tooltipHeight - 15; // 默认显示在鼠标上方
    if (top < 10) {
        top = y + 15; // 如果上方空间不足，则显示在鼠标下方
    }
    
    // 设置位置
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

/**
 * 获取前一年的增长率
 * @param {HTMLElement} currentBar - 当前柱状图元素
 * @returns {string} 前一年增长率
 */
function getPreviousGrowth(currentBar) {
    const bars = Array.from(document.querySelectorAll('.revenue-bar'));
    const currentIndex = bars.indexOf(currentBar);
    
    if (currentIndex > 0) {
        const previousBar = bars[currentIndex - 1];
        return previousBar.querySelector('.revenue-bar-value').textContent;
    }
    
    return '0%';
}

/**
 * 计算增长变化
 * @param {string} current - 当前增长率
 * @param {string} previous - 前一年增长率
 * @returns {string} 变化百分比
 */
function calculateChange(current, previous) {
    const currentValue = parseFloat(current);
    const previousValue = parseFloat(previous);
    
    if (previousValue === 0) return '0.0';
    
    const change = currentValue - previousValue;
    return change.toFixed(1);
}

/**
 * 监听图表容器的可见性
 */
function observeChartVisibility() {
    const chartContainer = document.querySelector('.revenue-chart-container');
    if (!chartContainer) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 触发柱状图动画
                animateBars();
                
                // 停止观察
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    observer.observe(chartContainer);
}

/**
 * 触发柱状图动画
 */
function animateBars() {
    const bars = document.querySelectorAll('.revenue-bar');
    
    bars.forEach((bar, index) => {
        // 延迟执行，产生级联效果
        setTimeout(() => {
            // 设置高度
            const height = bar.getAttribute('data-height');
            bar.style.height = height;
            
            // 添加动画类
            bar.classList.add('animated');
            
            // 如果是最后一个柱状图，触发趋势线动画
            if (index === bars.length - 1) {
                setTimeout(() => {
                    animateTrendLine();
                }, 500);
            }
        }, index * 200);
    });
}

/**
 * 触发趋势线动画
 */
function animateTrendLine() {
    const path = document.querySelector('.revenue-trend-path');
    const dots = document.querySelectorAll('.revenue-trend-dot');
    
    if (path) {
        path.classList.add('animated');
    }
    
    if (dots.length > 0) {
        dots.forEach((dot, index) => {
            setTimeout(() => {
                dot.classList.add('animated');
            }, index * 200);
        });
    }
} 