/**
 * 关于容电 - 公司数据区块脚本
 * 
 * 描述：公司数据区块的交互功能和动画
 * 用途：实现数据展示、图表动画等
 * 
 * 创建日期：2025-07-16
 * 最后修改：2025-07-16
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化数据卡片动画
    initDataCardAnimations();
    
    // 初始化图表动画
    initChartAnimations();
    
    // 监听滚动事件，实现视差效果
    window.addEventListener('scroll', function() {
        animateOnScroll();
    });
});

/**
 * 初始化数据卡片动画
 */
function initDataCardAnimations() {
    // 获取所有数据卡片
    const dataCards = document.querySelectorAll('.data-card-redesigned');
    
    // 设置初始状态
    dataCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // 检查是否在视口中并触发动画
    checkVisibilityAndAnimate(dataCards);
}

/**
 * 初始化图表动画
 */
function initChartAnimations() {
    // 初始化营收增长图表
    initRevenueChart();
    
    // 初始化市场分布图表
    initMarketChart();
    
    // 初始化客户满意度图表
    initSatisfactionChart();
}

/**
 * 初始化营收增长图表
 */
function initRevenueChart() {
    const chartBars = document.querySelectorAll('.chart-bar');
    
    // 设置初始状态
    chartBars.forEach(bar => {
        const targetHeight = bar.getAttribute('data-height');
        bar.style.height = '0';
        bar.style.transition = 'height 1.5s ease';
    });
    
    // 监听滚动，在图表进入视口时触发动画
    const revenueChart = document.querySelector('.revenue-chart');
    if (revenueChart) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 触发柱状图动画
                    setTimeout(() => {
                        chartBars.forEach(bar => {
                            const targetHeight = bar.getAttribute('data-height');
                            bar.style.height = targetHeight;
                        });
                    }, 300);
                    
                    // 停止观察
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(revenueChart);
    }
}

/**
 * 初始化市场分布图表
 */
function initMarketChart() {
    // 这里可以添加市场分布图表的动画效果
    // 例如：饼图的旋转或渐显效果
}

/**
 * 初始化客户满意度图表
 */
function initSatisfactionChart() {
    const satisfactionNeedle = document.querySelector('.satisfaction-needle');
    
    if (satisfactionNeedle) {
        // 设置初始状态
        satisfactionNeedle.style.transform = 'rotate(-45deg)';
        
        // 监听滚动，在图表进入视口时触发动画
        const satisfactionChart = document.querySelector('.satisfaction-chart');
        
        if (satisfactionChart) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // 触发指针动画，根据满意度数值设置旋转角度
                        setTimeout(() => {
                            const satisfactionValue = parseFloat(document.querySelector('.satisfaction-value').textContent);
                            const rotationDegree = calculateRotationDegree(satisfactionValue);
                            satisfactionNeedle.style.transform = `rotate(${rotationDegree}deg)`;
                        }, 300);
                        
                        // 停止观察
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            
            observer.observe(satisfactionChart);
        }
    }
}

/**
 * 根据满意度数值计算指针旋转角度
 * @param {number} value - 满意度百分比
 * @returns {number} - 旋转角度
 */
function calculateRotationDegree(value) {
    // 将百分比转换为-45度到45度之间的角度
    // 0% = -45度, 50% = 0度, 100% = 45度
    return -45 + (value / 100 * 90);
}

/**
 * 滚动时触发动画
 */
function animateOnScroll() {
    // 检查数据卡片是否在视口中
    const dataCards = document.querySelectorAll('.data-card-redesigned');
    checkVisibilityAndAnimate(dataCards);
    
    // 检查图表是否在视口中
    const chartCards = document.querySelectorAll('.chart-card');
    checkVisibilityAndAnimate(chartCards);
    
    // 检查数据比较表是否在视口中
    const comparisonTable = document.querySelector('.comparison-table-container');
    if (comparisonTable) {
        const position = comparisonTable.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (position < screenPosition) {
            comparisonTable.classList.add('animated');
        }
    }
}

/**
 * 检查元素是否在视口中并触发动画
 * @param {NodeList} elements - 要检查的元素列表
 */
function checkVisibilityAndAnimate(elements) {
    elements.forEach((element, index) => {
        const position = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (position < screenPosition) {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100); // 错开动画时间，产生级联效果
        }
    });
}

/**
 * 数字计数动画
 * @param {HTMLElement} element - 包含数字的元素
 * @param {number} target - 目标数值
 * @param {number} duration - 动画持续时间（毫秒）
 */
function animateCounter(element, target, duration) {
    let start = 0;
    const increment = target > 100 ? 1 : 0.1;
    const stepTime = Math.abs(Math.floor(duration / (target / increment)));
    
    const timer = setInterval(() => {
        start += increment;
        element.textContent = target > 100 ? Math.floor(start) : start.toFixed(1);
        
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        }
    }, stepTime);
}

/**
 * 初始化数字计数动画
 */
function initCounters() {
    const counterElements = document.querySelectorAll('.data-value');
    
    counterElements.forEach(counter => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseFloat(counter.getAttribute('data-target'));
                    animateCounter(counter, target, 2000);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
} 