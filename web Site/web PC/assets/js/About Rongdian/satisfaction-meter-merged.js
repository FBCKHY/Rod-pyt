/**
 * 关于容电 - 客户满意度仪表盘脚本（合并版）
 *
 * 描述：为客户满意度仪表盘提供动画和交互功能
 * 用途：展示客户满意度数据，提供良好的视觉体验
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 客户满意度图表脚本已加载');

    // 初始化满意度仪表盘
    initSatisfactionMeter();
    
    // 监听滚动事件，触发动画
    window.addEventListener('scroll', checkSatisfactionCardVisibility);
    
    // 页面加载后检查一次可见性
    setTimeout(checkSatisfactionCardVisibility, 500);
});

/**
 * 初始化满意度仪表盘
 */
function initSatisfactionMeter() {
    const satisfactionCard = document.querySelector('.satisfaction-card-enhanced');
    if (!satisfactionCard) return;
    
    // 获取满意度值
    const satisfactionValue = parseInt(satisfactionCard.querySelector('.satisfaction-number-enhanced').textContent);
    
    // 设置圆形进度条
    setCircleProgress(satisfactionCard, satisfactionValue);
    
    // 设置评级星星
    setRatingStars(satisfactionCard, satisfactionValue);
    
    // 添加交互效果
    addInteractionEffects(satisfactionCard);
    
    // 添加持续动画效果
    addContinuousAnimations(satisfactionCard);
}

/**
 * 设置圆形进度条
 * @param {HTMLElement} card - 满意度卡片元素
 * @param {number} value - 满意度值
 */
function setCircleProgress(card, value) {
    const progressCircle = card.querySelector('.satisfaction-circle-progress');
    if (!progressCircle) return;
    
    // 计算圆形路径
    const radius = 70; // 圆的半径
    const circumference = 2 * Math.PI * radius;
    
    // 根据满意度值计算描边长度
    const fillPercent = value / 100;
    const dashoffset = circumference * (1 - fillPercent);
    
    // 创建SVG圆形进度条
    progressCircle.innerHTML = `
        <svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
            <circle cx="90" cy="90" r="${radius}" fill="none" stroke="rgba(255, 255, 255, 0.2)" stroke-width="10" />
            <circle cx="90" cy="90" r="${radius}" fill="none" stroke="#FFD700" stroke-width="10" 
                stroke-dasharray="${circumference}" stroke-dashoffset="${dashoffset}"
                transform="rotate(-90, 90, 90)" class="progress-circle" />
        </svg>
    `;
}

/**
 * 设置评级星星
 * @param {HTMLElement} card - 满意度卡片元素
 * @param {number} value - 满意度值
 */
function setRatingStars(card, value) {
    const ratingContainer = card.querySelector('.satisfaction-rating-enhanced');
    if (!ratingContainer) return;
    
    // 计算星级（1-5，根据满意度百分比）
    const stars = Math.round(value / 20);
    
    // 创建星星HTML
    let starsHTML = '';
    for (let i = 0; i < 5; i++) {
        if (i < stars) {
            starsHTML += '<i class="bi bi-star-fill"></i>';
        } else {
            starsHTML += '<i class="bi bi-star"></i>';
        }
    }
    
    // 设置星星
    ratingContainer.innerHTML = starsHTML;
}

/**
 * 添加交互效果
 * @param {HTMLElement} card - 满意度卡片元素
 */
function addInteractionEffects(card) {
    // 鼠标进入效果
    card.addEventListener('mouseenter', function() {
        const progressCircle = this.querySelector('.progress-circle');
        if (progressCircle) {
            progressCircle.style.filter = 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.7))';
        }
        
        const satisfactionValue = this.querySelector('.satisfaction-value-container');
        if (satisfactionValue) {
            satisfactionValue.style.transform = 'scale(1.1)';
            satisfactionValue.style.textShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
        }
        
        const stars = this.querySelectorAll('.satisfaction-rating-enhanced i');
        stars.forEach((star, index) => {
            setTimeout(() => {
                star.style.transform = 'scale(1.2)';
                star.style.filter = 'brightness(1.3)';
            }, index * 100);
        });
    });
    
    // 鼠标离开效果
    card.addEventListener('mouseleave', function() {
        const progressCircle = this.querySelector('.progress-circle');
        if (progressCircle) {
            progressCircle.style.filter = 'drop-shadow(0 0 5px rgba(255, 215, 0, 0.5))';
        }
        
        const satisfactionValue = this.querySelector('.satisfaction-value-container');
        if (satisfactionValue) {
            satisfactionValue.style.transform = '';
            satisfactionValue.style.textShadow = '0 2px 10px rgba(255, 215, 0, 0.5)';
        }
        
        const stars = this.querySelectorAll('.satisfaction-rating-enhanced i');
        stars.forEach(star => {
            star.style.transform = '';
            star.style.filter = '';
        });
    });
}

/**
 * 添加持续动画效果
 * @param {HTMLElement} card - 满意度卡片元素
 */
function addContinuousAnimations(card) {
    // 为圆形进度条添加持续脉冲光晕效果
    const progressCircle = card.querySelector('.progress-circle');
    if (progressCircle) {
        // 创建脉冲动画
        const pulseAnimation = [
            { filter: 'drop-shadow(0 0 5px rgba(255, 215, 0, 0.5))' },
            { filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))' },
            { filter: 'drop-shadow(0 0 5px rgba(255, 215, 0, 0.5))' }
        ];
        
        // 应用无限循环动画
        progressCircle.animate(pulseAnimation, {
            duration: 3000,
            iterations: Infinity,
            easing: 'ease-in-out'
        });
    }
    
    // 为满意度数值添加轻微的呼吸效果
    const satisfactionValue = card.querySelector('.satisfaction-number-enhanced');
    if (satisfactionValue) {
        const breatheAnimation = [
            { textShadow: '0 2px 10px rgba(255, 215, 0, 0.5)' },
            { textShadow: '0 2px 20px rgba(255, 215, 0, 0.8)' },
            { textShadow: '0 2px 10px rgba(255, 215, 0, 0.5)' }
        ];
        
        satisfactionValue.animate(breatheAnimation, {
            duration: 4000,
            iterations: Infinity,
            easing: 'ease-in-out'
        });
    }
    
    // 为星星添加轻微闪烁效果 - 减少动画数量，只对前三颗星应用动画
    const stars = card.querySelectorAll('.satisfaction-rating-enhanced i.bi-star-fill');
    const starsToAnimate = Math.min(stars.length, 3);
    for (let i = 0; i < starsToAnimate; i++) {
        const star = stars[i];
        const delay = i * 800; // 增加延迟，减少同时执行的动画
        
        const twinkleAnimation = [
            { filter: 'brightness(1) drop-shadow(0 0 3px rgba(255, 215, 0, 0.5))' },
            { filter: 'brightness(1.3) drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))' },
            { filter: 'brightness(1) drop-shadow(0 0 3px rgba(255, 215, 0, 0.5))' }
        ];
        
        star.animate(twinkleAnimation, {
            duration: 4000, // 增加动画时长，减少频繁更新
            delay: delay,
            iterations: Infinity,
            easing: 'ease-in-out'
        });
    }
    
    // 为卡片背景添加光晕移动效果 - 降低频率，从5秒一次改为10秒一次
    let glowInterval;
    const createGlowEffect = () => {
        const glowEffect = document.createElement('div');
        glowEffect.className = 'satisfaction-glow-effect';
        glowEffect.style.position = 'absolute';
        glowEffect.style.top = '50%';
        glowEffect.style.left = '50%';
        glowEffect.style.transform = 'translate(-50%, -50%)';
        glowEffect.style.width = '200px';
        glowEffect.style.height = '200px';
        glowEffect.style.borderRadius = '50%';
        glowEffect.style.background = 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0) 70%)';
        glowEffect.style.zIndex = '0';
        glowEffect.style.opacity = '0';
        
        card.appendChild(glowEffect);
        
        glowEffect.animate([
            { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
            { opacity: 0.7, transform: 'translate(-50%, -50%) scale(1.2)' },
            { opacity: 0, transform: 'translate(-50%, -50%) scale(1.5)' }
        ], {
            duration: 3000,
            easing: 'ease-out',
            fill: 'forwards'
        });
        
        // 动画结束后移除元素
        setTimeout(() => {
            if (glowEffect.parentNode) {
                glowEffect.parentNode.removeChild(glowEffect);
            }
        }, 3000);
    };
    
    // 只在元素可见时启动光晕效果
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 元素可见时，启动光晕效果
                if (!glowInterval) {
                    createGlowEffect();
                    glowInterval = setInterval(createGlowEffect, 10000); // 10秒一次
                }
            } else {
                // 元素不可见时，停止光晕效果
                if (glowInterval) {
                    clearInterval(glowInterval);
                    glowInterval = null;
                }
            }
        });
    }, observerOptions);
    
    observer.observe(card);
    
    // 为数据图标添加持续动画效果 - 优化性能
    const dataIcons = document.querySelectorAll('#company-intro .data-cards-container .data-card-content .data-icon');
    
    // 限制同时动画的图标数量
    const maxAnimatedIcons = Math.min(dataIcons.length, 2);
    
    // 只为前几个图标添加动画
    for (let i = 0; i < maxAnimatedIcons; i++) {
        const icon = dataIcons[i];
        
        // 简化动画效果
        const simpleAnimation = [
            { transform: 'scale(1)', filter: 'brightness(1)' },
            { transform: 'scale(1.1)', filter: 'brightness(1.2)' },
            { transform: 'scale(1)', filter: 'brightness(1)' }
        ];
        
        // 应用动画
        icon.style.transformOrigin = 'center center';
        icon.animate(simpleAnimation, {
            duration: 5000, // 增加动画时长，减少频繁更新
            iterations: Infinity,
            easing: 'ease-in-out'
        });
        
        // 为图标内部的i元素添加简化的光晕效果
        const iconElement = icon.querySelector('i');
        if (iconElement) {
            iconElement.style.position = 'relative';
            iconElement.style.zIndex = '1';
            
            const glowAnimation = [
                { filter: 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.3))' },
                { filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.7))' },
                { filter: 'drop-shadow(0 0 3px rgba(255, 215, 0, 0.3))' }
            ];
            
            iconElement.animate(glowAnimation, {
                duration: 5000, // 增加动画时长
                iterations: Infinity,
                easing: 'ease-in-out'
            });
        }
    }
}

/**
 * 检查满意度卡片是否在视口中
 */
function checkSatisfactionCardVisibility() {
    const satisfactionCard = document.querySelector('.satisfaction-card-enhanced');
    if (!satisfactionCard) return;
    
    // 检查元素是否已经激活了动画
    if (satisfactionCard.classList.contains('animated')) return;
    
    // 检查元素是否在视口中
    const rect = satisfactionCard.getBoundingClientRect();
    const isInViewport = (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
        rect.bottom >= 0
    );
    
    if (isInViewport) {
        console.log('📊 客户满意度卡片进入视口，开始播放动画');
        // 标记为已播放动画
        satisfactionCard.classList.add('animated');
        
        // 播放进场动画
        playEntranceAnimation(satisfactionCard);
    }
}

/**
 * 播放进场动画
 * @param {HTMLElement} card - 满意度卡片元素
 */
function playEntranceAnimation(card) {
    // 添加初始动画类
    card.classList.add('entrance-animation');
    
    // 圆形背景动画
    const circleBg = card.querySelector('.satisfaction-circle-bg');
    if (circleBg) {
        circleBg.animate([
            { opacity: 0, transform: 'scale(0.8)' },
            { opacity: 1, transform: 'scale(1)' }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            fill: 'forwards'
        });
    }
    
    // 添加光晕效果
    setTimeout(() => {
        const glowEffect = document.createElement('div');
        glowEffect.className = 'satisfaction-glow-effect';
        glowEffect.style.position = 'absolute';
        glowEffect.style.top = '50%';
        glowEffect.style.left = '50%';
        glowEffect.style.transform = 'translate(-50%, -50%)';
        glowEffect.style.width = '200px';
        glowEffect.style.height = '200px';
        glowEffect.style.borderRadius = '50%';
        glowEffect.style.background = 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0) 70%)';
        glowEffect.style.zIndex = '0';
        glowEffect.style.opacity = '0';
        
        card.appendChild(glowEffect);
        
        glowEffect.animate([
            { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
            { opacity: 1, transform: 'translate(-50%, -50%) scale(1.2)' },
            { opacity: 0, transform: 'translate(-50%, -50%) scale(1.5)' }
        ], {
            duration: 1800,
            easing: 'ease-out',
            fill: 'forwards'
        });
        
        // 动画结束后移除元素
        setTimeout(() => {
            if (glowEffect.parentNode) {
                glowEffect.parentNode.removeChild(glowEffect);
            }
        }, 2000);
    }, 200);
    
    // 进度圆环动画
    const progressCircle = card.querySelector('.progress-circle');
    if (progressCircle) {
        // 获取圆环长度
        const circumference = parseFloat(progressCircle.getAttribute('stroke-dasharray'));
        
        // 动画：从完全隐藏到显示指定进度
        const finalOffset = parseFloat(progressCircle.getAttribute('stroke-dashoffset'));
        progressCircle.style.strokeDashoffset = circumference;
        
        // 使用动画API而不是CSS transition
        progressCircle.animate([
            { strokeDashoffset: circumference },
            { strokeDashoffset: finalOffset }
        ], {
            duration: 1500,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            fill: 'forwards'
        });
    }
    
    // 数值计数器动画
    const numberElement = card.querySelector('.satisfaction-number-enhanced');
    if (numberElement) {
        const targetValue = parseInt(numberElement.textContent);
        let startValue = 0;
        
        // 初始值
        numberElement.textContent = startValue;
        
        // 创建数字计数动画
        const duration = 1500; // 动画持续时间
        const startTime = performance.now();
        
        function updateNumber(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // 使用缓动函数使动画更自然
            const easedProgress = easeOutQuart(progress);
            
            // 计算当前值
            const currentValue = Math.round(easedProgress * targetValue);
            numberElement.textContent = currentValue;
            
            // 如果动画未完成，继续请求下一帧
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }
        
        // 开始动画
        requestAnimationFrame(updateNumber);
        
        // 添加数值跳动动画
        setTimeout(() => {
            numberElement.animate([
                { transform: 'scale(1)', textShadow: '0 2px 10px rgba(255, 215, 0, 0.5)' },
                { transform: 'scale(1.15)', textShadow: '0 0 25px rgba(255, 215, 0, 0.9)' },
                { transform: 'scale(1)', textShadow: '0 2px 10px rgba(255, 215, 0, 0.5)' }
            ], {
                duration: 600,
                easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
            });
        }, 1500);
    }
    
    // 星级评分动画
    const stars = card.querySelectorAll('.satisfaction-rating-enhanced i');
    stars.forEach((star, index) => {
        setTimeout(() => {
            star.style.opacity = '1';
            star.animate([
                { transform: 'translateY(20px) scale(0)', opacity: 0 },
                { transform: 'translateY(0) scale(1.2)', opacity: 1 },
                { transform: 'translateY(0) scale(1)', opacity: 1 }
            ], {
                duration: 600,
                easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                fill: 'forwards'
            });
        }, 1500 + index * 150); // 依次显示星星
    });
    
    // 评分文本动画
    const ratingText = card.querySelector('.satisfaction-rating-text');
    if (ratingText) {
        ratingText.style.opacity = '0';
        setTimeout(() => {
            ratingText.style.opacity = '1';
            ratingText.animate([
                { transform: 'translateY(15px)', opacity: 0 },
                { transform: 'translateY(0)', opacity: 1 }
            ], {
                duration: 600,
                easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                fill: 'forwards'
            });
        }, 2200);
    }
}

/**
 * 缓动函数 - 四次方缓出
 * @param {number} x - 进度值 (0-1)
 * @returns {number} 缓动后的值
 */
function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
}
