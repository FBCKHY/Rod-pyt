/**
 * 技术亮点区块交互脚本 - tech-highlights.js
 * 
 * 描述：处理技术亮点区块的交互效果
 * 用途：实现卡片悬停效果、数据展示和动画
 * 
 * 创建日期：2025-07-10
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化技术亮点区块
    initTechHighlights();
    
    // 初始化AOS动画库
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
});

/**
 * 初始化技术亮点区块
 */
function initTechHighlights() {
    // 获取所有技术亮点卡片
    const techCards = document.querySelectorAll('.tech-highlight-card');
    
    // 为每张卡片添加鼠标移动效果
    techCards.forEach(card => {
        // 添加鼠标进入事件
        card.addEventListener('mouseenter', function() {
            this.addEventListener('mousemove', handleCardMouseMove);
        });
        
        // 添加鼠标离开事件
        card.addEventListener('mouseleave', function() {
            this.removeEventListener('mousemove', handleCardMouseMove);
            resetCardPosition(this);
        });
    });
    
    // 初始化进度条动画
    initProgressBars();
}

/**
 * 处理卡片上的鼠标移动，创建3D效果
 * @param {Event} e - 鼠标事件对象
 */
function handleCardMouseMove(e) {
    const card = this;
    const cardRect = card.getBoundingClientRect();
    
    // 计算鼠标在卡片上的相对位置（从中心点为原点，范围从-1到1）
    const centerX = cardRect.left + cardRect.width / 2;
    const centerY = cardRect.top + cardRect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // 计算旋转角度（最大5度）
    const rotateX = mouseY * -0.005; // 垂直移动影响X轴旋转
    const rotateY = mouseX * 0.005;  // 水平移动影响Y轴旋转
    
    // 应用变换
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
}

/**
 * 重置卡片位置
 * @param {HTMLElement} card - 卡片元素
 */
function resetCardPosition(card) {
    // 平滑过渡回原始位置
    card.style.transform = '';
}

/**
 * 初始化进度条动画
 */
function initProgressBars() {
    const progressBars = document.querySelectorAll('.tech-progress-bar');
    
    // 使用Intersection Observer检测进度条是否进入视口
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const targetWidth = progressBar.getAttribute('data-progress') + '%';
                
                // 设置进度条宽度动画
                setTimeout(() => {
                    progressBar.style.width = targetWidth;
                }, 200);
                
                // 停止观察已经触发的元素
                observer.unobserve(progressBar);
            }
        });
    }, { threshold: 0.2 });
    
    // 开始观察所有进度条
    progressBars.forEach(bar => {
        observer.observe(bar);
    });
} 