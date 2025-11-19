/**
 * 产品详情选项卡脚本 - product-details-tabs.js
 * 
 * 描述：处理产品详情页选项卡的交互功能
 * 用途：实现选项卡切换、评价过滤、图片查看等功能
 * 
 * 包含功能：
 * - 选项卡切换
 * - 评价过滤
 * - 评价图片查看
 * - 加载更多评价
 * 
 * 创建日期：2023-10-20
 */

// 在脚本顶部添加，确保页面加载时就执行，不等待DOM加载
(function() {
    // 检测页面是否是刷新操作
    if (performance.navigation && performance.navigation.type === 1) { // 1 表示页面刷新
        // 立即滚动到顶部
        window.scrollTo(0, 0);
        
        // 移除URL中的锚点
        if (window.location.hash && history.replaceState) {
            const cleanUrl = window.location.href.split('#')[0];
            history.replaceState(null, document.title, cleanUrl);
        }
        
        // 禁用浏览器的滚动恢复功能
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    console.log("🚀 产品详情选项卡脚本已加载");
    
    // 首先阻止URL中的锚点导致自动滚动
    if (window.location.hash) {
        // 如果是刷新操作，移除URL中的锚点并滚动到顶部
        if (performance.navigation.type === 1) { // 1 表示页面刷新
            if (history.replaceState) {
                const cleanUrl = window.location.href.split('#')[0];
                history.replaceState(null, document.title, cleanUrl);
            }
            // 滚动到页面顶部
            window.scrollTo(0, 0);
        } else {
            // 非刷新操作（如直接点击链接），保持当前位置
            const currentPosition = window.scrollY;
            
            // 防止自动滚动
            setTimeout(() => {
                window.scrollTo(0, currentPosition);
            }, 0);
        }
    } else {
        // 无锚点但是刷新操作，也滚动到顶部
        if (performance.navigation.type === 1) {
            window.scrollTo(0, 0);
        }
    }
    
    // 初始化选项卡切换
    initTabSwitching();
    
    // 初始化评价过滤
    initReviewsFilter();
    
    // 初始化评价图片查看
    initReviewImageViewer();
    
    // 初始化加载更多评价
    initLoadMoreReviews();
    
    // 初始化URL哈希导航
    initHashNavigation();
    
    // 隐藏产品特点中的图片
    hideFeatureImages();
    
    // 重新设计选项卡导航栏样式
    redesignTabsNavigation();
    
    // 重新设计产品特点区块
    redesignFeaturesBlock();
    
    // 重新设计产品描述区块
    redesignDescriptionBlock();
    
    // 移除产品详情区域的所有自适应缩放效果
    resetProductDisplay();
    
    // 删除指定的产品图片区域元素
    removeProductGalleryDiv();
    
    // 添加与左侧缩略图联动的主图展示区
    addLinkedProductDisplay();
    
    // 增强版 - 调整第二个单元格（主图显示区域）向右移动以实现居中效果
    moveSecondCellRight();
    
    // 创建紧凑型缩略图区域
    createCompactThumbnails();
    
    // 更换活动缩略图图片
    changeActiveThumbnail();
    
    // 修复缩略图与主图的联动问题
    fixThumbnailLinking();
    
    // 使产品图片区域响应式
    makeProductGalleryResponsive();
    
    // 删除推荐区域标题
    removeRecommendationsTitle();
});

/**
 * 重新设计产品描述区块内容和样式
 */
function redesignDescriptionBlock() {
    const descriptionContent = document.getElementById('description-content');
    if (!descriptionContent) {
        console.warn('未找到产品描述内容区块');
        return;
    }
    
    // 获取现有描述内容
    const descriptionHeader = descriptionContent.querySelector('.description-header');
    const descriptionTitle = descriptionHeader?.querySelector('h3')?.textContent || '星火Pro 燃气灶';
    const descriptionSubtitle = descriptionHeader?.querySelector('.description-subtitle')?.textContent || '';
    
    // 获取描述内容部分
    const descriptionSections = [];
    const sectionElements = descriptionContent.querySelectorAll('.description-section');
    
    sectionElements.forEach(section => {
        const title = section.querySelector('h4')?.textContent || '';
        const content = section.querySelector('p')?.textContent || '';
        
        if (title && content) {
            descriptionSections.push({
                title,
                content
            });
        }
    });
    
    // 获取主要描述内容
    const mainDescription = descriptionContent.querySelector('.description-content > p')?.textContent || '';
    
    // 清空现有内容
    descriptionContent.innerHTML = '';
    
    // 创建新样式
    const style = document.createElement('style');
    style.textContent = `
        .product-description-elegant {
            padding: 20px 0 40px;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #333;
            position: relative;
            overflow: hidden;
        }
        
        .description-elegant-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.4;
        }
        
        .description-elegant-bg::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(7, 78, 156, 0.03) 0%, transparent 50%, rgba(255, 215, 0, 0.03) 100%);
        }
        
        .description-elegant-bg::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                radial-gradient(circle at 20% 20%, rgba(7, 78, 156, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.03) 0%, transparent 50%);
        }
        
        .description-elegant-header {
            text-align: center;
            position: relative;
            padding-bottom: 30px;
            margin-bottom: 40px;
        }
        
        .description-elegant-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, #074E9C, #FFD700);
            border-radius: 3px;
        }
        
        .description-elegant-logo {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: linear-gradient(135deg, #003366, #074E9C);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            box-shadow: 0 5px 15px rgba(0, 51, 102, 0.2);
            position: relative;
        }
        
        .description-elegant-logo::before {
            content: '';
            position: absolute;
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
            border-radius: 50%;
            background: linear-gradient(135deg, #003366, #FFD700);
            z-index: -1;
            opacity: 0.2;
        }
        
        .description-elegant-logo i {
            font-size: 32px;
            color: white;
        }
        
        .description-elegant-title {
            font-size: 32px;
            font-weight: 600;
            color: #003366;
            margin-bottom: 10px;
            position: relative;
            display: inline-block;
        }
        
        .description-elegant-subtitle {
            font-size: 16px;
            color: #666;
            max-width: 700px;
            margin: 0 auto;
            line-height: 1.6;
        }
        
        .description-main {
            background: white;
            border-radius: 15px;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.05);
            padding: 30px;
            margin-bottom: 40px;
            position: relative;
            border-top: 3px solid #074E9C;
            border-bottom: 3px solid #FFD700;
        }
        
        .description-main p {
            font-size: 17px;
            line-height: 1.7;
            color: #444;
            margin: 0;
        }
        
        .description-main::before {
            content: '"';
            position: absolute;
            top: 15px;
            left: 15px;
            font-size: 60px;
            color: rgba(7, 78, 156, 0.1);
            font-family: Georgia, serif;
            line-height: 1;
        }
        
        .description-sections {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .description-section-card {
            background: white;
            border-radius: 12px;
            overflow: visible;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            position: relative;
        }
        
        .description-section-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .section-card-header {
            background: linear-gradient(135deg, #003366, #074E9C);
            color: white;
            padding: 15px 20px;
            position: relative;
            overflow: visible;
        }
        
        .section-card-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
            position: relative;
            z-index: 2;
            padding-left: 30px;
        }
        
        .section-card-icon {
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 18px;
            color: #FFD700;
            z-index: 3;
        }
        
        .section-card-content {
            padding: 20px;
            font-size: 15px;
            line-height: 1.6;
            color: #555;
        }
        
        .section-card-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #FFD700;
            color: #003366;
            font-size: 12px;
            font-weight: 600;
            padding: 5px 15px;
            border-radius: 15px;
            box-shadow: 0 3px 10px rgba(255, 215, 0, 0.3);
            z-index: 20;
            width: auto;
            white-space: nowrap;
            display: inline-block;
        }
        
        /* 专门为第二个和第四个卡片添加特殊样式 */
        #description-content > div > div.description-sections > div:nth-child(2) .section-card-badge,
        #description-content > div > div.description-sections > div:nth-child(4) .section-card-badge {
            right: 15px;
            top: 8px;
            padding: 5px 15px;
            font-size: 11px;
            transform: scale(0.95);
            transform-origin: right top;
        }
        
        .description-footer {
            text-align: center;
            margin-top: 40px;
        }
        
        .description-cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #074E9C, #003366);
            color: white;
            font-size: 16px;
            font-weight: 500;
            padding: 12px 30px;
            border-radius: 30px;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(7, 78, 156, 0.2);
        }
        
        .description-cta:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(7, 78, 156, 0.3);
        }
        
        .description-cta i {
            margin-right: 8px;
            font-size: 18px;
            color: #FFD700;
        }
        
        @media (max-width: 768px) {
            .description-sections {
                grid-template-columns: 1fr;
            }
            
            .description-elegant-title {
                font-size: 26px;
            }
            
            .description-main p {
                font-size: 16px;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 创建新的描述内容
    const elegantDescription = document.createElement('div');
    elegantDescription.className = 'product-description-elegant';
    
    // 添加背景装饰
    const bgElement = document.createElement('div');
    bgElement.className = 'description-elegant-bg';
    elegantDescription.appendChild(bgElement);
    
    // 创建标题部分
    const headerElement = document.createElement('div');
    headerElement.className = 'description-elegant-header';
    
    const logoElement = document.createElement('div');
    logoElement.className = 'description-elegant-logo';
    const logoIcon = document.createElement('i');
    logoIcon.className = 'fas fa-fire';
    logoElement.appendChild(logoIcon);
    
    const titleElement = document.createElement('h2');
    titleElement.className = 'description-elegant-title';
    titleElement.textContent = descriptionTitle;
    
    const subtitleElement = document.createElement('p');
    subtitleElement.className = 'description-elegant-subtitle';
    subtitleElement.textContent = descriptionSubtitle;
    
    headerElement.appendChild(logoElement);
    headerElement.appendChild(titleElement);
    headerElement.appendChild(subtitleElement);
    elegantDescription.appendChild(headerElement);
    
    // 创建主要描述内容
    const mainDescriptionElement = document.createElement('div');
    mainDescriptionElement.className = 'description-main';
    
    const mainParagraph = document.createElement('p');
    mainParagraph.textContent = mainDescription;
    mainDescriptionElement.appendChild(mainParagraph);
    elegantDescription.appendChild(mainDescriptionElement);
    
    // 创建描述部分卡片
    const sectionsContainer = document.createElement('div');
    sectionsContainer.className = 'description-sections';
    
    // 设置每个部分对应的图标
    const sectionIcons = {
        '设计理念': 'lightbulb',
        '核心技术': 'microchip',
        '安全保障': 'shield-alt',
        '智能互联': 'wifi',
        '环保节能': 'leaf'
    };
    
    descriptionSections.forEach((section, index) => {
        const sectionCard = document.createElement('div');
        sectionCard.className = 'description-section-card';
        
        // 卡片头部
        const cardHeader = document.createElement('div');
        cardHeader.className = 'section-card-header';
        
        const iconName = sectionIcons[section.title] || 'info-circle';
        const cardIcon = document.createElement('i');
        cardIcon.className = `fas fa-${iconName} section-card-icon`;
        
        const cardTitle = document.createElement('h3');
        cardTitle.className = 'section-card-title';
        cardTitle.textContent = section.title;
        
        cardHeader.appendChild(cardIcon);
        cardHeader.appendChild(cardTitle);
        
        // 添加徽章（可选）
        if (section.title === '智能互联' || section.title === '核心技术') {
            const badge = document.createElement('div');
            badge.className = 'section-card-badge';
            badge.textContent = '创新科技';
            
            // 给第二个和第四个卡片添加特殊类
            if (index === 1 || index === 3) {
                badge.classList.add('special-badge');
            }
            
            cardHeader.appendChild(badge);
        }
        
        // 卡片内容
        const cardContent = document.createElement('div');
        cardContent.className = 'section-card-content';
        cardContent.textContent = section.content;
        
        sectionCard.appendChild(cardHeader);
        sectionCard.appendChild(cardContent);
        sectionsContainer.appendChild(sectionCard);
    });
    
    elegantDescription.appendChild(sectionsContainer);
    
    // 创建底部CTA
    const footerElement = document.createElement('div');
    footerElement.className = 'description-footer';
    
    const ctaButton = document.createElement('a');
    ctaButton.href = '#specs';
    ctaButton.className = 'description-cta';
    
    const ctaIcon = document.createElement('i');
    ctaIcon.className = 'fas fa-clipboard-list';
    
    ctaButton.appendChild(ctaIcon);
    ctaButton.appendChild(document.createTextNode('查看详细规格参数'));
    
    // 产品描述区块底部按钮
    ctaButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // 点击描述区块底部按钮后，先切换到规格参数选项卡
        document.querySelector('.tab-btn[data-tab="specs"]').click();
        
        // 然后滚动到选项卡导航栏的位置
        setTimeout(() => {
            scrollToTabsNavigation();
        }, 100);
    });
    
    footerElement.appendChild(ctaButton);
    elegantDescription.appendChild(footerElement);
    
    // 添加到页面
    descriptionContent.appendChild(elegantDescription);
    
    // 在页面加载后添加额外修复，确保徽章显示正常
    setTimeout(() => {
        const fixBadges = () => {
            const secondBadge = document.querySelector("#description-content > div > div.description-sections > div:nth-child(2) > div.section-card-header > div");
            const fourthBadge = document.querySelector("#description-content > div > div.description-sections > div:nth-child(4) > div.section-card-header > div");
            
            if (secondBadge) {
                secondBadge.style.right = '10px';
                secondBadge.style.top = '8px';
                secondBadge.style.zIndex = '100';
                secondBadge.style.fontSize = '11px';
                secondBadge.style.padding = '4px 12px';
            }
            
            if (fourthBadge) {
                fourthBadge.style.right = '10px';
                fourthBadge.style.top = '8px';
                fourthBadge.style.zIndex = '100';
                fourthBadge.style.fontSize = '11px';
                fourthBadge.style.padding = '4px 12px';
            }
        };
        
        // 执行一次
        fixBadges();
        
        // 再延迟执行一次，确保样式生效
        setTimeout(fixBadges, 300);
    }, 100);
}

/**
 * 重新设计产品特点区块内容和样式，进行优化
 */
function redesignFeaturesBlock() {
    const featuresContent = document.getElementById('features-content');
    if (!featuresContent) {
        console.warn('未找到产品特点内容区块');
        return;
    }
    
    // 清空现有内容
    featuresContent.innerHTML = '';
    
    // 创建主样式
    const style = document.createElement('style');
    style.textContent = `
        .product-features {
            font-family: var(--font-family);
            color: var(--neutral-gray-text-dark);
            padding: 30px 0 50px;
            position: relative;
            overflow: hidden;
        }
        
        /* 背景装饰元素 */
        .features-bg-decoration {
            position: absolute;
            z-index: 0;
            pointer-events: none;
            opacity: 0.5;
        }
        
        .features-bg-circle {
            border-radius: 50%;
            background: radial-gradient(circle, rgba(7, 78, 156, 0.05) 0%, transparent 70%);
        }
        
        .features-bg-circle-1 {
            width: 500px;
            height: 500px;
            top: -150px;
            left: -150px;
        }
        
        .features-bg-circle-2 {
            width: 300px;
            height: 300px;
            bottom: 10%;
            right: -100px;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%);
        }
        
        .features-bg-wave {
            position: absolute;
            width: 100%;
            height: 700px;
            background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' x2='0' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%23074E9C' stop-opacity='.03'/%3E%3Cstop offset='1' stop-color='%23FFD700' stop-opacity='.03'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpattern id='b' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath fill='url(%23a)' d='M0 100V0l50 50 50-50v100L50 50z'/%3E%3C/pattern%3E%3Crect width='100%25' height='100%25' fill='url(%23b)'/%3E%3C/svg%3E");
            opacity: 0.3;
            top: 0;
            left: 0;
            z-index: -1;
        }
        
        .product-features h3 {
            font-size: 36px;
            font-weight: 700;
            color: var(--brand-blue-dark);
            text-align: center;
            margin-bottom: 40px;
            position: relative;
            display: inline-block;
            left: 50%;
            transform: translateX(-50%);
        }
        
        .product-features h3::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 4px;
            background: linear-gradient(90deg, var(--brand-primary-blue), var(--brand-gold-primary));
            border-radius: 4px;
        }
        
        /* 特点介绍区块 */
        .features-intro {
            display: flex;
            background-color: var(--brand-white);
            border-radius: var(--border-radius-lg);
            box-shadow: var(--card-shadow);
            overflow: hidden;
            margin-bottom: 50px;
            position: relative;
            z-index: 1;
            transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        
        .features-intro:hover {
            transform: translateY(-5px);
            box-shadow: var(--card-shadow-hover);
        }
        
        .intro-content {
            flex: 1;
            padding: 40px;
            position: relative;
            z-index: 1;
        }
        
        .intro-content::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                radial-gradient(circle at 10% 10%, rgba(7, 78, 156, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 90% 90%, rgba(255, 215, 0, 0.03) 0%, transparent 50%);
            z-index: -1;
        }
        
        .intro-title {
            font-size: 28px;
            font-weight: 700;
            color: var(--brand-primary-blue);
            margin-bottom: 20px;
            position: relative;
            padding-bottom: 15px;
        }
        
        .intro-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 70px;
            height: 3px;
            background: var(--gold-gradient);
            border-radius: 3px;
        }
        
        .intro-content p {
            font-size: 17px;
            line-height: 1.8;
            color: var(--text-light);
            margin-bottom: 30px;
        }
        
        .intro-highlights {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 20px;
        }
        
        .highlight-item {
            display: flex;
            align-items: center;
            background: var(--brand-blue-soft);
            padding: 12px 20px;
            border-radius: 30px;
            transition: all 0.3s ease;
            border: 1px solid rgba(7, 78, 156, 0.08);
        }
        
        .highlight-item:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 10px 20px rgba(7, 78, 156, 0.1);
            background: linear-gradient(135deg, var(--brand-blue-soft), rgba(7, 78, 156, 0.05));
        }
        
        .highlight-item i {
            color: var(--brand-primary-blue);
            font-size: 22px;
            margin-right: 12px;
        }
        
        .highlight-item span {
            font-weight: 600;
            color: var(--brand-primary-blue);
            font-size: 15px;
        }
        
        .intro-badges {
            width: 280px;
            background: linear-gradient(135deg, var(--brand-primary-blue), var(--brand-blue-darker));
            padding: 40px 30px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 25px;
            position: relative;
            overflow: hidden;
        }
        
        .intro-badges::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 30%),
                radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 30%);
            z-index: 0;
        }
        
        .badge-energy {
            background: var(--brand-white-soft);
            border-radius: var(--border-radius-md);
            padding: 20px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .badge-energy:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .badge-header {
            font-weight: 700;
            color: var(--brand-blue-dark);
            margin-bottom: 15px;
            font-size: 16px;
        }
        
        .badge-rating {
            margin-bottom: 15px;
        }
        
        .rating-scale {
            display: flex;
            justify-content: center;
        }
        
        .scale-item {
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--brand-gray-silver);
            margin: 0 2px;
            color: var(--text-light);
            font-weight: 600;
            font-size: 15px;
            transition: all 0.3s ease;
            position: relative;
        }
        
        .scale-item.active {
            background: var(--button-success);
            color: var(--brand-white);
            transform: scale(1.1);
            z-index: 1;
        }
        
        .scale-item.active.plus {
            background: var(--button-success-dark);
        }
        
        .scale-item.active::after {
            content: '';
            position: absolute;
            top: -3px;
            left: -3px;
            right: -3px;
            bottom: -3px;
            border-radius: 3px;
            border: 1px solid var(--button-success);
            opacity: 0.5;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% {
                transform: scale(1);
                opacity: 0.5;
            }
            50% {
                transform: scale(1.1);
                opacity: 0.3;
            }
            100% {
                transform: scale(1);
                opacity: 0.5;
            }
        }
        
        .badge-footer {
            font-size: 13px;
            color: var(--text-muted);
        }
        
        .badge-tech {
            display: flex;
            align-items: center;
            background: var(--brand-white-soft);
            border-radius: var(--border-radius-md);
            padding: 18px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            position: relative;
            z-index: 1;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .badge-tech:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .tech-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--gold-gradient);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            box-shadow: 0 5px 10px rgba(255, 215, 0, 0.3);
        }
        
        .tech-icon i {
            color: var(--brand-white);
            font-size: 22px;
        }
        
        .tech-text {
            flex: 1;
        }
        
        .tech-title {
            font-weight: 700;
            color: var(--brand-blue-dark);
            font-size: 16px;
            line-height: 1.3;
            margin-bottom: 5px;
        }
        
        .tech-desc {
            font-size: 14px;
            color: var(--text-muted);
        }
        
        /* 特点分类标签 */
        .features-tabs {
            display: flex;
            justify-content: center;
            gap: 12px;
            margin-bottom: 40px;
        }
        
        .features-tab {
            padding: 12px 24px;
            background: var(--brand-gray-warm);
            border-radius: 30px;
            font-weight: 600;
            color: var(--text-light);
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid transparent;
            position: relative;
            overflow: hidden;
        }
        
        .features-tab::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: all 0.5s ease;
        }
        
        .features-tab:hover {
            background: var(--hover-bg-blue);
            transform: translateY(-3px);
            box-shadow: 0 5px 10px rgba(7, 78, 156, 0.1);
        }
        
        .features-tab:hover::before {
            left: 100%;
        }
        
        .features-tab.active {
            background: var(--brand-primary-blue);
            color: var(--brand-white);
            box-shadow: 0 5px 15px rgba(7, 78, 156, 0.2);
            transform: translateY(-3px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .features-tab.active::after {
            content: '';
            position: absolute;
            bottom: -3px;
            left: 50%;
            transform: translateX(-50%);
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--brand-gold-primary);
            box-shadow: 0 0 10px var(--brand-gold-primary);
        }
    `;
    document.head.appendChild(style);
    
    // 创建产品特点主容器
    const productFeatures = document.createElement('div');
    productFeatures.className = 'product-features';
    
    // 添加背景装饰元素
    const bgCircle1 = document.createElement('div');
    bgCircle1.className = 'features-bg-decoration features-bg-circle features-bg-circle-1';
    productFeatures.appendChild(bgCircle1);
    
    const bgCircle2 = document.createElement('div');
    bgCircle2.className = 'features-bg-decoration features-bg-circle features-bg-circle-2';
    productFeatures.appendChild(bgCircle2);
    
    const bgWave = document.createElement('div');
    bgWave.className = 'features-bg-wave';
    productFeatures.appendChild(bgWave);
    
    // 创建标题
    const title = document.createElement('h3');
    title.textContent = '星火Pro 燃气灶 - 产品特点';
    productFeatures.appendChild(title);
    
    // 创建产品特点概述
    const featuresIntro = document.createElement('div');
    featuresIntro.className = 'features-intro';
    
    // 介绍内容
    const introContent = document.createElement('div');
    introContent.className = 'intro-content';
    
    const introTitle = document.createElement('h4');
    introTitle.className = 'intro-title';
    introTitle.textContent = '行业领先 · 卓越品质';
    
    const introText = document.createElement('p');
    introText.textContent = '星火Pro燃气灶融合尖端科技与匠心工艺，以突破性的蓝焰技术和智能温控系统，实现热效率提升30%，为现代家庭带来高效、安全、节能的烹饪体验。六大核心特点全方位提升您的厨房品质，让烹饪成为一种享受。';
    
    const introHighlights = document.createElement('div');
    introHighlights.className = 'intro-highlights';
    
    // 创建高亮点
    const highlightData = [
        { icon: 'fire-alt', text: '热效率提升30%' },
        { icon: 'shield-alt', text: '多重安全保护' },
        { icon: 'leaf', text: '环保节能设计' }
    ];
    
    highlightData.forEach(item => {
        const highlightItem = document.createElement('div');
        highlightItem.className = 'highlight-item';
        
        const icon = document.createElement('i');
        icon.className = `fas fa-${item.icon}`;
        
        const span = document.createElement('span');
        span.textContent = item.text;
        
        highlightItem.appendChild(icon);
        highlightItem.appendChild(span);
        introHighlights.appendChild(highlightItem);
    });
    
    introContent.appendChild(introTitle);
    introContent.appendChild(introText);
    introContent.appendChild(introHighlights);
    
    // 徽章区域
    const introBadges = document.createElement('div');
    introBadges.className = 'intro-badges';
    
    // 能效等级徽章
    const badgeEnergy = document.createElement('div');
    badgeEnergy.className = 'badge-energy';
    
    const badgeHeader = document.createElement('div');
    badgeHeader.className = 'badge-header';
    badgeHeader.textContent = '能效等级';
    
    const badgeRating = document.createElement('div');
    badgeRating.className = 'badge-rating';
    
    const ratingScale = document.createElement('div');
    ratingScale.className = 'rating-scale';
    
    // 创建能效等级刻度
    const scaleItems = ['D', 'C', 'B', 'A', 'A+'];
    scaleItems.forEach((item, index) => {
        const scaleItem = document.createElement('span');
        scaleItem.className = 'scale-item';
        scaleItem.textContent = item;
        
        if (index >= 3) {
            scaleItem.classList.add('active');
            if (index === 4) {
                scaleItem.classList.add('plus');
            }
        }
        
        ratingScale.appendChild(scaleItem);
    });
    
    badgeRating.appendChild(ratingScale);
    
    const badgeFooter = document.createElement('div');
    badgeFooter.className = 'badge-footer';
    badgeFooter.textContent = '国家认证';
    
    badgeEnergy.appendChild(badgeHeader);
    badgeEnergy.appendChild(badgeRating);
    badgeEnergy.appendChild(badgeFooter);
    
    // 技术徽章
    const badgeTech = document.createElement('div');
    badgeTech.className = 'badge-tech';
    
    const techIcon = document.createElement('div');
    techIcon.className = 'tech-icon';
    
    const iconAward = document.createElement('i');
    iconAward.className = 'fas fa-award';
    techIcon.appendChild(iconAward);
    
    const techText = document.createElement('div');
    techText.className = 'tech-text';
    
    const techTitle = document.createElement('div');
    techTitle.className = 'tech-title';
    techTitle.textContent = '行业领先';
    
    const techDesc = document.createElement('div');
    techDesc.className = 'tech-desc';
    techDesc.textContent = '蓝焰专利技术';
    
    techText.appendChild(techTitle);
    techText.appendChild(techDesc);
    
    badgeTech.appendChild(techIcon);
    badgeTech.appendChild(techText);
    
    introBadges.appendChild(badgeEnergy);
    introBadges.appendChild(badgeTech);
    
    featuresIntro.appendChild(introContent);
    featuresIntro.appendChild(introBadges);
    productFeatures.appendChild(featuresIntro);
    
    // 特点分类标签
    const featuresTabs = document.createElement('div');
    featuresTabs.className = 'features-tabs';
    
    const tabsData = [
        { target: 'all', text: '全部特点', active: true },
        { target: 'performance', text: '性能' },
        { target: 'safety', text: '安全' },
        { target: 'design', text: '设计' }
    ];
    
    tabsData.forEach(tab => {
        const tabElement = document.createElement('div');
        tabElement.className = 'features-tab';
        if (tab.active) {
            tabElement.classList.add('active');
        }
        tabElement.setAttribute('data-target', tab.target);
        tabElement.textContent = tab.text;
        
        // 添加点击事件
        tabElement.addEventListener('click', function() {
            // 移除所有标签的active类
            document.querySelectorAll('.features-tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // 添加当前标签的active类
            this.classList.add('active');
            
            // 过滤特点卡片
            const target = this.getAttribute('data-target');
            const featureCards = document.querySelectorAll('.feature-card');
            
            featureCards.forEach(card => {
                if (target === 'all' || card.getAttribute('data-category') === target) {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.display = 'flex';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 50);
                    }, 300);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
        
        featuresTabs.appendChild(tabElement);
    });
    
    productFeatures.appendChild(featuresTabs);
    
    // 特点卡片网格
    const featuresGrid = document.createElement('div');
    featuresGrid.className = 'features-grid';
    
    // 添加样式
    const gridStyle = document.createElement('style');
    gridStyle.textContent = `
        /* 特点卡片网格 */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 30px;
            margin-bottom: 50px;
        }
        
        .feature-card {
            display: flex;
            background: var(--brand-white);
            border-radius: var(--border-radius-md);
            box-shadow: var(--card-shadow);
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            border: 1px solid rgba(7, 78, 156, 0.05);
            opacity: 0;
            transform: translateY(30px);
            animation: fadeInUp 0.6s forwards;
            animation-delay: calc(var(--index) * 0.1s);
        }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: var(--card-shadow-hover);
            border-color: rgba(7, 78, 156, 0.1);
        }
        
        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: linear-gradient(90deg, var(--brand-primary-blue), var(--brand-blue-lighter));
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .feature-card:hover::before {
            opacity: 1;
        }
        
        .feature-icon {
            width: 90px;
            background: linear-gradient(135deg, var(--brand-primary-blue), var(--brand-blue-darker));
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        
        .feature-icon::before {
            content: '';
            position: absolute;
            width: 150%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transform: skewX(-25deg);
            top: 0;
            left: -150%;
            transition: all 0.5s ease;
        }
        
        .feature-card:hover .feature-icon::before {
            left: 150%;
        }
        
        .feature-icon i {
            font-size: 32px;
            color: var(--brand-white);
            position: relative;
            z-index: 1;
            transition: all 0.3s ease;
        }
        
        .feature-card:hover .feature-icon i {
            transform: scale(1.2);
            color: var(--brand-gold-primary);
        }
        
        .feature-content {
            flex: 1;
            padding: 25px;
            position: relative;
        }
        
        .feature-content h4 {
            font-size: 20px;
            font-weight: 700;
            color: var(--brand-blue-dark);
            margin-bottom: 15px;
            position: relative;
            padding-bottom: 12px;
            transition: color 0.3s ease;
        }
        
        .feature-content h4::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 40px;
            height: 3px;
            background: var(--brand-gold-primary);
            transition: width 0.3s ease;
        }
        
        .feature-card:hover .feature-content h4::after {
            width: 60px;
        }
        
        .feature-content p {
            font-size: 15px;
            line-height: 1.7;
            color: var(--text-light);
            margin-bottom: 5px;
        }
        
        .feature-tag {
            position: absolute;
            top: 25px;
            right: 25px;
            background: var(--brand-gold-soft);
            color: var(--brand-blue-dark);
            font-size: 12px;
            font-weight: 700;
            padding: 5px 12px;
            border-radius: 20px;
            box-shadow: 0 3px 8px rgba(255, 215, 0, 0.15);
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 215, 0, 0.2);
        }
        
        .feature-card:hover .feature-tag {
            background: var(--brand-gold-primary);
            color: var(--brand-blue-dark);
            box-shadow: 0 5px 12px rgba(255, 215, 0, 0.3);
        }
        
        @media (max-width: 768px) {
            .features-intro {
                flex-direction: column;
            }
            
            .intro-badges {
                width: 100%;
                flex-direction: row;
                padding: 30px;
                justify-content: space-around;
            }
            
            .badge-energy, .badge-tech {
                width: 45%;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .feature-card {
                max-width: 500px;
                margin: 0 auto;
            }
        }
    `;
    document.head.appendChild(gridStyle);
    
    // 特点卡片数据
    const featureCardsData = [
        {
            icon: 'fire',
            title: '蓝焰技术',
            description: '专利蓝焰燃烧技术，热效率提升30%，火力更强劲，烹饪更高效。优化的燃气与空气混合比例，实现更充分燃烧，减少有害气体排放，更加环保健康。',
            tag: '专利技术',
            category: 'performance'
        },
        {
            icon: 'thermometer-half',
            title: '智能温控',
            description: '精准控制火力大小，从1档到12档无级调节，满足各种烹饪需求。智能传感器实时监测温度变化，自动调整火力，确保烹饪温度稳定，食材受热均匀。',
            tag: '智能科技',
            category: 'performance'
        },
        {
            icon: 'shield-alt',
            title: '防爆钢化玻璃',
            description: '采用5mm厚度高强度钢化玻璃面板，耐高温、抗冲击，安全可靠。特殊工艺处理，防刮擦、防腐蚀，经久耐用，使用寿命更长。',
            tag: '安全防护',
            category: 'safety'
        },
        {
            icon: 'broom',
            title: '易清洁设计',
            description: '一体成型设计，无缝隙结构，不积油污。表面采用纳米疏油涂层，油污不易附着，轻轻一擦即可清洁如新，让厨房始终保持整洁。',
            tag: '便捷生活',
            category: 'design'
        },
        {
            icon: 'bolt',
            title: '脉冲电子点火',
            description: '采用高能脉冲电子点火系统，点火成功率高达99.9%。轻轻旋转旋钮即可点火，无需手动点火，更加安全便捷。',
            tag: '便捷操作',
            category: 'safety'
        },
        {
            icon: 'hand-sparkles',
            title: '人性化操作',
            description: '人体工程学设计的控制旋钮，手感舒适，操作精准。大角度旋转设计，火力调节更加直观，让烹饪过程得心应手。',
            tag: '精准控制',
            category: 'design'
        },
        {
            icon: 'stopwatch',
            title: '定时烹饪',
            description: '内置智能定时系统，可设置精确烹饪时间，到点自动熄火，避免过度烹饪和食材浪费。同时有效防止忘记关火导致的安全隐患，让烹饪更加智能化。',
            tag: '智能控制',
            category: 'safety'
        },
        {
            icon: 'mobile-alt',
            title: '智能互联',
            description: '支持与智能家居系统连接，可通过手机APP远程监控燃气灶状态，随时掌握使用情况。智能语音助手兼容，支持语音控制，解放双手，提升烹饪体验。',
            tag: '智慧厨房',
            category: 'performance'
        }
    ];
    
    // 创建特点卡片
    featureCardsData.forEach((card, index) => {
        const featureCard = document.createElement('div');
        featureCard.className = 'feature-card';
        featureCard.setAttribute('data-category', card.category);
        featureCard.style.setProperty('--index', index); // 为动画延迟设置变量
        
        const iconDiv = document.createElement('div');
        iconDiv.className = 'feature-icon';
        
        const icon = document.createElement('i');
        icon.className = `fas fa-${card.icon}`;
        iconDiv.appendChild(icon);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'feature-content';
        
        const title = document.createElement('h4');
        title.textContent = card.title;
        
        const description = document.createElement('p');
        description.textContent = card.description;
        
        const tag = document.createElement('div');
        tag.className = 'feature-tag';
        tag.textContent = card.tag;
        
        contentDiv.appendChild(title);
        contentDiv.appendChild(description);
        contentDiv.appendChild(tag);
        
        featureCard.appendChild(iconDiv);
        featureCard.appendChild(contentDiv);
        
        featuresGrid.appendChild(featureCard);
    });
    
    productFeatures.appendChild(featuresGrid);
    
    // 性能指标比较
    const featuresComparison = document.createElement('div');
    featuresComparison.className = 'features-comparison';
    // 设置更宽的宽度
    featuresComparison.style.cssText = `
        width: 100%;
        max-width: 1400px;
        margin-left: auto;
        margin-right: auto;
        padding: 40px;
        box-sizing: border-box;
        overflow-x: auto; /* 添加横向滚动，确保在小屏幕上也能完整显示 */
    `;
    
    // 添加样式
    const comparisonStyle = document.createElement('style');
    comparisonStyle.textContent = `
        /* 性能指标比较 */
        .features-comparison {
            background: var(--brand-gray-platinum);
            border-radius: var(--border-radius-lg);
            padding: 40px;
            margin-bottom: 50px;
            box-shadow: var(--card-shadow);
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(7, 78, 156, 0.05);
            opacity: 0;
            transform: translateY(30px);
            animation: fadeIn 0.8s forwards;
            animation-delay: 0.6s;
        }
        
        @keyframes fadeIn {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .features-comparison::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 150px;
            height: 150px;
            background: radial-gradient(circle, rgba(7, 78, 156, 0.05) 0%, transparent 70%);
            z-index: 0;
        }
        
        .comparison-title {
            font-size: 24px;
            font-weight: 700;
            color: var(--brand-blue-dark);
            text-align: center;
            margin-bottom: 30px;
            position: relative;
            display: inline-block;
            left: 50%;
            transform: translateX(-50%);
            padding-bottom: 15px;
        }
        
        .comparison-title::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, var(--brand-primary-blue), var(--brand-gold-primary), var(--brand-primary-blue));
            border-radius: 3px;
            background-size: 200% 100%;
            animation: gradient 3s infinite linear;
        }
        
        @keyframes gradient {
            0% {
                background-position: 0% 0%;
            }
            100% {
                background-position: 200% 0%;
            }
        }
        
        .comparison-chart {
            display: flex;
            flex-direction: column;
            gap: 30px;
            max-width: 900px;
            margin: 0 auto;
        }
        
        .chart-item {
            display: flex;
            align-items: center;
            gap: 25px;
            opacity: 0;
            transform: translateX(-20px);
            animation: slideInRight 0.5s forwards;
            width: 100%;
            margin-bottom: 15px; /* 增加项目间距 */
        }
        
        .chart-item:nth-child(1) { animation-delay: 0.8s; }
        .chart-item:nth-child(2) { animation-delay: 1.0s; }
        .chart-item:nth-child(3) { animation-delay: 1.2s; }
        
        @keyframes slideInRight {
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .chart-label {
            width: 120px;
            font-weight: 700;
            color: var(--brand-blue-dark);
            flex-shrink: 0;
            font-size: 16px;
            text-align: right;
            padding-right: 5px;
            border-right: 3px solid var(--brand-primary-blue);
        }
        
        .chart-bars {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 15px;
            width: calc(100% - 140px); /* 确保图表占据更多宽度 */
        }
        
        .bar-container {
            display: flex;
            align-items: center;
            gap: 15px;
            width: 100%; /* 确保条形图容器占满宽度 */
        }
        
        .bar-label {
            width: 110px;
            font-size: 15px;
            color: var(--text-light);
            flex-shrink: 0;
            display: flex;
            align-items: center;
        }
        
        .bar-label::before {
            content: '';
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 8px;
            background: var(--brand-blue-lighter);
        }
        
        .bar-container:nth-child(2) .bar-label::before {
            background: var(--brand-gold-primary);
        }
        
        .bar-wrapper {
            flex: 1;
            height: 28px;
            background: var(--brand-gray-silver);
            border-radius: 14px;
            overflow: hidden;
            position: relative;
            box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
            min-width: 600px; /* 确保条形图有足够的最小宽度 */
            width: 100%; /* 占满可用空间 */
        }
        
        .bar {
            height: 100%;
            background: linear-gradient(90deg, var(--brand-blue-lighter), var(--brand-primary-blue));
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 15px;
            font-size: 14px;
            font-weight: 700;
            color: var(--brand-white);
            border-radius: 14px;
            width: 0;
            transition: width 1.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .bar.highlight {
            background: linear-gradient(90deg, var(--accent-yellow-light), var(--accent-yellow));
            color: var(--brand-blue-dark);
        }
        
        .bar.animate {
            width: var(--width);
        }
        
        .bar.no-width {
            width: auto;
            padding: 0 15px;
            justify-content: center;
            min-width: 70px;
        }
    `;
    document.head.appendChild(comparisonStyle);
    
    // 创建比较标题
    const comparisonTitleElement = document.createElement('h4');
    comparisonTitleElement.className = 'comparison-title';
    comparisonTitleElement.textContent = '性能指标对比';
    featuresComparison.appendChild(comparisonTitleElement);
    
    // 创建比较图表
    const comparisonChartElement = document.createElement('div');
    comparisonChartElement.className = 'comparison-chart';
    // 设置更宽的宽度
    comparisonChartElement.style.cssText = `
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
    `;
    
    // 比较项数据
    const chartData = [
        {
            label: '热效率',
            normalValue: '50%',
            normalWidth: '50%',
            proValue: '65%',
            proWidth: '65%'
        },
        {
            label: '点火成功率',
            normalValue: '85%',
            normalWidth: '85%',
            proValue: '99.9%',
            proWidth: '99.9%'
        },
        {
            label: '火力调节',
            normalValue: '5档',
            normalWidth: '0px',
            proValue: '12档',
            proWidth: '0px'
        }
    ];
    
    // 创建比较项
    chartData.forEach(item => {
        const chartItem = document.createElement('div');
        chartItem.className = 'chart-item';
        
        const chartLabel = document.createElement('div');
        chartLabel.className = 'chart-label';
        chartLabel.textContent = item.label;
        
        const chartBars = document.createElement('div');
        chartBars.className = 'chart-bars';
        
        // 普通燃气灶条形图
        const normalBarContainer = document.createElement('div');
        normalBarContainer.className = 'bar-container';
        
        const normalBarLabel = document.createElement('div');
        normalBarLabel.className = 'bar-label';
        normalBarLabel.textContent = '普通燃气灶';
        
        const normalBarWrapper = document.createElement('div');
        normalBarWrapper.className = 'bar-wrapper';
        
        const normalBar = document.createElement('div');
        normalBar.className = 'bar';
        if (item.normalWidth === '0px') {
            normalBar.classList.add('no-width');
        } else {
            normalBar.style.setProperty('--width', item.normalWidth);
        }
        normalBar.textContent = item.normalValue;
        
        normalBarWrapper.appendChild(normalBar);
        normalBarContainer.appendChild(normalBarLabel);
        normalBarContainer.appendChild(normalBarWrapper);
        
        // 星火Pro条形图
        const proBarContainer = document.createElement('div');
        proBarContainer.className = 'bar-container';
        
        const proBarLabel = document.createElement('div');
        proBarLabel.className = 'bar-label';
        proBarLabel.textContent = '星火Pro';
        
        const proBarWrapper = document.createElement('div');
        proBarWrapper.className = 'bar-wrapper';
        
        const proBar = document.createElement('div');
        proBar.className = 'bar highlight';
        if (item.proWidth === '0px') {
            proBar.classList.add('no-width');
        } else {
            proBar.style.setProperty('--width', item.proWidth);
        }
        proBar.textContent = item.proValue;
        
        proBarWrapper.appendChild(proBar);
        proBarContainer.appendChild(proBarLabel);
        proBarContainer.appendChild(proBarWrapper);
        
        chartBars.appendChild(normalBarContainer);
        chartBars.appendChild(proBarContainer);
        
        chartItem.appendChild(chartLabel);
        chartItem.appendChild(chartBars);
        
        comparisonChartElement.appendChild(chartItem);
    });
    
    featuresComparison.appendChild(comparisonChartElement);
    productFeatures.appendChild(featuresComparison);
    
    // 为图表添加动画
    setTimeout(() => {
        document.querySelectorAll('.bar:not(.no-width)').forEach(bar => {
            bar.classList.add('animate');
        });
    }, 1500);
    
    // 将创建的产品特点区块添加到页面
    featuresContent.appendChild(productFeatures);
    
    // 产品荣誉和认证
    const featuresAwards = document.createElement('div');
    featuresAwards.className = 'features-awards';
    
    // 添加样式
    const awardsStyle = document.createElement('style');
    awardsStyle.textContent = `
        /* 产品荣誉和认证 */
        .features-awards {
            background: var(--brand-white);
            border-radius: var(--border-radius-lg);
            padding: 40px;
            margin-bottom: 50px;
            box-shadow: var(--card-shadow);
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(7, 78, 156, 0.05);
            opacity: 0;
            transform: translateY(30px);
            animation: fadeIn 0.8s forwards;
            animation-delay: 0.9s;
        }
        
        .features-awards::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 60%;
            background: linear-gradient(180deg, transparent, rgba(7, 78, 156, 0.02));
            z-index: 0;
            pointer-events: none;
        }
        
        .awards-header {
            display: flex;
            align-items: center;
            margin-bottom: 40px;
            position: relative;
            justify-content: center;
        }
        
        .awards-header::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(7, 78, 156, 0.1), transparent);
            z-index: 0;
        }
        
        .awards-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: var(--gold-gradient);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
            position: relative;
            z-index: 1;
        }
        
        .awards-icon::before {
            content: '';
            position: absolute;
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), transparent);
            z-index: -1;
            animation: rotate 4s linear infinite;
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .awards-icon i {
            font-size: 28px;
            color: var(--brand-white);
        }
        
        .awards-header h4 {
            font-size: 26px;
            font-weight: 700;
            color: var(--brand-blue-dark);
            position: relative;
            z-index: 1;
            background: var(--brand-white);
            padding: 0 20px;
        }
        
        .awards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 25px;
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.8s forwards;
            animation-delay: 1.2s;
        }
        
        .award-item {
            display: flex;
            align-items: flex-start;
            background: var(--brand-gray-platinum);
            border-radius: var(--border-radius-md);
            padding: 25px;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            border: 1px solid rgba(7, 78, 156, 0.03);
            overflow: hidden;
        }
        
        .award-item:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
            background: var(--brand-white);
            border-color: rgba(7, 78, 156, 0.08);
        }
        
        .award-item::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            width: 0;
            background: linear-gradient(90deg, var(--brand-primary-blue), var(--brand-gold-primary));
            transition: width 0.3s ease;
        }
        
        .award-item:hover::after {
            width: 100%;
        }
        
        .award-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--brand-primary-blue), var(--brand-blue-darker));
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 20px;
            flex-shrink: 0;
            box-shadow: 0 5px 15px rgba(7, 78, 156, 0.2);
            position: relative;
            z-index: 1;
            transition: all 0.3s ease;
        }
        
        .award-item:hover .award-icon {
            transform: scale(1.1) rotate(10deg);
            background: var(--gold-gradient);
        }
        
        .award-icon i {
            font-size: 20px;
            color: var(--brand-white);
            transition: all 0.3s ease;
        }
        
        .award-item:hover .award-icon i {
            transform: scale(1.2);
        }
        
        .award-content {
            flex: 1;
        }
        
        .award-title {
            font-weight: 700;
            color: var(--brand-blue-dark);
            font-size: 16px;
            margin-bottom: 10px;
            line-height: 1.4;
            transition: color 0.3s ease;
        }
        
        .award-item:hover .award-title {
            color: var(--brand-primary-blue);
        }
        
        .award-desc {
            font-size: 14px;
            color: var(--text-light);
            line-height: 1.6;
        }
    `;
    document.head.appendChild(awardsStyle);
    
    // 创建标题部分
    const awardsHeader = document.createElement('div');
    awardsHeader.className = 'awards-header';
    
    const awardsIcon = document.createElement('div');
    awardsIcon.className = 'awards-icon';
    
    const awardIcon = document.createElement('i');
    awardIcon.className = 'fas fa-award';
    awardsIcon.appendChild(awardIcon);
    
    const awardsTitle = document.createElement('h4');
    awardsTitle.textContent = '产品荣誉与认证';
    
    awardsHeader.appendChild(awardsIcon);
    awardsHeader.appendChild(awardsTitle);
    
    featuresAwards.appendChild(awardsHeader);
    
    // 创建荣誉网格
    const awardsGrid = document.createElement('div');
    awardsGrid.className = 'awards-grid';
    
    // 荣誉数据
    const awardsData = [
        {
            icon: 'trophy',
            title: '2023年度中国厨电行业创新产品奖',
            desc: '由中国家用电器协会颁发，表彰在技术创新方面的突出贡献，特别肯定了蓝焰技术在提升热效率方面的革新。'
        },
        {
            icon: 'leaf',
            title: '国家节能环保认证产品',
            desc: '通过国家严格测试，符合最新节能环保标准，获得官方节能等级A+认证，为绿色低碳生活贡献力量。'
        },
        {
            icon: 'star',
            title: '消费者满意度五星级产品',
            desc: '根据用户评价和市场调研，在产品质量、性能表现和售后服务等方面获得消费者高度认可，满意度达95%以上。'
        }
    ];
    
    // 创建荣誉项
    awardsData.forEach((award, index) => {
        const awardItem = document.createElement('div');
        awardItem.className = 'award-item';
        awardItem.style.animationDelay = `${1.2 + index * 0.2}s`;
        
        const awardIconDiv = document.createElement('div');
        awardIconDiv.className = 'award-icon';
        
        const icon = document.createElement('i');
        icon.className = `fas fa-${award.icon}`;
        awardIconDiv.appendChild(icon);
        
        const awardContent = document.createElement('div');
        awardContent.className = 'award-content';
        
        const awardTitle = document.createElement('div');
        awardTitle.className = 'award-title';
        awardTitle.textContent = award.title;
        
        const awardDesc = document.createElement('div');
        awardDesc.className = 'award-desc';
        awardDesc.textContent = award.desc;
        
        awardContent.appendChild(awardTitle);
        awardContent.appendChild(awardDesc);
        
        awardItem.appendChild(awardIconDiv);
        awardItem.appendChild(awardContent);
        
        awardsGrid.appendChild(awardItem);
    });
    
    featuresAwards.appendChild(awardsGrid);
    productFeatures.appendChild(featuresAwards);
    
    // 产品特点总结
    const featuresSummary = document.createElement('div');
    featuresSummary.className = 'features-summary';
    
    // 添加样式
    const summaryStyle = document.createElement('style');
    summaryStyle.textContent = `
        /* 产品特点总结 */
        .features-summary {
            background: linear-gradient(135deg, var(--brand-primary-blue), var(--brand-blue-darker));
            border-radius: var(--border-radius-lg);
            padding: 50px;
            text-align: center;
            box-shadow: var(--card-shadow);
            position: relative;
            overflow: hidden;
            color: var(--brand-white);
            opacity: 0;
            transform: translateY(30px);
            animation: fadeIn 0.8s forwards;
            animation-delay: 1.5s;
        }
        
        .features-summary::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
                radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 30%),
                radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 30%);
            z-index: 0;
            pointer-events: none;
        }
        
        .features-summary p {
            font-size: 18px;
            line-height: 1.8;
            color: rgba(255, 255, 255, 0.9);
            max-width: 800px;
            margin: 0 auto 40px;
            position: relative;
            z-index: 1;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .summary-actions {
            display: flex;
            justify-content: center;
            gap: 25px;
            position: relative;
            z-index: 1;
        }
        
        .summary-actions button {
            padding: 14px 28px;
            border: none;
            border-radius: 30px;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
        }
        
        .summary-actions button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: all 0.6s ease;
        }
        
        .summary-actions button:hover::before {
            left: 100%;
        }
        
        .btn-learn-more {
            background: var(--gold-gradient);
            color: var(--brand-blue-dark);
            box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
        }
        
        .btn-learn-more:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 12px 25px rgba(255, 215, 0, 0.4);
        }
        
        .btn-compare {
            background: transparent;
            color: var(--brand-white);
            border: 2px solid rgba(255, 255, 255, 0.3) !important;
        }
        
        .btn-compare:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.5) !important;
        }
        
        .summary-highlight {
            display: inline-block;
            position: relative;
            z-index: 1;
            font-weight: 700;
            color: var(--brand-gold-primary);
        }
        
        .summary-highlight::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 6px;
            background: var(--brand-gold-primary);
            opacity: 0.3;
            z-index: -1;
        }
        
        @media (max-width: 768px) {
            .summary-actions {
                flex-direction: column;
                align-items: center;
            }
            
            .features-summary {
                padding: 30px 20px;
            }
            
            .features-summary p {
                font-size: 16px;
            }
        }
    `;
    document.head.appendChild(summaryStyle);
    
    // 创建总结文本
    const summaryText = document.createElement('p');
    
    // 使用HTML创建带有高亮效果的文本
    summaryText.innerHTML = '星火Pro燃气灶集<span class="summary-highlight">高效</span>、<span class="summary-highlight">安全</span>、<span class="summary-highlight">智能</span>、<span class="summary-highlight">便捷</span>于一体，是现代厨房的理想选择。无论您是烹饪爱好者还是追求高品质生活的家庭，星火Pro都能满足您的需求，为您带来愉悦的烹饪体验。';
    
    // 创建按钮区域
    const summaryActions = document.createElement('div');
    summaryActions.className = 'summary-actions';
    
    // 创建了解更多按钮
    const learnMoreBtn = document.createElement('button');
    learnMoreBtn.className = 'btn-learn-more';
    learnMoreBtn.innerHTML = '<i class="fas fa-info-circle"></i> 了解更多技术细节';
    
    // 添加点击事件
    learnMoreBtn.addEventListener('click', function() {
        // 点击后切换到产品描述选项卡
        document.querySelector('.tab-btn[data-tab="description"]').click();
        
        // 滚动到选项卡导航栏的位置
        setTimeout(() => {
            scrollToTabsNavigation();
        }, 100);
    });
    
    // 创建对比按钮
    const compareBtn = document.createElement('button');
    compareBtn.className = 'btn-compare';
    compareBtn.innerHTML = '<i class="fas fa-chart-bar"></i> 与其他产品对比';
    
    // 添加点击事件
    compareBtn.addEventListener('click', function() {
        // 点击后切换到规格参数选项卡
        document.querySelector('.tab-btn[data-tab="specs"]').click();
        
        // 滚动到选项卡导航栏的位置
        setTimeout(() => {
            scrollToTabsNavigation();
        }, 100);
    });
    
    summaryActions.appendChild(learnMoreBtn);
    summaryActions.appendChild(compareBtn);
    
    featuresSummary.appendChild(summaryText);
    featuresSummary.appendChild(summaryActions);
    
    productFeatures.appendChild(featuresSummary);
    
    // 将创建的产品特点区块添加到页面
    featuresContent.appendChild(productFeatures);
    
    // 初始化特点分类标签功能
    setTimeout(() => {
        initFeaturesTabs();
    }, 100);
    
    // 监听窗口滚动，实现滚动触发动画效果
    const handleScroll = () => {
        const comparisonEl = document.querySelector('.features-comparison');
        const awardsEl = document.querySelector('.features-awards');
        const summaryEl = document.querySelector('.features-summary');
        
        if (comparisonEl && isElementInViewport(comparisonEl) && !comparisonEl.classList.contains('animated')) {
            comparisonEl.classList.add('animated');
            setTimeout(() => {
                document.querySelectorAll('.bar:not(.no-width)').forEach(bar => {
                    bar.classList.add('animate');
                });
            }, 500);
        }
        
        if (awardsEl && isElementInViewport(awardsEl) && !awardsEl.classList.contains('animated')) {
            awardsEl.classList.add('animated');
        }
        
        if (summaryEl && isElementInViewport(summaryEl) && !summaryEl.classList.contains('animated')) {
            summaryEl.classList.add('animated');
        }
    };
    
    // 检查元素是否在视口中
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    window.addEventListener('scroll', handleScroll);
    
    // 初始检查一次
    setTimeout(handleScroll, 500);
}

/**
 * 初始化特点分类标签功能
 */
function initFeaturesTabs() {
    // 添加点击事件监听器到所有特点标签
    document.querySelectorAll('.features-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有标签的active类
            document.querySelectorAll('.features-tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // 添加当前标签的active类
            this.classList.add('active');
            
            // 过滤特点卡片
            const target = this.getAttribute('data-target');
            const featureCards = document.querySelectorAll('.feature-card');
            
            featureCards.forEach(card => {
                if (target === 'all' || card.getAttribute('data-category') === target) {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.display = 'flex';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 50);
                    }, 300);
        } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

/**
 * 重新设计选项卡导航栏样式并居中显示
 */
function redesignTabsNavigation() {
    const tabsNavigation = document.querySelector("body > section.product-details-tabs > div > div > div.tabs-navigation");
    
    if (!tabsNavigation) {
        console.warn('未找到选项卡导航栏元素');
        return;
    }
    
    // 添加新样式
    const style = document.createElement('style');
    style.textContent = `
        .tabs-navigation {
            display: flex;
            justify-content: center;
            width: 100%;
            margin: 0 auto 30px;
            padding: 15px 0;
            background: linear-gradient(135deg, #003366 0%, #074E9C 100%);
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(7, 78, 156, 0.2);
            position: relative;
            z-index: 10;
            text-align: center;
            border: 1px solid rgba(255, 215, 0, 0.3);
        }
        
        .tabs-navigation::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.8), transparent);
            border-radius: 12px 12px 0 0;
        }
        
        .tab-btn {
            position: relative;
            padding: 12px 25px;
            margin: 0 8px;
            background: transparent;
            border: none;
            border-radius: 30px;
            color: rgba(255, 255, 255, 0.85);
            font-weight: 500;
            font-size: 16px;
            transition: all 0.3s ease;
            cursor: pointer;
            overflow: hidden;
        }
        
        .tab-btn::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            z-index: -1;
            background: linear-gradient(45deg, #074E9C, #FFD700, #074E9C);
            background-size: 400% 400%;
            border-radius: 30px;
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .tab-btn:hover {
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
        }
        
        .tab-btn:hover::before {
            opacity: 0.3;
        }
        
        .tab-btn.active {
            color: #003366;
            background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
            box-shadow: 0 4px 12px rgba(255, 193, 7, 0.4);
            transform: translateY(-2px);
            font-weight: 600;
        }
        
        .tab-btn.active::before {
            opacity: 0;
        }
        
        .tab-btn:focus {
            outline: none;
        }
        
        .tab-btn::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%) scale(0);
            width: 8px;
            height: 8px;
            background-color: #FFD700;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
            transition: transform 0.3s ease, bottom 0.3s ease;
        }
        
        .tab-btn.active::after {
            transform: translateX(-50%) scale(1);
            bottom: -4px;
        }
        
        /* 添加装饰元素 */
        .tabs-navigation::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 8px;
            background-image: 
                radial-gradient(circle at 25% 100%, #FFD700 2px, transparent 2px),
                radial-gradient(circle at 75% 100%, #FFD700 2px, transparent 2px);
            background-size: 50% 8px;
            background-repeat: repeat-x;
            opacity: 0.2;
        }
        
        @media (max-width: 768px) {
            .tabs-navigation {
                flex-wrap: wrap;
                padding: 12px 5px;
            }
            
            .tab-btn {
                padding: 10px 15px;
                margin: 5px;
                font-size: 14px;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 为导航栏添加动画效果
    tabsNavigation.style.transition = 'all 0.3s ease';
    
    // 添加金色边框装饰
    const decorBefore = document.createElement('div');
    decorBefore.className = 'tabs-decor-before';
    decorBefore.style.cssText = `
        position: absolute;
        top: -3px;
        left: 15%;
        width: 70%;
        height: 3px;
        background: linear-gradient(90deg, transparent, #FFD700, transparent);
        border-radius: 3px;
    `;
    
    const decorAfter = document.createElement('div');
    decorAfter.className = 'tabs-decor-after';
    decorAfter.style.cssText = `
        position: absolute;
        bottom: -3px;
        left: 15%;
        width: 70%;
        height: 3px;
        background: linear-gradient(90deg, transparent, #FFD700, transparent);
        border-radius: 3px;
    `;
    
    tabsNavigation.appendChild(decorBefore);
    tabsNavigation.appendChild(decorAfter);
    
    // 确保所有选项卡按钮有一致的样式和效果
    const tabButtons = tabsNavigation.querySelectorAll('.tab-btn');
    if (tabButtons.length) {
        tabButtons.forEach(button => {
            // 添加金色小点装饰
            const dotDecor = document.createElement('span');
            dotDecor.className = 'tab-btn-dot';
            dotDecor.style.cssText = `
                position: absolute;
                bottom: -12px;
                left: 50%;
                transform: translateX(-50%) scale(0);
                width: 4px;
                height: 4px;
                background-color: #FFD700;
                border-radius: 50%;
                transition: all 0.3s ease;
                opacity: 0;
            `;
            button.appendChild(dotDecor);
            
            // 添加悬停效果
            button.addEventListener('mouseenter', function() {
                this.querySelector('.tab-btn-dot').style.transform = 'translateX(-50%) scale(1)';
                this.querySelector('.tab-btn-dot').style.opacity = '1';
            });
            
            button.addEventListener('mouseleave', function() {
                if (!this.classList.contains('active')) {
                    this.querySelector('.tab-btn-dot').style.transform = 'translateX(-50%) scale(0)';
                    this.querySelector('.tab-btn-dot').style.opacity = '0';
                }
            });
            
            // 特殊处理活动按钮
            if (button.classList.contains('active')) {
                button.querySelector('.tab-btn-dot').style.transform = 'translateX(-50%) scale(1)';
                button.querySelector('.tab-btn-dot').style.opacity = '1';
            }
            
            // 点击事件增加特效
            button.addEventListener('click', function() {
                // 为所有按钮移除活动状态的装饰效果
                tabButtons.forEach(btn => {
                    if (btn !== this) {
                        const dot = btn.querySelector('.tab-btn-dot');
                        if (dot) {
                            dot.style.transform = 'translateX(-50%) scale(0)';
                            dot.style.opacity = '0';
                        }
                    }
                });
                
                // 为当前按钮添加活动状态的装饰效果
                const dot = this.querySelector('.tab-btn-dot');
                if (dot) {
                    dot.style.transform = 'translateX(-50%) scale(1)';
                    dot.style.opacity = '1';
                }
            });
        });
    }
    
    // 添加闪光装饰效果
    const glowEffect = document.createElement('div');
    glowEffect.className = 'tabs-glow-effect';
    glowEffect.style.cssText = `
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        background: linear-gradient(
            90deg, 
            transparent, 
            rgba(255, 255, 255, 0.1), 
            rgba(255, 215, 0, 0.1), 
            rgba(255, 255, 255, 0.05), 
            transparent
        );
        transform: skewX(-15deg);
        animation: tabsGlowAnimation 6s infinite;
    `;
    tabsNavigation.appendChild(glowEffect);
    
    // 添加闪光动画
    const glowAnimation = document.createElement('style');
    glowAnimation.textContent = `
        @keyframes tabsGlowAnimation {
            0% {
                left: -100%;
            }
            20%, 100% {
                left: 100%;
            }
        }
    `;
    document.head.appendChild(glowAnimation);
}

/**
 * 隐藏产品特点选项卡中的图片
 */
function hideFeatureImages() {
    // 添加样式隐藏产品特点中的图片
    const style = document.createElement('style');
    style.textContent = `
        #features-content .feature-image {
            display: none;
        }
        
        #features-content .feature-highlight {
            display: flex;
            flex-direction: column;
            margin: 30px 0;
        }
        
        #features-content .feature-details {
            flex: 1;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 8px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
        }
        
        #features-content .feature-highlight.reverse {
            flex-direction: column;
        }
    `;
    document.head.appendChild(style);
}

/**
 * 初始化选项卡切换功能
 */
function initTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (!tabButtons.length || !tabContents.length) {
        console.warn('未找到选项卡元素');
        return;
    }
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const tabId = this.getAttribute('data-tab');
            
            // 隐藏所有选项卡内容
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // 取消选中所有选项卡按钮
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // 显示选中的选项卡内容
            document.getElementById(`${tabId}-content`).classList.add('active');
            
            // 选中当前选项卡按钮
            this.classList.add('active');
            
            // 更新URL但不触发页面滚动
            if (history.pushState) {
                history.pushState(null, document.title, `#${tabId}`);
            }
            
            // 标记为用户手动触发的点击操作
            window.scrollToTabsManuallyTriggered = true;
            
            // 滚动到选项卡导航栏位置，但仅在用户点击时
            setTimeout(() => {
                scrollToTabsNavigation();
            }, 50);
        });
    });
}

/**
 * 初始化评价过滤功能
 */
function initReviewsFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (!filterButtons.length) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有过滤按钮的active类
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // 激活当前过滤按钮
            this.classList.add('active');
            
            // 获取过滤类型
            const filterType = this.textContent.trim();
            console.log(`过滤评价: ${filterType}`);
            
            // 模拟过滤效果（实际项目中应该根据过滤类型从服务器获取评价数据）
            simulateFilterEffect(filterType);
        });
    });
    
    /**
     * 模拟评价过滤效果
     * @param {string} filterType 过滤类型
     */
    function simulateFilterEffect(filterType) {
        const reviewItems = document.querySelectorAll('.review-item');
        if (!reviewItems.length) return;
        
        // 添加过滤动画
        const reviewsList = document.querySelector('.reviews-list');
        if (reviewsList) {
            reviewsList.classList.add('filtering');
            
            setTimeout(() => {
                reviewsList.classList.remove('filtering');
            }, 500);
        }
    }
    
    // 添加过滤动画样式
    const style = document.createElement('style');
    style.textContent = `
        .reviews-list.filtering {
            opacity: 0.6;
            transition: opacity 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

/**
 * 初始化评价图片查看功能
 */
function initReviewImageViewer() {
    const reviewImages = document.querySelectorAll('.review-image');
    if (!reviewImages.length) return;
    
    reviewImages.forEach(imageContainer => {
        imageContainer.addEventListener('click', function() {
            const image = this.querySelector('img');
            if (!image) return;
            
            // 创建图片查看器
            const imageViewer = document.createElement('div');
            imageViewer.className = 'image-viewer';
            
            const viewerContent = document.createElement('div');
            viewerContent.className = 'viewer-content';
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'viewer-close';
            closeBtn.innerHTML = '&times;';
            
            const viewerImage = document.createElement('img');
            viewerImage.src = image.src;
            viewerImage.alt = image.alt;
            
            viewerContent.appendChild(closeBtn);
            viewerContent.appendChild(viewerImage);
            imageViewer.appendChild(viewerContent);
            document.body.appendChild(imageViewer);
            
            // 添加关闭事件
            closeBtn.addEventListener('click', function() {
                document.body.removeChild(imageViewer);
            });
            
            imageViewer.addEventListener('click', function(e) {
                if (e.target === this) {
                    document.body.removeChild(imageViewer);
                }
            });
            
            // 添加ESC键关闭
            document.addEventListener('keydown', function escHandler(e) {
                if (e.key === 'Escape') {
                    document.body.removeChild(imageViewer);
                    document.removeEventListener('keydown', escHandler);
                }
            });
        });
    });
    
    // 添加图片查看器样式
    const style = document.createElement('style');
    style.textContent = `
        .image-viewer {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .viewer-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
        }
        
        .viewer-content img {
            max-width: 100%;
            max-height: 90vh;
            object-fit: contain;
            border: 5px solid white;
            box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
        }
        
        .viewer-close {
            position: absolute;
            top: -40px;
            right: -40px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.3);
            border: none;
            color: white;
            font-size: 24px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .viewer-close:hover {
            background-color: rgba(255, 255, 255, 0.5);
            transform: rotate(90deg);
        }
    `;
    document.head.appendChild(style);
}

/**
 * 初始化加载更多评价功能
 */
function initLoadMoreReviews() {
    const loadMoreBtn = document.querySelector('.btn-more-reviews');
    if (!loadMoreBtn) return;
    
    loadMoreBtn.addEventListener('click', function() {
        // 显示加载中状态
        this.textContent = '加载中...';
        this.disabled = true;
        
        // 模拟加载更多评价（实际项目中应该从服务器获取更多评价数据）
        setTimeout(() => {
            // 创建新的评价项目
            const reviewsList = document.querySelector('.reviews-list');
            if (!reviewsList) return;
            
            // 获取第一个评价作为模板
            const firstReview = document.querySelector('.review-item');
            if (!firstReview) return;
            
            // 克隆现有评价并修改内容
            for (let i = 0; i < 3; i++) {
                const newReview = firstReview.cloneNode(true);
                
                // 修改评价日期（仅作演示用途）
                const dateElement = newReview.querySelector('.review-date');
                if (dateElement) {
                    const randomDay = Math.floor(Math.random() * 30) + 1;
                    const randomMonth = Math.floor(Math.random() * 12) + 1;
                    dateElement.textContent = `2023-${randomMonth.toString().padStart(2, '0')}-${randomDay.toString().padStart(2, '0')}`;
                }
                
                // 修改评价内容（仅作演示用途）
                const textElement = newReview.querySelector('.review-text p');
                if (textElement) {
                    const reviews = [
                        "这款燃气灶的质量非常好，火力均匀，控温精准，做菜很方便。安装也很简单，售后服务也很贴心。",
                        "外观设计很漂亮，和我家的厨房风格很搭。使用了一个月，感觉省气不少，而且清洁起来也很方便。",
                        "智能控温功能很实用，可以精确控制火力大小，煲汤和炖菜特别有用。总体来说是一次满意的购买。"
                    ];
                    textElement.textContent = reviews[i % reviews.length];
                }
                
                // 将新评价添加到列表中
                reviewsList.insertBefore(newReview, loadMoreBtn.parentNode);
            }
            
            // 恢复按钮状态
            this.textContent = '查看更多评价';
            this.disabled = false;
            
            // 如果评价数量达到一定值，隐藏加载更多按钮
            const reviewCount = document.querySelectorAll('.review-item').length;
            if (reviewCount >= 9) {
                this.parentNode.style.display = 'none';
            }
        }, 1000);
    });
}

/**
 * 初始化URL哈希导航
 * 允许通过URL哈希直接打开特定选项卡，但不自动滚动到该位置
 */
function initHashNavigation() {
    // 检查URL是否包含哈希
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const tabButton = document.querySelector(`.tab-btn[data-tab="${hash}"]`);
        
        if (tabButton) {
            // 阻止浏览器默认的锚点滚动行为
            window.addEventListener('load', function() {
                // 如果是通过刷新页面到达的，保持当前滚动位置
                if (performance.navigation.type === 1) { // 1 表示页面刷新
                    // 不执行滚动操作
                    // 移除URL中的锚点，但不影响历史记录
                    if (history.replaceState) {
                        // 保存当前URL的路径部分，不包含锚点
                        const cleanUrl = window.location.href.split('#')[0];
                        history.replaceState(null, document.title, cleanUrl);
                    }
                } else {
                    // 对于非刷新情况，例如直接点击链接，允许选项卡切换
            setTimeout(() => {
                tabButton.click();
            }, 100);
        }
            });
            
            // 对于页面加载后的点击，正常处理
            tabButton.addEventListener('click', function(e) {
                // 阻止默认的锚点滚动行为
                e.preventDefault();
                
                // 手动触发选项卡切换逻辑
                const tabId = this.getAttribute('data-tab');
                const tabContents = document.querySelectorAll('.tab-content');
                const tabButtons = document.querySelectorAll('.tab-btn');
                
                // 隐藏所有选项卡内容
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                // 取消选中所有选项卡按钮
                tabButtons.forEach(button => {
                    button.classList.remove('active');
                });
                
                // 显示选中的选项卡内容
                document.getElementById(`${tabId}-content`).classList.add('active');
                
                // 选中当前选项卡按钮
                this.classList.add('active');
                
                // 更新URL但不触发页面滚动
                if (history.pushState) {
                    history.pushState(null, document.title, `#${tabId}`);
                }
            });
        }
    }
}

/**
 * 滚动到选项卡导航栏位置，确保其完全显示
 * 但仅在用户主动点击触发时执行滚动
 */
function scrollToTabsNavigation() {
    // 检查是否是用户触发的点击操作，而不是页面刷新
    if (window.scrollToTabsManuallyTriggered !== true) {
        // 标记已经触发过
        window.scrollToTabsManuallyTriggered = true;
        return;
    }
    
    // 找到产品详情选项卡区域
    const tabsSection = document.querySelector("body > section.product-details-tabs");
    if (!tabsSection) return;
    
    // 计算滚动位置，考虑页面顶部的固定导航栏
    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
    
    // 直接滚动到选项卡区域上方100px的位置，确保完全显示
    const scrollPosition = tabsSection.offsetTop - headerHeight - 100;
    
    // 执行滚动
    window.scrollTo({
        top: Math.max(0, scrollPosition), // 确保不会滚动到负值位置
        behavior: 'smooth'
    });
    
    // 确保导航栏样式正确
    const tabsNavigation = document.querySelector("body > section.product-details-tabs > div > div > div.tabs-navigation");
    if (tabsNavigation) {
        setTimeout(() => {
            tabsNavigation.style.opacity = '1';
            tabsNavigation.style.visibility = 'visible';
            tabsNavigation.style.zIndex = '100';
            
            // 确保导航栏没有被隐藏
            const tabsNavigationParent = tabsNavigation.parentElement;
            if (tabsNavigationParent) {
                tabsNavigationParent.style.overflow = 'visible';
            }
        }, 300);
    }
}

/**
 * 移除产品展示区域所有的自适应缩放效果
 * 恢复原始的显示尺寸和布局
 */
function resetProductDisplay() {
    // 移除所有产品详情区域的缩放效果
    const productDetailSection = document.querySelector("body > section.product-detail-section > div > div");
    if (productDetailSection) {
        console.log("移除产品详情区域的所有缩放效果");
        
        // 移除transform样式并重置所有可能影响布局的属性
        productDetailSection.style.transform = 'none';
        productDetailSection.style.transformOrigin = '';
        productDetailSection.style.width = '';
        productDetailSection.style.height = '';
        
        // 确保子元素也恢复原始大小
        const childElements = productDetailSection.querySelectorAll('*');
        childElements.forEach(element => {
            if (element.style && element.style.transform) {
                element.style.transform = 'none';
                element.style.transformOrigin = '';
                element.style.width = '';
                element.style.height = '';
            }
        });
    } else {
        console.warn("未找到产品详情区域元素");
    }
}

/**
 * 使产品图片区域的大小与normal-view保持一致，并增加300px宽度
 */
function matchProductGallerySize() {
    // 获取normal-view元素
    const normalViewElement = document.querySelector("#normal-view");
    
    // 获取产品图片区域元素
    const productGalleryElement = document.querySelector("body > section.product-detail-section > div > div > div.product-gallery > table > tbody > tr > td:nth-child(2)");
    
    // 确保两个元素都存在
    if (!normalViewElement || !productGalleryElement) {
        console.warn("未找到要调整尺寸的元素");
        return;
    }
    
    console.log("将产品图片区域大小设置为与normal-view一致并增加300px宽度");
    
    // 获取normal-view的尺寸
    const normalViewRect = normalViewElement.getBoundingClientRect();
    const normalViewWidth = normalViewRect.width;
    const normalViewHeight = normalViewRect.height;
    
    console.log(`normal-view原始尺寸: ${normalViewWidth}px × ${normalViewHeight}px`);
    console.log(`产品图片区域新尺寸: ${normalViewWidth + 300}px × ${normalViewHeight}px`);
    
    // 应用尺寸到产品图片区域，宽度增加300px
    productGalleryElement.style.width = `${normalViewWidth + 300}px`;
    productGalleryElement.style.height = `${normalViewHeight}px`;
    productGalleryElement.style.display = 'flex';
    productGalleryElement.style.alignItems = 'center';
    productGalleryElement.style.justifyContent = 'center';
    productGalleryElement.style.overflow = 'hidden'; // 防止内容溢出
    
    // 调整父容器，确保增大的图片区域能够适当显示
    const galleryContainer = productGalleryElement.closest('.product-gallery');
    if (galleryContainer) {
        galleryContainer.style.maxWidth = 'none';
        galleryContainer.style.overflowX = 'auto';
    }
    
    // 在窗口大小改变时重新调整尺寸
    window.addEventListener('resize', function() {
        // 重新获取尺寸
        const newNormalViewRect = normalViewElement.getBoundingClientRect();
        const newWidth = newNormalViewRect.width;
        const newHeight = newNormalViewRect.height;
        
        // 更新尺寸，宽度始终增加300px
        productGalleryElement.style.width = `${newWidth + 300}px`;
        productGalleryElement.style.height = `${newHeight}px`;
    });
}

/**
 * 删除指定的产品图片区域div元素
 */
function removeProductGalleryDiv() {
    // 查找需要删除的元素
    const targetElement = document.querySelector("body > section.product-detail-section > div > div > div.product-gallery > table > tbody > tr > td:nth-child(2) > div");
    
    if (targetElement) {
        console.log("找到目标元素，准备删除");
        
        // 获取父元素
        const parentElement = targetElement.parentNode;
        
        if (parentElement) {
            // 从DOM中移除目标元素
            parentElement.removeChild(targetElement);
            console.log("已成功删除指定的产品图片区域元素");
        } else {
            console.warn("未找到目标元素的父元素，无法删除");
        }
    } else {
        console.warn("未找到要删除的产品图片区域元素");
    }
}

/**
 * 添加与左侧缩略图联动的主图展示区
 * 在缩略图右侧添加主图展示，点击缩略图切换主图
 */
function addLinkedProductDisplay() {
    // 查找左侧缩略图单元格
    const thumbnailCell = document.querySelector("body > section.product-detail-section > div > div > div.product-gallery > table > tbody > tr > td:nth-child(1)");
    
    if (!thumbnailCell) {
        console.warn("未找到左侧缩略图单元格");
        return;
    }
    
    console.log("找到左侧缩略图单元格，准备添加联动主图展示区");
    
    // 获取父表格行
    const tableRow = thumbnailCell.parentElement;
    
    if (!tableRow) {
        console.warn("未找到表格行元素");
        return;
    }
    
    // 创建样式
    const style = document.createElement('style');
    style.textContent = `
        .main-image-display {
            padding: 20px;
            text-align: center;
        }
        
        .main-image-display img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }
        
        .main-image-display img:hover {
            transform: scale(1.02);
        }
        
        .thumbnail-item {
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.3s ease;
            margin-bottom: 10px;
            border-radius: 5px;
            opacity: 0.7;
        }
        
        .thumbnail-item:hover {
            border-color: #FFD700;
            opacity: 1;
        }
        
        .thumbnail-item.active {
            border-color: #074E9C;
            opacity: 1;
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
    
    // 创建右侧主图单元格
    const mainImageCell = document.createElement('td');
    mainImageCell.style.width = '70%'; // 设置宽度
    mainImageCell.style.verticalAlign = 'top';
    
    // 创建主图容器
    const mainImageContainer = document.createElement('div');
    mainImageContainer.className = 'main-image-display';
    
    // 创建主图
    const mainImage = document.createElement('img');
    mainImage.id = 'product-main-image';
    mainImage.alt = '产品主图';
    
    // 将主图添加到容器
    mainImageContainer.appendChild(mainImage);
    mainImageCell.appendChild(mainImageContainer);
    
    // 将主图单元格添加到行
    tableRow.insertBefore(mainImageCell, tableRow.children[1]);
    
    // 处理左侧缩略图 - 添加点击事件和样式
    const thumbnailImages = thumbnailCell.querySelectorAll('img');
    
    if (thumbnailImages.length > 0) {
        // 设置第一个缩略图为活动状态并加载主图
        thumbnailImages[0].classList.add('thumbnail-item', 'active');
        mainImage.src = thumbnailImages[0].src;
        
        // 为所有缩略图添加类和点击事件
        thumbnailImages.forEach((thumbnail, index) => {
            if (index > 0) {
                thumbnail.classList.add('thumbnail-item');
            }
            
            thumbnail.addEventListener('click', function() {
                // 更新主图
                mainImage.src = this.src;
                
                // 更新缩略图活动状态
                thumbnailImages.forEach(thumb => {
                    thumb.classList.remove('active');
                });
                this.classList.add('active');
            });
        });
    } else {
        // 如果没有找到缩略图，使用默认图片
        mainImage.src = '../assets/images/product center/gas-stove/星火Pro 燃气灶.png';
        console.warn("未找到缩略图，使用默认图片");
    }
    
    console.log("联动主图展示区添加完成");
}

/**
 * 增强版 - 调整第二个单元格（主图显示区域）向右移动以实现居中效果
 * 使用更可靠的方法确保在所有情况下都能正确居中
 */
function moveSecondCellRight() {
    // 查找product-gallery容器
    const galleryContainer = document.querySelector("body > section.product-detail-section > div > div > div.product-gallery");
    
    // 查找表格中的第一个和第二个单元格
    const firstCell = document.querySelector("body > section.product-detail-section > div > div > div.product-gallery > table > tbody > tr > td:nth-child(1)");
    const secondCell = document.querySelector("body > section.product-detail-section > div > div > div.product-gallery > table > tbody > tr > td:nth-child(2)");
    
    if (!galleryContainer || !firstCell || !secondCell) {
        console.warn("未找到必要的元素，无法调整位置");
        return;
    }
    
    console.log("找到所有元素，开始调整第二个单元格的位置");
    
    // 获取表格元素和表格行
    const table = secondCell.closest('table');
    const tableRow = firstCell.parentElement;
    
    // 添加全新的布局样式
    const style = document.createElement('style');
    style.textContent = `
            /* 产品展示区容器样式 */
    body > section.product-detail-section > div > div > div.product-gallery {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        position: relative; /* 为绝对定位提供参考 */
    }
    
    /* 确保表格整体居中 */
    body > section.product-detail-section > div > div > div.product-gallery > table {
        margin: 0 auto !important;
    }
        
        /* 表格布局样式 */
        body > section.product-detail-section > div > div > div.product-gallery > table {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            border-collapse: separate;
            border-spacing: 0;
        }
        
            /* 表格行样式 - 使用flex布局实现更好的控制 */
    body > section.product-detail-section > div > div > div.product-gallery > table > tbody > tr {
        display: flex;
        align-items: center; /* 子元素上下居中 */
        justify-content: center;
        min-height: 450px; /* 确保行有足够的高度 */
        position: relative; /* 为绝对定位提供参考 */
        padding-left: 0; /* 移除左侧内边距 */
    }
    
    /* 左侧缩略图单元格样式 */
    body > section.product-detail-section > div > div > div.product-gallery > table > tbody > tr > td:nth-child(1) {
        flex: 0 0 120px; /* 固定宽度 */
        padding-right: 20px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        position: relative;
        align-self: center; /* 确保上下居中 */
        justify-content: center; /* 内容垂直居中 */
    }
    
    /* 右侧主图单元格样式 */
    body > section.product-detail-section > div > div > div.product-gallery > table > tbody > tr > td:nth-child(2) {
        flex: 1 1 auto; /* 灵活增长和收缩 */
        min-width: 60%;
        max-width: 70%; /* 稍微减小最大宽度 */
        display: flex;
        justify-content: center;
        align-items: center;
        align-self: center; /* 居中对齐 */
        margin: 0 auto; /* 水平居中 */
        position: relative; /* 使定位更准确 */
        left: -40px; /* 向左偏移以弥补缩略图区域的影响 */
    }
        
        /* 主图内容容器样式 */
        body > section.product-detail-section > div > div > div.product-gallery > table > tbody > tr > td:nth-child(2) > div {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        /* 响应式调整 */
        @media (max-width: 768px) {
            body > section.product-detail-section > div > div > div.product-gallery > table > tbody > tr {
                flex-direction: column;
                align-items: center;
                min-height: auto; /* 移动端不设置最小高度 */
            }
            
            /* 移动端缩略图区域特殊处理 */
            body > section.product-detail-section > div > div > div.product-gallery > table > tbody > tr > td:nth-child(1) {
                margin-bottom: 20px;
                padding-right: 0;
            }
            
            body > section.product-detail-section > div > div > div.product-gallery > table > tbody > tr > td:nth-child(1) {
                flex: none;
                width: 100%;
                padding-right: 0;
                margin-bottom: 20px;
                display: flex;
                justify-content: center;
            }
            
            body > section.product-detail-section > div > div > div.product-gallery > table > tbody > tr > td:nth-child(2) {
                flex: none;
                width: 100%;
                padding-left: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 应用关键样式到表格元素
    if (table) {
        table.style.width = "100%";
        table.style.maxWidth = "1200px";
        table.style.margin = "0 auto";
        table.style.borderCollapse = "separate";
        table.style.borderSpacing = "0";
    }
    
    // 应用flex布局到表格行
    if (tableRow) {
        tableRow.style.display = "flex";
        tableRow.style.alignItems = "flex-start";
        tableRow.style.justifyContent = "center";
    }
    
    // 设置左侧缩略图单元格样式 - 与主图区域相关联
    firstCell.style.flex = "0 0 120px";
    firstCell.style.paddingRight = "20px";
    firstCell.style.boxSizing = "border-box";
    firstCell.style.position = "relative"; // 使用相对定位
    firstCell.style.alignSelf = "center"; // 确保上下居中
    firstCell.style.display = "flex";
    firstCell.style.flexDirection = "column";
    firstCell.style.justifyContent = "center"; // 内容垂直居中
    
    // 设置右侧主图单元格样式
    secondCell.style.flex = "1 1 auto"; // 改为弹性增长
    secondCell.style.minWidth = "60%"; // 最小宽度
    secondCell.style.maxWidth = "70%"; // 稍微减小最大宽度
    secondCell.style.display = "flex";
    secondCell.style.justifyContent = "center";
    secondCell.style.alignItems = "center"; 
    secondCell.style.alignSelf = "center"; // 垂直居中
    secondCell.style.margin = "0 auto"; // 水平居中
    secondCell.style.position = "relative"; // 使用相对定位
    secondCell.style.left = "-40px"; // 向左偏移以弥补缩略图区域的影响
    
    // 确保主图容器内部元素也居中
    const mainImageContainer = secondCell.querySelector('.main-image-display');
    if (mainImageContainer) {
        mainImageContainer.style.width = "100%";
        mainImageContainer.style.height = "100%"; // 使容器填满单元格高度
        mainImageContainer.style.display = "flex";
        mainImageContainer.style.justifyContent = "center";
        mainImageContainer.style.alignItems = "center";
        
        // 确保图片能够正确显示且保持纵横比
        const mainImage = mainImageContainer.querySelector('img');
        if (mainImage) {
            mainImage.style.maxHeight = "100%";
            mainImage.style.maxWidth = "100%";
            mainImage.style.objectFit = "contain";
        }
    }
    
    // 确保缩略图容器在单元格中垂直居中
    const thumbnailContainer = firstCell.querySelector('.compact-thumbnails');
    if (thumbnailContainer) {
        thumbnailContainer.style.display = "flex";
        thumbnailContainer.style.flexDirection = "column";
        thumbnailContainer.style.justifyContent = "center"; // 垂直居中
        thumbnailContainer.style.alignItems = "center";
        thumbnailContainer.style.overflowY = "auto"; // 如果缩略图太多，允许滚动
        thumbnailContainer.style.maxHeight = "400px"; // 限制最大高度，防止过长
        thumbnailContainer.style.padding = "10px 0"; // 添加上下内边距
    }
    
    // 确保产品展示区容器使用flex布局
    if (galleryContainer) {
        galleryContainer.style.display = "flex";
        galleryContainer.style.flexDirection = "column";
        galleryContainer.style.alignItems = "center";
        galleryContainer.style.width = "100%";
    }
    
    // 添加窗口大小调整监听器，确保在浏览器调整大小时保持居中
    const adjustCentering = () => {
        // 调整主图区域到整个容器的中间位置
        if (galleryContainer && secondCell) {
            const galleryWidth = galleryContainer.offsetWidth;
            const firstCellWidth = firstCell.offsetWidth;
            const secondCellWidth = secondCell.offsetWidth;
            
            // 计算居中所需的偏移量
            const idealLeft = (galleryWidth - firstCellWidth - secondCellWidth) / 2;
            const offset = idealLeft - 40; // 40是左侧单元格的大约位置
            
            // 应用偏移，确保主图居中
            secondCell.style.left = offset > 0 ? `-${offset}px` : "0";
        }
        
        if (window.innerWidth <= 768) {
            // 小屏幕设备特殊处理
            if (tableRow) tableRow.style.flexDirection = "column";
            if (firstCell) {
                firstCell.style.flex = "none";
                firstCell.style.width = "100%";
                firstCell.style.paddingRight = "0";
                firstCell.style.marginBottom = "20px";
                firstCell.style.display = "flex";
                firstCell.style.justifyContent = "center";
                firstCell.style.height = "auto"; // 在小屏幕上高度自适应
                firstCell.style.alignSelf = "center"; // 确保上下居中
            }
            if (secondCell) {
                secondCell.style.flex = "none";
                secondCell.style.width = "100%";
                secondCell.style.maxWidth = "100%"; // 在小屏幕上允许占满宽度
                secondCell.style.paddingLeft = "0";
            }
        } else {
            // 大屏幕设备
            if (tableRow) tableRow.style.flexDirection = "row";
            if (firstCell) {
                firstCell.style.flex = "0 0 120px";
                firstCell.style.width = "";
                firstCell.style.paddingRight = "20px";
                firstCell.style.marginBottom = "0";
                firstCell.style.display = "";
                firstCell.style.justifyContent = "";
                firstCell.style.height = "100%"; // 重置高度为100%
            }
            if (secondCell) {
                secondCell.style.flex = "1 1 auto";
                secondCell.style.minWidth = "60%";
                secondCell.style.maxWidth = "70%";
                secondCell.style.paddingLeft = "0";
                secondCell.style.alignSelf = "center";
                secondCell.style.margin = "0 auto";
                secondCell.style.left = "-40px"; // 保持向左偏移
            }
        }
    };
    
    // 立即应用居中调整
    adjustCentering();
    
    // 在窗口大小改变时重新调整
    window.addEventListener('resize', adjustCentering);
    
    console.log("第二个单元格位置调整完成 - 使用增强的居中技术");
}

/**
 * 创建紧凑型缩略图区域
 */
function createCompactThumbnails() {
    // 查找左侧缩略图单元格
    const thumbnailCell = document.querySelector("body > section.product-detail-section > div > div > div.product-gallery > table > tbody > tr > td:nth-child(1)");
    
    if (!thumbnailCell) {
        console.warn("未找到左侧缩略图单元格");
        return;
    }
    
    // 获取所有缩略图
    const thumbnails = thumbnailCell.querySelectorAll('img');
    
    if (!thumbnails.length) {
        console.warn("未找到缩略图");
        return;
    }
    
    // 创建小巧的样式
    const style = document.createElement('style');
    style.textContent = `
        .compact-thumbnails {
            width: 100px;
            padding: 5px;
        }
        
        .compact-thumb {
            width: 80px;
            height: auto;
            border: 1px solid #eee;
            border-radius: 4px;
            cursor: pointer;
            margin-bottom: 8px;
            opacity: 0.7;
            transition: all 0.2s ease;
        }
        
        .compact-thumb:hover {
            opacity: 1;
            border-color: #ddd;
        }
        
        .compact-thumb.active {
            border: 2px solid #074E9C;
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
    
    // 创建紧凑容器
    const compactContainer = document.createElement('div');
    compactContainer.className = 'compact-thumbnails';
    
    // 处理所有缩略图
    thumbnails.forEach((thumbnail, index) => {
        // 克隆缩略图
        const compactThumb = thumbnail.cloneNode(true);
        compactThumb.className = 'compact-thumb';
        if (index === 0) {
            compactThumb.classList.add('active');
        }
        
        // 保存原始点击事件
        const originalClick = thumbnail.onclick;
        
        // 添加点击事件
        compactThumb.addEventListener('click', function() {
            // 移除所有活动状态
            document.querySelectorAll('.compact-thumb').forEach(thumb => {
                thumb.classList.remove('active');
            });
            
            // 添加当前活动状态
            this.classList.add('active');
            
            // 执行原始点击事件
            if (typeof originalClick === 'function') {
                originalClick.call(this);
            } else if (thumbnail.parentNode) {
                thumbnail.click();
            }
        });
        
        compactContainer.appendChild(compactThumb);
    });
    
    // 清空原有内容并添加新内容
    thumbnailCell.innerHTML = '';
    thumbnailCell.appendChild(compactContainer);
    
    // 应用样式
    thumbnailCell.style.width = '100px';
    thumbnailCell.style.padding = '0';
    thumbnailCell.style.verticalAlign = 'top';
}

/**
 * 更换活动缩略图的图片
 */
function changeActiveThumbnail() {
    // 等待DOM完全加载
    setTimeout(() => {
        // 查找当前活动的缩略图
        const activeThumb = document.querySelector("body > section.product-detail-section > div > div > div.product-gallery > table > tbody > tr > td:nth-child(1) > div > img.compact-thumb.active");
        
        if (!activeThumb) {
            console.warn("未找到活动缩略图");
            return;
        }
        
        console.log("找到活动缩略图，准备更换图片");
        
        // 获取当前图片URL
        const currentSrc = activeThumb.src;
        console.log("当前图片URL:", currentSrc);
        
        // 定义新的图片URL - 使用产品相关的其他图片
        // 这里我们选择一个不同的图片来替换
        const newSrc = '../assets/images/home page/core-products/云魔方 抽油烟机.png';
        
        // 更新图片源
        activeThumb.src = newSrc;
        console.log("缩略图图片已更换为:", newSrc);
        
        // 同时更新主图
        const mainImage = document.querySelector("#product-main-image");
        if (mainImage) {
            mainImage.src = newSrc;
            console.log("主图也已更新");
        }
        
        // 触发点击事件以确保完全更新
        activeThumb.click();
    }, 500); // 等待500ms确保其他函数已执行完毕
}

/**
 * 修复缩略图与主图的联动问题
 * 确保点击左侧缩略图后右侧主图区域正确更新图片
 */
function fixThumbnailLinking() {
    console.log("开始修复缩略图与主图的联动问题");
    
    // 查找所有紧凑缩略图
    const thumbs = document.querySelectorAll("body > section.product-detail-section > div > div > div.product-gallery > table > tbody > tr > td:nth-child(1) > div > img.compact-thumb");
    
    // 查找主图元素
    const mainImage = document.querySelector("body > section.product-detail-section > div > div > div.product-gallery > table > tbody > tr > td:nth-child(2) > div > img");
    
    if (!thumbs.length || !mainImage) {
        console.warn("未找到缩略图或主图元素，无法修复联动");
        return;
    }
    
    console.log("找到", thumbs.length, "个缩略图和主图元素，正在建立联动关系");
    
    // 移除所有现有的点击事件（通过克隆和替换实现）
    thumbs.forEach((thumb, index) => {
        const newThumb = thumb.cloneNode(true);
        
        // 直接设置新的点击事件，确保更新主图
        newThumb.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            
            // 更新所有缩略图的活动状态
            document.querySelectorAll('.compact-thumb').forEach(t => {
                t.classList.remove('active');
            });
            
            // 设置当前缩略图为活动状态
            this.classList.add('active');
            
            // 更新主图
            mainImage.src = this.src;
            console.log("已更新主图为:", this.src);
        });
        
        // 替换原始缩略图
        if (thumb.parentNode) {
            thumb.parentNode.replaceChild(newThumb, thumb);
        }
    });
    
    // 初始状态 - 确保第一个缩略图为活动状态并更新主图
    const firstThumb = document.querySelector('.compact-thumb');
    if (firstThumb) {
        firstThumb.classList.add('active');
        mainImage.src = firstThumb.src;
    }
    
    // 添加调试输出 - 点击监听器
    document.querySelector('.compact-thumbnails').addEventListener('click', (e) => {
        if (e.target.classList.contains('compact-thumb')) {
            console.log("缩略图被点击:", e.target.src);
            console.log("当前主图:", mainImage.src);
        }
    });
    
    console.log("缩略图与主图联动修复完成");
}

/**
 * 使产品图片区域响应式，根据屏幕尺寸自动调整内容
 * 当屏幕变小时，图片会变大以保持良好的视觉体验
 */
function makeProductGalleryResponsive() {
    console.log("开始设置产品图片区域的响应式布局");
    
    // 查找产品图片区域容器和相关元素
    const galleryContainer = document.querySelector("body > section.product-detail-section > div > div > div.product-gallery");
    const productInfoContainer = document.querySelector("body > section.product-detail-section > div > div > div.product-info");
    const galleryRecommendations = document.querySelector("body > section.product-detail-section > div > div > div.product-gallery > div.gallery-recommendations");
    
    if (!galleryContainer) {
        console.warn("未找到产品图片区域容器");
        return;
    }
    
    // 创建响应式样式
    const responsiveStyle = document.createElement('style');
    responsiveStyle.textContent = `
        /* 基本响应式容器样式 */
        .product-gallery {
            width: 100% !important;
            max-width: 1200px !important;
            margin: 0 auto !important;
            transition: all 0.3s ease !important;
            position: relative !important; /* 允许绝对定位子元素 */
        }
        
        /* 表格响应式样式 */
        .product-gallery table {
            width: 100% !important;
            transition: all 0.3s ease !important;
        }
        
        /* 缩略图列样式 */
        .product-gallery table tr td:nth-child(1) {
            width: 100px !important;
            transition: all 0.3s ease !important;
            vertical-align: top !important;
        }
        
        /* 主图列样式 */
        .product-gallery table tr td:nth-child(2) {
            transition: all 0.3s ease !important;
            padding-left: 20px !important;
        }
        
        /* 主图容器样式 */
        .product-gallery .main-image-display {
            width: 100% !important;
            text-align: center !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
        }
        
        /* 主图样式 */
        .product-gallery .main-image-display img {
            max-width: 100% !important;
            height: auto !important;
            object-fit: contain !important;
            transition: transform 0.3s ease !important;
        }
        
        /* 缩略图容器样式 */
        .compact-thumbnails {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 10px !important;
            padding: 5px !important;
        }
        
        /* 缩略图样式 */
        .compact-thumb {
            width: 80px !important;
            height: auto !important;
            object-fit: cover !important;
            transition: all 0.3s ease !important;
        }
        
        /* 推荐区域样式 */
        .gallery-recommendations {
            width: 100% !important;
            margin-top: 20px !important;
        }
        
        /* 大屏幕布局 - 默认 */
        @media (min-width: 1200px) {
            .product-gallery table {
                table-layout: fixed !important;
            }
            
            .product-gallery table tr td:nth-child(2) {
                padding-left: 30px !important;
            }
            
            .product-gallery .main-image-display img {
                max-height: 500px !important;
            }
            
            .gallery-recommendations {
                margin-top: 30px !important;
            }
        }
        
        /* 中等屏幕布局 */
        @media (max-width: 1199px) and (min-width: 768px) {
            .product-gallery table tr td:nth-child(1) {
                width: 90px !important;
            }
            
            .compact-thumb {
                width: 70px !important;
            }
            
            .product-gallery .main-image-display img {
                max-height: 450px !important;
                transform: scale(1.15) !important; /* 增强放大效果 */
            }
        }
        
        /* 小屏幕布局 */
        @media (max-width: 767px) {
            .product-gallery {
                display: flex !important;
                flex-direction: column !important;
            }
            
            .product-gallery table {
                display: flex !important;
                flex-direction: column !important;
                order: 1 !important;
            }
            
            .gallery-recommendations {
                order: 2 !important;
                margin-top: 20px !important;
                margin-bottom: 30px !important;
                padding: 15px !important;
                background-color: rgba(248, 249, 250, 0.8) !important;
                border-radius: 8px !important;
            }
            
            .product-gallery table tbody, 
            .product-gallery table tr {
                display: flex !important;
                flex-direction: column !important;
                width: 100% !important;
            }
            
            .product-gallery table tr td:nth-child(1),
            .product-gallery table tr td:nth-child(2) {
                width: 100% !important;
                padding: 0 !important;
                margin-bottom: 15px !important;
            }
            
            .compact-thumbnails {
                flex-direction: row !important;
                justify-content: center !important;
                flex-wrap: wrap !important;
                background-color: rgba(248, 249, 250, 0.8) !important;
                border-radius: 8px !important;
                padding: 10px 5px !important;
                margin-bottom: 15px !important;
            }
            
            .compact-thumb {
                width: 65px !important;
                margin: 5px !important;
            }
            
            .product-gallery .main-image-display img {
                max-height: 400px !important; /* 增加最大高度 */
                transform: scale(1.3) !important; /* 显著增强放大效果 */
                margin-top: 10px !important; /* 添加上边距 */
                margin-bottom: 15px !important; /* 添加下边距 */
            }
            
            /* 增强主图容器 */
            .product-gallery .main-image-display {
                padding: 15px !important;
                background-color: rgba(255, 255, 255, 0.7) !important;
                border-radius: 8px !important;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1) !important;
            }
            
            /* 确保产品信息区域和产品图片区域等高 */
            .product-detail-section .container .row {
                display: flex !important;
                flex-direction: column !important;
            }
            
            .product-info {
                order: 2 !important;
            }
            
            .product-gallery {
                order: 1 !important;
            }
        }
        
        /* 超小屏幕布局 */
        @media (max-width: 480px) {
            .product-gallery .main-image-display img {
                max-height: 350px !important; /* 增加最大高度 */
                transform: scale(1.5) !important; /* 大幅增强放大效果 */
            }
            
            .compact-thumb {
                width: 55px !important;
            }
            
            /* 确保在超小屏幕上主图有足够的容器空间 */
            .product-gallery .main-image-display {
                min-height: 400px !important;
                padding: 20px 10px !important;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15) !important;
            }
            
            .gallery-recommendations {
                padding: 10px !important;
            }
        }
    `;
    document.head.appendChild(responsiveStyle);
    
    // 处理gallery-recommendations区域的位置和样式
    if (galleryRecommendations) {
        // 为recommendations区域添加标题
        if (!galleryRecommendations.querySelector('.recommendations-title')) {
            const recTitle = document.createElement('h4');
            recTitle.className = 'recommendations-title';
            recTitle.style.cssText = 'margin-top: 0; margin-bottom: 15px; font-size: 16px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px;';
            recTitle.textContent = '相关产品推荐';
            galleryRecommendations.insertBefore(recTitle, galleryRecommendations.firstChild);
        }
    }
    
    // 添加窗口大小变化监听器
    window.addEventListener('resize', function() {
        adjustGalleryForScreenSize();
    });
    
    // 首次加载时调整
    adjustGalleryForScreenSize();
    
    /**
     * 根据当前屏幕尺寸调整图片区域
     */
    function adjustGalleryForScreenSize() {
        const windowWidth = window.innerWidth;
        const mainImage = document.querySelector(".product-gallery .main-image-display img");
        const table = document.querySelector(".product-gallery table");
        
        if (!mainImage) return;
        
        // 记录当前滚动位置
        const scrollPos = window.pageYOffset;
        
        // 根据屏幕宽度设置图片比例 - 增强放大效果
        if (windowWidth <= 480) {
            mainImage.style.maxHeight = '350px';
            mainImage.style.transform = 'scale(1.5)'; // 大幅增强放大效果
            
            // 确保超小屏幕有良好的显示效果
            const mainImageContainer = mainImage.parentElement;
            if (mainImageContainer) {
                mainImageContainer.style.minHeight = '400px';
                mainImageContainer.style.padding = '20px 10px';
                mainImageContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                mainImageContainer.style.borderRadius = '8px';
                mainImageContainer.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
            }
            
            // 处理gallery-recommendations
            if (galleryRecommendations) {
                galleryRecommendations.style.order = '2';
                galleryRecommendations.style.marginTop = '10px';
                galleryRecommendations.style.padding = '10px';
                galleryRecommendations.style.backgroundColor = 'rgba(248, 249, 250, 0.8)';
                galleryRecommendations.style.borderRadius = '8px';
            }
            
            // 如果存在table，设置其顺序
            if (table) {
                table.style.order = '1';
            }
            
        } else if (windowWidth <= 767) {
            mainImage.style.maxHeight = '400px'; // 增加高度
            mainImage.style.transform = 'scale(1.3)'; // 显著增强放大效果
            mainImage.style.marginTop = '10px';
            mainImage.style.marginBottom = '15px';
            
            // 小屏幕主图容器样式
            const mainImageContainer = mainImage.parentElement;
            if (mainImageContainer) {
                mainImageContainer.style.padding = '15px';
                mainImageContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                mainImageContainer.style.borderRadius = '8px';
                mainImageContainer.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)';
            }
            
            // 处理gallery-recommendations
            if (galleryRecommendations) {
                galleryRecommendations.style.order = '2';
                galleryRecommendations.style.marginTop = '20px';
                galleryRecommendations.style.marginBottom = '30px';
                galleryRecommendations.style.padding = '15px';
                galleryRecommendations.style.backgroundColor = 'rgba(248, 249, 250, 0.8)';
                galleryRecommendations.style.borderRadius = '8px';
            }
            
            // 如果存在table，设置其顺序
            if (table) {
                table.style.order = '1';
            }
            
            // 重新排序product-info和product-gallery
            if (galleryContainer && productInfoContainer) {
                const row = galleryContainer.parentElement;
                if (row) {
                    productInfoContainer.style.order = '2';
                    galleryContainer.style.order = '1';
                }
            }
            
        } else if (windowWidth <= 1199) {
            mainImage.style.maxHeight = '450px';
            mainImage.style.transform = 'scale(1.15)'; // 增强放大效果
            
            // 重置小屏幕特有样式
            if (galleryRecommendations) {
                galleryRecommendations.style.order = '';
                galleryRecommendations.style.marginTop = '20px';
                galleryRecommendations.style.marginBottom = '';
                galleryRecommendations.style.padding = '';
                galleryRecommendations.style.backgroundColor = '';
                galleryRecommendations.style.borderRadius = '';
            }
            
            // 重置product-info和product-gallery顺序
            if (productInfoContainer && galleryContainer) {
                productInfoContainer.style.order = '';
                galleryContainer.style.order = '';
            }
            
            // 重置table顺序
            if (table) {
                table.style.order = '';
            }
            
        } else {
            mainImage.style.maxHeight = '500px';
            mainImage.style.transform = 'none';
            
            // 重置小屏幕特有样式
            if (galleryRecommendations) {
                galleryRecommendations.style.order = '';
                galleryRecommendations.style.marginTop = '30px';
                galleryRecommendations.style.marginBottom = '';
                galleryRecommendations.style.padding = '';
                galleryRecommendations.style.backgroundColor = '';
                galleryRecommendations.style.borderRadius = '';
            }
            
            // 重置product-info和product-gallery顺序
            if (productInfoContainer && galleryContainer) {
                productInfoContainer.style.order = '';
                galleryContainer.style.order = '';
            }
            
            // 重置table顺序
            if (table) {
                table.style.order = '';
            }
        }
        
        // 恢复滚动位置（防止因为调整而改变用户的浏览位置）
        window.scrollTo(0, scrollPos);
    }
    
    console.log("产品图片区域响应式布局设置完成");
}

/**
 * 删除推荐区域标题
 */
function removeRecommendationsTitle() {
    const recommendationsTitle = document.querySelector("body > section.product-detail-section > div > div > div.product-gallery > div.gallery-recommendations > h4.recommendations-title");
    if (recommendationsTitle) {
        recommendationsTitle.parentNode.removeChild(recommendationsTitle);
        console.log("推荐区域标题已删除");
    } else {
        console.warn("未找到推荐区域标题元素");
    }
}

// ===== Merged: Inline product-detail.js to ensure single JS entry =====
(function(){
try {
  if (typeof initThumbnailNavigation !== 'function') {
    document.addEventListener('DOMContentLoaded', function() {
      if (typeof initThumbnailNavigation === 'function') return; // if already injected, skip
      try { initThumbnailNavigation(); } catch(e) {}
      try { initImageZoom(); } catch(e) {}
      try { initProductActions(); } catch(e) {}
      try { initCountdown(); } catch(e) {}
      try { initTopActions(); } catch(e) {}
      try { initConfigMenu(); } catch(e) {}
      try { initConsultMenu(); } catch(e) {}
      try { initReviewsFeatures(); } catch(e) {}
      try { initReviewsEnhancedFeatures(); } catch(e) {}
      try { initRatingBars(); } catch(e) {}
      try { enhanceReviewFilters(); } catch(e) {}
    });
  }
} catch(e) { console.warn('Inline init guard error', e); }
})();