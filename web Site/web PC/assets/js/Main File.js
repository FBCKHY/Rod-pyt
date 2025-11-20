/**
 * 主脚本文件 - main-merged.js
 * 
 * 描述：包含网站的主要交互功能和动画效果，以及页脚相关功能
 * 用途：处理导航栏交互、页面滚动效果、动画初始化、页脚交互等
 * 
 * 包含功能：
 * - 导航栏滚动效果（透明度和阴影变化）
 * - 导航栏滚动微动画（隐藏/显示/上拉效果）
 * - 当前页面导航项高亮
 * - 外部链接特殊处理
 * - AOS动画库初始化
 * - 返回顶部按钮功能
 * - 订阅表单验证与提交
 * - 统一页脚动态注入（新增）
 * 
 * 创建日期：2025-07-07
 * 最后修改：2025-07-14
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    console.log("🚀 高端厨电官网 - 前端脚本已加载");
    
    // 初始化统一页脚
    loadUnifiedFooter();
    
    // 初始化全局事件监听器（用于页脚等动态内容）
    initGlobalEventListeners();
    
    // 初始化页面预加载
    preloadPages();
    
    // 初始化AOS动画库
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            disable: '.slide-content, .hero-title-wrapper, .slide-content p, .hero-button'
        });
    }
    
    // 导航栏滚动效果
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        setupNavbarScroll(navbar);
    }
    
    // 设置当前活动页面的导航链接为激活状态
    setActiveNav();
    
    console.log("✨ 导航栏初始化完成");
});

function setupNavbarScroll(navbar) {
    const navbarHeight = navbar.offsetHeight;
    let lastScrollTop = 0;
    let ticking = false;

    // 初始透明度
    if (window.scrollY <= 50) {
        navbar.style.backgroundColor = 'rgba(7, 78, 156, 0.9)';
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                handleNavbarScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    function handleNavbarScroll() {
        const currentScrollTop = window.scrollY || document.documentElement.scrollTop;
        
        // 更加轻微的滚动检测，使收缩效果更加自然
        if (currentScrollTop > 30) {
            if (!navbar.classList.contains('navbar-scrolled')) {
                navbar.classList.add('navbar-scrolled');
            }
            // 优化背景不透明度变化，使其更加微妙
            const opacity = Math.min(1, 0.9 + (currentScrollTop / 800)); 
            navbar.style.backgroundColor = `rgba(4, 49, 102, ${opacity})`;
        } else {
            if (navbar.classList.contains('navbar-scrolled')) {
                // 延长过渡时间以匹配更轻微的变化
                setTimeout(() => navbar.classList.remove('navbar-scrolled'), 100);
            }
            navbar.style.backgroundColor = 'rgba(7, 78, 156, 0.9)';
        }
        lastScrollTop = currentScrollTop;
    }
}

function setActiveNav() {
    const currentLocation = location.pathname;
    const menuItems = document.querySelectorAll('.nav-link');

    menuItems.forEach(item => {
        item.classList.remove('active');
        item.removeAttribute('aria-current');
    });

    let activeItemFound = false;
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (!href) return;

        // 智能路径匹配 - 兼容文件访问和HTTP服务器访问
        let isMatch = false;
        
        // 检查当前页面是否是产品相关页面
        const isProductCatalog = currentLocation.includes('product-catalog') || currentLocation.includes('products');
        const isProductDetail = currentLocation.includes('product-detail');
        const isProductLink = href.includes('products.html');
        
        // 产品页面特殊处理
        if ((isProductCatalog || isProductDetail) && isProductLink) {
            isMatch = true;
        }
        // 首页匹配 - 处理 href="#" 和 href="../index.html" 两种情况
        else if ((href === '#' || href.includes('index.html')) && (currentLocation === '/' || currentLocation.endsWith('/index.html'))) {
            isMatch = true;
        }
        // 其他页面匹配 - 兼容不同的路径格式
        else {
            // 提取链接的页面名称（去掉路径和.html后缀）
            let linkPageName = href.replace(/\.html$/, '').replace(/^.*\//, '');
            
            // 如果链接包含 "pages/" 前缀，也提取页面名称
            if (href.includes('pages/')) {
                linkPageName = href.replace(/^.*pages\//, '').replace(/\.html$/, '');
            }
            
            // 检查当前路径是否包含该页面名称
            if (linkPageName && linkPageName !== '' && linkPageName !== '#' && (
                currentLocation.includes('/pages/' + linkPageName + '.html') ||
                currentLocation.includes('/pages/' + linkPageName) ||
                currentLocation.endsWith('/' + linkPageName) ||
                currentLocation.includes('/' + linkPageName + '.html') ||
                currentLocation.includes('/' + linkPageName)
            )) {
                isMatch = true;
            }
        }
        
        if (isMatch) {
            item.classList.add('active');
            item.setAttribute('aria-current', 'page');
            activeItemFound = true;
        }
    });

    // 首页默认激活逻辑 - 处理 href="#" 和 href="index.html" 两种情况
    if (!activeItemFound && (currentLocation === '/' || currentLocation.endsWith('/index.html'))) {
        const homeLink = document.querySelector('.nav-link[href="#"], .nav-link[href*="index.html"]');
        if (homeLink) {
            homeLink.classList.add('active');
            homeLink.setAttribute('aria-current', 'page');
        }
    }
    
    // 调试信息
    console.log('当前路径:', currentLocation, '- 已激活导航项');
}

/**
 * 统一页脚 - 动态加载页脚内容
 */
function loadUnifiedFooter() {
    // 检查页脚是否已存在
    if (document.getElementById('footer')) {
        console.log("⚠️ 页脚已存在，跳过动态加载。");
        return;
    }
    
    // 统一使用根路径，避免相对路径在不同目录层级失效
    const rootPath = '/';
    
    const footerHTML = `
    <footer class="footer global-footer" id="footer">
        <div class="footer-pattern"></div>
        <div class="container">
            <div class="footer-content">
                <div class="footer-company">
                    <a href="${rootPath}index.html" class="footer-logo"><img src="${rootPath}assets/images/Main File/容电log.png" alt="容电Logo"></a>
                    <div class="footer-company-info">容电科技成立于2010年，致力于为全球用户提供高端厨房电器解决方案。15年专注研发，打造智能、环保、高效的厨电产品，让生活更加美好。</div>
                    <div class="footer-social">
                        <a href="#" class="social-icon footer-social-icon" title="微信" aria-label="微信"><i class="fab fa-weixin"></i></a>
                        <a href="#" class="social-icon footer-social-icon" title="微博" aria-label="微博"><i class="fab fa-weibo"></i></a>
                        <a href="#" class="social-icon footer-social-icon" title="抖音" aria-label="抖音"><i class="fab fa-tiktok"></i></a>
                        <a href="#" class="social-icon footer-social-icon" title="领英" aria-label="领英"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
                <div class="footer-nav">
                    <h3 class="footer-nav-title">快速导航</h3>
                    <ul class="footer-nav-links">
                        <li><a href="${rootPath}index.html">首页</a></li>
                        <li><a href="${rootPath}pages/products.html">产品中心</a></li>
                        <li><a href="${rootPath}pages/about.html">关于容电</a></li>
                        <li><a href="${rootPath}pages/contact.html">联系我们</a></li>
                    </ul>
                </div>
                <div class="footer-contact">
                    <h3 class="footer-nav-title">联系我们</h3>
                    <div class="contact-item"><div class="contact-icon"><i class="fas fa-map-marker-alt"></i></div><div class="contact-text">中国上海市浦东新区张江高科技园区博云路2号</div></div>
                    <div class="contact-item"><div class="contact-icon"><i class="fas fa-phone-alt"></i></div><div class="contact-text">400-800-8888</div></div>
                    <div class="contact-item"><div class="contact-icon"><i class="fas fa-envelope"></i></div><div class="contact-text">contact@rongdian.com</div></div>
                    <div class="contact-item"><div class="contact-icon"><i class="fas fa-clock"></i></div><div class="contact-text">周一至周五: 9:00 - 18:00</div></div>
                </div>
                <div class="footer-subscribe">
                    <h3 class="footer-nav-title">订阅我们</h3>
                    <p class="footer-company-info">订阅我们的资讯推送，获取产品更新、行业资讯和促销活动的第一手消息。</p>
                    <form class="subscribe-form">
                        <div class="form-input-group">
                            <input type="text" class="subscribe-input" placeholder="请输入邮箱/微信号/手机号" required>
                            <button type="submit" class="subscribe-button footer-subscribe-button">订阅</button>
                        </div>
                        <div class="subscribe-info">支持邮箱、微信号、手机号订阅 · 我们尊重您的隐私，绝不会向第三方分享您的信息</div>
                    </form>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="footer-copyright"><img src="${rootPath}assets/images/Main File/容电log.png" alt="容电Logo" width="20" height="20"><span>&copy; 2010-2025 容电科技 版权所有</span></div>
                <div class="footer-links">
                    <a href="${rootPath}pages/privacy.html">隐私政策</a>
                    <a href="${rootPath}pages/terms.html">使用条款</a>
                    <a href="${rootPath}pages/sitemap.html">网站地图</a>
                </div>
            </div>
        </div>
        <div class="back-to-top" aria-label="返回顶部"><i class="fas fa-chevron-up"></i></div>
    </footer>`;
    
    document.body.insertAdjacentHTML('beforeend', footerHTML);
    console.log("✅ 统一页脚已动态加载");
}

/**
 * 初始化全局事件监听器，采用事件委托模式
 */
function initGlobalEventListeners() {
    console.log(" 事件委托机制已启动，监听页脚交互...");

    // 主监听器，处理点击事件
    document.addEventListener('click', function(e) {
        // 返回顶部按钮
        const backToTop = e.target.closest('.back-to-top');
        if (backToTop) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            console.log("🔝 返回顶部 by event delegation");
            return;
        }

        // 社交媒体图标
        const socialIcon = e.target.closest('.social-icon');
        if (socialIcon) {
            e.preventDefault();
            const platform = socialIcon.getAttribute('title') || '社交平台';
            alert(`即将前往 ${platform} 官方页面`);
            console.log(`🔗 点击 ${platform} 图标 by event delegation`);
            return;
        }
    });

    // 主监听器，处理表单提交
    document.addEventListener('submit', function(e) {
        // 订阅表单
        const subscribeForm = e.target.closest('.subscribe-form');
        if (subscribeForm) {
            e.preventDefault();
            console.log('📝 订阅表单提交事件触发');
            
            const contactInput = subscribeForm.querySelector('.subscribe-input');
            const contactValue = contactInput.value.trim();
            console.log('📧 输入的联系方式:', contactValue);

            if (isValidContact(contactValue)) {
                const contactType = getContactType(contactValue);
                console.log('✅ 联系方式验证通过，类型:', contactType);
                
                // 仅跳转到联系页面并携带参数，不直接调用后端
                showSubscribeMessage('正在跳转到联系页面...', 'success', subscribeForm);
                contactInput.disabled = true;

                // 写入 sessionStorage 兜底，防止查询参数在重定向中丢失
                try {
                    sessionStorage.setItem('subscribe_from', 'subscribe');
                    sessionStorage.setItem('subscribe_contact', contactValue);
                    sessionStorage.setItem('subscribe_type', contactType);
                    console.log('💾 已保存到 sessionStorage');
                } catch (e) {
                    console.error('❌ sessionStorage 保存失败:', e);
                }
                
                setTimeout(() => {
                    const encodedContact = encodeURIComponent(contactValue);
                    const encodedType = encodeURIComponent(contactType);
                    
                    // 使用绝对路径跳转到联系页面
                    const baseUrl = window.location.origin;
                    const contactPageUrl = `${baseUrl}/pages/contact.html?from=subscribe&contact=${encodedContact}&type=${encodedType}`;
                    
                    console.log('🔗 准备跳转到:', contactPageUrl);
                    console.log('🌐 当前页面:', window.location.href);
                    
                    // 跳转到联系页面并传递参数
                    window.location.href = contactPageUrl;
                }, 600);
            } else {
                showSubscribeMessage('请输入有效的邮箱、微信号或手机号', 'error', subscribeForm);
                contactInput.focus();
                console.log(`❌ 无效的联系方式 by event delegation`);
            }
        }
    });

    // 滚动监听器，处理返回顶部按钮的可见性
    window.addEventListener('scroll', function() {
        const backToTopButton = document.querySelector('.back-to-top');
        if (backToTopButton) {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        }
    });
}


/**
 * 显示订阅表单消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 (success/error)
 * @param {HTMLElement} formElement - 触发表单的元素
 */
function showSubscribeMessage(message, type, formElement) {
    const subscribeInfo = formElement.querySelector('.subscribe-info');
    if (!subscribeInfo) {
        alert(message);
        return;
    }
    
    const originalText = subscribeInfo.textContent;
    subscribeInfo.textContent = message;
    subscribeInfo.style.color = type === 'success' ? '#28a745' : '#dc3545';
    subscribeInfo.style.fontWeight = 'bold';

    setTimeout(() => {
        subscribeInfo.textContent = originalText;
        subscribeInfo.style.color = '';
        subscribeInfo.style.fontWeight = '';
    }, 3000);
}

/**
 * 验证电子邮件格式
 * @param {string} email - 要验证的电子邮件
 * @returns {boolean} 是否有效
 */
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/**
 * 验证手机号格式
 * @param {string} phone - 要验证的手机号
 * @returns {boolean} 是否有效
 */
function isValidPhone(phone) {
    const re = /^1[3-9]\d{9}$/;
    return re.test(phone);
}

/**
 * 验证微信号格式
 * @param {string} wechat - 要验证的微信号
 * @returns {boolean} 是否有效
 */
function isValidWechat(wechat) {
    // 微信号规则：6-20位，字母、数字、下划线、减号，必须以字母开头
    const re = /^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/;
    return re.test(wechat);
}

/**
 * 验证联系方式（邮箱、手机号或微信号）
 * @param {string} contact - 要验证的联系方式
 * @returns {boolean} 是否有效
 */
function isValidContact(contact) {
    if (!contact || contact.length === 0) {
        return false;
    }
    
    return isValidEmail(contact) || isValidPhone(contact) || isValidWechat(contact);
}

/**
 * 获取联系方式类型
 * @param {string} contact - 联系方式
 * @returns {string} 联系方式类型
 */
function getContactType(contact) {
    if (isValidEmail(contact)) {
        return '邮箱';
    } else if (isValidPhone(contact)) {
        return '手机号';
    } else if (isValidWechat(contact)) {
        return '微信号';
    }
    return '未知';
}

/**
 * 提交订阅到后端API
 * @param {string} contactType - 联系方式类型
 * @param {string} contactValue - 联系方式值
 * @param {string} source - 订阅来源
 * @returns {Promise} 订阅结果
 */
async function submitSubscriptionToAPI(contactType, contactValue, source = 'website_footer') {
    try {
        // 获取用户IP和User Agent
        const userAgent = navigator.userAgent;
        
        const response = await fetch('http://localhost:3000/api/subscriptions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contactType: mapContactTypeToAPI(contactType),
                contactValue: contactValue,
                source: source,
                userAgent: userAgent
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.code === 200) {
            return {
                success: true,
                data: result.data,
                message: result.msg
            };
        } else {
            return {
                success: false,
                message: result.msg || '订阅失败'
            };
        }
    } catch (error) {
        console.error('API调用失败:', error);
        return {
            success: false,
            message: '网络错误，请稍后重试'
        };
    }
}

/**
 * 映射联系方式类型到API格式
 * @param {string} contactType - 前端联系方式类型
 * @returns {string} API联系方式类型
 */
function mapContactTypeToAPI(contactType) {
    const typeMap = {
        '邮箱': 'email',
        '微信号': 'wechat',
        '手机号': 'phone'
    };
    return typeMap[contactType] || 'email';
}

// 页面预加载功能 (保持不变)
function preloadPages() {
    if (document.visibilityState === 'visible') {
        setTimeout(() => {
            document.querySelectorAll('.nav-link').forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !link.classList.contains('external-link')) {
                    const preloadLink = document.createElement('link');
                    preloadLink.href = href;
                    preloadLink.rel = 'prefetch';
                    preloadLink.as = 'document';
                    document.head.appendChild(preloadLink);
                }
            });
        }, 2000);
    }
} 