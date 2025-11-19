/**
 * 核心产品区块脚本 - core-products.js
 * 
 * 描述：为核心产品区块添加交互效果
 * 用途：增强用户体验，提供产品展示动效
 * 
 * 包含内容：
 * - 产品卡片悬停效果
 * - 产品图片3D旋转效果
 * - 视差滚动效果
 * - 容器丝滑变大变小动画
 * 
 * 创建日期：2025-07-10
 * 最后修改：2025-07-10
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('✨ 核心产品区块初始化完成');
    initCoreProducts();
});

/**
 * 初始化核心产品区块
 */
function initCoreProducts() {
    // 初始化产品卡片3D效果
    initProductCards();
    
    // 初始化产品图片视差效果
    initParallaxImages();
    
    // 初始化按钮特效
    initButtonEffects();
    
    // 初始化容器动画效果
    initContainerAnimation();
}

/**
 * 初始化容器动画效果
 */
function initContainerAnimation() {
    const container = document.querySelector('#core-products > div.container');
    if (!container) return;
    
    // 移除动画类
    // container.classList.add('animate-scale-up');
    
    // 监听鼠标进入容器事件
    container.addEventListener('mouseenter', function() {
        // 添加鼠标跟随效果（仅光晕）
        this.addEventListener('mousemove', handleMouseMove);
    });
    
    // 监听鼠标离开容器事件
    container.addEventListener('mouseleave', function() {
        // 重置鼠标位置变量
        this.style.setProperty('--mouse-x', '50%');
        this.style.setProperty('--mouse-y', '50%');
        
        // 移除鼠标跟随效果
        this.removeEventListener('mousemove', handleMouseMove);
    });
    
    // 鼠标移动处理函数
    function handleMouseMove(e) {
        const rect = this.getBoundingClientRect();
        
        // 计算鼠标位置相对于容器的百分比
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // 更新CSS变量，仅用于光晕跟随效果
        const mouseXPercent = (mouseX / rect.width) * 100;
        const mouseYPercent = (mouseY / rect.height) * 100;
        this.style.setProperty('--mouse-x', `${mouseXPercent}%`);
        this.style.setProperty('--mouse-y', `${mouseYPercent}%`);
    }
    
    // 初始化"查看全部产品"按钮效果
    initViewAllButton();
}

/**
 * 初始化"查看全部产品"按钮效果
 */
function initViewAllButton() {
    const viewAllButton = document.querySelector('.core-products-view-all');
    if (!viewAllButton) return;
    
    // 鼠标进入按钮时的效果
    viewAllButton.addEventListener('mouseenter', function(e) {
        // 创建光晕跟随效果
        this.addEventListener('mousemove', handleButtonMouseMove);
    });
    
    // 鼠标离开按钮时的效果
    viewAllButton.addEventListener('mouseleave', function() {
        this.removeEventListener('mousemove', handleButtonMouseMove);
    });
    
    // 按钮点击效果
    viewAllButton.addEventListener('click', function(e) {
        // 创建点击波纹效果
        const ripple = document.createElement('span');
        ripple.classList.add('button-ripple');
        this.appendChild(ripple);
        
        // 设置波纹位置
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        // 移除波纹元素
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
    
    // 按钮鼠标移动处理函数
    function handleButtonMouseMove(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 计算鼠标在按钮上的相对位置（百分比）
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        
        // 创建光晕效果跟随鼠标
        this.style.setProperty('--x-pos', `${xPercent}%`);
        this.style.setProperty('--y-pos', `${yPercent}%`);
    }
}

/**
 * 初始化产品卡片3D效果
 */
function initProductCards() {
    // 此处代码已禁用，以移除产品卡片的悬停动画效果。
    /*
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // 鼠标移入卡片时的效果，使用RAF实现更平滑的过渡
        card.addEventListener('mouseenter', function(e) {
            // 使用requestAnimationFrame实现更平滑的过渡
            requestAnimationFrame(() => {
                // 简单的上浮效果
                this.style.transform = 'translateY(-3px)';
                
                // 获取卡片内的图片元素
                const image = this.querySelector('.product-image');
                if (image) {
                    image.style.transform = 'scale(1)';
                }
            });
        });
        
        // 鼠标离开卡片时的效果
        card.addEventListener('mouseleave', function() {
            // 使用requestAnimationFrame实现更平滑的过渡
            requestAnimationFrame(() => {
                this.style.transform = '';
                
                // 重置图片样式
                const image = this.querySelector('.product-image');
                if (image) {
                    image.style.transform = 'scale(0.95)';
                }
            });
        });
    });
    */
}

/**
 * 初始化产品图片视差效果
 */
function initParallaxImages() {
    const productImages = document.querySelectorAll('.product-image');
    
    // 监听滚动事件，为图片添加视差效果
    window.addEventListener('scroll', function() {
        productImages.forEach(image => {
            const rect = image.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // 检查图片是否在视口中
            if (rect.top < windowHeight && rect.bottom > 0) {
                // 计算图片在视口中的位置比例
                const scrollPosition = (windowHeight - rect.top) / (windowHeight + rect.height);
                
                // 应用极微小的平移效果，移除 scale(0.95)
                const translateY = (scrollPosition - 0.5) * 5; // 从10px减小到5px
                image.style.transform = `translateY(${translateY}px)`;
            }
        });
    });
}

/**
 * 初始化按钮特效
 */
function initButtonEffects() {
    const productButtons = document.querySelectorAll('.product-button');
    
    productButtons.forEach(button => {
        // 鼠标移入按钮时的效果
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
            this.style.boxShadow = '0 6px 15px rgba(212, 175, 55, 0.4)';
        });
        
        // 鼠标离开按钮时的效果
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
        
        // 点击按钮时的效果
        button.addEventListener('click', function(e) {
            // 创建波纹效果
            const ripple = document.createElement('span');
            ripple.classList.add('button-ripple');
            this.appendChild(ripple);
            
            // 设置波纹位置
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            // 移除波纹元素
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
} 