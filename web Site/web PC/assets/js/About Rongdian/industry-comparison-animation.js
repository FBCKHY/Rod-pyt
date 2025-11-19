/**
 * 关于容电 - 行业对比表格动画效果
 * 
 * 描述：为行业对比表格添加交互效果和动画
 * 用途：提升用户体验和数据可视化效果
 * 
 * 创建日期：2025-07-20
 * 更新日期：2025-07-21 - 修复动画和提示问题
 * 更新日期：2025-07-23 - 修复鼠标悬浮动画问题
 * 更新日期：2025-07-24 - 修复提示框显示位置和事件冒泡问题
 * 更新日期：2025-07-25 - 重写提示框显示逻辑，使用固定定位
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化行业对比表格动画
    initIndustryComparisonAnimation();
    
    // 初始化数据对比可视化
    initDataComparisonVisuals();
    
    // 初始化滚动触发动画
    initScrollTriggerAnimation();
});

/**
 * 初始化行业对比表格动画
 */
function initIndustryComparisonAnimation() {
    const comparisonTable = document.querySelector('.comparison-table');
    
    if (!comparisonTable) return;
    
    // 为表格行添加鼠标进入/离开事件
    const tableRows = comparisonTable.querySelectorAll('tbody tr');
    
    // 创建全局提示框元素
    const globalTip = document.createElement('div');
    globalTip.className = 'comparison-tip';
    document.body.appendChild(globalTip);
    
    tableRows.forEach((row, index) => {
        // 添加延迟加载动画
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
        row.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // 延迟显示每一行
        setTimeout(() => {
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, 100 + index * 100); // 减少延迟时间
        
        // 添加鼠标进入事件
        row.addEventListener('mouseenter', function(e) {
            // 防止事件冒泡
            e.stopPropagation();
            
            // 高亮当前行
            this.style.zIndex = '5';
            
            // 获取高亮数据单元格
            const highlightCell = this.querySelector('.highlight');
            if (highlightCell) {
                // 添加脉冲动画
                highlightCell.classList.add('pulse-animation');
                
                // 显示数据比较提示
                showDataComparison(this, globalTip);
            }
        });
        
        // 添加鼠标离开事件
        row.addEventListener('mouseleave', function(e) {
            // 防止事件冒泡
            e.stopPropagation();
            
            // 恢复z-index
            this.style.zIndex = '1';
            
            // 获取高亮数据单元格
            const highlightCell = this.querySelector('.highlight');
            if (highlightCell) {
                // 移除脉冲动画
                highlightCell.classList.remove('pulse-animation');
                
                // 隐藏数据比较提示
                hideDataComparison(globalTip);
            }
        });
    });
    
    // 为表头添加动画效果
    const tableHeaders = comparisonTable.querySelectorAll('th');
    
    tableHeaders.forEach((header, index) => {
        // 添加延迟加载动画
        header.style.opacity = '0';
        header.style.transform = 'translateY(-10px)';
        header.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // 延迟显示每个表头
        setTimeout(() => {
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 100 + index * 80); // 减少延迟时间
    });
    
    // 添加CSS类用于脉冲动画
    if (!document.getElementById('comparison-animation-style')) {
        const style = document.createElement('style');
        style.id = 'comparison-animation-style';
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            .pulse-animation {
                animation: pulse 1.5s infinite ease-in-out;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * 显示数据比较提示
 * @param {HTMLElement} row - 表格行元素
 * @param {HTMLElement} tipElement - 全局提示框元素
 */
function showDataComparison(row, tipElement) {
    // 获取容电科技数据和行业平均数据
    const companyData = row.querySelector('td:nth-child(2)').textContent;
    const industryData = row.querySelector('td:nth-child(3)').textContent;
    const indicator = row.querySelector('td:first-child').textContent;
    
    // 计算差异百分比
    let companyValue = parseFloat(companyData.replace(/[^0-9.]/g, ''));
    let industryValue = parseFloat(industryData.replace(/[^0-9.]/g, ''));
    
    if (!isNaN(companyValue) && !isNaN(industryValue) && industryValue !== 0) {
        const difference = companyValue - industryValue;
        const percentDifference = ((difference / industryValue) * 100).toFixed(1);
        const isPositive = difference > 0;
        
        tipElement.innerHTML = `
            <strong>${indicator}</strong>: 容电科技领先行业平均 
            <span style="color: ${isPositive ? '#4caf50' : '#f44336'}; font-weight: bold;">
                ${isPositive ? '+' : ''}${percentDifference}%
            </span>
        `;
    } else {
        tipElement.textContent = `${indicator}: 容电科技 ${companyData} vs 行业平均 ${industryData}`;
    }
    
    // 计算位置
    const rowRect = row.getBoundingClientRect();
    const rowCenterX = rowRect.left + (rowRect.width / 2);
    const rowTopY = rowRect.top;
    
    // 设置提示框位置
    tipElement.style.left = `${rowCenterX}px`;
    tipElement.style.top = `${rowTopY}px`;
    
    // 显示提示框
    tipElement.classList.add('visible');
}

/**
 * 隐藏数据比较提示
 * @param {HTMLElement} tipElement - 全局提示框元素
 */
function hideDataComparison(tipElement) {
    tipElement.classList.remove('visible');
}

/**
 * 初始化数据对比可视化
 */
function initDataComparisonVisuals() {
    const comparisonTable = document.querySelector('.comparison-table');
    
    if (!comparisonTable) return;
    
    // 获取所有数据行
    const tableRows = comparisonTable.querySelectorAll('tbody tr');
    
    tableRows.forEach(row => {
        // 获取容电科技数据和行业平均数据
        const companyCell = row.querySelector('td:nth-child(2)');
        const industryCell = row.querySelector('td:nth-child(3)');
        
        if (companyCell && industryCell) {
            const companyData = parseFloat(companyCell.textContent.replace(/[^0-9.]/g, ''));
            const industryData = parseFloat(industryCell.textContent.replace(/[^0-9.]/g, ''));
            
            if (!isNaN(companyData) && !isNaN(industryData) && industryData !== 0) {
                // 计算差异
                const difference = companyData - industryData;
                const ratio = companyData / industryData;
                
                // 添加视觉指示器
                if (difference > 0) {
                    // 容电数据大于行业平均
                    companyCell.style.position = 'relative';
                    
                    // 创建背景条
                    const bgBar = document.createElement('div');
                    bgBar.className = 'comparison-bg-bar';
                    bgBar.style.cssText = `
                        position: absolute;
                        top: 0;
                        left: 0;
                        height: 100%;
                        width: 0;
                        background: linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0) 100%);
                        z-index: -1;
                        transition: width 1s ease-out;
                        pointer-events: none;
                    `;
                    
                    companyCell.appendChild(bgBar);
                    
                    // 设置背景条宽度（基于比率，最大100%）
                    setTimeout(() => {
                        const maxWidth = Math.min(ratio * 40, 100); // 减少宽度比例
                        bgBar.style.width = `${maxWidth}%`;
                    }, 500);
                }
            }
        }
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
    
    // 获取表格容器
    const comparisonTableContainer = document.querySelector('.comparison-table-container');
    
    if (!comparisonTableContainer) return;
    
    // 标记是否已经触发动画
    let animated = false;
    
    // 滚动事件处理函数
    function onScroll() {
        if (!animated && isElementInViewport(comparisonTableContainer)) {
            animated = true;
            
            // 添加动画类
            comparisonTableContainer.classList.add('animated-in');
            
            // 触发行交错动画
            const tableRows = comparisonTableContainer.querySelectorAll('tbody tr');
            tableRows.forEach((row, index) => {
                setTimeout(() => {
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0)';
                }, 100 + index * 100);
            });
            
            // 触发表头动画
            const tableHeaders = comparisonTableContainer.querySelectorAll('th');
            tableHeaders.forEach((header, index) => {
                setTimeout(() => {
                    header.style.opacity = '1';
                    header.style.transform = 'translateY(0)';
                }, 100 + index * 80);
            });
        }
    }
    
    // 添加滚动事件监听
    window.addEventListener('scroll', onScroll);
    
    // 初始检查（页面加载时）
    setTimeout(onScroll, 500);
} 