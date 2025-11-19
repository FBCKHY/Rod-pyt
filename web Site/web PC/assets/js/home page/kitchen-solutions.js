/**
 * 厨房解决方案脚本 - kitchen-solutions.js
 * 
 * 描述：处理厨房解决方案区块的交互功能
 * 用途：实现分类切换、数据加载和动画效果
 * 
 * 包含功能：
 * - 分类导航切换
 * - 解决方案数据加载
 * - 动画触发
 * 
 * 创建日期：2025-07-08
 * 最后修改：2025-07-10
 */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    // 初始化厨房解决方案区块
    initKitchenSolutions();
    
    console.log('✨ 厨房解决方案区块初始化完成');
    
    // 初始化场景切换功能
    initSceneSwitching();
    
    // 初始化卡片动画
    initCardAnimations();
    
    // 初始化咨询按钮特效
    initConsultButton();
    
    // 初始化卡片按钮导航功能
    initCardButtonsNavigation();
});

/**
 * 初始化场景切换功能
 * 处理厨房场景的自动切换和交互效果
 */
function initSceneSwitching() {
    const sceneContainers = document.querySelectorAll('.solution-scenes-vertical');
    if (!sceneContainers.length) return;
    
    // 为每个场景容器设置自动切换
    sceneContainers.forEach(container => {
        const scenes = container.querySelectorAll('.solution-item');
        if (scenes.length <= 1) return;
        
        let currentIndex = 0;
        let intervalId = null;
        
        // 启动自动切换
        startAutoSwitch();
        
        // 鼠标进入时暂停自动切换
        container.addEventListener('mouseenter', () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        });
        
        // 鼠标离开时恢复自动切换
        container.addEventListener('mouseleave', () => {
            startAutoSwitch();
        });
        
        // 开始自动切换
        function startAutoSwitch() {
            if (intervalId) clearInterval(intervalId);
            
            intervalId = setInterval(() => {
                // 隐藏当前场景
                scenes[currentIndex].classList.remove('active');
                
                // 更新索引
                currentIndex = (currentIndex + 1) % scenes.length;
                
                // 显示新场景
                scenes[currentIndex].classList.add('active');
            }, 5000); // 每5秒切换一次
        }
    });
}

/**
 * 初始化卡片动画效果
 * 为解决方案卡片添加动画和交互效果
 */
function initCardAnimations() {
    // 获取所有解决方案卡片
    const solutionItems = document.querySelectorAll('.solution-item');
    if (!solutionItems.length) return;
    
    // 为每个卡片添加进入视口时的动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 添加动画类
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, 100);
                
                // 卡片内部元素的级联动画
                const title = entry.target.querySelector('.solution-title');
                const description = entry.target.querySelector('.solution-description');
                const link = entry.target.querySelector('.solution-link');
                
                if (title) setTimeout(() => { title.classList.add('animated'); }, 300);
                if (description) setTimeout(() => { description.classList.add('animated'); }, 500);
                if (link) setTimeout(() => { link.classList.add('animated'); }, 700);
                
                // 停止观察已经触发动画的元素
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    // 开始观察所有卡片
    solutionItems.forEach(item => {
        observer.observe(item);
    });
    
    // 添加卡片悬停效果
    solutionItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.classList.add('hover');
        });
        
        item.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
    });
}

/**
 * 初始化厨房解决方案区块
 */
function initKitchenSolutions() {
    const solutionsSection = document.getElementById('kitchen-solutions');
    if (!solutionsSection) return;
    
    // 获取分类导航项
    const categoryItems = document.querySelectorAll('.category-item');
    const solutionsContainer = document.getElementById('solutionScenesContainer');
    
    // 从JSON数据容器中获取解决方案数据
    let solutionsData = {};
    const dataContainer = document.getElementById('allKitchenSolutionsDataContainer');
    
    if (dataContainer && dataContainer.dataset.solutionsJson) {
        try {
            solutionsData = JSON.parse(dataContainer.dataset.solutionsJson);
        } catch (error) {
            console.error('解析解决方案数据失败:', error);
        }
    }
    
    // 添加过渡动画标志，防止多次点击导致动画冲突
    let isTransitioning = false;
    
    // 记录当前活动的分类ID
    let currentCategoryId = '';
    
    // 为导航项添加波纹效果
    categoryItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            link.addEventListener('mousedown', createRippleEffect);
        }
    });
    
    // 初始化卡片鼠标跟踪效果
    initCardMouseTracking();
    
    // 绑定分类切换事件
    categoryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // 阻止默认行为和事件冒泡
            e.preventDefault();
            e.stopPropagation();
            
            // 如果正在过渡中，则忽略点击
            if (isTransitioning) return;
            
            // 获取分类ID
            const categoryId = this.dataset.categoryId;
            if (!categoryId) return;
            
            // 如果点击的是当前活动分类，不做任何操作
            if (this.classList.contains('active')) return;
            
            // 更新URL哈希，但不触发页面跳转
            if (history.pushState) {
                history.pushState(null, null, `#${categoryId}`);
            } else {
                location.hash = `#${categoryId}`;
            }
            
            // 确定动画方向
            const direction = determineDirection(categoryId);
            
            // 更新活动状态
            updateActiveCategory(categoryId);
            
            // 显示对应分类的解决方案
            showCategorySolutions(categoryId, direction);
            
            // 更新当前分类ID
            currentCategoryId = categoryId;
        });
    });
    
    // 根据URL哈希初始化活动分类
    initActiveCategoryFromHash();
    
    // 监听哈希变化
    window.addEventListener('hashchange', function() {
        initActiveCategoryFromHash();
    });
    
    /**
     * 创建波纹效果
     * @param {Event} e 鼠标事件
     */
    function createRippleEffect(e) {
        const link = e.currentTarget;
        
        // 创建波纹元素
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        link.appendChild(ripple);
        
        // 获取点击位置
        const rect = link.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        // 设置波纹位置和大小
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        
        // 动画结束后移除波纹元素
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }
    
    /**
     * 确定动画方向
     * @param {string} newCategoryId 新分类ID
     * @returns {string} 动画方向：'left'、'right' 或 ''
     */
    function determineDirection(newCategoryId) {
        if (!currentCategoryId) return '';
        
        // 获取所有分类ID的顺序
        const categoryIds = Array.from(categoryItems).map(item => item.dataset.categoryId);
        
        // 获取当前分类和新分类的索引
        const currentIndex = categoryIds.indexOf(currentCategoryId);
        const newIndex = categoryIds.indexOf(newCategoryId);
        
        // 根据索引差确定方向
        if (currentIndex < newIndex) {
            return 'left'; // 向左滑动
        } else if (currentIndex > newIndex) {
            return 'right'; // 向右滑动
        }
        
        return ''; // 默认无方向
    }
    
    /**
     * 根据URL哈希初始化活动分类
     */
    function initActiveCategoryFromHash() {
        const hash = window.location.hash.substring(1);
        if (hash && solutionsData[hash]) {
            updateActiveCategory(hash);
            showCategorySolutions(hash);
            currentCategoryId = hash;
        } else {
            // 默认显示"all"分类
            updateActiveCategory('all');
            showCategorySolutions('all');
            currentCategoryId = 'all';
        }
    }
    
    /**
     * 更新活动分类
     */
    function updateActiveCategory(categoryId) {
        categoryItems.forEach(item => {
            if (item.dataset.categoryId === categoryId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    /**
     * 显示对应分类的解决方案
     * @param {string} categoryId 分类ID
     * @param {string} direction 动画方向：'left'、'right' 或 ''
     */
    function showCategorySolutions(categoryId, direction = '') {
        // 设置过渡状态为true
        isTransitioning = true;
        
        // 获取所有解决方案容器
        const existingContainers = solutionsContainer.querySelectorAll('.solution-scenes-vertical');
        
        // 获取或创建目标分类容器
        let targetContainer = solutionsContainer.querySelector(`.solution-scenes-vertical[data-category="${categoryId}"]`);
        const needsCreation = !targetContainer;
        
        // 如果目标容器不存在，创建它但先不显示
        if (needsCreation) {
            targetContainer = createSolutionContainer(categoryId, false);
            if (!targetContainer) {
                isTransitioning = false;
                return;
            }
        }
        
        // 根据方向添加动画类
        if (direction) {
            targetContainer.classList.add(`slide-${direction}`);
        }
        
        // 处理现有容器的淡出
        existingContainers.forEach(container => {
            if (container !== targetContainer) {
                // 设置淡出动画
                container.style.opacity = '0';
                container.style.transform = direction === 'left' ? 
                    'translateX(-50px) rotateY(-5deg)' : 
                    (direction === 'right' ? 
                        'translateX(50px) rotateY(5deg)' : 
                        'translateY(40px) rotateX(10deg)');
                container.classList.remove('active');
                container.style.filter = 'blur(5px)';
            }
        });
        
        // 等待淡出动画完成
        setTimeout(() => {
            // 隐藏所有非目标容器
            existingContainers.forEach(container => {
                if (container !== targetContainer) {
                    container.style.display = 'none';
                    container.style.visibility = 'hidden';
                }
            });
            
            // 如果是新创建的容器，现在可以准备显示它
            if (needsCreation) {
                // 容器已在createSolutionContainer中添加到DOM
                // 但我们需要确保它已准备好进行淡入动画
                targetContainer.style.display = 'grid';
                targetContainer.style.visibility = 'visible';
            } else {
                // 已有的容器，确保它是可见的
                targetContainer.style.display = 'grid';
                targetContainer.style.visibility = 'visible';
            }
            
            // 触发重排后设置动画
            setTimeout(() => {
                targetContainer.classList.add('active');
                targetContainer.style.opacity = '1';
                targetContainer.style.transform = 'translateY(0) rotateX(0)';
                targetContainer.style.filter = 'blur(0)';
                
                // 设置卡片的交错动画
                const items = targetContainer.querySelectorAll('.solution-scene-item');
                items.forEach((item, index) => {
                    item.style.setProperty('--item-index', index);
                });
                
                // 动画完成后重置过渡状态
                setTimeout(() => {
                    isTransitioning = false;
                    
                    // 移除方向类
                    if (direction) {
                        targetContainer.classList.remove(`slide-${direction}`);
                    }
                    
                }, 600);
            }, 50);
        }, 400); // 等待淡出动画完成
    }
    
    /**
     * 创建解决方案容器
     * @param {string} categoryId 分类ID
     * @param {boolean} animate 是否立即应用动画
     * @returns {HTMLElement} 创建的容器元素
     */
    function createSolutionContainer(categoryId, animate = true) {
        if (!solutionsData[categoryId]) return null;
        
        const solutions = solutionsData[categoryId];
        const container = document.createElement('div');
        container.className = 'solution-scenes-vertical';
        container.dataset.category = categoryId;
        
        // 初始状态
        container.style.opacity = '0';
        container.style.transform = 'translateY(40px) rotateX(10deg)';
        container.style.display = animate ? 'grid' : 'none';
        container.style.visibility = animate ? 'visible' : 'hidden';
        container.style.filter = 'blur(5px)';
        
        // 创建解决方案项
        solutions.forEach((solution, index) => {
            const solutionItem = createSolutionItem(solution, index);
            container.appendChild(solutionItem);
        });
        
        // 添加到容器
        solutionsContainer.appendChild(container);
        
        // 如果需要立即动画，设置动画
        if (animate) {
            // 触发重排后设置动画
            setTimeout(() => {
                container.classList.add('active');
                container.style.opacity = '1';
                container.style.transform = 'translateY(0) rotateX(0)';
                container.style.filter = 'blur(0)';
                
                // 设置卡片的交错动画
                const items = container.querySelectorAll('.solution-scene-item');
                items.forEach((item, index) => {
                    item.style.setProperty('--item-index', index);
                });
                
            }, 50);
        }
        
        return container;
    }
    
    /**
     * 创建单个解决方案项
     */
    function createSolutionItem(solution, index) {
        const item = document.createElement('div');
        item.className = 'solution-scene-item';
        item.dataset.aos = 'fade-up';
        item.dataset.aosDelay = (index * 100).toString();
        item.style.setProperty('--item-index', index);
        
        // 确保link属性有效
        const solutionLink = solution.link || 'pages/products.html';
        
        item.innerHTML = `
            <div class="scene-card">
                <div class="scene-visual">
                    <img class="scene-image" src="${solution.imagePath}" alt="${solution.altText}">
                </div>
                <div class="scene-content">
                    <h3>${solution.title}</h3>
                    <p>${solution.description}</p>
                </div>
                <div class="card-decoration"></div>
                <div class="card-button" data-href="${solutionLink}">
                    <span>了解详情</span>
                </div>
            </div>
        `;
        
        // 添加点击事件
        const card = item.querySelector('.scene-card');
        const button = item.querySelector('.card-button');
        
        // 为卡片添加点击事件
        card.addEventListener('click', function(e) {
            // 如果点击的是按钮区域，则不触发卡片点击事件
            if (e.target.closest('.card-button')) {
                return;
            }
            if (solutionLink.startsWith('/')) {
                window.location.href = solutionLink.substring(1); // 移除开头的斜杠
            } else {
                window.location.href = solutionLink;
            }
        });
        
        // 为按钮单独添加点击事件
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            const buttonLink = this.getAttribute('data-href');
            if (buttonLink.startsWith('/')) {
                window.location.href = buttonLink.substring(1); // 移除开头的斜杠
            } else {
                window.location.href = buttonLink;
            }
        });
        
        card.style.cursor = 'pointer';
        
        return item;
    }

/**
 * 初始化卡片鼠标跟踪效果
 */
function initCardMouseTracking() {
    // 委托事件到容器上，以处理动态创建的卡片
    solutionsContainer.addEventListener('mousemove', function(e) {
        const cards = document.querySelectorAll('.scene-card');
        
        cards.forEach(card => {
            // 获取卡片相对于视口的位置
            const rect = card.getBoundingClientRect();
            
            // 检查鼠标是否在当前卡片上
            if (
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            ) {
                // 计算鼠标在卡片内的相对位置（-0.5到0.5之间）
                const x = ((e.clientX - rect.left) / rect.width) - 0.5;
                const y = ((e.clientY - rect.top) / rect.height) - 0.5;
                
                // 根据鼠标位置计算倾斜角度（最大±20度，增大了角度范围）
                const tiltX = y * 20;
                const tiltY = -x * 20;
                
                // 计算位移量（根据鼠标位置移动卡片，最大±15px）
                const moveX = x * 15;
                const moveY = y * 15;
                
                // 应用倾斜和位移效果
                card.style.transform = `
                    translateY(calc(var(--hover-translate-y, -15px) + ${moveY}px)) 
                    translateX(${moveX}px)
                    scale(var(--hover-scale, 1.05)) 
                    rotate(var(--hover-rotate, 0deg))
                    rotateX(${tiltX}deg) 
                    rotateY(${tiltY}deg)
                `;
            }
        });
    });
    
    // 鼠标离开卡片时重置效果
    solutionsContainer.addEventListener('mouseleave', function(e) {
        const cards = document.querySelectorAll('.scene-card');
        cards.forEach(card => {
            card.style.transform = '';
        });
    });
    
    // 为每个卡片添加鼠标离开事件
    solutionsContainer.addEventListener('mouseout', function(e) {
        if (e.target.closest('.scene-card')) {
            const card = e.target.closest('.scene-card');
            card.style.transform = `
                translateY(var(--hover-translate-y, -15px)) 
                scale(var(--hover-scale, 1.05)) 
                rotate(var(--hover-rotate, 0deg))
            `;
        }
    });
    
    }
} 

/**
 * 初始化咨询定制方案按钮特效
 */
function initConsultButton() {
    const consultButton = document.querySelector('.custom-solution-btn');
    if (!consultButton) {
        console.error('咨询定制方案按钮未找到');
        return;
    }
    
    console.log('初始化咨询定制方案按钮特效');
    
    // 鼠标进入按钮时的效果
    consultButton.addEventListener('mouseenter', function() {
        // 添加鼠标移动监听
        this.addEventListener('mousemove', handleButtonMouseMove);
    });
    
    // 鼠标离开按钮时的效果
    consultButton.addEventListener('mouseleave', function() {
        // 移除鼠标移动监听
        this.removeEventListener('mousemove', handleButtonMouseMove);
    });
    
    // 按钮点击效果
    consultButton.addEventListener('click', function(e) {
        // 创建点击波纹效果
        const ripple = document.createElement('span');
        ripple.classList.add('solution-ripple');
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
 * 初始化和更新卡片按钮的导航功能
 * 允许动态更改卡片按钮的导航目标
 */
function initCardButtonsNavigation() {
    console.log('初始化卡片按钮导航功能');
    
    // 获取所有当前存在的卡片按钮
    const updateCardButtons = () => {
        const cardButtons = document.querySelectorAll('.card-button');
        
        cardButtons.forEach(button => {
            // 重新绑定点击事件，确保使用最新的data-href属性
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const buttonLink = this.getAttribute('data-href') || 'pages/products.html';
                if (buttonLink.startsWith('/')) {
                    window.location.href = buttonLink.substring(1);
                } else {
                    window.location.href = buttonLink;
                }
            });
        });
    };
    
    // 立即执行一次更新
    updateCardButtons();
    
    // 创建一个公共方法，允许外部更改卡片按钮的导航链接
    window.updateCardButtonHref = function(buttonElement, newHref) {
        if (!(buttonElement instanceof Element)) {
            console.error('提供的按钮不是有效的DOM元素');
            return false;
        }
        
        // 更新data-href属性
        buttonElement.setAttribute('data-href', newHref);
        
        // 重新绑定点击事件
        buttonElement.addEventListener('click', function(e) {
            e.stopPropagation();
            const buttonLink = this.getAttribute('data-href');
            if (buttonLink.startsWith('/')) {
                window.location.href = buttonLink.substring(1);
            } else {
                window.location.href = buttonLink;
            }
        });
        
        console.log(`卡片按钮导航已更新为: ${newHref}`);
        return true;
    };
    
    // 监听DOM变化，当新卡片添加时更新按钮
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                // 检查是否添加了新的卡片
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // 元素节点
                        if (node.classList && node.classList.contains('solution-scene-item')) {
                            // 是新添加的卡片，更新其中的按钮
                            updateCardButtons();
                        } else if (node.querySelector) {
                            // 检查是否包含卡片
                            const hasCards = node.querySelector('.solution-scene-item');
                            if (hasCards) {
                                updateCardButtons();
                            }
                        }
                    }
                });
            }
        });
    });
    
    // 观察容器变化
    const container = document.getElementById('solutionScenesContainer');
    if (container) {
        observer.observe(container, {
            childList: true,
            subtree: true
        });
    }
} 