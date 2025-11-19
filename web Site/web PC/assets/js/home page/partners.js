/**
 * 合作伙伴区块脚本 - partners.js
 * 
 * 描述：处理合作伙伴区块的交互和动画效果
 * 用途：实现合作伙伴筛选、统计动画和视差效果
 * 
 * 创建日期：2025-07-11
 * 最后修改：2025-07-11
 */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    // 初始化合作伙伴区块
    initPartnersSection();
    
    console.log('✨ 合作伙伴区块初始化完成');
});

/**
 * 初始化合作伙伴区块
 */
function initPartnersSection() {
    // 创建装饰粒子
    createParticles();
    
    // 初始化合作伙伴类别筛选
    initCategoryFilter();
    
    // 初始化合作伙伴卡片动画
    initPartnerCards();
    
    // 初始化统计数字动画
    initStatisticsCounter();
    
    // 初始化视差效果
    initParallaxEffect();
    
    // 初始化光波效果
    initLightWaves();
    
    // 初始化滚动动画
    initScrollAnimations();
}

/**
 * 创建装饰粒子
 */
function createParticles() {
    const particlesContainer = document.querySelector('.partners-section .particles');
    
    if (!particlesContainer) return;
    
    // 清空现有粒子
    particlesContainer.innerHTML = '';
    
    // 创建8个粒子
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // 随机大小 (5-10px)
        const size = 5 + Math.random() * 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // 随机位置
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.left = `${Math.random() * 100}%`;
        
        // 随机阴影大小
        const shadowSize = Math.floor(size * 2);
        particle.style.boxShadow = `0 0 ${shadowSize}px rgba(255, 215, 0, 0.7)`;
        
        // 随机动画延迟
        particle.style.animationDelay = `${Math.random() * 10}s`;
        
        // 随机动画时长 (15-30s)
        particle.style.animationDuration = `${15 + Math.random() * 15}s`;
        
        particlesContainer.appendChild(particle);
    }
}

/**
 * 初始化合作伙伴类别筛选
 */
function initCategoryFilter() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const partnerItems = document.querySelectorAll('.partner-item');
    
    if (!categoryButtons.length || !partnerItems.length) return;
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加当前按钮的active类
            this.classList.add('active');
            
            // 获取当前类别
            const category = this.getAttribute('data-category');
            
            // 筛选合作伙伴
            filterPartners(category, partnerItems);
        });
    });
}

/**
 * 筛选合作伙伴
 * @param {string} category - 合作伙伴类别
 * @param {NodeList} partnerItems - 合作伙伴元素列表
 */
function filterPartners(category, partnerItems) {
    partnerItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        if (category === 'all' || category === itemCategory) {
            // 显示符合条件的合作伙伴
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
            item.style.display = '';
        } else {
            // 隐藏不符合条件的合作伙伴
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            // 延迟隐藏元素，以便动画完成
            setTimeout(() => {
                item.style.display = 'none';
            }, 600);
        }
    });
}

/**
 * 初始化合作伙伴卡片动画
 */
function initPartnerCards() {
    const partnerCards = document.querySelectorAll('.partner-card');
    
    if (!partnerCards.length) return;
    
    partnerCards.forEach(card => {
        // 添加鼠标移动事件
        card.addEventListener('mousemove', handleCardHover);
        
        // 添加鼠标离开事件
        card.addEventListener('mouseleave', resetCardHover);
    });
}

/**
 * 处理卡片悬浮效果
 * @param {MouseEvent} e - 鼠标事件对象
 */
function handleCardHover(e) {
    const card = e.currentTarget;
    const cardRect = card.getBoundingClientRect();
    
    // 计算鼠标在卡片上的相对位置 (0-1)
    const x = (e.clientX - cardRect.left) / cardRect.width;
    const y = (e.clientY - cardRect.top) / cardRect.height;
    
    // 计算倾斜角度 (-5 到 5 度)
    const tiltX = (y - 0.5) * 5;
    const tiltY = (0.5 - x) * 5;
    
    // 应用3D变换
    card.style.transform = `translateY(-10px) scale(1.02) perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    card.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.2)';
    
    // 添加光泽效果
    addCardGlareEffect(card, x, y);
}

/**
 * 重置卡片悬浮效果
 * @param {MouseEvent} e - 鼠标事件对象
 */
function resetCardHover(e) {
    const card = e.currentTarget;
    
    // 重置卡片变换
    card.style.transform = '';
    card.style.boxShadow = '';
    
    // 移除光泽效果
    card.style.backgroundImage = '';
}

/**
 * 添加卡片光泽效果
 * @param {HTMLElement} card - 卡片元素
 * @param {number} x - 鼠标X坐标比例
 * @param {number} y - 鼠标Y坐标比例
 */
function addCardGlareEffect(card, x, y) {
    // 计算光泽位置
    const glareX = x * 100;
    const glareY = y * 100;
    
    // 更新光泽效果
    card.style.backgroundImage = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 60%, transparent 70%)`;
}

/**
 * 初始化统计数字动画
 */
function initStatisticsCounter() {
    const statsSection = document.getElementById('partners-stats');
    const countElements = document.querySelectorAll('.partners-count');
    
    if (!statsSection || !countElements.length) return;
    
    // 初始化时设置样式
    statsSection.style.opacity = '0';
    statsSection.style.transform = 'translateY(20px)';
    
    // 初始化统计项样式
    const statItems = statsSection.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(15px)';
    });
    
    // 创建Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 显示统计区块
                statsSection.style.opacity = '1';
                statsSection.style.transform = 'translateY(0)';
                
                // 依次显示统计项
                statItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 200 * index);
                });
                
                // 启动数字计数动画
                setTimeout(() => {
                    startCounting(countElements);
                }, 600); // 等待统计项显示后再开始数字动画
                
                // 取消观察
                observer.unobserve(entry.target);
            } else {
                // 元素不可见时，重置状态以便下次进入视口时再次触发动画
                if (entry.boundingClientRect.top > 0) {
                    statsSection.style.opacity = '0';
                    statsSection.style.transform = 'translateY(20px)';
                    
                    statItems.forEach(item => {
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(15px)';
                    });
                    
                    // 重置数字
                    countElements.forEach(element => {
                        element.textContent = '0';
                    });
                }
            }
        });
    }, { 
        threshold: 0.3, // 当30%的元素可见时触发
        rootMargin: '0px 0px -100px 0px' // 提前100px触发
    });
    
    // 开始观察统计区块
    observer.observe(statsSection);
    
    // 添加鼠标移动效果
    statsSection.addEventListener('mousemove', handleStatsHover);
    statsSection.addEventListener('mouseleave', resetStatsHover);
}

/**
 * 处理统计区块悬浮效果
 * @param {MouseEvent} e - 鼠标事件对象
 */
function handleStatsHover(e) {
    const stats = e.currentTarget;
    const statItems = stats.querySelectorAll('.stat-item');
    const statsRect = stats.getBoundingClientRect();
    
    // 计算鼠标在统计区块上的相对位置 (0-1)
    const x = (e.clientX - statsRect.left) / statsRect.width;
    const y = (e.clientY - statsRect.top) / statsRect.height;
    
    // 添加3D倾斜效果 - 增强效果，更明显的倾斜角度
    const tiltX = (y - 0.5) * 8; // 增大倾斜角度
    const tiltY = (0.5 - x) * 8; // 增大倾斜角度
    
    // 应用3D变换，添加更多的变换效果
    stats.style.transform = `translateY(-8px) perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    stats.style.boxShadow = `
        ${tiltY * 0.5}px ${tiltX * -0.5}px 20px rgba(0, 0, 0, 0.4), 
        inset 0 1px 3px rgba(255, 255, 255, 0.15)
    `;
    
    // 使用CSS变量控制伪元素的背景位置
    stats.style.setProperty('--glow-position-x', `${x * 100}%`);
    stats.style.setProperty('--glow-position-y', `${y * 100}%`);
    stats.style.setProperty('--glow-opacity', '1');
    
    // 为每个统计项添加视差效果
    statItems.forEach(item => {
        const itemRect = item.getBoundingClientRect();
        const itemX = (e.clientX - itemRect.left) / itemRect.width;
        const itemY = (e.clientY - itemRect.top) / itemRect.height;
        
        // 计算距离中心的距离
        const distX = itemX - 0.5;
        const distY = itemY - 0.5;
        
        // 根据距离计算移动量，增强视差效果
        const moveX = distX * 15; // 增大移动量
        const moveY = distY * 15; // 增大移动量
        
        // 应用视差效果，添加微小的旋转
        item.style.transform = `translate3d(${moveX}px, ${moveY}px, 20px) scale(1.05) rotateX(${distY * -3}deg) rotateY(${distX * 3}deg)`;
        
        // 动态调整文字阴影方向，创造光源跟随效果
        const statNumber = item.querySelector('.stat-number span:first-child');
        if (statNumber) {
            statNumber.style.textShadow = `
                ${distX * -5}px ${distY * -5}px 10px rgba(0, 0, 0, 0.3),
                ${distX * 3}px ${distY * 3}px 6px rgba(255, 215, 0, 0.2)
            `;
        }
        
        // 动态调整图标阴影
        const statIcon = item.querySelector('.stat-icon');
        if (statIcon) {
            statIcon.style.textShadow = `
                ${distX * 5}px ${distY * 5}px 15px rgba(255, 215, 0, 0.7)
            `;
        }
    });
}

/**
 * 重置统计区块悬浮效果
 * @param {MouseEvent} e - 鼠标事件对象
 */
function resetStatsHover(e) {
    const stats = e.currentTarget;
    const statItems = stats.querySelectorAll('.stat-item');
    
    // 重置统计区块的变换，保留轻微上浮效果
    stats.style.transform = '';
    stats.style.boxShadow = '';
    
    // 重置CSS变量
    stats.style.removeProperty('--glow-position-x');
    stats.style.removeProperty('--glow-position-y');
    stats.style.removeProperty('--glow-opacity');
    
    // 重置每个统计项的变换
    statItems.forEach(item => {
        item.style.transform = '';
        
        // 重置文字阴影
        const statNumber = item.querySelector('.stat-number span:first-child');
        if (statNumber) {
            statNumber.style.textShadow = '';
        }
        
        // 重置图标阴影
        const statIcon = item.querySelector('.stat-icon');
        if (statIcon) {
            statIcon.style.textShadow = '';
        }
    });
}

/**
 * 启动数字计数动画
 * @param {NodeList} elements - 需要计数的元素
 */
function startCounting(elements) {
    elements.forEach(element => {
        const targetValue = parseInt(element.getAttribute('data-count'), 10);
        const target = !isNaN(targetValue) ? targetValue : 0;

        // 设置初始值
        element.textContent = '0';
        
        // 如果目标值为0，则不需要动画
        if (target === 0) return;

        // 创建动画参数
        let startTimestamp = null;
        const duration = 2500; // 增加动画时间，让效果更明显
        
        // 使用更平滑的缓动函数
        const easeOutElastic = t => {
            const p = 0.3;
            return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
        };
        
        // 使用更平滑的步进函数，使数字变化看起来更自然
        const calculateStep = (progress, target) => {
            // 在动画前半段加速增长，后半段减速
            if (progress < 0.5) {
                return Math.floor(Math.pow(progress * 2, 2) * target / 2);
            } else {
                const remaining = 1 - progress;
                return target - Math.floor(Math.pow(remaining * 2, 2) * target / 2);
            }
        };

        // 动画函数
        const animate = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const elapsed = timestamp - startTimestamp;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutElastic(progress);
            
            // 计算当前值
            const currentValue = calculateStep(progress, target);
            
            // 检查是否需要更新数字显示
            const currentDisplayValue = parseInt(element.textContent, 10);
            if (currentValue !== currentDisplayValue) {
                // 添加动画类，触发CSS动画
                element.classList.add('animate');
                
                // 确保数值有效
                element.textContent = isNaN(currentValue) ? '0' : currentValue.toString();
                
                // 移除动画类，以便下次变化时可以再次触发
                setTimeout(() => {
                    element.classList.remove('animate');
                }, 800);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // 确保最终显示正确的目标值
                element.textContent = target.toString();
                
                // 最终值显示时添加强调动画
                element.classList.add('animate');
                setTimeout(() => {
                    element.classList.remove('animate');
                }, 800);
            }
        };
        
        // 开始动画
        requestAnimationFrame(animate);
    });
}

// 添加数字脉冲动画的关键帧
if (!document.getElementById('partners-count-animation')) {
    const style = document.createElement('style');
    style.id = 'partners-count-animation';
    style.textContent = `
        @keyframes number-pulse {
            0% { text-shadow: 0 0 10px rgba(255, 215, 0, 0.3); transform: scale(1); }
            100% { text-shadow: 0 0 15px rgba(255, 215, 0, 0.6); transform: scale(1.05); }
        }
    `;
    document.head.appendChild(style);
}

/**
 * 初始化视差效果
 */
function initParallaxEffect() {
    const partnersSection = document.getElementById('partners-section');
    
    if (!partnersSection) return;
    
    // 添加鼠标移动事件
    document.addEventListener('mousemove', function(e) {
        // 计算鼠标位置相对于视口中心的偏移
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;
        
        // 应用视差效果
        partnersSection.style.backgroundPosition = `${mouseX * 30}px ${mouseY * -20}px`;
    });
}

/**
 * 初始化光波效果
 */
function initLightWaves() {
    const partnersSection = document.querySelector('.partners-section');
    
    if (!partnersSection) return;
    
    // 创建两个光波
    for (let i = 0; i < 2; i++) {
        const wave = document.createElement('div');
        wave.className = 'light-wave';
        
        // 随机大小 (250-400px)
        const size = 250 + Math.random() * 150;
        wave.style.width = `${size}px`;
        wave.style.height = `${size}px`;
        
        // 随机位置
        wave.style.left = `${Math.random() * 100}%`;
        wave.style.top = `${Math.random() * 100}%`;
        
        partnersSection.appendChild(wave);
    }
}

/**
 * 初始化滚动动画
 */
function initScrollAnimations() {
    const ctaSection = document.getElementById('partner-cta');
    
    if (!ctaSection) return;
    
    // 创建Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 显示CTA区块
                ctaSection.style.opacity = '1';
                ctaSection.style.transform = 'translateY(0)';
                
                // 取消观察
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    // 开始观察CTA区块
    observer.observe(ctaSection);
} 