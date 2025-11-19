/**
 * 产品中心主页面脚本 - product-main.js
 * 
 * 描述：提供产品中心主页面的交互功能，包括产品卡片动效、筛选跳转等
 * 
 * 包含功能：
 * - 产品卡片交互效果
 * - 热门产品展示
 * - 动态加载产品数据
 * - 产品分类筛选
 * 
 * 创建日期：2023-07-15
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    console.log("🚀 产品中心页面脚本已加载");
    
    // 初始化产品卡片交互效果
    initProductCards();
    
    // 初始化动态效果
    initDynamicEffects();
    
    // 初始化数据
    initProductData();
    
    // 初始化分类筛选
    initCategoryLinks();
});

/**
 * 初始化产品卡片交互效果
 */
function initProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // 鼠标移入效果增强
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '1';
        });
        
        // 添加"查看详情"按钮点击事件
        const viewDetailBtn = card.querySelector('.btn-view-detail');
        if (viewDetailBtn) {
            viewDetailBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const productName = card.querySelector('.product-title').textContent;
                console.log(`点击查看产品: ${productName}`);
                // 在实际环境中，这里应该导航到产品详情页，传递产品ID
                // 示例: window.location.href = `product-detail.html?id=${productId}`;
                
                // 开发阶段，显示消息
                alert(`即将跳转到产品详情页: ${productName}`);
            });
        }
        
        // 添加快速操作按钮点击事件
        const actionBtns = card.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const action = this.querySelector('i').classList.contains('bi-eye') ? '查看' : 
                              this.querySelector('i').classList.contains('bi-heart') ? '收藏' : '分享';
                const productName = card.querySelector('.product-title').textContent;
                console.log(`${action}产品: ${productName}`);
                
                // 开发阶段，显示消息
                if (action !== '查看') {
                    alert(`${action}产品: ${productName}`);
                }
            });
        });
    });
}

/**
 * 初始化动态效果
 */
function initDynamicEffects() {
    // 为产品分类卡片添加动画效果
    document.querySelectorAll('.category-card').forEach((card, index) => {
        // 延迟加载效果
        setTimeout(() => {
            card.classList.add('loaded');
        }, index * 100);
        
        // 为查看更多按钮添加事件
        const viewMoreBtn = card.querySelector('.btn-view-more');
        if (viewMoreBtn) {
            viewMoreBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const categoryTitle = card.querySelector('.category-title').textContent;
                console.log(`点击查看更多: ${categoryTitle}`);
                
                // 根据分类设置URL参数
                let categoryParam = '';
                let subcategoryParam = '';
                
                // 根据分类标题确定对应的子类别
                if (categoryTitle.includes('抽油烟机')) {
                    subcategoryParam = 'range-hood';
                } else if (categoryTitle.includes('燃气灶')) {
                    subcategoryParam = 'gas-stove';
                } else if (categoryTitle.includes('热水器')) {
                    subcategoryParam = 'water-heater';
                } else if (categoryTitle.includes('智能厨电')) {
                    categoryParam = 'smart-home'; // 这是主类别
                } else {
                    // 默认不设置筛选参数
                }
                
                // 构建URL
                let targetUrl = './product-catalog.html';
                if (categoryParam || subcategoryParam) {
                    targetUrl += '?';
                    if (categoryParam) {
                        targetUrl += `category=${categoryParam}`;
                    }
                    if (subcategoryParam) {
                        targetUrl += `${categoryParam ? '&' : ''}subcategory=${subcategoryParam}`;
                    }
                }
                
                // 跳转到产品目录页面
                window.location.href = targetUrl;
            });
        }
    });
    
    // 添加服务承诺项目悬停效果
    document.querySelectorAll('.promise-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            // 添加波纹动画效果
            const ripple = document.createElement('span');
            ripple.classList.add('promise-ripple');
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 1000);
        });
    });
    
    // 为筛选入口添加点击事件
    const filterButton = document.querySelector('.product-filter-section .btn');
    if (filterButton) {
        filterButton.addEventListener('click', function(e) {
            // 不再阻止默认行为，让链接正常工作
            console.log('点击进入产品筛选');
            // 如果需要手动跳转，可以使用下面的代码
            // window.location.href = './product-catalog.html';
        });
    }
}

/**
 * 初始化产品数据
 * 注：在实际项目中，这里应该从API获取数据并动态渲染
 */
function initProductData() {
    // 这里模拟产品加载完成后的处理
    console.log('产品数据加载完成');
    
    // 添加产品价格区域的动态效果
    document.querySelectorAll('.product-price').forEach(priceBlock => {
        const currentPrice = priceBlock.querySelector('.current-price');
        const originalPrice = priceBlock.querySelector('.original-price');
        
        if (currentPrice && originalPrice) {
            // 计算折扣并显示
            const current = parseFloat(currentPrice.textContent.replace('¥', '').replace(',', ''));
            const original = parseFloat(originalPrice.textContent.replace('¥', '').replace(',', ''));
            
            if (!isNaN(current) && !isNaN(original) && original > current) {
                const discount = Math.round((1 - current / original) * 100);
                const discountTag = document.createElement('span');
                discountTag.classList.add('discount-tag');
                discountTag.textContent = `-${discount}%`;
                priceBlock.appendChild(discountTag);
            }
        }
    });
}

/**
 * 初始化分类链接
 */
function initCategoryLinks() {
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            // 移除所有标签的active类
            document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
            // 为当前标签添加active类
            this.classList.add('active');
            
            const category = this.dataset.category;
            console.log(`筛选分类: ${category}`);
            
            // 在实际应用中，这里应该根据选择的分类筛选产品列表
            // 开发阶段，显示筛选消息
            if (category !== 'all') {
                alert(`已选择分类: ${category}`);
            }
        });
    });
} 