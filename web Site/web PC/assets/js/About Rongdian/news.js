/**
 * 关于容电 - 新闻动态区块脚本 (重新设计版)
 * 
 * 描述：处理新闻动态区块的交互功能和动画
 * 用途：为新闻动态区块提供现代化的动画和交互效果
 * 
 * 包含功能：
 * - 新闻卡片动画效果
 * - 新闻分类筛选交互
 * - 特色新闻交互效果
 * - 滚动动画和视差效果
 * - 图片和标签动画
 * 
 * 创建日期：2025-07-14
 * 最后修改：2025-07-14
 */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    console.log('📰 新闻动态区块脚本已加载');
    
    // 初始化装饰元素
    initDecorativeElements();
    
    // 初始化新闻卡片动画
    initNewsCardAnimation();
    
    // 初始化新闻分类筛选
    initNewsCategoryFilter();
    
    // 初始化特色新闻效果
    initFeaturedNewsEffect();
    
    // 初始化图片和标签效果
    initMediaEffects();
    
    // 初始化滚动动画
    initScrollAnimations();
});

/**
 * 初始化装饰元素
 * 确保装饰元素不会干扰交互功能
 */
function initDecorativeElements() {
    const newsSection = document.getElementById('news');
    if (!newsSection) return;
    
    console.log('🎨 初始化新闻区域装饰元素');
    
    // 获取所有装饰元素
    const decorElements = newsSection.querySelectorAll('.tech-grid, .data-flow, .tech-circles, .circuit-lines');
    
    // 设置装饰元素为不可交互
    decorElements.forEach(element => {
        if (element) {
            element.style.pointerEvents = 'none';
        }
    });
    
    // 确保新闻内容可交互
    const interactiveElements = newsSection.querySelectorAll('.news-content, .featured-news, .news-card, .category-tag');
    interactiveElements.forEach(element => {
        if (element) {
            element.style.position = 'relative';
            element.style.zIndex = '5';
            element.style.pointerEvents = 'auto';
        }
    });
    
    // 特别处理分类标签，确保它们可以点击
    const categoryTags = newsSection.querySelectorAll('.category-tag');
    categoryTags.forEach(tag => {
        if (tag) {
            tag.style.position = 'relative';
            tag.style.zIndex = '10';
            tag.style.cursor = 'pointer';
            tag.style.pointerEvents = 'auto';
        }
    });
}

/**
 * 初始化新闻卡片动画
 * 添加进入视口时的动画效果
 */
function initNewsCardAnimation() {
    const newsCards = document.querySelectorAll('.news-card');
    
    if (!newsCards.length) return;
    console.log(`🃏 找到${newsCards.length}个新闻卡片，初始化动画效果`);
    
    // 创建Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 当卡片进入视口时
            if (entry.isIntersecting) {
                entry.target.classList.add('card-visible');
                
                // 添加逐个内容显示动画
                const cardElements = [
                    entry.target.querySelector('.news-card-title'),
                    entry.target.querySelector('.news-card-excerpt'),
                    entry.target.querySelector('.news-card-footer')
                ];
                
                cardElements.forEach((element, index) => {
                    if (element) {
                        element.style.opacity = '0';
                        element.style.transform = 'translateY(20px)';
                        
                        setTimeout(() => {
                            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                            element.style.opacity = '1';
                            element.style.transform = 'translateY(0)';
                        }, 300 + (index * 150));
                    }
                });
                
                // 停止观察此元素
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2, // 当元素有20%进入视口时触发
        rootMargin: '0px 0px -50px 0px' // 底部偏移50px，提前触发
    });
    
    // 开始观察所有卡片
    newsCards.forEach((card, index) => {
        // 设置初始状态
        card.classList.add('card-hidden');
        
        // 设置延迟，使卡片按顺序显示
        card.style.transitionDelay = `${index * 0.1}s`;
        
        // 开始观察
        observer.observe(card);
    });
}

/**
 * 初始化新闻分类筛选
 * 添加交互式分类标签效果
 */
function initNewsCategoryFilter() {
    const categoryTags = document.querySelectorAll('.category-tag');
    const newsCards = document.querySelectorAll('.news-card');
    
    if (!categoryTags.length || !newsCards.length) return;
    console.log(`🏷️ 找到${categoryTags.length}个分类标签，初始化分类筛选`);
    
    // 为每个分类标签添加点击事件
    categoryTags.forEach(tag => {
        tag.addEventListener('click', () => {
            // 获取选中的分类
            const category = tag.getAttribute('data-category');
            
            // 更新标签样式，添加动画效果
            categoryTags.forEach(t => {
                t.classList.remove('active');
                t.style.transform = '';
            });
            
            tag.classList.add('active');
            tag.style.transform = 'scale(1.1)';
            setTimeout(() => {
                tag.style.transform = '';
            }, 300);
            
            // 筛选新闻卡片，添加更流畅的过渡效果
            filterNewsCards(category);
        });
        
        // 添加悬停效果
        tag.addEventListener('mouseenter', () => {
            if (!tag.classList.contains('active')) {
                tag.style.transform = 'translateY(-3px)';
            }
        });
        
        tag.addEventListener('mouseleave', () => {
            if (!tag.classList.contains('active')) {
                tag.style.transform = '';
            }
        });
    });
    
    /**
     * 筛选新闻卡片
     * @param {string} category - 选中的分类
     */
    function filterNewsCards(category) {
        // 使用变量追踪匹配项数量，以调整布局
        let matchCount = 0;
        let containerElement = document.querySelector('.news-cards');
        
        newsCards.forEach((card, index) => {
            const cardCategory = card.getAttribute('data-category');
            
            if (category === 'all' || cardCategory === category) {
                // 显示匹配的卡片，添加延迟和更平滑的动画
                matchCount++;
                
                // 先设置显示，但保持透明
                card.style.display = '';
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                
                // 添加延迟，创建级联效果
                setTimeout(() => {
                    card.style.transition = 'opacity 0.6s cubic-bezier(0.165, 0.84, 0.44, 1), transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 80);
            } else {
                // 隐藏不匹配的卡片，添加淡出动画
                card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px) scale(0.95)';
                
                setTimeout(() => {
                    card.style.display = 'none';
                }, 400);
            }
        });
        
        // 根据匹配项数量调整布局
        if (containerElement) {
            if (matchCount <= 2 && window.innerWidth > 768) {
                containerElement.style.gridTemplateColumns = matchCount === 1 ? '1fr' : 'repeat(2, 1fr)';
            } else {
                containerElement.style.gridTemplateColumns = '';
            }
        }
    }
}

/**
 * 初始化特色新闻效果
 * 添加特色新闻区域的交互动画
 */
function initFeaturedNewsEffect() {
    const featuredNews = document.querySelector('.featured-news');
    
    if (!featuredNews) {
        console.log('⚠️ 未找到特色新闻元素，跳过初始化特色新闻效果');
        return;
    }
    
    console.log('🔍 初始化特色新闻交互效果');
    
    // 添加进入视口时的动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 应用动画效果
                featuredNews.style.opacity = '1';
                featuredNews.style.transform = 'translateY(0)';
                
                // 逐个显示内容元素
                const contentElements = featuredNews.querySelectorAll('.featured-news-tag, .featured-news-title, .featured-news-date, .featured-news-excerpt, .featured-news-cta');
                
                contentElements.forEach((element, index) => {
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }, 500 + (index * 150));
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '-50px 0px'
    });
    
    // 设置初始状态
    featuredNews.style.opacity = '0';
    featuredNews.style.transform = 'translateY(50px)';
    featuredNews.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    
    // 开始观察
    observer.observe(featuredNews);
    
    // 确保特色新闻可以正常交互
    featuredNews.style.position = 'relative';
    featuredNews.style.zIndex = '10';
    featuredNews.style.pointerEvents = 'auto';
    
    // 添加鼠标移动视差效果
    featuredNews.addEventListener('mousemove', (e) => {
        // 确保鼠标事件正常工作
        e.stopPropagation();
        
        const newsImage = featuredNews.querySelector('.featured-news-image');
        const newsOverlay = featuredNews.querySelector('.featured-news-overlay');
        
        if (newsImage && newsOverlay) {
            const rect = featuredNews.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) / rect.width;
            const mouseY = (e.clientY - rect.top) / rect.height;
            
            // 图片视差效果
            newsImage.style.transform = `scale(1.08) translate(${(mouseX - 0.5) * -20}px, ${(mouseY - 0.5) * -20}px)`;
            
            // 渐变覆盖层效果 - 适应蓝色背景
            newsOverlay.style.background = `linear-gradient(${135 + mouseX * 30}deg, rgba(0, 0, 0, ${0.7 - mouseX * 0.2}) 0%, rgba(0, 0, 0, ${0.3 - mouseY * 0.2}) ${60 + mouseY * 20}%)`;
        }
    });
    
    // 鼠标离开时重置效果
    featuredNews.addEventListener('mouseleave', (e) => {
        // 确保鼠标事件正常工作
        e.stopPropagation();
        
        const newsImage = featuredNews.querySelector('.featured-news-image img');
        const newsOverlay = featuredNews.querySelector('.featured-news-overlay');
        
        if (newsImage) {
            newsImage.style.transform = '';
        }
        
        if (newsOverlay) {
            newsOverlay.style.background = '';
        }
    });
}

/**
 * 初始化图片和标签效果
 * 增强卡片内图片和标签的交互效果
 */
function initMediaEffects() {
    const newsCards = document.querySelectorAll('.news-card');
    
    if (!newsCards.length) return;
    console.log('🖼️ 初始化新闻媒体效果');
    
    newsCards.forEach(card => {
        // 确保卡片可以正常交互
        card.style.position = 'relative';
        card.style.zIndex = '6';
        card.style.pointerEvents = 'auto';
        
        const cardImage = card.querySelector('.news-card-image img');
        const cardOverlay = card.querySelector('.news-card-overlay');
        const cardTag = card.querySelector('.news-card-tag');
        
        if (!cardImage || !cardOverlay) return;
        
        // 添加鼠标移动效果
        card.addEventListener('mousemove', (e) => {
            // 确保鼠标事件正常工作
            e.stopPropagation();
            
            const rect = card.querySelector('.news-card-image').getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) / rect.width;
            const mouseY = (e.clientY - rect.top) / rect.height;
            
            // 图片视差效果 - 增强视差幅度
            cardImage.style.transform = `scale(1.1) translate(${(mouseX - 0.5) * -20}px, ${(mouseY - 0.5) * -20}px)`;
            
            // 标签上浮效果
            if (cardTag) {
                cardTag.style.transform = `translateY(-${5 + mouseY * 5}px) scale(1.05)`;
                cardTag.style.boxShadow = `0 10px 15px rgba(0, 0, 0, 0.2)`;
            }
            
            // 渐变覆盖层效果 - 深色到蓝色渐变
            cardOverlay.style.background = `linear-gradient(to bottom, rgba(0,0,0,${0.2 + mouseY * 0.2}) 0%, rgba(13, 43, 80, ${0.8 + mouseY * 0.1}) 100%)`;
        });
        
        // 鼠标离开时重置效果
        card.addEventListener('mouseleave', (e) => {
            // 确保鼠标事件正常工作
            e.stopPropagation();
            
            cardImage.style.transform = '';
            
            if (cardTag) {
                cardTag.style.transform = '';
                cardTag.style.boxShadow = '';
            }
            
            cardOverlay.style.background = '';
        });
    });
}

/**
 * 初始化滚动动画
 * 添加滚动时的视差和动画效果
 */
function initScrollAnimations() {
    const newsSection = document.getElementById('news');
    if (!newsSection) return;
    
    console.log('📜 初始化新闻区域滚动动画');
    
    // 获取装饰元素
    const techGrid = newsSection.querySelector('.tech-grid');
    const dataFlow = newsSection.querySelector('.data-flow');
    const techCircles = newsSection.querySelector('.tech-circles');
    const circuitLines = newsSection.querySelector('.circuit-lines');
    
    // 为整个区域添加视差背景效果
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const sectionTop = newsSection.offsetTop;
        const sectionHeight = newsSection.offsetHeight;
        
        // 检查滚动位置是否在区域内
        if (scrollPosition > sectionTop - window.innerHeight && scrollPosition < sectionTop + sectionHeight) {
            // 计算视差效果
            const parallaxOffset = (scrollPosition - sectionTop + window.innerHeight) * 0.1;
            const scrollProgress = Math.min(1, Math.max(0, (scrollPosition - sectionTop + window.innerHeight) / (sectionHeight + window.innerHeight)));
            
            // 应用视差效果到伪元素
            newsSection.style.setProperty('--parallax-offset', `${parallaxOffset}px`);
            
            // 应用视差效果到装饰元素
            if (techGrid) {
                techGrid.style.transform = `translateY(${parallaxOffset * 0.3}px)`;
            }
            
            if (dataFlow) {
                dataFlow.style.transform = `translateY(${-parallaxOffset * 0.2}px)`;
            }
            
            if (techCircles) {
                techCircles.style.transform = `translateY(${parallaxOffset * 0.1}px) rotate(${scrollProgress * 5}deg)`;
            }
            
            if (circuitLines) {
                circuitLines.style.transform = `rotate(${180 + scrollProgress * 5}deg)`;
            }
        }
    });
    
    // 为查看更多按钮添加滚动动画
    const viewMoreBtn = document.querySelector('.view-more-btn');
    if (viewMoreBtn) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    viewMoreBtn.style.opacity = '1';
                    viewMoreBtn.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });
        
        // 设置初始状态
        viewMoreBtn.style.opacity = '0';
        viewMoreBtn.style.transform = 'translateY(30px)';
        viewMoreBtn.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        // 开始观察
        observer.observe(viewMoreBtn.parentElement);
    }
}

/**
 * 在窗口加载完成后再次初始化，确保所有资源都已加载
 */
window.addEventListener('load', function() {
    console.log('🔄 页面完全加载，重新初始化新闻动态效果');
    
    // 强制触发一次滚动事件，激活可见元素的动画
    setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
    }, 200);
    
    // 为特色新闻添加加载完成的类
    const featuredNews = document.querySelector('.featured-news');
    if (featuredNews) {
        featuredNews.classList.add('fully-loaded');
    }
});