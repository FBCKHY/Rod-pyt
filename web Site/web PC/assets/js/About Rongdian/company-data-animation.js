/**
 * 关于容电 - 公司数据区块动画效果
 * 
 * 描述：为公司数据区块的卡片和图表添加动画效果
 * 用途：提升用户体验和交互性
 * 
 * 创建日期：2025-07-18
 * 更新日期：2025-07-20 - 增强动画效果，提高内容在蓝色背景上的可见度
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化数据卡片动画
    initDataCardAnimations();
    
    // 初始化图表动画
    initChartAnimations();
    
    // 初始化滚动触发动画
    initScrollAnimations();
    
    // 初始化数据计数器
    initCounters();
    
    // 新增：初始化内容可见度增强
    initVisibilityEnhancement();
    
    // 新增：初始化卡片背景动画效果
    initBackgroundAnimation();
    
    // 新增：初始化趋势线动画
    initTrendLineAnimation();
    
    // 新增：初始化创新进度条动画
    initInnovationBarAnimation();
    
    // 直接应用图标动画 - 确保在DOMContentLoaded后直接执行
    forceApplyIconAnimations();
    
    // 所有动画初始化完成，记录日志
    console.log('✅ 所有数据卡片动画已统一初始化完成');
});

/**
 * 强制应用图标动画到所有数据卡片
 * 这个函数会直接插入CSS样式并确保每个图标都有动画效果
 */
function forceApplyIconAnimations() {
    // 创建动画样式
    const styleEl = document.createElement('style');
    styleEl.id = 'forced-icon-animations';
    styleEl.innerHTML = `
        @keyframes pulse-icon {
            0% { transform: scale(1); filter: brightness(1); }
            100% { transform: scale(1.1); filter: brightness(1.2); }
        }
        
        .data-card-redesigned .data-icon i {
            animation: pulse-icon 2s infinite alternate ease-in-out !important;
            will-change: transform, filter;
        }
        
        .data-card-redesigned:hover .data-icon i {
            animation: none !important;
            transform: scale(1.2) !important;
            filter: brightness(1.2) drop-shadow(0 0 8px rgba(255, 215, 0, 0.8)) !important;
            transition: all 0.3s ease !important;
        }
    `;
    document.head.appendChild(styleEl);
    
    // 设置一个延迟函数，确保即使在所有资源加载后，动画也能应用
    setTimeout(function() {
        // 查找所有图标，分别应用动画
        const allIcons = document.querySelectorAll('.data-card-redesigned .data-icon i');
        console.log('直接强制应用动画到所有图标元素，共找到:', allIcons.length);
        
        allIcons.forEach((icon, index) => {
            // 为每个图标单独应用内联样式
            icon.style.animation = 'pulse-icon 2s infinite alternate ease-in-out';
            icon.style.willChange = 'transform, filter';
            
            // 打印每个图标信息以便调试
            console.log(`图标 #${index+1} 已应用动画:`, 
                icon.parentElement.parentElement.querySelector('.data-label')?.textContent || '未知标签');
        });
        
        // 特别处理第三个卡片 (索引为2)
        if (allIcons.length >= 3) {
            const thirdIcon = allIcons[2];
            console.log('特别处理第三个图标:', 
                thirdIcon.parentElement.parentElement.querySelector('.data-label')?.textContent || '未知标签');
            thirdIcon.style.animation = 'pulse-icon 2s infinite alternate ease-in-out';
            thirdIcon.style.willChange = 'transform, filter';
        }
        
        // 特别处理第四个卡片 (索引为3)
        if (allIcons.length >= 4) {
            const fourthIcon = allIcons[3];
            console.log('特别处理第四个图标:', 
                fourthIcon.parentElement.parentElement.querySelector('.data-label')?.textContent || '未知标签');
            fourthIcon.style.animation = 'pulse-icon 2s infinite alternate ease-in-out';
            fourthIcon.style.willChange = 'transform, filter';
        }
    }, 1000); // 1秒后执行，确保页面完全加载
    
    // 在页面onload事件时再次应用，确保在所有资源加载后也能正常工作
    window.addEventListener('load', function() {
        setTimeout(function() {
            const allIcons = document.querySelectorAll('.data-card-redesigned .data-icon i');
            console.log('页面完全加载后再次应用动画，共找到图标:', allIcons.length);
            
            // 直接操作每个元素的style属性
            allIcons.forEach(icon => {
                icon.style.animation = 'pulse-icon 2s infinite alternate ease-in-out';
                icon.style.willChange = 'transform, filter';
            });
        }, 500);
    });
    
    // 添加滚动事件处理，确保在滚动时图标仍然有动画
    window.addEventListener('scroll', function() {
        const allIcons = document.querySelectorAll('.data-card-redesigned .data-icon i');
        allIcons.forEach(icon => {
            // 检查当前是否有动画
            const currentAnimation = window.getComputedStyle(icon).getPropertyValue('animation-name');
            if (currentAnimation === 'none' || currentAnimation === '') {
                // 如果没有动画，添加动画
                icon.style.animation = 'pulse-icon 2s infinite alternate ease-in-out';
            }
        });
    });
    
    console.log('强制图标动画样式已添加到页面');
}

/**
 * 初始化图表动画
 */
function initChartAnimations() {
    const chartCards = document.querySelectorAll('.chart-card');
    
    // 为每个图表卡片添加鼠标进入/离开事件
    chartCards.forEach(card => {
        // 添加鼠标进入事件
        card.addEventListener('mouseenter', function() {
            // 添加动画类
            this.classList.add('animate');
            
            // 特殊处理满意度图表
            const satisfactionNeedle = this.querySelector('.satisfaction-needle');
            if (satisfactionNeedle) {
                // 根据满意度值设置旋转角度
                const satisfactionValue = this.querySelector('.satisfaction-value');
                if (satisfactionValue) {
                    const value = parseFloat(satisfactionValue.textContent);
                    const degree = (value / 100) * 180 - 90; // 将百分比转换为角度（-90到90度）
                    this.style.setProperty('--satisfaction-degree', `${degree}deg`);
                }
            }
            
            // 新增：增强图表文本可见度
            const textElements = this.querySelectorAll('.chart-title, .chart-bar-value, .chart-bar-label, .donut-total, .donut-label, .satisfaction-value, .satisfaction-label');
            textElements.forEach(el => {
                el.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.4)';
            });
        });
        
        // 添加鼠标离开事件
        card.addEventListener('mouseleave', function() {
            // 移除动画类，但保留某些动画状态
            setTimeout(() => {
                this.classList.remove('animate');
            }, 500);
            
            // 新增：恢复图表文本样式
            const textElements = this.querySelectorAll('.chart-title, .chart-bar-value, .chart-bar-label, .donut-total, .donut-label, .satisfaction-value, .satisfaction-label');
            textElements.forEach(el => {
                el.style.textShadow = '';
            });
        });
    });
}

/**
 * 初始化滚动触发动画
 */
function initScrollAnimations() {
    // 检测元素是否在视口内
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    // 要监听的元素
    const elements = {
        dataCards: document.querySelectorAll('.data-card-redesigned'),
        chartCards: document.querySelectorAll('.chart-card')
    };
    
    // 滚动事件处理函数
    function onScroll() {
        // 检查数据卡片
        const visibleDataCards = Array.from(elements.dataCards).filter(
            card => isElementInViewport(card) && !card.classList.contains('has-animated')
        );
        
        // 如果有可见的数据卡片，让它们几乎同时开始动画
        if (visibleDataCards.length > 0) {
            visibleDataCards.forEach((card, index) => {
                setTimeout(() => {
                    // 添加动画类
                    card.classList.add('animate');
                    card.classList.add('has-animated');
                    
                    // 触发数据值计数动画
                    const dataValue = card.querySelector('.data-value');
                    if (dataValue) {
                        dataValue.classList.add('counting');
                        
                        // 移除计数动画类（动画结束后）
                        setTimeout(() => {
                            dataValue.classList.remove('counting');
                        }, 1500);
                    }
                    
                    // 所有卡片使用相同的图标动画效果
                    const icon = card.querySelector('.data-icon');
                    if (icon) {
                        icon.animate([
                            { filter: 'brightness(1)', transform: 'scale(1)' },
                            { filter: 'brightness(1.3)', transform: 'scale(1.1)' },
                            { filter: 'brightness(1)', transform: 'scale(1)' }
                        ], {
                            duration: 1800,
                            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                        });
                    }
                    
                    // 延迟移除动画类
                    setTimeout(() => {
                        card.classList.remove('animate');
                    }, 2000);
                }, index * 100); // 每个卡片仅错开100毫秒，使动画看起来几乎同时发生
            });
        }
        
        // 检查图表卡片
        const visibleChartCards = Array.from(elements.chartCards).filter(
            card => isElementInViewport(card) && !card.classList.contains('has-animated')
        );
        
        // 如果有可见的图表卡片，让它们几乎同时开始动画
        if (visibleChartCards.length > 0) {
            visibleChartCards.forEach((card, index) => {
                setTimeout(() => {
                    // 添加动画类
                    card.classList.add('animate');
                    card.classList.add('has-animated');
                    
                    // 特殊处理满意度图表
                    const satisfactionNeedle = card.querySelector('.satisfaction-needle');
                    if (satisfactionNeedle) {
                        // 根据满意度值设置旋转角度
                        const satisfactionValue = card.querySelector('.satisfaction-value');
                        if (satisfactionValue) {
                            const value = parseFloat(satisfactionValue.textContent);
                            const degree = (value / 100) * 180 - 90; // 将百分比转换为角度（-90到90度）
                            card.style.setProperty('--satisfaction-degree', `${degree}deg`);
                            
                            // 所有卡片使用相同的满意度值动画效果
                            satisfactionValue.animate([
                                { textShadow: '0 0 0 rgba(255, 215, 0, 0)' },
                                { textShadow: '0 0 20px rgba(255, 215, 0, 0.8)' },
                                { textShadow: '0 0 5px rgba(255, 215, 0, 0.4)' }
                            ], {
                                duration: 2000,
                                easing: 'ease-out'
                            });
                        }
                    }
                }, index * 100); // 每个图表卡片仅错开100毫秒
            });
        }
    }
    
    // 添加滚动事件监听
    window.addEventListener('scroll', onScroll);
    
    // 初始检查（页面加载时）
    setTimeout(onScroll, 500);
}

/**
 * 初始化数据计数器
 */
function initCounters() {
    const counters = document.querySelectorAll('.data-value[data-target]');
    
    // 检测元素是否在视口内
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    // 计数动画函数
    function animateCounter(counter) {
        // 获取目标值
        const target = parseFloat(counter.getAttribute('data-target'));
        
        // 检查是否有百分号
        const hasPercent = counter.textContent.includes('%');
        
        // 当前值
        let current = 0;
        
        // 统一的增量 - 所有计数器使用相同的动画速度
        const increment = target / 50;
        
        // 更新函数
        const updateCounter = () => {
            current += increment;
            
            // 如果达到或超过目标值，设置为目标值
            if (current >= target) {
                counter.textContent = hasPercent ? `${target}%` : target;
                
                // 统一的高亮效果 - 所有计数器使用相同的效果
                counter.style.textShadow = '0 0 15px rgba(255, 215, 0, 0.7), 0 0 5px rgba(0, 0, 0, 0.3)';
                setTimeout(() => {
                    counter.style.textShadow = '';
                }, 1000);
                
                return;
            }
            
            // 更新计数器文本
            counter.textContent = hasPercent ? `${Math.ceil(current)}%` : Math.ceil(current);
            
            // 使用统一的动画间隔
            setTimeout(updateCounter, 30);
        };
        
        // 开始动画
        updateCounter();
        
        // 标记为已动画
        counter.setAttribute('data-animated', 'true');
    }
    
    // 滚动事件处理函数
    function onScroll() {
        // 找到视口内所有未动画的计数器
        const visibleCounters = Array.from(counters).filter(counter => 
            isElementInViewport(counter) && counter.getAttribute('data-animated') !== 'true'
        );
        
        // 如果有可见的计数器，为它们添加短暂的延迟，使它们几乎同时开始动画
        if (visibleCounters.length > 0) {
            visibleCounters.forEach((counter, index) => {
                setTimeout(() => {
                    animateCounter(counter);
                }, index * 100); // 每个计数器仅错开100毫秒，使动画看起来几乎同时发生
            });
        }
    }
    
    // 添加滚动事件监听
    window.addEventListener('scroll', onScroll);
    
    // 初始检查（页面加载时）
    setTimeout(onScroll, 500);
}

/**
 * 初始化内容可见度增强
 * 为所有数据卡片提供统一的初始样式和可见性增强
 */
function initVisibilityEnhancement() {
    // 获取所有数据卡片
    const dataCards = document.querySelectorAll('.data-card-redesigned');
    
    // 如果没有找到卡片，直接返回
    if (!dataCards.length) return;
    
    // 定义统一的样式配置
    const styles = {
        card: {
            boxShadow: '0 15px 35px rgba(7, 78, 156, 0.3), 0 5px 15px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)'
        },
        icon: {
            filter: 'drop-shadow(0 0 5px rgba(255, 215, 0, 0.5))',
            transition: 'all 0.4s ease'
        },
        value: {
            textShadow: '0 2px 10px rgba(255, 215, 0, 0.6), 0 0 5px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease'
        },
        label: {
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease'
        },
        description: {
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease'
        }
    };
    
    // 为每个卡片应用统一的样式
    dataCards.forEach(card => {
        // 应用卡片样式
        Object.assign(card.style, styles.card);
        
        // 应用图标样式
        const icon = card.querySelector('.data-icon i');
        if (icon) {
            Object.assign(icon.style, styles.icon);
        }
        
        // 应用数据值样式
        const dataValue = card.querySelector('.data-value');
        if (dataValue) {
            Object.assign(dataValue.style, styles.value);
        }
        
        // 应用标签样式
        const dataLabel = card.querySelector('.data-label');
        if (dataLabel) {
            Object.assign(dataLabel.style, styles.label);
        }
        
        // 应用描述文本样式
        const dataDesc = card.querySelector('.data-description-text');
        if (dataDesc) {
            Object.assign(dataDesc.style, styles.description);
        }
    });
    
    // 添加窗口调整大小事件监听器，确保在不同视口大小下保持一致的样式
    window.addEventListener('resize', function() {
        // 重新应用样式
        dataCards.forEach(card => {
            // 重新应用卡片样式
            Object.assign(card.style, styles.card);
            
            // 重新应用数据值样式
            const dataValue = card.querySelector('.data-value');
            if (dataValue) {
                Object.assign(dataValue.style, styles.value);
            }
        });
    });
    
    // 添加控制台日志以便调试
    console.log('内容可见度增强已初始化，共处理卡片数量:', dataCards.length);
}

/**
 * 初始化卡片背景动画效果
 * 为数据卡片的背景元素添加动态动画效果
 */
function initBackgroundAnimation() {
    // 获取所有数据卡片
    const dataCards = document.querySelectorAll('.data-card-redesigned');
    
    // 如果没有找到卡片，直接返回
    if (!dataCards.length) return;
    
    // 为每个卡片添加背景动画效果
    dataCards.forEach((card, index) => {
        // 获取背景元素
        const bg = card.querySelector('.data-card-bg');
        if (!bg) return;
        
        // 为卡片背景添加基本样式
        bg.style.overflow = 'hidden';
        bg.style.position = 'absolute';
        bg.style.top = '0';
        bg.style.left = '0';
        bg.style.width = '100%';
        bg.style.height = '100%';
        bg.style.zIndex = '0';
        
        // 获取或创建背景图像
        let bgImage = bg.querySelector('img');
        
        // 如果没有找到图像，创建一个并设置
        if (!bgImage) {
            bgImage = document.createElement('img');
            bgImage.src = '../assets/images/About Rongdian/company-data/chart-bg.png';
            bgImage.alt = '';
            bgImage.setAttribute('aria-hidden', 'true');
            bg.appendChild(bgImage);
        }
        
        // 设置图像样式
        bgImage.style.width = '100%';
        bgImage.style.height = '100%';
        bgImage.style.objectFit = 'cover';
        bgImage.style.opacity = '0.15';
        bgImage.style.transition = 'transform 8s ease-in-out, filter 4s ease-in-out';
        bgImage.style.willChange = 'transform, filter';
        
        // 创建统一的动画效果函数
        const animateBackground = () => {
            // 对所有卡片使用相同的动画效果
            bgImage.style.transform = 'scale(1.08) rotate(0.5deg)';
            bgImage.style.filter = 'brightness(1.05) contrast(1.05)';
            
            setTimeout(() => {
                bgImage.style.transform = 'scale(1) rotate(0deg)';
                bgImage.style.filter = 'brightness(1) contrast(1)';
            }, 8000);
            
            // 每16秒重复一次动画（8秒动画 + 8秒回到初始状态）
            setTimeout(animateBackground, 16000);
        };
        
        // 统一的动画开始时间，所有卡片动画同步开始
        setTimeout(() => {
            animateBackground();
        }, 100); // 所有卡片几乎同时开始动画
        
        // 添加鼠标悬停效果增强，所有卡片使用相同的悬停效果
        card.addEventListener('mouseenter', () => {
            bgImage.style.transition = 'transform 1s ease-out, filter 1s ease-out';
            bgImage.style.transform = 'scale(1.12)';
            bgImage.style.filter = 'brightness(1.2) contrast(1.15)';
        });
        
        card.addEventListener('mouseleave', () => {
            bgImage.style.transition = 'transform 4s ease-in-out, filter 4s ease-in-out';
            bgImage.style.transform = 'scale(1)';
            bgImage.style.filter = 'brightness(1) contrast(1)';
        });
    });
    
    // 添加全局的性能优化
    // 使用Intersection Observer来检测卡片是否在视口中，仅对可见卡片应用动画
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const card = entry.target;
                const bg = card.querySelector('.data-card-bg');
                if (!bg) return;
                
                const bgImage = bg.querySelector('img');
                if (!bgImage) return;
                
                if (entry.isIntersecting) {
                    // 卡片进入视口，启用动画
                    bgImage.style.transition = 'transform 8s ease-in-out, filter 4s ease-in-out';
                } else {
                    // 卡片离开视口，禁用动画以节省性能
                    bgImage.style.transition = 'none';
                }
            });
        }, {
            threshold: 0.2 // 当卡片至少有20%在视口中时触发
        });
        
        // 观察所有数据卡片
        document.querySelectorAll('.data-card-redesigned').forEach(card => {
            observer.observe(card);
        });
    }
    
    // 添加控制台日志以便调试
    console.log('背景动画已初始化，共处理卡片数量:', dataCards.length);
}

/**
 * 初始化数据卡片动画
 */
function initDataCardAnimations() {
    const dataCards = document.querySelectorAll('.data-card-redesigned');
    
    // 统一应用动画到所有图标
    function applyIconAnimation() {
        // 选择所有卡片图标，确保不遗漏
        const allIcons = document.querySelectorAll('.data-card-redesigned .data-icon i');
        
        allIcons.forEach(icon => {
            // 应用脉动动画
            icon.style.animation = 'pulse-icon 2s infinite alternate ease-in-out';
            
            // 如果页面没有定义这个动画，则添加
            if (!document.getElementById('icon-animations')) {
                const styleSheet = document.createElement('style');
                styleSheet.id = 'icon-animations';
                styleSheet.textContent = `
                    @keyframes pulse-icon {
                        0% { transform: scale(1); filter: brightness(1); }
                        100% { transform: scale(1.1); filter: brightness(1.2); }
                    }
                `;
                document.head.appendChild(styleSheet);
            }
        });
    }
    
    // 立即应用动画
    applyIconAnimation();
    
    // 为每个卡片添加鼠标进入/离开事件
    dataCards.forEach(card => {
        // 添加鼠标进入事件
        card.addEventListener('mouseenter', function() {
            // 添加动画类
            this.classList.add('animate');
            
            // 触发数据值计数动画
            const dataValue = this.querySelector('.data-value');
            if (dataValue) {
                dataValue.classList.add('counting');
                
                // 移除计数动画类（动画结束后）
                setTimeout(() => {
                    dataValue.classList.remove('counting');
                }, 1500);
            }
            
            // 统一的图标亮度增强效果
            const icon = this.querySelector('.data-icon i');
            if (icon) {
                icon.style.animation = 'none'; // 暂停持续动画
                icon.style.filter = 'brightness(1.2) drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))';
                icon.style.transform = 'scale(1.2)'; // 更明显的缩放效果
                icon.style.transition = 'all 0.3s ease';
            }
            
            // 统一的标签效果增强
            const label = this.querySelector('.data-label');
            if (label) {
                label.style.transform = 'translateY(-2px)';
                label.style.transition = 'all 0.3s ease';
            }
            
            // 统一的描述文本效果增强
            const desc = this.querySelector('.data-description-text');
            if (desc) {
                desc.style.opacity = '1';
                desc.style.transform = 'translateY(-2px)';
                desc.style.transition = 'all 0.3s ease';
            }
        });
        
        // 添加鼠标离开事件
        card.addEventListener('mouseleave', function() {
            // 移除动画类
            this.classList.remove('animate');
            
            // 统一恢复图标效果
            const icon = this.querySelector('.data-icon i');
            if (icon) {
                // 恢复持续动画
                icon.style.filter = '';
                icon.style.transform = '';
                icon.style.animation = 'pulse-icon 2s infinite alternate ease-in-out';
            }
            
            // 统一恢复标签效果
            const label = this.querySelector('.data-label');
            if (label) {
                label.style.transform = '';
            }
            
            // 统一恢复描述文本效果
            const desc = this.querySelector('.data-description-text');
            if (desc) {
                desc.style.opacity = '';
                desc.style.transform = '';
            }
        });
    });
    
    // 添加控制台日志以便调试
    console.log('数据卡片动画已初始化，共处理卡片数量:', dataCards.length, '所有图标都已应用统一动画');
} 

/**
 * 初始化趋势线动画
 */
function initTrendLineAnimation() {
    // 设置趋势点的初始位置变量
    const trendDots = document.querySelectorAll('.trend-dot');
    trendDots.forEach((dot, index) => {
        const yPos = [5, 0, -3, -7, -12][index];
        dot.style.setProperty('--y-pos', yPos + 'px');
    });
    
    // 添加趋势线悬停效果
    const dataCards = document.querySelectorAll('.data-card-redesigned');
    dataCards.forEach(card => {
        const trendLine = card.querySelector('.trend-line');
        if (trendLine) {
            card.addEventListener('mouseenter', () => {
                const dots = trendLine.querySelectorAll('.trend-dot');
                dots.forEach((dot, index) => {
                    // 增强趋势点亮度和大小
                    dot.style.transform = `translateY(${[5, 0, -3, -7, -12][index]}px) scale(1.3)`;
                    dot.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.8)';
                    dot.style.background = '#FFC800';
                });
                
                // 增强箭头效果
                const arrow = card.querySelector('.trend-arrow');
                if (arrow) {
                    arrow.style.color = '#FFC800';
                    arrow.style.transform = 'scale(1.3)';
                    arrow.style.textShadow = '0 0 15px rgba(255, 215, 0, 1)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const dots = trendLine.querySelectorAll('.trend-dot');
                dots.forEach((dot, index) => {
                    // 恢复趋势点样式
                    dot.style.transform = `translateY(${[5, 0, -3, -7, -12][index]}px)`;
                    dot.style.boxShadow = '0 0 5px rgba(255, 215, 0, 0.5)';
                    dot.style.background = '#FFD700';
                });
                
                // 恢复箭头效果
                const arrow = card.querySelector('.trend-arrow');
                if (arrow) {
                    arrow.style.color = '#FFD700';
                    arrow.style.transform = 'scale(1)';
                    arrow.style.textShadow = '0 0 8px rgba(255, 215, 0, 0.8)';
                }
            });
        }
    });
    
    console.log('趋势线动画已初始化');
}

/**
 * 初始化创新进度条动画
 */
function initInnovationBarAnimation() {
    const innovationBars = document.querySelectorAll('.innovation-progress');
    
    // 检测元素是否在视口内
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    // 滚动事件处理函数
    function onScroll() {
        innovationBars.forEach(bar => {
            if (isElementInViewport(bar)) {
                // 设置宽度为100%以触发动画
                bar.style.width = '100%';
            }
        });
    }
    
    // 添加滚动事件监听
    window.addEventListener('scroll', onScroll);
    
    // 初始检查
    setTimeout(onScroll, 500);
    
    console.log('创新进度条动画已初始化');
} 