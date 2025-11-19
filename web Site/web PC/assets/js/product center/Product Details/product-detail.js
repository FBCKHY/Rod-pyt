/**
 * 产品详情页脚本 - product-detail.js
 * 
 * 描述：处理产品详情页的交互功能
 * 用途：实现产品图片切换、数量选择、产品配置等功能
 * 
 * 包含功能：
 * - 产品图片切换
 * - 产品特点标记与提示
 * - 产品配置选择
 * - 数量选择器
 * - 购买与购物车功能
 * 
 * 创建日期：2023-07-25
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    console.log("🚀 产品详情页脚本已加载");
    
    // 初始化产品图库
    initThumbnailNavigation();
    
    // 初始化图片放大功能
    initImageZoom();
    
    // 初始化产品操作
    initProductActions();
    
    // 初始化倒计时
    initCountdown();
    
    // 初始化顶部操作
    initTopActions();
    
    // 初始化定制配置菜单
    initConfigMenu();
    
    // 初始化咨询菜单
    initConsultMenu();

    // 初始化用户评价相关功能
    initReviewsFeatures();

    // 初始化评价增强功能
    initReviewsEnhancedFeatures();

    // 初始化评分分布条动画
    initRatingBars();

    // 优化评价筛选功能
    enhanceReviewFilters();
});

/**
 * 初始化缩略图导航
 */
function initThumbnailNavigation() {
    // 处理缩略图点击
    const thumbnailItems = document.querySelectorAll('.thumbnail-item');
    const mainImage = document.querySelector('.main-image');
    
    thumbnailItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有缩略图的active类
            thumbnailItems.forEach(thumb => thumb.classList.remove('active'));
            
            // 添加active类到当前点击的缩略图
            this.classList.add('active');
            
            // 更新主图
            if (mainImage && !this.classList.contains('video-thumbnail')) {
                const imgSrc = this.querySelector('img').src;
                
                // 添加淡出效果
                mainImage.style.opacity = '0';
                
                // 短暂延迟后更换图片并淡入
                setTimeout(() => {
                    mainImage.src = imgSrc;
                    mainImage.style.opacity = '1';
                }, 200);
            }
            
            // 视频缩略图点击处理
            if (this.classList.contains('video-thumbnail')) {
                console.log('视频缩略图被点击');
                // 这里可以添加简单的视频播放逻辑
                alert('即将打开产品视频');
            }
        });
    });
}

/**
 * 初始化图片放大功能
 */
function initImageZoom() {
    const zoomOverlay = document.querySelector('.image-zoom-overlay');
    const mainImage = document.querySelector('.main-image');
    
    if (!zoomOverlay || !mainImage) return;
    
    zoomOverlay.addEventListener('click', function() {
        // 创建图片放大模态框
        const modal = document.createElement('div');
        modal.className = 'image-zoom-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'zoom-modal-content';
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'zoom-close-btn';
        closeBtn.innerHTML = '&times;';
        
        const zoomedImage = document.createElement('img');
        zoomedImage.src = mainImage.src;
        zoomedImage.className = 'zoomed-image';
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(zoomedImage);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
            
            // 添加样式
            const style = document.createElement('style');
            style.textContent = `
            .image-zoom-modal {
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
                    opacity: 0;
                    transition: opacity 0.3s ease;
            }
            
            .zoom-modal-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
            }
            
            .zoomed-image {
                max-width: 100%;
                max-height: 90vh;
                object-fit: contain;
                box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .zoom-close-btn {
                position: absolute;
                top: -40px;
                right: -40px;
                color: white;
                font-size: 30px;
                font-weight: bold;
                cursor: pointer;
                width: 40px;
                height: 40px;
                    display: flex;
                justify-content: center;
                    align-items: center;
                    border-radius: 50%;
                    background-color: rgba(255, 255, 255, 0.2);
                transition: all 0.3s ease;
                }
                
            .zoom-close-btn:hover {
                    background-color: rgba(255, 255, 255, 0.4);
            }
        `;
        document.head.appendChild(style);
        
        // 显示模态框并添加动画效果
        setTimeout(() => {
            modal.style.opacity = '1';
            zoomedImage.style.transform = 'scale(1)';
        }, 10);
        
        // 添加关闭功能
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // 添加键盘Esc关闭功能
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        // 防止滚动
        document.body.style.overflow = 'hidden';
        
        function closeModal() {
            modal.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            }, 300);
        }
    });
}

/**
 * 初始化产品操作
 */
function initProductActions() {
    // 数量选择器处理
    const quantityInput = document.querySelector('.quantity-input');
    const minusBtn = document.querySelector('.quantity-minus');
    const plusBtn = document.querySelector('.quantity-plus');
    
    if (quantityInput && minusBtn && plusBtn) {
        minusBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });
        
        plusBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            quantityInput.value = value + 1;
        });
        
        quantityInput.addEventListener('change', function() {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) {
                this.value = 1;
            }
        });
    }
    
    // 立即咨询按钮处理
    const consultBtn = document.querySelector('.btn-buy-now');
    if (consultBtn) {
        consultBtn.addEventListener('click', function(event) {
            // 创建选项菜单
            createOptionsMenu(event);
        });
    }
    
    // 购物车按钮处理
    const addToCartBtn = document.querySelector('.btn-add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const cartAnimation = document.createElement('div');
            cartAnimation.className = 'cart-animation';
            document.body.appendChild(cartAnimation);
            
            setTimeout(() => {
                document.body.removeChild(cartAnimation);
                alert('已添加到购物车');
            }, 1000);
        });
    }
    
    // 定制配置按钮处理
    const configBtn = document.querySelector('.btn-config');
    if (configBtn) {
        configBtn.addEventListener('click', function() {
            openConfigMenu();
        });
    }
}

/**
 * 创建选项菜单
 */
function createOptionsMenu(event) {
    // 删除任何已存在的选项菜单
    const existingMenu = document.querySelector('.options-menu');
    if (existingMenu) {
        document.body.removeChild(existingMenu);
        return;
    }
    
    // 阻止事件冒泡
    event.stopPropagation();
    event.preventDefault();
    
    // 获取按钮位置
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();
    
    // 创建选项菜单
    const optionsMenu = document.createElement('div');
    optionsMenu.className = 'options-menu';
    
    // 创建菜单内容包装器
    const menuContent = document.createElement('div');
    menuContent.className = 'options-menu-content';
    
    // 创建菜单箭头指示器
    const menuArrow = document.createElement('div');
    menuArrow.className = 'options-menu-arrow';
    
    // 添加选项
    const jdOption = document.createElement('div');
    jdOption.className = 'option-item';
    jdOption.innerHTML = '<i class="bi bi-shop"></i> 跳转京东商店购买';
    jdOption.addEventListener('click', function(e) {
        // 阻止事件冒泡，防止触发document的点击事件
        e.stopPropagation();
        window.open('https://www.jd.com', '_blank');
        // 不要在这里移除菜单，让用户看到点击效果
        setTimeout(() => {
            if (document.body.contains(optionsMenu)) {
                document.body.removeChild(optionsMenu);
            }
        }, 100);
    });
    
    const contactOption = document.createElement('div');
    contactOption.className = 'option-item';
    contactOption.innerHTML = '<i class="bi bi-headset"></i> 联系我们';
    contactOption.addEventListener('click', function(e) {
        // 阻止事件冒泡，防止触发document的点击事件
        e.stopPropagation();
        // 使用全局openConsultMenu函数打开咨询菜单
        if (typeof window.openConsultMenu === 'function') {
            // 先移除菜单
            if (document.body.contains(optionsMenu)) {
                document.body.removeChild(optionsMenu);
            }
            
            window.openConsultMenu();
        } else {
            console.error('咨询菜单函数未定义');
        }
    });
    
    const divider = document.createElement('div');
    divider.className = 'option-divider';
    
    // 将选项添加到菜单内容
    menuContent.appendChild(jdOption);
    menuContent.appendChild(divider);
    menuContent.appendChild(contactOption);
    
    // 将内容和箭头添加到菜单
    optionsMenu.appendChild(menuArrow);
    optionsMenu.appendChild(menuContent);
    
    // 将菜单添加到文档
    document.body.appendChild(optionsMenu);
    
    // 计算并设置菜单位置
    function positionMenu() {
        // 重新获取按钮位置（以防滚动）
        const updatedButtonRect = button.getBoundingClientRect();
        
        // 计算菜单位置，确保居中于按钮
        const menuWidth = optionsMenu.offsetWidth;
        const buttonCenterX = updatedButtonRect.left + (updatedButtonRect.width / 2);
        
        // 计算左侧位置，保持菜单箭头居中于按钮
        let leftPosition = buttonCenterX - (menuWidth / 2);
        
        // 防止菜单超出窗口边界
        const windowWidth = window.innerWidth;
        if (leftPosition < 10) {
            leftPosition = 10;
        } else if (leftPosition + menuWidth > windowWidth - 10) {
            leftPosition = windowWidth - menuWidth - 10;
        }
        
        // 调整箭头位置以指向按钮中心
        const arrowLeftOffset = buttonCenterX - leftPosition;
        menuArrow.style.left = `${arrowLeftOffset}px`;
        
        // 设置菜单位置
        optionsMenu.style.left = `${leftPosition}px`;
        optionsMenu.style.top = `${updatedButtonRect.bottom + 6}px`;
    }
    
    // 初始定位
    positionMenu();
    
    // 添加滚动和调整大小事件监听器，确保菜单跟随按钮
    window.addEventListener('scroll', positionMenu);
    window.addEventListener('resize', positionMenu);
    
    // 点击文档其他位置关闭菜单
    document.addEventListener('click', function closeMenu(e) {
        if (!optionsMenu.contains(e.target) && e.target !== button) {
            if (document.body.contains(optionsMenu)) {
                document.body.removeChild(optionsMenu);
                
                // 移除滚动和调整大小事件监听器
                window.removeEventListener('scroll', positionMenu);
                window.removeEventListener('resize', positionMenu);
            }
            document.removeEventListener('click', closeMenu);
        }
    });
}
    
/**
 * 初始化倒计时
 */
function initCountdown() {
    const countdownElement = document.querySelector('.countdown');
    if (!countdownElement) return;
    
    // 设置24小时倒计时
    let hours = 23;
    let minutes = 59;
    let seconds = 59;
    
    const countdownInterval = setInterval(function() {
        seconds--;
        
        if (seconds < 0) {
            minutes--;
            seconds = 59;
        }
        
        if (minutes < 0) {
            hours--;
            minutes = 59;
        }
        
        if (hours < 0) {
            clearInterval(countdownInterval);
            hours = 0;
            minutes = 0;
            seconds = 0;
        }
        
        countdownElement.textContent = 
            (hours < 10 ? '0' + hours : hours) + ':' + 
            (minutes < 10 ? '0' + minutes : minutes) + ':' + 
            (seconds < 10 ? '0' + seconds : seconds);
    }, 1000);
}

/**
 * 初始化顶部操作
 */
function initTopActions() {
    const shareButtons = document.querySelectorAll('.social-share-btn');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.getAttribute('data-platform');
            
            // 模拟分享行为
            alert(`分享到${platform}功能将在后续实现`);
        });
    });
}

/**
 * 初始化定制配置菜单
 */
function initConfigMenu() {
    const configMenu = document.querySelector('.config-menu');
    const configOverlay = document.querySelector('.config-overlay');
    const configCloseBtn = document.querySelector('.config-close-btn');
    const configOptions = document.querySelectorAll('.config-option');
    const configResetBtn = document.querySelector('.btn-config-reset');
    const configConfirmBtn = document.querySelector('.btn-config-confirm');
    
    // 加载保存的配置
    loadSavedConfig();
    
    // 将openConfigMenu函数设为全局函数，以便其他地方调用
    window.openConfigMenu = function() {
        if (configMenu && configOverlay) {
            // 保存当前滚动位置到data属性
            document.body.dataset.scrollY = window.scrollY;
            
            // 重新计算滚动条宽度
            const scrollbarWidth = calculateScrollbarWidth();
            
            // 激活菜单和遮罩前应用滚动条宽度补偿
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            
            // 激活菜单和遮罩
            configMenu.classList.add('active');
            configOverlay.classList.add('active');
            
            // 禁用滚动
            document.body.classList.add('menu-open');
            
            // 添加滚轮事件处理
            document.addEventListener('wheel', preventScroll, { passive: false });
            document.addEventListener('touchmove', preventScroll, { passive: false });
            document.addEventListener('keydown', preventScrollKeys, { passive: false });
            
            console.log('配置菜单已打开');
        }
    };
    
    // 关闭配置菜单
    function closeConfigMenu() {
        if (configMenu && configOverlay) {
            // 先移除active类
            configMenu.classList.remove('active');
            configOverlay.classList.remove('active');
            
            // 移除事件监听器
            document.removeEventListener('wheel', preventScroll);
            document.removeEventListener('touchmove', preventScroll);
            document.removeEventListener('keydown', preventScrollKeys);
            
            // 设置一个短暂的延迟以匹配CSS过渡效果
            setTimeout(() => {
                // 恢复滚动功能
                document.body.classList.remove('menu-open');
                
                // 平滑恢复padding
                document.body.style.paddingRight = '';
                
                // 恢复之前保存的滚动位置
                if (document.body.dataset.scrollY) {
                    window.scrollTo(0, parseInt(document.body.dataset.scrollY));
                }
            }, 50); // 50ms延迟以配合过渡效果
            
            console.log('配置菜单已关闭');
        }
    }
    
    // 阻止滚动
    function preventScroll(e) {
        // 允许菜单内部滚动
        if (configMenu && configMenu.contains(e.target)) {
            const scrollTop = configMenu.scrollTop;
            const scrollHeight = configMenu.scrollHeight;
            const height = configMenu.clientHeight;
            
            // 允许在菜单内部滚动
            if ((scrollTop === 0 && e.deltaY < 0) || (scrollHeight - scrollTop === height && e.deltaY > 0)) {
                e.preventDefault();
            }
            return;
        }
        
        // 阻止其他区域滚动
        e.preventDefault();
    }
    
    // 阻止键盘滚动
    function preventScrollKeys(e) {
        // 上下左右键和空格键
        if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }
    
    // 计算总价格
    function calculatePrice() {
        const basePrice = 2499; // 基础价格
        let upgradePrice = 0;
        
        // 获取所有选中的配置项
        const selectedOptions = document.querySelectorAll('.config-option.selected');
        
        // 计算升级价格
        selectedOptions.forEach(option => {
            upgradePrice += parseInt(option.dataset.price) || 0;
        });
        
        // 更新价格显示
        const upgradePriceElement = document.getElementById('config-upgrade-price');
        const totalPriceElement = document.getElementById('config-total-price');
        
        if (upgradePriceElement) {
            upgradePriceElement.textContent = `¥${upgradePrice.toLocaleString()}`;
        }
        
        if (totalPriceElement) {
            const totalPrice = basePrice + upgradePrice;
            totalPriceElement.textContent = `¥${totalPrice.toLocaleString()}`;
            
            // 存储当前总价格，用于后续确认使用
            configMenu.dataset.totalPrice = totalPrice;
        }
        
        return basePrice + upgradePrice;
    }
    
    // 重置配置
    function resetConfig() {
        if (!configOptions) return;
        
        // 遍历所有配置选项
        configOptions.forEach(option => {
            // 移除所有选中状态
            option.classList.remove('selected');
            
            // 为每个配置组的第一个选项添加选中状态
            const optionGroup = option.closest('.config-options');
            if (optionGroup) {
                const firstOption = optionGroup.querySelector('.config-option');
                if (firstOption) {
                    firstOption.classList.add('selected');
                }
            }
        });
        
        // 重新计算价格
        calculatePrice();
        
        // 删除本地存储的配置
        localStorage.removeItem('productConfig');
        
        console.log('配置已重置');
    }
    
    // 保存配置到本地存储
    function saveConfig() {
        const config = {
            options: {},
            totalPrice: parseInt(configMenu.dataset.totalPrice) || 2499,
            timestamp: new Date().getTime()
        };
        
        // 获取所有选中的配置项
        const selectedOptions = document.querySelectorAll('.config-option.selected');
        
        // 保存每个配置项的信息
        selectedOptions.forEach(option => {
            const optionType = option.dataset.option;
            const optionValue = option.dataset.value;
            const optionPrice = parseInt(option.dataset.price) || 0;
            const optionTitle = option.querySelector('.option-title').textContent;
            
            config.options[optionType] = {
                value: optionValue,
                price: optionPrice,
                title: optionTitle
            };
        });
        
        // 保存到本地存储
        localStorage.setItem('productConfig', JSON.stringify(config));
        
        console.log('配置已保存:', config);
        return config;
    }
    
    // 加载保存的配置
    function loadSavedConfig() {
        const savedConfig = localStorage.getItem('productConfig');
        if (!savedConfig) return false;
        
        try {
            const config = JSON.parse(savedConfig);
            
            // 检查配置是否过期（24小时）
            const now = new Date().getTime();
            const configAge = now - (config.timestamp || 0);
            const configExpiry = 24 * 60 * 60 * 1000; // 24小时
            
            if (configAge > configExpiry) {
                console.log('配置已过期，使用默认配置');
                localStorage.removeItem('productConfig');
                return false;
            }
            
            // 应用保存的配置
            for (const optionType in config.options) {
                const optionData = config.options[optionType];
                const optionSelector = `.config-option[data-option="${optionType}"][data-value="${optionData.value}"]`;
                const optionElement = document.querySelector(optionSelector);
                
                if (optionElement) {
                    // 移除该组中所有选项的选中状态
                    const optionGroup = optionElement.closest('.config-options');
                    if (optionGroup) {
                        const groupOptions = optionGroup.querySelectorAll('.config-option');
                        groupOptions.forEach(opt => opt.classList.remove('selected'));
                    }
                    
                    // 为当前选项添加选中状态
                    optionElement.classList.add('selected');
                }
            }
            
            // 更新价格
            calculatePrice();
            
            // 更新主页面价格显示
            updateMainPagePrice(config.totalPrice);
            
            console.log('已加载保存的配置:', config);
            return true;
        } catch (error) {
            console.error('加载配置失败:', error);
            return false;
        }
    }
    
    // 更新主页面价格显示
    function updateMainPagePrice(totalPrice) {
        const mainPriceElement = document.querySelector('.product-price-section .current-price');
        if (mainPriceElement) {
            // 格式化价格显示
            const formattedPrice = `¥${totalPrice.toLocaleString()}`;
            mainPriceElement.textContent = formattedPrice;
            
            // 添加自定义配置标记
            const priceSection = document.querySelector('.product-price-section .product-price');
            
            // 移除已有的配置标记
            const existingBadge = document.querySelector('.custom-config-badge');
            if (existingBadge) {
                existingBadge.remove();
            }
            
            // 添加新的配置标记
            const configBadge = document.createElement('span');
            configBadge.className = 'custom-config-badge';
            configBadge.innerHTML = '<i class="fas fa-cog"></i> 已定制';
            
            if (priceSection && !existingBadge) {
                priceSection.appendChild(configBadge);
            }
            
            // 更新分期付款信息
            const installmentElement = document.querySelector('.installment-option strong');
            if (installmentElement) {
                const monthlyPrice = Math.ceil(totalPrice / 12);
                installmentElement.textContent = `¥${monthlyPrice}/月`;
            }
        }
    }
    
    // 添加配置选项点击事件
    if (configOptions) {
        configOptions.forEach(option => {
            option.addEventListener('click', function() {
                // 获取当前选项的配置组
                const optionGroup = this.closest('.config-options');
                
                if (optionGroup) {
                    // 移除该组中所有选项的选中状态
                    const groupOptions = optionGroup.querySelectorAll('.config-option');
                    groupOptions.forEach(opt => opt.classList.remove('selected'));
                    
                    // 为当前选项添加选中状态
                    this.classList.add('selected');
                    
                    // 更新价格
                    calculatePrice();
                }
            });
        });
    }
    
    // 添加关闭按钮点击事件
    if (configCloseBtn) {
        configCloseBtn.addEventListener('click', closeConfigMenu);
    }
    
    // 添加遮罩点击事件
    if (configOverlay) {
        configOverlay.addEventListener('click', closeConfigMenu);
    }
    
    // 添加重置按钮点击事件
    if (configResetBtn) {
        configResetBtn.addEventListener('click', resetConfig);
    }
    
    // 添加确认按钮点击事件
    if (configConfirmBtn) {
        configConfirmBtn.addEventListener('click', function() {
            // 保存配置
            const config = saveConfig();
            
            // 更新主页面价格显示
            if (config) {
                updateMainPagePrice(config.totalPrice);
            }
            
            // 关闭配置菜单
            closeConfigMenu();
            
            // 显示确认消息
            showConfigConfirmation();
        });
    }
    
    // 显示配置确认消息
    function showConfigConfirmation() {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'config-notification';
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">配置已保存</div>
                <div class="notification-message">您的定制配置已成功保存</div>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .config-notification {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                padding: 15px 20px;
                display: flex;
                align-items: center;
                gap: 15px;
                z-index: 1000;
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s ease;
                max-width: 300px;
            }
            
            .notification-icon {
                font-size: 24px;
                color: #00a854;
            }
            
            .notification-title {
                font-weight: 600;
                margin-bottom: 5px;
            }
            
            .notification-message {
                font-size: 14px;
                color: #666;
            }
        `;
        document.head.appendChild(style);
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
            notification.style.opacity = '1';
            
            // 3秒后隐藏
            setTimeout(() => {
                notification.style.transform = 'translateY(100px)';
                notification.style.opacity = '0';
                
                // 动画结束后移除
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }, 100);
    }
    
    // 初始化时计算一次价格
    calculatePrice();
} 

/**
 * 计算滚动条宽度并设置为CSS变量
 */
function calculateScrollbarWidth() {
    // 创建一个带滚动条的div
    const scrollDiv = document.createElement('div');
    scrollDiv.style.cssText = 'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;';
    document.body.appendChild(scrollDiv);
    
    // 计算滚动条宽度
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    
    // 从DOM中移除div
    document.body.removeChild(scrollDiv);
    
    // 将滚动条宽度设置为CSS变量
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    
    return scrollbarWidth;
}

// 在页面加载时立即计算滚动条宽度
document.addEventListener('DOMContentLoaded', function() {
    calculateScrollbarWidth();
    
    // 窗口大小改变时重新计算
    window.addEventListener('resize', calculateScrollbarWidth);
});

/**
 * 初始化咨询菜单
 */
function initConsultMenu() {
    // 不再在这里获取立即咨询按钮，因为我们不再需要点击它打开咨询菜单
    // const consultBtn = document.querySelector('.btn-buy-now');
    const consultMenu = document.querySelector('.consult-menu');
    const consultOverlay = document.querySelector('.consult-overlay');
    const closeBtn = document.querySelector('.consult-close-btn');
    const resetBtn = document.querySelector('.btn-consult-reset');
    const submitBtn = document.querySelector('.btn-consult-submit');
    
    const nameInput = document.getElementById('consult-name');
    const phoneInput = document.getElementById('consult-phone');
    const timeSelect = document.getElementById('consult-time');
    const messageTextarea = document.getElementById('consult-message');
    const topicCheckboxes = document.querySelectorAll('input[name="consult-topic"]');
    
    // 将openConsultMenu函数设为全局函数，以便其他地方调用
    window.openConsultMenu = function() {
        if (consultMenu && consultOverlay) {
            // 保存当前滚动位置到data属性
            document.body.dataset.scrollY = window.scrollY;
            
            // 重新计算滚动条宽度
            const scrollbarWidth = calculateScrollbarWidth();
            
            // 激活菜单和遮罩前应用滚动条宽度补偿
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            
            // 激活菜单和遮罩
            consultMenu.classList.add('active');
            consultOverlay.classList.add('active');
            
            // 禁用滚动
            document.body.classList.add('menu-open');
            
            // 添加滚轮事件处理
            document.addEventListener('wheel', preventScroll, { passive: false });
            document.addEventListener('touchmove', preventScroll, { passive: false });
            document.addEventListener('keydown', preventScrollKeys, { passive: false });
            
            console.log('咨询菜单已打开');
        }
    };
    
    // 关闭咨询菜单
    function closeConsultMenu() {
        if (consultMenu && consultOverlay) {
            // 先移除active类
            consultMenu.classList.remove('active');
            consultOverlay.classList.remove('active');
            
            // 移除事件监听器
            document.removeEventListener('wheel', preventScroll);
            document.removeEventListener('touchmove', preventScroll);
            document.removeEventListener('keydown', preventScrollKeys);
            
            // 设置一个短暂的延迟以匹配CSS过渡效果
            setTimeout(() => {
                // 恢复滚动功能
                document.body.classList.remove('menu-open');
                
                // 平滑恢复padding
                document.body.style.paddingRight = '';
                
                // 恢复之前保存的滚动位置
                if (document.body.dataset.scrollY) {
                    window.scrollTo(0, parseInt(document.body.dataset.scrollY));
                }
            }, 50); // 50ms延迟以配合过渡效果
            
            console.log('咨询菜单已关闭');
        }
    }
    
    // 通用的阻止滚动函数
    function preventScroll(e) {
        // 检查事件目标是否在菜单内
        let isInsideMenu = false;
        let target = e.target;
        
        // 向上遍历DOM树检查是否在菜单内
        while (target) {
            if (target === consultMenu) {
                isInsideMenu = true;
                break;
            }
            target = target.parentElement;
        }
        
        // 如果不在菜单内，阻止滚动
        if (!isInsideMenu) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }
    
    // 阻止键盘滚动
    function preventScrollKeys(e) {
        // 空格键、上下箭头、Page Up/Down、Home、End键
        const keys = {32: 1, 33: 1, 34: 1, 35: 1, 36: 1, 37: 1, 38: 1, 39: 1, 40: 1};
        if (keys[e.keyCode]) {
                    e.preventDefault();
            return false;
        }
    }
    
    // 重置表单
    function resetConsultForm() {
        if (nameInput) nameInput.value = '';
        if (phoneInput) phoneInput.value = '';
        if (timeSelect) timeSelect.value = '';
        if (messageTextarea) messageTextarea.value = '';
        
        topicCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    // 验证表单
    function validateConsultForm() {
        let isValid = true;
        let errorMessage = '';
        
        // 验证姓名
        if (!nameInput.value.trim()) {
            isValid = false;
            errorMessage += '请输入您的姓名\n';
        }
        
        // 验证电话
        const phonePattern = /^1[3-9]\d{9}$/;
        if (!phonePattern.test(phoneInput.value.trim())) {
            isValid = false;
            errorMessage += '请输入有效的手机号码\n';
        }
        
        // 验证时间选择
        if (!timeSelect.value) {
            isValid = false;
            errorMessage += '请选择方便接听时间\n';
        }
        
        // 检查是否选择了至少一个主题
        let hasCheckedTopic = false;
        topicCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                hasCheckedTopic = true;
            }
        });
        
        if (!hasCheckedTopic) {
            isValid = false;
            errorMessage += '请至少选择一个咨询主题\n';
        }
        
        // 验证留言内容
        if (!messageTextarea.value.trim()) {
            isValid = false;
            errorMessage += '请输入详细咨询内容';
        }
        
        if (!isValid) {
            alert('表单验证失败：\n' + errorMessage);
        }
        
        return isValid;
    }
    
    // 提交表单
    function submitConsultForm() {
        if (!validateConsultForm()) {
            return;
        }
        
        // 收集表单数据
        const formData = {
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            time: timeSelect.value,
            message: messageTextarea.value.trim(),
            topics: []
        };
        
        // 收集选中的主题
        topicCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                formData.topics.push(checkbox.value);
            }
        });
        
        // 在实际应用中这里会发送到服务器
        console.log('咨询表单数据:', formData);
        
        // 显示成功消息
        alert('感谢您的咨询！我们的客服人员将会在工作时间尽快与您联系。');
        
        // 关闭咨询菜单并重置表单
        closeConsultMenu();
        resetConsultForm();
    }
    
    // 绑定事件处理程序
    if (closeBtn) {
        closeBtn.addEventListener('click', closeConsultMenu);
    }
    
    if (consultOverlay) {
        consultOverlay.addEventListener('click', closeConsultMenu);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetConsultForm);
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', submitConsultForm);
    }
    
    // 添加键盘监听
        document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && consultMenu.classList.contains('active')) {
            closeConsultMenu();
        }
    });
    
    // 添加电话号码输入限制
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^\d]/g, '');
            if (this.value.length > 11) {
                this.value = this.value.slice(0, 11);
            }
        });
    }
} 

/**
 * 用户评价相关功能
 */
function initReviewsFeatures() {
    // 评价筛选按钮点击事件
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // 移除所有按钮的active类
                filterBtns.forEach(b => b.classList.remove('active'));
                // 为当前点击的按钮添加active类
                this.classList.add('active');
                
                // 这里可以添加实际的筛选逻辑
                const filterType = this.textContent.trim();
                console.log(`筛选评价: ${filterType}`);
                
                // 模拟筛选效果
                const reviewItems = document.querySelectorAll('.review-item');
                reviewItems.forEach(item => {
                    // 添加淡出效果
                    item.style.opacity = '0.5';
                    // 短暂延迟后恢复，模拟筛选完成
                    setTimeout(() => {
                        item.style.opacity = '1';
                    }, 300);
                });
            });
        });
    }
    
    // 有用按钮点击事件
    const helpfulBtns = document.querySelectorAll('.btn-helpful');
    if (helpfulBtns.length > 0) {
        helpfulBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // 检查按钮是否已被点击
                if (!this.classList.contains('clicked')) {
                    // 获取当前有用数量
                    const helpfulText = this.textContent;
                    const helpfulCount = parseInt(helpfulText.match(/\d+/)[0]);
                    
                    // 更新有用数量
                    this.innerHTML = `<i class="far fa-thumbs-up"></i> 有帮助 (${helpfulCount + 1})`;
                    
                    // 添加已点击标记
                    this.classList.add('clicked');
                    this.style.backgroundColor = '#e8f4ff';
                    this.style.color = '#0a4da8';
                    
                    // 显示感谢提示
                    const thankMsg = document.createElement('span');
                    thankMsg.textContent = '感谢您的反馈！';
                    thankMsg.style.color = '#0a4da8';
                    thankMsg.style.fontSize = '0.85rem';
                    thankMsg.style.marginLeft = '10px';
                    thankMsg.style.opacity = '0';
                    thankMsg.style.transition = 'opacity 0.3s ease';
                    
                    this.parentNode.appendChild(thankMsg);
                    
                    // 淡入效果
                    setTimeout(() => {
                        thankMsg.style.opacity = '1';
                    }, 10);
                    
                    // 3秒后淡出
                    setTimeout(() => {
                        thankMsg.style.opacity = '0';
                        setTimeout(() => {
                            thankMsg.remove();
                        }, 300);
                    }, 3000);
                }
            });
        });
    }
    
    // 查看更多评价按钮点击事件
    const moreReviewsBtn = document.querySelector('.btn-more-reviews');
    if (moreReviewsBtn) {
        moreReviewsBtn.addEventListener('click', function() {
            // 显示加载中状态
            this.textContent = '加载中...';
            this.disabled = true;
            
            // 模拟加载更多评价
            setTimeout(() => {
                // 恢复按钮状态
                this.textContent = '查看更多评价';
                this.disabled = false;
                
                // 提示用户
                alert('已加载全部评价');
            }, 1000);
        });
    }
    
    // 评价图片点击预览
    const reviewImages = document.querySelectorAll('.review-image img');
    if (reviewImages.length > 0) {
        reviewImages.forEach(img => {
            img.addEventListener('click', function() {
                // 创建图片预览遮罩
                const overlay = document.createElement('div');
                overlay.className = 'image-preview-overlay';
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                overlay.style.zIndex = '9999';
                overlay.style.display = 'flex';
                overlay.style.justifyContent = 'center';
                overlay.style.alignItems = 'center';
                overlay.style.cursor = 'zoom-out';
                
                // 创建大图
                const largeImg = document.createElement('img');
                largeImg.src = this.src;
                largeImg.style.maxWidth = '90%';
                largeImg.style.maxHeight = '90%';
                largeImg.style.objectFit = 'contain';
                largeImg.style.border = '2px solid white';
                largeImg.style.borderRadius = '4px';
                largeImg.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
                
                // 创建关闭按钮
                const closeBtn = document.createElement('div');
                closeBtn.innerHTML = '&times;';
                closeBtn.style.position = 'absolute';
                closeBtn.style.top = '20px';
                closeBtn.style.right = '30px';
                closeBtn.style.color = 'white';
                closeBtn.style.fontSize = '40px';
                closeBtn.style.cursor = 'pointer';
                closeBtn.style.zIndex = '10000';
                
                // 添加到页面
                overlay.appendChild(largeImg);
                overlay.appendChild(closeBtn);
                document.body.appendChild(overlay);
                
                // 禁用滚动
                document.body.style.overflow = 'hidden';
                
                // 关闭预览的事件
                const closePreview = () => {
                    overlay.style.opacity = '0';
                    overlay.style.transition = 'opacity 0.3s ease';
                    setTimeout(() => {
                        document.body.removeChild(overlay);
                        document.body.style.overflow = '';
                    }, 300);
                };
                
                // 点击关闭按钮或遮罩关闭预览
                closeBtn.addEventListener('click', closePreview);
                overlay.addEventListener('click', function(e) {
                    if (e.target === overlay) {
                        closePreview();
                    }
                });
                
                // ESC键关闭预览
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape') {
                        closePreview();
                    }
                });
                
                // 淡入效果
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    overlay.style.opacity = '1';
                }, 10);
            });
        });
    }
} 

/**
 * 用户评价增强功能
 */
function initReviewsEnhancedFeatures() {
    // 评价亮点标签点击事件
    const highlightTags = document.querySelectorAll('.highlight-tag');
    if (highlightTags.length > 0) {
        highlightTags.forEach(tag => {
            tag.addEventListener('click', function() {
                // 获取标签文本
                const tagText = this.textContent.trim().split(' ')[0];
                
                // 将标签文本填入搜索框
                const searchInput = document.querySelector('.review-search-input');
                if (searchInput) {
                    searchInput.value = tagText;
                    searchInput.focus();
                    
                    // 触发搜索
                    simulateSearch(tagText);
                }
            });
        });
    }
    
    // 评价搜索功能
    const searchInput = document.querySelector('.review-search-input');
    if (searchInput) {
        // 防抖函数
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            
            const searchTerm = this.value.trim();
            
            // 设置300ms的延迟，避免频繁搜索
            searchTimeout = setTimeout(() => {
                simulateSearch(searchTerm);
            }, 300);
        });
        
        // 回车键触发搜索
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                simulateSearch(this.value.trim());
            }
        });
    }
    
    // 模拟搜索功能
    function simulateSearch(searchTerm) {
        if (!searchTerm) {
            // 如果搜索词为空，显示所有评价
            console.log('显示所有评价');
            
            // 移除所有高亮
            document.querySelectorAll('.review-text p').forEach(p => {
                p.innerHTML = p.textContent;
            });
            
            // 显示所有评价项
            document.querySelectorAll('.review-item').forEach(item => {
                item.style.display = 'block';
                item.style.opacity = '1';
            });
            
            return;
        }
        
        console.log(`搜索评价: ${searchTerm}`);
        
        // 模拟搜索效果
        const reviewItems = document.querySelectorAll('.review-item');
        let matchFound = false;
        
        reviewItems.forEach(item => {
            const reviewText = item.querySelector('.review-text p').textContent.toLowerCase();
            const reviewTags = Array.from(item.querySelectorAll('.review-tag')).map(tag => tag.textContent.toLowerCase());
            
            // 检查评价文本或标签是否包含搜索词
            if (reviewText.includes(searchTerm.toLowerCase()) || reviewTags.some(tag => tag.includes(searchTerm.toLowerCase()))) {
                item.style.display = 'block';
                
                // 高亮搜索词
                const textElement = item.querySelector('.review-text p');
                const originalText = textElement.textContent;
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                textElement.innerHTML = originalText.replace(regex, '<span class="search-highlight">$1</span>');
                
                // 淡入效果
                item.style.opacity = '0.5';
                setTimeout(() => {
                    item.style.opacity = '1';
                }, 100);
                
                matchFound = true;
            } else {
                // 隐藏不匹配的评价
                item.style.display = 'none';
            }
        });
        
        // 如果没有匹配项，显示提示
        const noResultsMessage = document.querySelector('.no-results-message');
        if (!matchFound) {
            if (!noResultsMessage) {
                const message = document.createElement('div');
                message.className = 'no-results-message';
                message.innerHTML = `
                    <div class="no-results-icon"><i class="fas fa-search"></i></div>
                    <div class="no-results-text">没有找到包含 "${searchTerm}" 的评价</div>
                    <button class="btn-clear-search">清除搜索</button>
                `;
                
                const reviewsList = document.querySelector('.reviews-list');
                if (reviewsList) {
                    reviewsList.appendChild(message);
                    
                    // 清除搜索按钮点击事件
                    message.querySelector('.btn-clear-search').addEventListener('click', function() {
                        searchInput.value = '';
                        simulateSearch('');
                    });
                }
            }
        } else if (noResultsMessage) {
            noResultsMessage.remove();
        }
    }
    
    // 排序功能
    const sortSelect = document.getElementById('review-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            console.log(`排序方式: ${sortValue}`);
            
            // 获取所有评价项
            const reviewItems = Array.from(document.querySelectorAll('.review-item'));
            const reviewsList = document.querySelector('.reviews-list');
            
            if (reviewsList) {
                // 根据选择的排序方式进行排序
                switch (sortValue) {
                    case 'recent':
                        // 按日期排序（最新的在前）
                        reviewItems.sort((a, b) => {
                            const dateA = new Date(a.querySelector('.review-date').textContent);
                            const dateB = new Date(b.querySelector('.review-date').textContent);
                            return dateB - dateA;
                        });
                        break;
                        
                    case 'helpful':
                        // 按有用数排序（最有帮助的在前）
                        reviewItems.sort((a, b) => {
                            const helpfulA = parseInt(a.querySelector('.btn-helpful').textContent.match(/\d+/)[0]);
                            const helpfulB = parseInt(b.querySelector('.btn-helpful').textContent.match(/\d+/)[0]);
                            return helpfulB - helpfulA;
                        });
                        break;
                        
                    case 'highest':
                        // 按评分排序（高到低）
                        reviewItems.sort((a, b) => {
                            const starsA = a.querySelectorAll('.review-rating .fa-star').length;
                            const starsB = b.querySelectorAll('.review-rating .fa-star').length;
                            return starsB - starsA;
                        });
                        break;
                        
                    case 'lowest':
                        // 按评分排序（低到高）
                        reviewItems.sort((a, b) => {
                            const starsA = a.querySelectorAll('.review-rating .fa-star').length;
                            const starsB = b.querySelectorAll('.review-rating .fa-star').length;
                            return starsA - starsB;
                        });
                        break;
                }
                
                // 清空列表
                const reviewsMoreBtn = document.querySelector('.reviews-more');
                reviewsList.innerHTML = '';
                
                // 重新添加排序后的评价项
                reviewItems.forEach(item => {
                    reviewsList.appendChild(item);
                });
                
                // 重新添加"查看更多"按钮
                if (reviewsMoreBtn) {
                    reviewsList.appendChild(reviewsMoreBtn);
                }
                
                // 添加淡入效果
                reviewItems.forEach(item => {
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.opacity = '1';
                    }, 100);
                });
            }
        });
    }
    
    // 写评价按钮点击事件
    const writeReviewBtn = document.querySelector('.btn-write-review');
    if (writeReviewBtn) {
        writeReviewBtn.addEventListener('click', function() {
            alert('评价功能即将上线，敬请期待！');
        });
    }
    
    // 查看问答按钮点击事件
    const viewQaBtn = document.querySelector('.btn-view-qa');
    if (viewQaBtn) {
        viewQaBtn.addEventListener('click', function() {
            alert('问答功能即将上线，敬请期待！');
        });
    }
    
    // 为搜索高亮添加样式
    const style = document.createElement('style');
    style.textContent = `
        .search-highlight {
            background-color: #ffeb3b;
            padding: 0 2px;
            border-radius: 2px;
            font-weight: bold;
        }
        
        .no-results-message {
            text-align: center;
            padding: 30px 0;
            color: #666;
        }
        
        .no-results-icon {
            font-size: 2rem;
            color: #ccc;
            margin-bottom: 15px;
        }
        
        .no-results-text {
            margin-bottom: 15px;
            font-size: 1rem;
        }
        
        .btn-clear-search {
            background-color: #f5f5f5;
            border: none;
            color: #333;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .btn-clear-search:hover {
            background-color: #e8e8e8;
        }
    `;
    document.head.appendChild(style);
} 

/**
 * 初始化评分分布条
 */
function initRatingBars() {
    console.log('初始化评分分布条');
    
    // 直接设置评分条宽度，不使用动画
    function setRatingBarWidths() {
        // 获取所有评分条
        const ratingBars = document.querySelectorAll('.rating-bar .rating-fill');
        
        if (!ratingBars || ratingBars.length === 0) {
            console.log('评分条元素未找到');
            return;
        }
        
        console.log('找到评分条元素:', ratingBars.length);
        
        // 遍历所有评分条
        ratingBars.forEach((bar, index) => {
            // 获取父元素中的百分比文本
            const percentageElement = bar.closest('.rating-bar-item').querySelector('.rating-percentage');
            let percentageText = '';
            
            if (percentageElement) {
                percentageText = percentageElement.textContent.trim();
                console.log(`评分条 ${index} 百分比文本:`, percentageText);
            }
            
            // 从百分比文本中提取数字
            const percentageValue = parseInt(percentageText) || 0;
            
            // 设置评分条宽度
            if (percentageValue > 0) {
                bar.style.width = percentageValue + '%';
                console.log(`设置评分条 ${index} 宽度:`, percentageValue + '%');
            } else {
                // 如果没有找到百分比，尝试从内联样式获取
                const inlineStyle = bar.getAttribute('style');
                if (inlineStyle && inlineStyle.includes('width')) {
                    console.log(`评分条 ${index} 使用内联样式宽度`);
                } else {
                    // 使用默认值
                    console.log(`评分条 ${index} 使用默认宽度 0%`);
                    bar.style.width = '0%';
                }
            }
        });
    }
    
    // 监听标签切换事件
    function setupTabListeners() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.getAttribute('data-tab') === 'reviews') {
                    console.log('点击评价标签，设置评分条宽度');
                    setTimeout(setRatingBarWidths, 100);
                }
            });
        });
        
        // 如果评价标签已激活，立即设置宽度
        const reviewsTab = document.querySelector('.tab-btn[data-tab="reviews"]');
        if (reviewsTab && reviewsTab.classList.contains('active')) {
            console.log('评价标签已激活，立即设置评分条宽度');
            setRatingBarWidths();
        }
    }
    
    // 初始化
    setupTabListeners();
    
    // 页面加载完成后再次尝试设置宽度
    window.addEventListener('load', function() {
        console.log('页面加载完成，设置评分条宽度');
        setTimeout(setRatingBarWidths, 500);
    });
} 

/**
 * 优化评价筛选功能
 */
function enhanceReviewFilters() {
    console.log('优化评价筛选功能');
    
    // 获取所有筛选按钮和评价项
    const filterBtns = document.querySelectorAll('.filter-btn');
    const reviewItems = document.querySelectorAll('.review-item');
    
    if (!filterBtns.length || !reviewItems.length) {
        console.log('未找到筛选按钮或评价项');
        return;
    }
    
    // 添加CSS样式，使过渡更加丝滑
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .review-item {
            transition: opacity 0.3s ease, transform 0.3s ease, height 0.3s ease, margin 0.3s ease, padding 0.3s ease;
            transform-origin: top center;
            height: auto;
            opacity: 1;
            overflow: hidden;
        }
        .review-item.filtered-out {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
            height: 0;
            margin: 0;
            padding: 0;
        }
        .filter-btn {
            position: relative;
            overflow: hidden;
        }
        .filter-btn::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 2px;
            background-color: #0a4da8;
            transition: all 0.3s ease;
            transform: translateX(-50%);
        }
        .filter-btn.active::after {
            width: 80%;
        }
        .filter-btn:not(.active):hover::after {
            width: 40%;
        }
    `;
    document.head.appendChild(styleElement);
    
    // 筛选函数
    function filterReviews(filterType) {
        console.log('筛选评价:', filterType);
        
        // 延迟执行，确保UI更新
        setTimeout(() => {
            // 根据筛选类型确定筛选条件
            reviewItems.forEach(item => {
                let shouldShow = true;
                
                switch(filterType) {
                    case '最新':
                        // 获取日期并转换为时间戳
                        const dateText = item.querySelector('.review-date').textContent;
                        const reviewDate = new Date(dateText);
                        const threeMonthsAgo = new Date();
                        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                        
                        // 只显示三个月内的评价
                        shouldShow = reviewDate >= threeMonthsAgo;
                        break;
                        
                    case '好评':
                        // 计算星级数量
                        const fullStars = item.querySelectorAll('.review-rating .fa-star').length;
                        const halfStars = item.querySelectorAll('.review-rating .fa-star-half-alt').length;
                        const rating = fullStars + (halfStars * 0.5);
                        
                        // 4星及以上为好评
                        shouldShow = rating >= 4;
                        break;
                        
                    case '差评':
                        // 计算星级数量
                        const stars = item.querySelectorAll('.review-rating .fa-star').length;
                        const halfStar = item.querySelectorAll('.review-rating .fa-star-half-alt').length;
                        const starRating = stars + (halfStar * 0.5);
                        
                        // 3星及以下为差评
                        shouldShow = starRating <= 3;
                        break;
                        
                    case '有图':
                        // 检查是否有图片
                        shouldShow = item.querySelector('.review-images') !== null;
                        break;
                        
                    case '全部':
                    default:
                        shouldShow = true;
                        break;
                }
                
                // 应用过滤效果
                if (shouldShow) {
                    // 先移除filtered-out类
                    item.classList.remove('filtered-out');
                    
                    // 延迟一点点时间，使动画更加平滑
                    setTimeout(() => {
                        item.style.display = 'block';
                    }, 10);
                } else {
                    // 先添加filtered-out类触发淡出动画
                    item.classList.add('filtered-out');
                    
                    // 等动画完成后再隐藏元素
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
            
            // 检查是否有显示的评价
            setTimeout(() => {
                const visibleReviews = Array.from(reviewItems).filter(item => !item.classList.contains('filtered-out'));
                
                // 如果没有匹配的评价，显示提示信息
                const noResultsMsg = document.querySelector('.no-filter-results');
                if (visibleReviews.length === 0) {
                    if (!noResultsMsg) {
                        const reviewsList = document.querySelector('.reviews-list');
                        const message = document.createElement('div');
                        message.className = 'no-filter-results';
                        message.innerHTML = `
                            <div class="no-results-icon"><i class="fas fa-filter"></i></div>
                            <div class="no-results-text">没有找到符合条件的评价</div>
                        `;
                        reviewsList.appendChild(message);
                        
                        // 淡入效果
                        message.style.opacity = '0';
                        message.style.transform = 'translateY(20px)';
                        message.style.transition = 'all 0.3s ease';
                        
                        setTimeout(() => {
                            message.style.opacity = '1';
                            message.style.transform = 'translateY(0)';
                        }, 10);
                    }
                } else if (noResultsMsg) {
                    // 淡出效果
                    noResultsMsg.style.opacity = '0';
                    noResultsMsg.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        noResultsMsg.remove();
                    }, 300);
                }
            }, 350);
        }, 50);
    }
    
    // 添加筛选按钮点击事件
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有按钮的active类
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // 为当前点击的按钮添加active类
            this.classList.add('active');
            
            // 获取筛选类型
            const filterType = this.textContent.trim();
            
            // 应用筛选
            filterReviews(filterType);
            
            // 添加波纹效果
            addRippleEffect(this);
        });
    });
    
    // 添加波纹点击效果
    function addRippleEffect(element) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        
        // 设置波纹样式
        ripple.style.position = 'absolute';
        ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        ripple.style.borderRadius = '50%';
        ripple.style.pointerEvents = 'none';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        
        // 添加波纹动画
        const styleSheet = document.styleSheets[0];
        let keyframesRule = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        
        // 检查是否已添加动画规则
        let animationExists = false;
        for (let i = 0; i < document.styleSheets.length; i++) {
            try {
                const rules = document.styleSheets[i].cssRules;
                for (let j = 0; j < rules.length; j++) {
                    if (rules[j].name === 'ripple') {
                        animationExists = true;
                        break;
                    }
                }
                if (animationExists) break;
            } catch (e) {
                // 跨域样式表会抛出安全错误，忽略
                continue;
            }
        }
        
        // 如果动画规则不存在，添加它
        if (!animationExists) {
            styleSheet.insertRule(keyframesRule, styleSheet.cssRules.length);
        }
        
        // 计算波纹位置和大小
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.marginLeft = `-${size/2}px`;
        ripple.style.marginTop = `-${size/2}px`;
        
        // 添加波纹元素
        element.appendChild(ripple);
        
        // 动画结束后移除波纹元素
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // 初始化时应用"全部"筛选
    filterReviews('全部');
} 