/**
 * 容电科技 - 公司概览重新设计 JavaScript
 * 负责处理公司概览区块的动画和交互效果
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化公司概览区块
    initCompanyOverview();
    
    // 监听滚动事件，添加视差效果
    window.addEventListener('scroll', function() {
        parallaxEffect();
    });
});

/**
 * 初始化公司概览区块
 */
function initCompanyOverview() {
    // 添加背景装饰元素
    addBackgroundElements();
    
    // 添加标题动画效果
    animateTitle();
    
    // 初始化数字计数器
    initCounters();
    
    // 添加鼠标悬停效果
    addHoverEffects();
}

/**
 * 添加背景装饰元素
 */
function addBackgroundElements() {
    const overviewSection = document.querySelector('.company-overview-redesigned');
    
    if (!overviewSection) return;
    
    // 创建背景元素容器
    const bgElements = document.createElement('div');
    bgElements.className = 'overview-bg-elements';
    
    // 添加圆形装饰
    for (let i = 1; i <= 5; i++) {
        const circle = document.createElement('div');
        circle.className = `overview-bg-circle circle-${i}`;
        bgElements.appendChild(circle);
    }
    
    // 添加线条装饰
    for (let i = 1; i <= 4; i++) {
        const line = document.createElement('div');
        line.className = `overview-bg-line line-${i}`;
        bgElements.appendChild(line);
    }
    
    // 将背景元素添加到区块中
    overviewSection.insertBefore(bgElements, overviewSection.firstChild);
}

/**
 * 为标题添加动画效果
 */
function animateTitle() {
    const title = document.querySelector('.overview-title');
    
    if (!title) return;
    
    // 将标题文本包裹在span中，以便应用动画
    const titleText = title.textContent;
    const words = titleText.split(' · ');
    
    if (words.length === 2) {
        title.innerHTML = `<span>${words[0]}</span> · <span>${words[1]}</span>`;
    }
    
    // 为标题添加淡入动画
    setTimeout(() => {
        const spans = title.querySelectorAll('span');
        spans.forEach((span, index) => {
            setTimeout(() => {
                span.style.opacity = '1';
                span.style.transform = 'translateY(0)';
            }, index * 300);
        });
    }, 500);
}

/**
 * 初始化数字计数器
 */
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    
    if (counters.length === 0) return;
    
    const options = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 2000; // 动画持续时间（毫秒）
                const step = target / (duration / 16); // 每16ms更新一次
                
                let current = 0;
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        counter.textContent = target;
                        clearInterval(timer);
                    } else {
                        counter.textContent = Math.floor(current);
                    }
                }, 16);
                
                observer.unobserve(counter);
            }
        });
    }, options);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

/**
 * 添加鼠标悬停效果
 */
function addHoverEffects() {
    // 为特点列表项添加悬停效果
    const featureItems = document.querySelectorAll('.feature-item');
    
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
    
    // 为品牌优势盒子添加悬停效果
    const advantageBoxes = document.querySelectorAll('.advantage-box');
    
    advantageBoxes.forEach(box => {
        box.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        box.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

/**
 * 视差滚动效果
 */
function parallaxEffect() {
    const overviewSection = document.querySelector('.company-overview-redesigned');
    
    if (!overviewSection) return;
    
    const scrollPosition = window.pageYOffset;
    const sectionTop = overviewSection.offsetTop;
    const sectionHeight = overviewSection.offsetHeight;
    
    // 检查区块是否在可视区域内
    if (scrollPosition > sectionTop - window.innerHeight && 
        scrollPosition < sectionTop + sectionHeight) {
        
        // 计算视差效果的偏移量
        const offset = (scrollPosition - sectionTop + window.innerHeight) * 0.1;
        
        // 应用视差效果
        const circles = document.querySelectorAll('.overview-bg-circle');
        circles.forEach((circle, index) => {
            const direction = index % 2 === 0 ? 1 : -1;
            const factor = (index % 3 + 1) * 0.1;
            circle.style.transform = `translate(${offset * direction * factor}px, ${offset * (direction * -1) * factor}px)`;
        });
        
        const lines = document.querySelectorAll('.overview-bg-line');
        lines.forEach((line, index) => {
            const direction = index % 2 === 0 ? 1 : -1;
            const rotation = 45 + (index * 15);
            line.style.transform = `rotate(${rotation}deg) translateY(${offset * direction * 0.2}px)`;
        });
    }
}

/**
 * 添加打字机效果
 * @param {HTMLElement} element - 要添加效果的元素
 * @param {string} text - 要显示的文本
 * @param {number} speed - 打字速度（毫秒）
 */
function typeWriterEffect(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

/**
 * 添加图片加载动画
 */
function animateImages() {
    const images = document.querySelectorAll('.overview-image-main img');
    
    images.forEach(img => {
        // 图片加载完成后添加动画
        img.onload = function() {
            this.classList.add('loaded');
        };
        
        // 如果图片已经加载完成
        if (img.complete) {
            img.classList.add('loaded');
        }
    });
} 