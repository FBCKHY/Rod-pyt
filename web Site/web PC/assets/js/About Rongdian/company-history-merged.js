/**
 * 关于容电 - 发展历程区块脚本（垂直时间轴故事叙述风格）
 * 
 * 描述：处理发展历程区块的交互功能和动画效果
 * 用途：为发展历程区块提供现代化的动画和交互效果，实现垂直时间轴的视觉叙述
 * 
 * 包含功能：
 * - 数据计数动画
 * - 垂直时间轴滚动交互
 * - 滚动触发动画
 * - 视差滚动效果
 * - 图片悬停效果
 * - 移动设备导航
 * - 返回顶部功能
 * 
 * 创建日期：2023年11月
 * 最后修改：2025年7月
 */

'use strict';

/**
 * 节流函数 - 限制函数在一定时间内只能执行一次
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 防抖函数 - 函数在一定时间内没有再次被调用才执行
 */
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * 初始化计数器动画
 */
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'), 10);
        counter.textContent = '0';
        
        // 检查元素是否在视口中，如果是则开始动画
        if (isElementInViewport(counter)) {
            animateCounter(counter, target);
        }
    });
}

/**
 * 计数器动画函数
 */
function animateCounter(element, target) {
    const duration = 2000; // 动画持续时间（毫秒）
    const startTime = performance.now();
    const startValue = 0;
    
    function updateCounter(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easedProgress = easeOutQuart(progress);
        const current = Math.floor(easedProgress * target);
        
        element.textContent = current + (element.textContent.includes('+') ? '+' : '');
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + (element.textContent.includes('+') ? '+' : '');
        }
    }
    
    requestAnimationFrame(updateCounter);
}

/**
 * 缓动函数 - 四次方缓出
 */
function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

/**
 * 初始化垂直时间轴
 */
function initVerticalTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (!timelineItems.length) {
        console.warn('时间轴元素未找到');
        return;
    }
    
    console.log('🔄 初始化垂直时间轴');
    
    // 确保时间线中心线高度正确
    adjustTimelineHeight();
    
    // 特别处理第一个时间线项的标记位置
    const firstItem = timelineItems[0];
    if (firstItem) {
        const firstMarker = firstItem.querySelector('.timeline-marker');
        if (firstMarker) {
            // 确保第一个标记不被内容盖住
            firstMarker.style.zIndex = '15';
            firstMarker.style.top = '-10px';
            
            // 确保年份标记在圆点上方
            const yearMarker = firstMarker.querySelector('.year-marker');
            if (yearMarker) {
                yearMarker.style.zIndex = '20';
            }
            
            // 调整第一个圆点位置
            const markerDot = firstMarker.querySelector('.marker-dot');
            if (markerDot) {
                markerDot.style.top = '50px';
            }
        }
    }
    
    // 处理所有时间线项的年份标记和圆点层级
    timelineItems.forEach((item, index) => {
        const marker = item.querySelector('.timeline-marker');
        if (marker) {
            const yearMarker = marker.querySelector('.year-marker');
            const markerDot = marker.querySelector('.marker-dot');
            const timelineLine = marker.querySelector('.timeline-line');
            
            if (yearMarker) {
                yearMarker.style.zIndex = '20';
            }
            
            if (markerDot) {
                // 根据屏幕宽度调整圆点位置
                if (window.innerWidth <= 992) {
                    markerDot.style.left = '10px';
                    markerDot.style.transform = 'none';
                } else {
                    markerDot.style.left = '50%';
                    markerDot.style.transform = 'translateX(-50%)';
                }
                
                // 调整圆点垂直位置
                markerDot.style.top = '50px';
                markerDot.style.zIndex = '5';
            }
            
            if (timelineLine) {
                // 根据屏幕宽度调整时间线位置
                if (window.innerWidth <= 992) {
                    timelineLine.style.left = '10px';
                    timelineLine.style.transform = 'none';
    } else {
                    timelineLine.style.left = '50%';
                    timelineLine.style.transform = 'translateX(-50%)';
                }
                
                // 调整时间线高度
                const nextItem = timelineItems[index + 1];
                if (nextItem) {
                    const distance = nextItem.offsetTop - item.offsetTop;
                    timelineLine.style.height = `${distance - 60}px`;
                } else if (index === timelineItems.length - 1) {
                    // 最后一个项目的时间线高度
                    timelineLine.style.height = '100px';
                }
            }
        }
    });
    
    // 为每个时间线项添加鼠标悬停效果
    timelineItems.forEach(item => {
        const card = item.querySelector('.milestone-card');
        const image = item.querySelector('.milestone-image img');
        
        if (card && image) {
            // 鼠标悬停时添加效果
            card.addEventListener('mouseenter', function() {
                image.style.transform = 'scale(1.08)';
            });
            
            // 鼠标移出时恢复
            card.addEventListener('mouseleave', function() {
                image.style.transform = 'scale(1)';
            });
        }
    });
    
    // 初始化滚动触发动画
    initScrollAnimations();
    
    // 初始化时间线动画
    animateTimelineOnScroll();
}

/**
 * 初始化滚动触发动画
 */
function initScrollAnimations() {
    // 获取所有需要动画的元素
    const cards = document.querySelectorAll('.milestone-card');
    const markers = document.querySelectorAll('.timeline-marker');
    const achievements = document.querySelectorAll('.achievement-item');
    const storyHeader = document.querySelector('.story-header');
    const historyOverview = document.querySelector('.history-overview');
    
    // 创建Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '-50px',
        threshold: 0.2
    };
    
    // 标题和历史概览动画
    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-animation');
                headerObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 观察标题和历史概览
    if (storyHeader) headerObserver.observe(storyHeader);
    if (historyOverview) headerObserver.observe(historyOverview);
    
    // 卡片动画
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // 根据左右位置添加不同的动画
                const card = entry.target;
                const content = card.closest('.timeline-content');
                
                if (content) {
                    if (content.classList.contains('left')) {
                        card.classList.add('animate-slide-right');
                    } else {
                        card.classList.add('animate-slide-left');
                    }
                    
                    // 为卡片内的成就项添加延迟动画
                    const achievements = card.querySelectorAll('.achievement-item');
                    achievements.forEach((item, i) => {
                        item.classList.add('animate-slide-up', `delay-${(i+1)*100}`);
                    });
                }
                
                cardObserver.unobserve(card);
            }
        });
    }, observerOptions);
    
    // 标记动画
    const markerObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const marker = entry.target;
                marker.classList.add('animate-scale-in');
                
                // 动画完成后取消观察
                markerObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 添加观察者
    cards.forEach(card => {
        cardObserver.observe(card);
    });
    
    markers.forEach(marker => {
        markerObserver.observe(marker);
    });
}

/**
 * 增强动画效果
 */
function enhanceAnimations() {
    // 添加鼠标移动视差效果
    document.addEventListener('mousemove', function(e) {
        if (window.innerWidth <= 992) return; // 移动设备不应用此效果
        
        const cards = document.querySelectorAll('.milestone-card');
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;
        
        cards.forEach(card => {
            if (isElementInViewport(card)) {
                const rect = card.getBoundingClientRect();
                const cardCenterX = rect.left + rect.width / 2;
                const cardCenterY = rect.top + rect.height / 2;
                
                // 计算鼠标与卡片中心的距离
                const distX = (e.clientX - cardCenterX) / window.innerWidth;
                const distY = (e.clientY - cardCenterY) / window.innerHeight;
                
                // 计算移动距离，距离越近移动越明显
                const moveX = distX * 10;
                const moveY = distY * 5;
                
                // 应用轻微的3D变换
                card.style.transform = `perspective(1000px) rotateY(${moveX}deg) rotateX(${-moveY}deg) translateZ(10px)`;
                
                // 恢复原始变换
                setTimeout(() => {
                    card.style.transform = '';
                }, 100);
            }
        });
    });
}

/**
 * 调整时间线高度
 */
function adjustTimelineHeight() {
    const timelineStory = document.querySelector('.timeline-story');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (!timelineStory || !timelineItems.length) {
        return;
    }
    
    // 计算时间线总高度
    const lastItem = timelineItems[timelineItems.length - 1];
    const totalHeight = lastItem.offsetTop + lastItem.offsetHeight + 100; // 额外添加一些空间
    
    // 在移动设备上，恢复使用单一中心线
    if (window.innerWidth <= 992) {
        timelineStory.style.setProperty('--timeline-height', `${totalHeight}px`);
        timelineStory.classList.add('mobile-timeline');
    } else {
        timelineStory.classList.remove('mobile-timeline');
    }
    
    // 调整每个时间线项的线条高度
    timelineItems.forEach((item, index) => {
        const timelineLine = item.querySelector('.timeline-line');
        if (timelineLine) {
            const nextItem = timelineItems[index + 1];
            if (nextItem) {
                const distance = nextItem.offsetTop - item.offsetTop;
                timelineLine.style.height = `${distance - 60}px`;
            } else if (index === timelineItems.length - 1) {
                // 最后一个项目的时间线高度
                timelineLine.style.height = '100px';
            }
        }
    });
}

/**
 * 初始化视差滚动效果
 */
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.milestone-image, .vision-content');
    
    // 检查是否应该启用视差效果（在桌面设备上启用）
    if (window.innerWidth <= 992) {
        // 在移动设备上禁用视差效果
        disableParallaxOnMobile();
        return;
    }
    
    window.addEventListener('scroll', throttle(function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        parallaxElements.forEach(element => {
            if (isElementInViewport(element)) {
                // 获取元素相对于视口的位置
                const rect = element.getBoundingClientRect();
                const elementTop = rect.top + scrollTop;
                const elementCenter = elementTop + (rect.height / 2);
                
                // 计算元素中心点与当前滚动位置的差值
                const distanceFromCenter = elementCenter - (scrollTop + window.innerHeight / 2);
                
                // 视差效果强度，根据元素类型调整
                const speed = element.classList.contains('milestone-image') ? 0.05 : 0.03;
                
                // 计算视差位移
                const yPos = distanceFromCenter * speed;
                
                if (element.classList.contains('milestone-image')) {
                    // 对图片应用视差效果
                    const img = element.querySelector('img');
                    if (img) {
                        img.style.transform = `translateY(${yPos}px)`;
                    }
                } else {
                    // 对其他元素应用轻微的视差效果
                    element.style.transform = `translateY(${yPos}px)`;
                }
            }
        });
    }, 10));
}

/**
 * 初始化移动设备导航
 */
function initMobileNavigation() {
    const mobileYearLinks = document.querySelectorAll('.mobile-year-link');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (!mobileYearLinks.length) {
        return;
    }
    
    console.log('📱 初始化移动设备导航');
    
    // 为每个年份链接添加点击事件
    mobileYearLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取目标年份
            const targetYear = this.getAttribute('data-year');
            
            // 移除所有链接的激活状态
            mobileYearLinks.forEach(l => l.classList.remove('active'));
            
            // 激活当前点击的链接
            this.classList.add('active');
            
            // 查找对应的时间线项
            const targetItem = document.querySelector(`.timeline-item[data-year="${targetYear}"]`);
            
            if (targetItem) {
                // 滚动到目标位置，添加偏移以考虑固定头部
                const offset = 80;
                const targetPosition = targetItem.getBoundingClientRect().top + window.pageYOffset - offset;
                
                // 平滑滚动
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // 高亮显示目标项
                setTimeout(() => {
                    highlightTimelineItem(targetItem);
                }, 500);
            }
        });
    });
    
    // 监听滚动以更新移动导航的激活状态
    window.addEventListener('scroll', throttle(function() {
        updateMobileNavActiveState();
    }, 100));
}

/**
 * 高亮显示时间线项
 */
function highlightTimelineItem(item) {
    // 为目标项添加临时高亮效果
    const card = item.querySelector('.milestone-card');
    if (card) {
        card.style.boxShadow = '0 15px 40px rgba(30, 136, 229, 0.3)';
        card.style.transform = 'translateY(-10px)';
        
        // 2秒后恢复
            setTimeout(() => {
            card.style.boxShadow = '';
            card.style.transform = '';
        }, 2000);
    }
}

/**
 * 更新移动导航的激活状态
 */
function updateMobileNavActiveState() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const mobileYearLinks = document.querySelectorAll('.mobile-year-link');
    const windowHeight = window.innerHeight;
    
    // 找到当前在视口中的时间线项
    let activeYear = null;
    
    timelineItems.forEach(item => {
        const rect = item.getBoundingClientRect();
        // 当项目的顶部进入视口的40%时激活
        if (rect.top <= windowHeight * 0.4 && rect.bottom >= 0) {
            activeYear = item.getAttribute('data-year');
        }
    });
    
    // 更新移动导航的激活状态
    if (activeYear) {
        mobileYearLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-year') === activeYear);
        });
    }
}

/**
 * 初始化返回顶部按钮
 */
function initBackToTop() {
    const backToTopBtn = document.getElementById('history-back-to-top');
    
    if (!backToTopBtn) {
        return;
    }
    
    console.log('⬆️ 初始化返回顶部按钮');
    
    // 初始隐藏按钮
    backToTopBtn.style.opacity = '0';
    backToTopBtn.style.visibility = 'hidden';
    
    // 监听滚动事件
    window.addEventListener('scroll', throttle(function() {
        // 当页面滚动超过500px时显示按钮
        if (window.pageYOffset > 500) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
        }
    }, 100));
    
    // 点击事件
    backToTopBtn.addEventListener('click', function() {
        // 获取历史区块的顶部位置
        const historySection = document.getElementById('company-history');
        
        if (historySection) {
            // 平滑滚动到历史区块顶部
            window.scrollTo({
                top: historySection.offsetTop,
                behavior: 'smooth'
            });
        } else {
            // 如果找不到历史区块，则滚动到页面顶部
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
}

/**
 * 时间线动画
 */
function animateTimelineOnScroll() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    // 创建Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const item = entry.target;
                const marker = item.querySelector('.timeline-marker');
                const card = item.querySelector('.milestone-card');
                
                // 添加动画类
                if (marker) marker.classList.add('animate-fade-in');
                if (card) {
                    // 根据左右位置添加不同的动画
                    const content = card.closest('.timeline-content');
                    if (content) {
                        if (content.classList.contains('left')) {
                            card.classList.add('animate-slide-right');
                        } else {
                            card.classList.add('animate-slide-left');
                        }
                    }
                }
                
                // 动画完成后取消观察
                observer.unobserve(item);
            }
        });
    }, observerOptions);
    
    // 添加观察者
    timelineItems.forEach(item => {
        observer.observe(item);
    });
}

/**
 * 在滚动时触发动画
 */
function animateOnScroll() {
    // 检查计数器是否在视口中
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
        if (isElementInViewport(counter) && counter.textContent === '0') {
            const target = parseInt(counter.getAttribute('data-count'), 10);
            animateCounter(counter, target);
        }
    });
    
    // 为统计项添加动画
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((item, index) => {
        if (isElementInViewport(item) && !item.classList.contains('animated')) {
            item.classList.add('animated');
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 100 * index);
        }
    });
    
    // 为未来展望区域添加动画
    const visionContent = document.querySelector('.vision-content');
    if (visionContent && isElementInViewport(visionContent) && !visionContent.classList.contains('animated')) {
        visionContent.classList.add('animated');
        visionContent.style.opacity = '0';
        
        setTimeout(() => {
            visionContent.style.transition = 'opacity 1s ease';
            visionContent.style.opacity = '1';
        }, 300);
    }
    
    // 为未来目标添加动画
    const visionGoals = document.querySelectorAll('.vision-goal');
    visionGoals.forEach((goal, index) => {
        if (isElementInViewport(goal) && !goal.classList.contains('animated')) {
            goal.classList.add('animated');
            goal.style.opacity = '0';
            goal.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                goal.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                goal.style.opacity = '1';
                goal.style.transform = 'translateY(0)';
            }, 200 + (100 * index));
        }
    });
    
    // 为标题区域添加动画
    const storyHeader = document.querySelector('.story-header');
    if (storyHeader && isElementInViewport(storyHeader) && !storyHeader.classList.contains('animated')) {
        storyHeader.classList.add('animated');
        storyHeader.style.opacity = '0';
        
        setTimeout(() => {
            storyHeader.style.transition = 'opacity 0.8s ease';
            storyHeader.style.opacity = '1';
        }, 100);
    }
    
    // 为大型计数器添加动画
    const historyCounter = document.querySelector('.history-counter-large');
    if (historyCounter && isElementInViewport(historyCounter) && !historyCounter.classList.contains('animated')) {
        historyCounter.classList.add('animated');
        historyCounter.style.opacity = '0';
        historyCounter.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            historyCounter.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            historyCounter.style.opacity = '1';
            historyCounter.style.transform = 'translateY(0)';
        }, 200);
    }
    
    // 为移动导航添加动画
    const mobileNav = document.querySelector('.timeline-mobile-nav');
    if (mobileNav && isElementInViewport(mobileNav) && !mobileNav.classList.contains('animated')) {
        mobileNav.classList.add('animated');
        mobileNav.style.opacity = '0';
        mobileNav.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            mobileNav.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            mobileNav.style.opacity = '1';
            mobileNav.style.transform = 'translateY(0)';
        }, 300);
    }
}

/**
 * 判断元素是否在视口中
 */
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * 调整响应式布局
 */
function adjustResponsiveLayout() {
    const windowWidth = window.innerWidth;
    
    // 在移动设备上调整时间线布局
    if (windowWidth <= 992) {
        // 移动设备上的调整
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            const content = item.querySelector('.timeline-content');
            if (content) {
                // 确保所有内容都在右侧
                content.style.paddingLeft = '70px';
                content.style.paddingRight = '0';
                content.style.marginLeft = '0';
                content.style.marginRight = '0';
            }
            
            // 调整时间标记位置
            const marker = item.querySelector('.timeline-marker');
            if (marker) {
                marker.style.left = '30px';
                marker.style.transform = 'none';
                
                // 特别处理第一个时间线项的标记
                if (index === 0) {
                    marker.style.top = '-10px';
                    marker.style.zIndex = '15';
                }
                
                // 确保第6个时间线项的标记位置正确
                if (item === timelineItems[5]) { // 第6个元素（索引为5）
                    marker.style.left = '30px';
                    marker.style.transform = 'none';
                }
                
                // 调整圆点位置
                const markerDot = marker.querySelector('.marker-dot');
                if (markerDot) {
                    markerDot.style.left = '10px';
                    markerDot.style.transform = 'none';
                }
                
                // 调整时间线位置
                const timelineLine = marker.querySelector('.timeline-line');
                if (timelineLine) {
                    timelineLine.style.left = '10px';
                    timelineLine.style.transform = 'none';
                }
            }
        });
        
        // 在小屏幕上禁用视差效果
        disableParallaxOnMobile();
        
        // 恢复使用单一中心线
        const timelineStory = document.querySelector('.timeline-story');
        if (timelineStory) {
            timelineStory.classList.add('mobile-timeline');
        }
    } else {
        // 恢复桌面布局
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            const content = item.querySelector('.timeline-content');
            if (content) {
                if (content.classList.contains('left')) {
                    content.style.paddingLeft = '50px';
                    content.style.paddingRight = '0';
                    content.style.marginLeft = 'auto';
                    content.style.marginRight = '0';
                } else {
                    content.style.paddingLeft = '0';
                    content.style.paddingRight = '50px';
                    content.style.marginLeft = '0';
                    content.style.marginRight = 'auto';
                }
            }
            
            // 恢复时间标记位置
            const marker = item.querySelector('.timeline-marker');
            if (marker) {
                marker.style.left = '50%';
                marker.style.transform = 'translateX(-50%)';
                
                // 特别处理第一个时间线项的标记
                if (index === 0) {
                    marker.style.top = '-10px';
                    marker.style.zIndex = '15';
                }
                
                // 确保第6个时间线项的标记位置正确
                if (item === timelineItems[5]) { // 第6个元素（索引为5）
                    marker.style.left = '50%';
                    marker.style.transform = 'translateX(-50%)';
                }
                
                // 调整圆点位置
                const markerDot = marker.querySelector('.marker-dot');
                if (markerDot) {
                    markerDot.style.left = '50%';
                    markerDot.style.transform = 'translateX(-50%)';
                }
                
                // 调整时间线位置
                const timelineLine = marker.querySelector('.timeline-line');
                if (timelineLine) {
                    timelineLine.style.left = '50%';
                    timelineLine.style.transform = 'translateX(-50%)';
                }
            }
        });
        
        // 重新启用视差效果
        initParallaxEffects();
        
        // 移除移动时间线类
        const timelineStory = document.querySelector('.timeline-story');
        if (timelineStory) {
            timelineStory.classList.remove('mobile-timeline');
        }
    }
    
    // 调整时间线高度
    adjustTimelineHeight();
    
    // 更新移动导航的激活状态
    updateMobileNavActiveState();
    
    // 重新检查动画
    animateOnScroll();
}

/**
 * 在移动设备上禁用视差效果
 */
function disableParallaxOnMobile() {
    const parallaxElements = document.querySelectorAll('.milestone-image img, .vision-content');
    
    parallaxElements.forEach(element => {
        element.style.transform = '';
    });
}

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('📅 发展历程区块脚本已加载 - 垂直时间轴故事叙述风格');
    
    // 初始化计数器动画
    initCounters();
    
    // 初始化垂直时间轴
    initVerticalTimeline();
    
    // 初始化视差效果
    initParallaxEffects();
    
    // 增强动画效果
    enhanceAnimations();
    
    // 监听窗口大小变化，调整布局
    window.addEventListener('resize', debounce(function() {
        adjustResponsiveLayout();
        adjustTimelineHeight();
    }, 250));
    
    // 监听滚动事件，更新动画
    window.addEventListener('scroll', throttle(function() {
        animateOnScroll();
        updateMobileNavActiveState();
        checkBackToTopButton();
    }, 50));
    
    // 初始化移动导航点击事件
    initMobileNavigation();
    
    // 初始化返回顶部按钮
    initBackToTop();
    
    // 初始调整布局
    adjustResponsiveLayout();
    
    // 初始执行一次动画检查
    setTimeout(function() {
        animateOnScroll();
    }, 300);
}); 