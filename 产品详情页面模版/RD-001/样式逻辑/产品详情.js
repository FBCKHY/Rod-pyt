// 现代产品详情页 - 增强交互功能
(function() {
  'use strict';

  // 等待DOM加载完成
  document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
  });

  // 自定义Toast弹窗功能
  function showToast(title = '操作成功', message = '', type = 'success', duration = 1000) {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.getElementById('customToast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastTitle = toast.querySelector('.toast-title');
    const toastMessage = toast.querySelector('.toast-message');
    const progressBar = toast.querySelector('.progress-bar');
    
    if (!toast) return;
    
    // 更新内容
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // 更新图标和样式
    toastIcon.className = 'toast-icon';
    let iconClass, iconName;
    
    switch (type) {
      case 'success':
        iconClass = '';
        iconName = 'bi-check-circle-fill';
        break;
      case 'error':
        iconClass = 'error';
        iconName = 'bi-x-circle-fill';
        break;
      case 'warning':
        iconClass = 'warning';
        iconName = 'bi-exclamation-triangle-fill';
        break;
      case 'info':
        iconClass = 'info';
        iconName = 'bi-info-circle-fill';
        break;
      default:
        iconClass = '';
        iconName = 'bi-check-circle-fill';
    }
    
    if (iconClass) toastIcon.classList.add(iconClass);
    toastIcon.innerHTML = `<i class="bi ${iconName}"></i>`;
    
    // 显示Toast
    toast.classList.remove('hide');
    toast.classList.add('show');
    
    // 启动进度条动画
    progressBar.classList.remove('animate');
    setTimeout(() => {
      progressBar.classList.add('animate');
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
      hideToast();
    }, duration);
  }
  
  function hideToast() {
    const toast = document.getElementById('customToast');
    const progressBar = toast.querySelector('.progress-bar');
    
    if (toast) {
      toast.classList.remove('show');
      toast.classList.add('hide');
      
      // 重置进度条
      setTimeout(() => {
        progressBar.classList.remove('animate');
      }, 400);
    }
  }

  function initializeApp() {
    // 禁用页面加载完成的自动弹窗

    // 设置特点卡片动画索引
    initCardIndexes();

    // 初始化各种功能
    initImageGallery();
    initProductTabs(); // 这里会自动处理问答功能
    
    // 确保特点选项卡功能正确初始化
    setTimeout(() => {
      initFeatureTabs();
    }, 100);

    // 初始化选项卡导航的额外动效
    initTabsEnhancements();
    
    initSpecificationSelection();
    updatePrice();
    initPriceCountdown();
    initScrollEffects();
    initFloatingPurchaseBar();
    initBackToTop();
    initHotspots();
    initQAAccordion();
    initSmoothScrolling();
    initButtonAnimations();
    initHeightSync();
    initScrollOffset();
    initConsultationModal();
    initConfigModal();
    initBuyNowDropdown(); // 初始化立即下单下拉菜单
    initContactOrderModal(); // 初始化联系下单模态框
  }

  // 设置特点卡片的动画索引
  function initCardIndexes() {
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
      card.style.setProperty('--index', index);
    });
    
    // 设置奖项卡片的动画延迟
    const awardItems = document.querySelectorAll('.award-item');
    awardItems.forEach((item, index) => {
      item.style.setProperty('--delay', index);
    });
  }

  // 初始化AOS动画库
  function initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 100,
        delay: 100
      });
    }
  }

  // 图片画廊功能
  function initImageGallery() {
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    const mainImage = document.getElementById('mainProductImage');
    
    if (!mainImage || thumbnails.length === 0) return;

    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', function() {
        // 移除所有活跃状态
        thumbnails.forEach(t => t.classList.remove('active'));
        
        // 添加当前活跃状态
        this.classList.add('active');
        
        // 获取新图片路径
        const newImageSrc = this.getAttribute('data-image');
        
        if (newImageSrc) {
          // 添加淡出效果
          mainImage.style.opacity = '0';
          
          setTimeout(() => {
            mainImage.src = newImageSrc;
            mainImage.style.opacity = '1';
          }, 200);
        }
      });

      // 添加悬停效果
      thumbnail.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.02)';
      });

      thumbnail.addEventListener('mouseleave', function() {
        if (!this.classList.contains('active')) {
          this.style.transform = 'translateY(0) scale(1)';
        }
      });
    });

    // 主图点击放大效果
    const mainImageContainer = document.querySelector('.main-image-container');
    if (mainImageContainer) {
      mainImageContainer.addEventListener('click', function() {
        // 这里可以添加图片放大功能
        showImageModal(mainImage.src);
      });
    }
  }

  // 图片模态框
  function showImageModal(imageSrc) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-content">
          <button class="modal-close">&times;</button>
          <img src="${imageSrc}" alt="产品大图">
        </div>
      </div>
    `;

    // 添加样式
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    document.body.appendChild(modal);

    // 淡入效果
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 10);

    // 关闭功能
    const closeBtn = modal.querySelector('.modal-close');
    const backdrop = modal.querySelector('.modal-backdrop');

    function closeModal() {
      modal.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    }

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', function(e) {
      if (e.target === backdrop) {
        closeModal();
      }
    });

    // ESC键关闭
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  }

  // 全新的选项卡导航功能
  function initProductTabs() {
    const tabBtns = document.querySelectorAll('.nav-tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const navSlider = document.querySelector('.nav-slider');

    if (tabBtns.length === 0) return;

    tabBtns.forEach((btn, index) => {
      btn.addEventListener('click', function() {
        const targetTab = this.getAttribute('data-tab');
        const activeIndex = this.getAttribute('data-index');

        // 触发水波纹效果
        createRippleEffect(this);

        // 移除所有活跃状态
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        // 添加当前活跃状态
        this.classList.add('active');
        
        // 更新滑块位置
        if (navSlider) {
          navSlider.setAttribute('data-active-index', activeIndex);
          updateNavSliderPosition(this);
        }
        
        // 显示对应内容区域
        const targetContent = document.getElementById(targetTab + '-content');
        if (targetContent) {
          targetContent.classList.add('active');
        }

        // 如果是特点选项卡，初始化特点子选项卡功能
        if (targetTab === 'features') {
          setTimeout(() => {
            initFeatureTabs();
          }, 100);
        }

        // 如果是问题解答选项卡，初始化问答功能
        if (targetTab === 'qa') {
          setTimeout(() => {
            initQAFeatures();
          }, 100);
        }

        // 平滑滚动到选项卡区域
        const detailsSection = document.querySelector('.product-details-tabs');
        if (detailsSection) {
          // 动态计算导航栏高度
          let navHeight = 100;
          if (window.innerWidth <= 360) navHeight = 60;
          else if (window.innerWidth <= 480) navHeight = 70;
          else if (window.innerWidth <= 768) navHeight = 80;
          
          const elementPosition = detailsSection.offsetTop - navHeight;
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
      });

      // 增强的悬停效果
      btn.addEventListener('mouseenter', function() {
        if (!this.classList.contains('active')) {
          // 添加悬停时的微妙动画
          const icon = this.querySelector('.btn-icon');
          const text = this.querySelector('.btn-text');
          if (icon) icon.style.transform = 'translateY(-1px) scale(1.05)';
          if (text) text.style.transform = 'translateY(-0.5px)';
        }
      });

      btn.addEventListener('mouseleave', function() {
        if (!this.classList.contains('active')) {
          // 恢复正常状态
          const icon = this.querySelector('.btn-icon');
          const text = this.querySelector('.btn-text');
          if (icon) icon.style.transform = 'translateY(0) scale(1)';
          if (text) text.style.transform = 'translateY(0)';
        }
      });
    });

    // 初始化特点选项卡功能
    setTimeout(() => {
      initFeatureTabs();
    }, 50);
  }

  // 创建水波纹效果
  function createRippleEffect(button) {
    const ripple = button.querySelector('.btn-ripple');
    if (!ripple) return;

    // 重置水波纹
    ripple.style.width = '0';
    ripple.style.height = '0';
    
    // 触发水波纹动画
    setTimeout(() => {
      ripple.style.width = '100px';
      ripple.style.height = '100px';
    }, 10);
    
    // 清除水波纹效果
    setTimeout(() => {
      ripple.style.width = '0';
      ripple.style.height = '0';
    }, 600);
  }

  // 选项卡导航增强功能
  function initTabsEnhancements() {
    // 添加键盘支持
    initTabsKeyboardNavigation();
    
    // 添加滑块平滑动画监听
    initSliderAnimations();

    // 初始化一次滑块像素级位置，避免初次渲染偏差
    const firstActiveBtn = document.querySelector('.nav-tab-btn.active') || document.querySelector('.nav-tab-btn[data-index="0"]');
    const slider = document.querySelector('.nav-slider');
    if (slider && firstActiveBtn) {
      updateNavSliderPosition(firstActiveBtn);
    }
    
    // 添加视窗滚动检测
    initTabsScrollDetection();
    
    // 添加背景效果的交互响应
    initBackgroundInteractions();

    // 窗口变化时重新对齐滑块
    window.addEventListener('resize', debounce(function(){
      const activeBtn = document.querySelector('.nav-tab-btn.active');
      const sliderEl = document.querySelector('.nav-slider');
      if (sliderEl && activeBtn) {
        updateNavSliderPosition(activeBtn);
      }
    }, 150));
  }

  // 根据按钮像素位置和宽度更新滑块的位置与宽度
  function updateNavSliderPosition(activeButton) {
    const slider = document.querySelector('.nav-slider');
    const container = document.querySelector('.nav-buttons-container');
    if (!slider || !container || !activeButton) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = activeButton.getBoundingClientRect();

    const offsetLeft = btnRect.left - containerRect.left;
    const width = btnRect.width;

    // 使用像素定位：设置宽度并通过transform位移
    slider.style.width = width + 'px';
    slider.style.transform = `translateX(${offsetLeft}px)`;
  }

  // 键盘导航支持
  function initTabsKeyboardNavigation() {
    const tabBtns = document.querySelectorAll('.nav-tab-btn');
    
    tabBtns.forEach((btn, index) => {
      btn.setAttribute('tabindex', '0');
      
      btn.addEventListener('keydown', function(e) {
        let nextIndex = index;
        
        switch(e.key) {
          case 'ArrowRight':
            e.preventDefault();
            nextIndex = (index + 1) % tabBtns.length;
            tabBtns[nextIndex].focus();
            tabBtns[nextIndex].click();
            break;
            
          case 'ArrowLeft':
            e.preventDefault();
            nextIndex = index === 0 ? tabBtns.length - 1 : index - 1;
            tabBtns[nextIndex].focus();
            tabBtns[nextIndex].click();
            break;
            
          case 'Enter':
          case ' ':
            e.preventDefault();
            this.click();
            break;
        }
      });
    });
  }

  // 滑块动画监听
  function initSliderAnimations() {
    const navSlider = document.querySelector('.nav-slider');
    if (!navSlider) return;

    // 监听滑块位置变化，添加缓动效果
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-active-index') {
          // 添加轻微的缩放动画
          navSlider.style.transform += ' scale(1.02)';
          
          setTimeout(() => {
            const currentTransform = navSlider.style.transform.replace(' scale(1.02)', '');
            navSlider.style.transform = currentTransform;
          }, 200);
        }
      });
    });

    observer.observe(navSlider, {
      attributes: true,
      attributeFilter: ['data-active-index']
    });
  }

  // 滚动检测和视觉反馈
  function initTabsScrollDetection() {
    const tabsNavigation = document.querySelector('.tabs-navigation-new');
    if (!tabsNavigation) return;

    let isTabsVisible = false;

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isTabsVisible) {
          isTabsVisible = true;
          // 当选项卡进入视窗时触发入场动画
          tabsNavigation.style.animation = 'slideInFromTop 0.6s ease-out';
        } else if (!entry.isIntersecting && isTabsVisible) {
          isTabsVisible = false;
        }
      });
    }, { threshold: 0.3 });

    observer.observe(tabsNavigation);
  }

  // 背景交互效果
  function initBackgroundInteractions() {
    const tabsNavigation = document.querySelector('.tabs-navigation-new');
    const navWave1 = document.querySelector('.nav-wave-1');
    const navWave2 = document.querySelector('.nav-wave-2');
    
    if (!tabsNavigation) return;

    // 鼠标移动时的视差效果
    tabsNavigation.addEventListener('mousemove', throttle(function(e) {
      const rect = tabsNavigation.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;
      
      // 应用轻微的视差效果
      if (navWave1) {
        navWave1.style.transform = `translate(${deltaX * 2}px, ${deltaY * 2}px) rotate(${deltaX * 0.5}deg) scale(${1 + Math.abs(deltaX) * 0.02})`;
      }
      
      if (navWave2) {
        navWave2.style.transform = `translate(${-deltaX * 1.5}px, ${-deltaY * 1.5}px) rotate(${-deltaX * 0.3}deg) scale(${1 + Math.abs(deltaY) * 0.01})`;
      }
    }, 16));

    // 鼠标离开时重置效果
    tabsNavigation.addEventListener('mouseleave', function() {
      if (navWave1) {
        navWave1.style.transform = '';
      }
      if (navWave2) {
        navWave2.style.transform = '';
      }
    });
  }

  // 特点内部选项卡功能
  function initFeatureTabs() {
    const featureTabs = document.querySelectorAll('.features-tab');
    const featureCards = document.querySelectorAll('.feature-card');

    if (featureTabs.length === 0) return;

    featureTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const targetCategory = this.getAttribute('data-target');

        // 移除所有活跃状态
        featureTabs.forEach(t => t.classList.remove('active'));
        
        // 添加当前活跃状态
        this.classList.add('active');

        // 显示/隐藏相应的特点卡片
        featureCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          
          if (targetCategory === 'all' || cardCategory === targetCategory) {
            card.style.display = 'block';
            // 添加淡入动画
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
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

    // 为特点卡片添加入场动画
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const card = entry.target;
            // 只有当卡片还没有动画过时才添加动画类
            if (!card.classList.contains('animated')) {
              card.classList.add('animate-in');
              card.classList.add('animated'); // 标记为已动画过
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    featureCards.forEach(card => {
      observer.observe(card);
    });

    // 立即初始化默认显示状态 - 确保页面加载时特点卡片正确显示
    setTimeout(() => {
      const defaultActiveTab = document.querySelector('.features-tab.active') || document.querySelector('.features-tab[data-target="all"]');
      const targetCategory = defaultActiveTab ? defaultActiveTab.getAttribute('data-target') : 'all';
      
      console.log('Initializing feature cards with category:', targetCategory); // 调试用
      
      featureCards.forEach((card, index) => {
        const cardCategory = card.getAttribute('data-category');
        
        if (targetCategory === 'all' || cardCategory === targetCategory) {
          // 确保卡片显示
          card.style.display = 'block';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
          card.style.visibility = 'visible';
          
          // 移除可能存在的animate-in类，避免冲突
          card.classList.remove('animate-in');
          
          console.log(`Showing card ${index} with category: ${cardCategory}`); // 调试用
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    }, 10); // 很小的延迟确保DOM完全准备好
  }

  // 规格选择功能
  function initSpecificationSelection() {
    const specBtns = document.querySelectorAll('.spec-btn');

    specBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const specType = this.getAttribute('data-spec') || this.getAttribute('data-service');
        
        if (specType) {
          // 在同一组内移除其他活跃状态
          const group = this.closest('.spec-group');
          if (group) {
            group.querySelectorAll('.spec-btn').forEach(b => b.classList.remove('active'));
          }
          
          // 添加当前活跃状态
          this.classList.add('active');
          
          // 更新价格（如果需要）
          updatePrice();
        }
      });

      // 添加悬停动画
      btn.addEventListener('mouseenter', function() {
        if (!this.classList.contains('active')) {
          this.style.transform = 'translateY(-3px)';
          this.style.boxShadow = '0 8px 25px rgba(0, 102, 255, 0.15)';
        }
      });

      btn.addEventListener('mouseleave', function() {
        if (!this.classList.contains('active')) {
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = 'none';
        }
      });
    });
  }

  // 价格更新功能
  function updatePrice() {
    const activeSpecs = document.querySelectorAll('.spec-btn.active');
    let basePrice = 2499;
    let totalAddPrice = 0;

    activeSpecs.forEach(spec => {
      const priceText = spec.querySelector('.spec-price');
      if (priceText) {
        const price = parseInt(priceText.textContent.replace(/[^\d]/g, '')) || 0;
        totalAddPrice += price;
      }
    });

    const finalPrice = basePrice + totalAddPrice;
    
    // 更新显示价格
    const amountElement = document.querySelector('.current-price .amount');
    if (amountElement) {
      animateNumber(amountElement, parseInt(amountElement.textContent.replace(/,/g, '')), finalPrice);
    }

    // 更新悬浮栏价格
    const miniPrice = document.querySelector('.mini-price');
    if (miniPrice) {
      miniPrice.textContent = `¥${finalPrice.toLocaleString()}`;
    }
  }

  // 数字动画效果
  function animateNumber(element, start, end) {
    const duration = 500;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const current = Math.floor(start + (end - start) * easeOutCubic(progress));
      element.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // 数量控制功能已移除，替换为产品快速信息展示

  // 倒计时功能
  function initPriceCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    // 设置结束时间（24小时后）
    const endTime = new Date().getTime() + (24 * 60 * 60 * 1000);

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance > 0) {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        countdownElement.textContent = 
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        countdownElement.textContent = '00:00:00';
        clearInterval(countdownInterval);
      }
    }

    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown(); // 立即更新一次
  }

  // 滚动效果
  function initScrollEffects() {
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // 视差效果
      const shapes = document.querySelectorAll('.shape');
      shapes.forEach((shape, index) => {
        const speed = 0.5 + (index * 0.2);
        const yPos = -(scrollTop * speed);
        shape.style.transform = `translateY(${yPos}px) rotate(${scrollTop * 0.1}deg)`;
      });

      lastScrollTop = scrollTop;
    }, { passive: true });
  }

  // 全新悬浮购买栏功能
  function initFloatingPurchaseBar() {
    const floatingBar = document.querySelector('.floating-purchase-bar-new');
    const productHero = document.querySelector('.product-hero-section');
    
    if (!floatingBar || !productHero) return;

    // 初始化所有功能
    initFloatingBarVisibility(floatingBar, productHero);
    initFloatingBarToggle(floatingBar);
    initFloatingQuantityControls(floatingBar);
    initFloatingActionButtons(floatingBar);
    initFloatingBarAnimations(floatingBar);
    initFloatingPriceSync(floatingBar);
  }

  // 浮动栏显示/隐藏逻辑
  function initFloatingBarVisibility(floatingBar, productHero) {
    let isVisible = false;

    function toggleFloatingBar() {
      const heroBottom = productHero.getBoundingClientRect().bottom;
      const shouldShow = heroBottom < 100; // 提前100px显示
      
      if (shouldShow && !isVisible) {
        isVisible = true;
        floatingBar.classList.add('visible');
        // 添加入场动画
        setTimeout(() => {
          floatingBar.style.animation = 'slideInFromBottom 0.6s ease-out';
        }, 100);
      } else if (!shouldShow && isVisible) {
        isVisible = false;
        floatingBar.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', throttle(toggleFloatingBar, 16), { passive: true });
  }

  // 收起/展开功能
  function initFloatingBarToggle(floatingBar) {
    const toggleBtn = floatingBar.querySelector('.floating-bar-toggle');
    const toggleIcon = toggleBtn?.querySelector('.floating-toggle-icon i');
    const toggleText = toggleBtn?.querySelector('.floating-toggle-text');
    
    if (!toggleBtn) return;

    let isMinimized = false;

    toggleBtn.addEventListener('click', function() {
      isMinimized = !isMinimized;
      
      if (isMinimized) {
        floatingBar.classList.add('minimized');
        toggleText.textContent = '展开';
        // 触发收起动画
        floatingBar.style.animation = 'minimizeBar 0.4s ease';
      } else {
        floatingBar.classList.remove('minimized');
        toggleText.textContent = '收起';
        // 触发展开动画
        floatingBar.style.animation = 'expandBar 0.4s ease';
      }
    });
  }

  // 数量控制功能
  function initFloatingQuantityControls(floatingBar) {
    const quantityInput = floatingBar.querySelector('.floating-quantity-input');
    const decreaseBtn = floatingBar.querySelector('.floating-quantity-decrease');
    const increaseBtn = floatingBar.querySelector('.floating-quantity-increase');
    
    if (!quantityInput || !decreaseBtn || !increaseBtn) return;

    // 减少数量
    decreaseBtn.addEventListener('click', function() {
      let currentValue = parseInt(quantityInput.value) || 1;
      if (currentValue > 1) {
        currentValue--;
        quantityInput.value = currentValue;
        animateQuantityChange(quantityInput);
        updateTotalPrice(currentValue);
      }
      
      // 触发按钮动画
      animateQuantityButton(this);
    });

    // 增加数量
    increaseBtn.addEventListener('click', function() {
      let currentValue = parseInt(quantityInput.value) || 1;
      if (currentValue < 999) {
        currentValue++;
        quantityInput.value = currentValue;
        animateQuantityChange(quantityInput);
        updateTotalPrice(currentValue);
      }
      
      // 触发按钮动画
      animateQuantityButton(this);
    });

    // 数量输入验证
    quantityInput.addEventListener('input', function() {
      let value = parseInt(this.value) || 1;
      value = Math.max(1, Math.min(999, value));
      this.value = value;
      updateTotalPrice(value);
    });
  }

  // 操作按钮功能
  function initFloatingActionButtons(floatingBar) {
    const actionBtns = floatingBar.querySelectorAll('.floating-action-btn');
    
    actionBtns.forEach(btn => {
      // 添加水波纹点击效果
      btn.addEventListener('click', function(e) {
        const action = this.getAttribute('data-action');
        
        // 触发水波纹
        createFloatingRipple(this, e);
        
        // 执行对应操作
        if (action === 'consult') {
          handleConsultAction();
        } else if (action === 'buy') {
          handleBuyAction();
        }
      });

      // 悬停效果增强
      btn.addEventListener('mouseenter', function() {
        const icon = this.querySelector('.floating-btn-content i');
        if (icon) {
          icon.style.transform = 'translateY(-2px) scale(1.1)';
        }
      });

      btn.addEventListener('mouseleave', function() {
        const icon = this.querySelector('.floating-btn-content i');
        if (icon) {
          icon.style.transform = 'translateY(0) scale(1)';
        }
      });
    });
  }

  // 浮动栏动画效果
  function initFloatingBarAnimations(floatingBar) {
    // 背景粒子动画控制
    const particles = floatingBar.querySelectorAll('.floating-particle');
    particles.forEach((particle, index) => {
      // 随机延迟启动动画
      setTimeout(() => {
        particle.style.animationDelay = `${Math.random() * 2}s`;
      }, index * 500);
    });

    // 装饰点动画
    const decorationDots = floatingBar.querySelectorAll('.floating-decoration-dot');
    if (decorationDots.length > 0) {
      let currentDot = 0;
      
      setInterval(() => {
        decorationDots.forEach(dot => dot.classList.remove('active'));
        decorationDots[currentDot].classList.add('active');
        currentDot = (currentDot + 1) % decorationDots.length;
      }, 1500);
    }
  }

  // 价格同步功能
  function initFloatingPriceSync(floatingBar) {
    const floatingPrice = floatingBar.querySelector('#floatingPrice');
    if (!floatingPrice) return;

    // 监听主产品价格变化
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const mainPrice = document.querySelector('.product-price .price-current');
          if (mainPrice && floatingPrice.textContent !== mainPrice.textContent) {
            // 同步价格并添加动画
            animatePriceChange(floatingPrice, mainPrice.textContent);
          }
        }
      });
    });

    const mainPrice = document.querySelector('.product-price .price-current');
    if (mainPrice) {
      observer.observe(mainPrice, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
  }

  // 辅助函数
  function animateQuantityChange(input) {
    input.style.transform = 'scale(1.1)';
    input.style.color = 'var(--product-gold)';
    
    setTimeout(() => {
      input.style.transform = 'scale(1)';
      input.style.color = 'var(--text-on-blue)';
    }, 200);
  }

  function animateQuantityButton(button) {
    button.style.transform = 'scale(0.95)';
    button.style.background = 'rgba(255, 215, 0, 0.3)';
    
    setTimeout(() => {
      button.style.transform = 'scale(1)';
      button.style.background = 'transparent';
    }, 150);
  }

  function updateTotalPrice(quantity) {
    const basePrice = 2499;
    const totalPrice = basePrice * quantity;
    const floatingPrice = document.querySelector('#floatingPrice');
    
    if (floatingPrice) {
      animatePriceChange(floatingPrice, totalPrice.toString());
    }
  }

  function animatePriceChange(priceElement, newPrice) {
    priceElement.style.transform = 'scale(1.1)';
    priceElement.style.color = 'var(--product-gold)';
    
    setTimeout(() => {
      priceElement.textContent = newPrice;
      priceElement.style.transform = 'scale(1)';
    }, 150);
  }

  function createFloatingRipple(button, event) {
    const ripple = button.querySelector('.floating-btn-ripple');
    if (!ripple) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size/2) + 'px';
    
    setTimeout(() => {
      ripple.style.width = '0';
      ripple.style.height = '0';
    }, 600);
  }

  function handleConsultAction() {
    // 显示咨询模态框或跳转到咨询页面
    const consultModal = document.querySelector('#consultationModal');
    if (consultModal) {
      consultModal.style.display = 'block';
    } else {
      // 滚动到咨询按钮
      const consultBtn = document.querySelector('.btn-consult');
      if (consultBtn) {
        let navHeight = 100;
        if (window.innerWidth <= 360) navHeight = 60;
        else if (window.innerWidth <= 480) navHeight = 70;
        else if (window.innerWidth <= 768) navHeight = 80;
        
        const elementPosition = consultBtn.offsetTop - navHeight;
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    }
    
    // 显示成功提示
    showToast('咨询请求已发送', 'success', 2000);
  }

  function handleBuyAction() {
    const quantity = parseInt(document.querySelector('.floating-quantity-input')?.value) || 1;
    
    // 显示购买确认或跳转到结算页面
    const configModal = document.querySelector('#configModal');
    if (configModal) {
      configModal.style.display = 'block';
    } else {
      // 滚动到购买按钮
      const buyBtn = document.querySelector('.btn-buy-now');
      if (buyBtn) {
        let navHeight = 100;
        if (window.innerWidth <= 360) navHeight = 60;
        else if (window.innerWidth <= 480) navHeight = 70;
        else if (window.innerWidth <= 768) navHeight = 80;
        
        const elementPosition = buyBtn.offsetTop - navHeight;
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    }
    
    // 显示成功提示
    showToast(`已添加 ${quantity} 件商品到购物车`, 'success', 3000);
  }

  // 返回顶部功能
  function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 热点标记功能
  function initHotspots() {
    const hotspots = document.querySelectorAll('.hotspot');
    
    hotspots.forEach(hotspot => {
      hotspot.addEventListener('mouseenter', function() {
        this.style.zIndex = '100';
      });

      hotspot.addEventListener('mouseleave', function() {
        this.style.zIndex = '10';
      });

      // 移动设备点击事件
      hotspot.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // 关闭其他热点提示
        hotspots.forEach(h => {
          if (h !== this) {
            h.classList.remove('active');
          }
        });
        
        // 切换当前热点状态
        this.classList.toggle('active');
      });
    });

    // 点击其他地方关闭热点提示
    document.addEventListener('click', function() {
      hotspots.forEach(hotspot => {
        hotspot.classList.remove('active');
      });
    });
  }

  // 问答手风琴功能
  function initQAAccordion() {
    const qaItems = document.querySelectorAll('.qa-item');
    
    qaItems.forEach(item => {
      const question = item.querySelector('.question');
      const answer = item.querySelector('.answer');
      const icon = question.querySelector('i');
      
      if (!question || !answer) return;

      // 初始隐藏答案
      answer.style.display = 'none';
      
      question.addEventListener('click', function() {
        const isOpen = answer.style.display === 'block';
        
        // 关闭所有其他项目
        qaItems.forEach(otherItem => {
          if (otherItem !== item) {
            const otherAnswer = otherItem.querySelector('.answer');
            const otherIcon = otherItem.querySelector('.question i');
            if (otherAnswer) otherAnswer.style.display = 'none';
            if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
          }
        });
        
        // 切换当前项目
        if (isOpen) {
          answer.style.display = 'none';
          if (icon) icon.style.transform = 'rotate(0deg)';
        } else {
          answer.style.display = 'block';
          if (icon) icon.style.transform = 'rotate(180deg)';
        }
      });
    });
  }

  // 平滑滚动
  function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // 按钮动画效果
  function initButtonAnimations() {
    const buttons = document.querySelectorAll('button, .btn-consult, .btn-buy-now, .btn-add-cart');
    
    buttons.forEach(button => {
      button.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
      });

      button.addEventListener('click', function(e) {
        // 创建涟漪效果
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        `;
        
        // 确保按钮有相对定位
        if (getComputedStyle(this).position === 'static') {
          this.style.position = 'relative';
        }
        
        this.appendChild(ripple);
        
        setTimeout(() => {
          if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
          }
        }, 600);
      });
    });

    // 添加涟漪动画CSS
    if (!document.querySelector('#ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // 性能优化：防抖函数
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 性能优化：节流函数
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
    }
  }

  // 高度同步功能 - 让左边画廊跟随右边信息卡片的高度
  function initHeightSync() {
    const leftContainer = document.querySelector('.product-gallery-wrapper .gallery-container');
    const rightContainer = document.querySelector('.product-info-wrapper .product-info-card');
    
    if (!leftContainer || !rightContainer) return;
    
    function syncHeights() {
      // 检查是否在移动端（1024px以下）
      if (window.innerWidth <= 1024) {
        // 在移动端，让容器保持自然高度
        leftContainer.style.height = 'auto';
        return;
      }
      
      // 暂时移除左边的高度设置
      leftContainer.style.height = 'auto';
      
      // 等待下一帧，让右边容器渲染完成
      requestAnimationFrame(() => {
        // 获取右边容器的实际高度
        const rightHeight = rightContainer.offsetHeight;
        
        // 考虑CSS缩放因子的影响
        const gridElement = document.querySelector('.product-hero-grid');
        const computedStyle = window.getComputedStyle(gridElement);
        const transform = computedStyle.transform;
        
        // 提取缩放值，如果没有缩放则默认为1
        let scaleValue = 1;
        if (transform && transform !== 'none') {
          const scaleMatch = transform.match(/scale\(([^)]+)\)/);
          if (scaleMatch) {
            scaleValue = parseFloat(scaleMatch[1]);
          }
        }
        
        // 将左边容器的高度设置为与右边相同
        leftContainer.style.height = rightHeight + 'px';
      });
    }
    
    // 初始同步
    setTimeout(syncHeights, 100);
    
    // 在窗口大小变化时重新同步
    window.addEventListener('resize', debounce(syncHeights, 250));
    
    // 监听自定义高度同步事件
    document.addEventListener('heightSync', syncHeights);
    
    // 监听内容变化（如选项卡切换等）
    const observer = new MutationObserver(debounce(syncHeights, 100));
    observer.observe(rightContainer, {
      childList: true,
      subtree: true,
      attributes: true
    });
  }

  // 滚动偏移量处理 - 防止固定导航栏遮挡内容
  function initScrollOffset() {
    // 根据屏幕大小动态获取导航栏高度
    function getNavbarHeight() {
      if (window.innerWidth <= 360) return 60; // 极小屏幕
      if (window.innerWidth <= 480) return 70; // 超小屏幕
      if (window.innerWidth <= 768) return 80; // 手机端
      return 100; // 桌面端
    }
    
    // 处理所有锚点链接
    document.addEventListener('click', function(e) {
      const target = e.target.closest('a[href^="#"]');
      if (!target) return;
      
      const href = target.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      
      const targetElement = document.querySelector(href);
      if (targetElement) {
        const navbarHeight = getNavbarHeight();
        const elementPosition = targetElement.offsetTop - navbarHeight;
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    });
    
    // 处理页面加载时的锚点
    if (window.location.hash) {
      setTimeout(() => {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
          const navbarHeight = getNavbarHeight();
          const elementPosition = targetElement.offsetTop - navbarHeight;
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }

  // 监听窗口大小变化，重新初始化某些功能
  window.addEventListener('resize', debounce(function() {
    // 重新计算某些尺寸相关的功能
    initFloatingPurchaseBar();
    // 重新同步高度
    const syncEvent = new CustomEvent('heightSync');
    document.dispatchEvent(syncEvent);
  }, 250));

  // 咨询表单模态框功能
  function initConsultationModal() {
    const modal = document.getElementById('consultationModal');
    const consultButtons = document.querySelectorAll('.btn-consult, .floating-btn.btn-consult');
    const closeButton = document.getElementById('closeModal');
    const cancelButton = document.getElementById('cancelConsult');
    const overlay = modal.querySelector('.modal-overlay');
    const form = document.getElementById('consultationForm');
    
    if (!modal || !form) return;
    
    // 打开模态框
    function openModal() {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // 聚焦到第一个输入框
      setTimeout(() => {
        const firstInput = form.querySelector('input:not([readonly])');
        if (firstInput) firstInput.focus();
      }, 300);
    }
    
    // 关闭模态框
    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      form.reset();
      
      // 恢复产品名称
      const productInput = document.getElementById('consultProduct');
      if (productInput) {
        productInput.value = '星火Pro 智能燃气灶';
      }
      
      // 重置自定义来源输入框状态
      const customSourceContainer = document.getElementById('customSourceContainer');
      const customSourceInput = document.getElementById('customSource');
      if (customSourceContainer && customSourceInput) {
        customSourceContainer.style.display = 'none';
        customSourceInput.required = false;
        customSourceInput.value = '';
        customSourceInput.classList.remove('invalid');
      }
      
      // 重置联系方式字段状态
      const contactInput = document.getElementById('consultContact');
      if (contactInput) {
        contactInput.classList.remove('invalid');
        const helpText = contactInput.parentNode.querySelector('.form-text');
        if (helpText) {
          helpText.textContent = '支持手机号、邮箱地址或微信号';
          helpText.style.color = '#6c757d';
        }
      }
    }
    
    // 绑定事件
    consultButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        openModal();
      });
    });
    
    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
    
    // 表单提交处理
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });
      
      // 验证必填项
      const requiredFields = ['name', 'contact', 'message'];
      const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
      
      // 如果选择了"其他"来源，验证自定义来源输入框
      if (data.source === '其他' && (!data.customSource || data.customSource.trim() === '')) {
        missingFields.push('customSource');
      }
      
      if (missingFields.length > 0) {
        const fieldNames = {
          'name': '姓名',
          'contact': '联系方式',
          'message': '详细需求',
          'customSource': '具体来源'
        };
        const missingFieldNames = missingFields.map(field => fieldNames[field] || field).join('、');
        showToast('表单验证失败', `请填写：${missingFieldNames}`, 'error', 2000);
        return;
      }
      
      // 验证联系方式格式
      if (data.contact && data.contact.trim() !== '') {
        const contactValidation = validateContactFormat(data.contact);
        if (!contactValidation.valid) {
          showToast('格式验证失败', '请输入正确的联系方式（手机号、邮箱地址或微信号）', 'error', 2000);
          return;
        }
      }
      
      // 显示提交状态
      const submitBtn = form.querySelector('.btn-submit');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i><span>发送中...</span>';
      submitBtn.disabled = true;
      
      // 模拟提交（实际项目中这里应该调用API）
      setTimeout(() => {
        showToast('咨询已提交', '我们会尽快与您联系', 'success');
        
        // 延迟关闭模态框
        setTimeout(() => {
          closeModal();
        }, 1200);
        
        // 恢复按钮状态
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // 这里可以添加实际的API调用
        console.log('咨询数据:', data);
      }, 1500);
    });
    
    // 实时验证
    const nameInput = document.getElementById('consultName');
    const contactInput = document.getElementById('consultContact');
    const sourceSelect = document.getElementById('consultSource');
    const customSourceContainer = document.getElementById('customSourceContainer');
    const customSourceInput = document.getElementById('customSource');
    
    // 联系方式格式验证函数
    function validateContactFormat(contact) {
      const phoneRegex = /^1[3-9]\d{9}$/; // 中国手机号
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 邮箱格式
      // 微信号格式（更宽松的规则）：
      // 1. 字母开头，6-20位，包含字母数字下划线连字符
      // 2. 或者纯数字（5-11位，支持QQ号）
      // 3. 或者字母数字组合，4-20位
      const wechatRegex = /^([a-zA-Z][\w-]{5,19}|[0-9]{5,11}|[a-zA-Z0-9_-]{4,20})$/;
      
      if (phoneRegex.test(contact)) {
        return { valid: true, type: 'phone' };
      } else if (emailRegex.test(contact)) {
        return { valid: true, type: 'email' };
      } else if (wechatRegex.test(contact)) {
        return { valid: true, type: 'wechat' };
      } else {
        return { valid: false, type: 'unknown' };
      }
    }
    
    // 处理自定义来源输入框显示/隐藏
    if (sourceSelect && customSourceContainer && customSourceInput) {
      sourceSelect.addEventListener('change', function() {
        if (this.value === '其他') {
          customSourceContainer.style.display = 'block';
          customSourceInput.required = true;
        } else {
          customSourceContainer.style.display = 'none';
          customSourceInput.required = false;
          customSourceInput.value = '';
        }
      });
      
      // 自定义来源输入框验证
      customSourceInput.addEventListener('input', function() {
        this.classList.toggle('invalid', this.value.trim().length < 2);
      });
    }
    
    if (nameInput) {
      nameInput.addEventListener('input', function() {
        this.classList.toggle('invalid', this.value.trim().length < 2);
      });
    }
    
    if (contactInput) {
      contactInput.addEventListener('input', function() {
        const contact = this.value.trim();
        if (contact === '') {
          this.classList.remove('invalid');
          return;
        }
        
        const validation = validateContactFormat(contact);
        this.classList.toggle('invalid', !validation.valid);
        
        // 更新提示文本
        const helpText = this.parentNode.querySelector('.form-text');
        if (helpText) {
          if (validation.valid) {
            const typeNames = {
              'phone': '手机号',
              'email': '邮箱地址', 
              'wechat': '微信号'
            };
            helpText.textContent = `已识别为：${typeNames[validation.type]}`;
            helpText.style.color = '#28a745';
          } else {
            helpText.textContent = '支持手机号、邮箱地址或微信号';
            helpText.style.color = '#6c757d';
          }
        }
      });
    }
  }

  // 全新的配置菜单模态框功能
  function initConfigModal() {
    const modal = document.getElementById('configModal');
    const configButtons = document.querySelectorAll('.btn-add-cart'); // 配置菜单按钮
    const closeButton = document.getElementById('closeConfigModal');
    const resetButton = document.getElementById('resetConfig');
    const addToCartButton = document.getElementById('addToCart');
    const buyNowButton = document.getElementById('buyNow');
    const prevButton = document.getElementById('prevStep');
    const nextButton = document.getElementById('nextStep');
    const completeButton = document.getElementById('completeConfig');
    const backdrop = modal.querySelector('.modal-backdrop');
    const applyButton = addToCartButton; // 使用添加到购物车按钮作为应用按钮
    const buyButton = buyNowButton; // 使用立即购买按钮
    
    if (!modal) return;
    
    // 当前步骤状态
    let currentStep = 1;
    const totalSteps = 3;
    
    // 配置状态管理
    let currentConfig = {
      gasType: 'natural',
      panelColor: 'black',
      installation: 'basic',
      warranty: 'standard'
    };
    
    // 同步到全局，供“联系下单”等功能读取
    window.__productCurrentConfig = { ...currentConfig };
    
    let configPrices = {
      base: 2499,
      panelColor: {
        black: 0,
        white: 150,
        gray: 100,
        gold: 300
      },
      installation: {
        basic: 0,
        premium: 200
      },
      warranty: {
        standard: 0,
        extended: 300
      }
    };
    
    // 打开配置模态框
    function openConfigModal() {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      showStep(1);
      updateConfigSummary();
      updateProgress();
    }
    
    // 关闭配置模态框
    function closeConfigModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    // 显示指定步骤
    function showStep(step) {
      currentStep = step;
      console.log('切换到步骤:', step);
      
      // 更新步骤导航指示器
      document.querySelectorAll('.step-nav-item').forEach((item, index) => {
        item.classList.remove('active', 'completed');
        if (index + 1 === step) {
          item.classList.add('active');
          console.log('激活步骤导航:', index + 1);
        } else if (index + 1 < step) {
          item.classList.add('completed');
          console.log('完成步骤导航:', index + 1);
        }
      });
      
      // 更新导航进度条
      const navProgress = document.getElementById('navProgress');
      if (navProgress) {
        const progressPercent = ((step - 1) / (totalSteps - 1)) * 100;
        navProgress.style.width = `${progressPercent}%`;
        console.log('更新导航进度条:', progressPercent + '%');
      }
      
      // 更新选项卡显示
      document.querySelectorAll('.config-step').forEach((tab, index) => {
        tab.classList.remove('active');
        if (index + 1 === step) {
          tab.classList.add('active');
          console.log('激活步骤标签:', tab);
        }
      });
      
      // 更新导航按钮状态
      prevButton.disabled = step === 1;
      nextButton.textContent = step === totalSteps ? '完成配置' : '下一步';
      
      // 添加图标
      if (step === totalSteps) {
        nextButton.innerHTML = '<i class="bi bi-check-lg"></i>完成配置';
      } else {
        nextButton.innerHTML = '下一步<i class="bi bi-chevron-right"></i>';
      }
      
      // 更新进度条
      updateProgress();
    }
    
    // 重置配置
    function resetConfig() {
      currentConfig = {
        gasType: 'natural',
        panelColor: 'black',
        installation: 'basic',
        warranty: 'standard'
      };
      // 同步到全局
      window.__productCurrentConfig = { ...currentConfig };
      
      // 重置UI状态
      document.querySelectorAll('.option-card, .config-card, .color-card, .color-option, .service-card').forEach(card => {
        card.classList.remove('active', 'selected');
      });
      
      // 设置默认选项为激活状态
      document.querySelectorAll('input[value="natural"], input[value="black"], input[value="basic"], input[value="standard"]').forEach(input => {
        input.checked = true;
        const card = input.closest('.option-card, .config-card, .color-card, .color-option, .service-card');
        if (card) {
          card.classList.add('active', 'selected');
        }
      });
      
      showStep(1);
      updateConfigSummary();
    }
    
    // 更新进度指示器
    function updateProgress() {
      // 更新头部进度条
      const progressFill = document.getElementById('configProgress');
      const currentStepNum = document.getElementById('currentStepNum');
      
      if (progressFill) {
        const progressPercent = (currentStep / totalSteps) * 100;
        progressFill.style.width = `${progressPercent}%`;
        console.log('更新头部进度条:', progressPercent + '%');
      }
      
      if (currentStepNum) {
        currentStepNum.textContent = currentStep;
        console.log('更新步骤数字显示:', currentStep);
      }
      
      // 更新底部步骤指示器
      const indicators = document.querySelectorAll('.indicator');
      indicators.forEach((indicator, index) => {
        indicator.classList.remove('active');
        if (index + 1 === currentStep) {
          indicator.classList.add('active');
          console.log('激活底部指示器:', index + 1);
        }
      });
    }
    
    // 计算总价格
    function calculateTotalPrice() {
      let total = configPrices.base;
      total += configPrices.panelColor[currentConfig.panelColor] || 0;
      total += configPrices.installation[currentConfig.installation] || 0;
      total += configPrices.warranty[currentConfig.warranty] || 0;
      
      console.log('价格计算详情:');
      console.log('- 基础价格:', configPrices.base);
      console.log('- 面板颜色加价:', configPrices.panelColor[currentConfig.panelColor]);
      console.log('- 安装服务加价:', configPrices.installation[currentConfig.installation]);
      console.log('- 质保服务加价:', configPrices.warranty[currentConfig.warranty]);
      console.log('- 计算总价:', total);
      
      return total;
    }
    
    // 更新配置总结
    function updateConfigSummary() {
      console.log('=== 开始更新配置总结 ===');
      console.log('当前配置:', currentConfig);
      
      const totalPrice = calculateTotalPrice();
      const optionsPrice = totalPrice - configPrices.base;
      const finalPrice = totalPrice - 500; // 减去优惠
      
      console.log('基础价格:', configPrices.base);
      console.log('配置升级价格:', optionsPrice);
      console.log('总价:', totalPrice);
      console.log('最终价格:', finalPrice);
      
      // 更新价格显示
      const upgradePrice = document.getElementById('upgradePrice');
      const subtotalPrice = document.getElementById('subtotalPrice');
      const finalConfigPrice = document.getElementById('finalConfigPrice');
      
      if (upgradePrice) {
        upgradePrice.textContent = optionsPrice > 0 ? `+¥${optionsPrice.toLocaleString()}` : '¥0';
        console.log('已更新配置升级价格:', optionsPrice);
      }
      
      if (subtotalPrice) {
        subtotalPrice.textContent = `¥${totalPrice.toLocaleString()}`;
        console.log('已更新小计价格:', totalPrice);
      }
      
      if (finalConfigPrice) {
        finalConfigPrice.textContent = `¥${finalPrice.toLocaleString()}`;
        console.log('已更新最终价格:', finalPrice);
      }
      
      // 配置项标签映射
      const configLabels = {
        gasType: {
          natural: '天然气',
          lpg: '液化气'
        },
        panelColor: {
          black: '雅致黑',
          white: '珍珠白',
          gray: '银灰色',
          gold: '香槟金'
        },
        installation: {
          basic: '基础安装',
          premium: '高级安装'
        },
        warranty: {
          standard: '标准质保',
          extended: '延长质保'
        }
      };
      
      const configPriceLabels = {
        gasType: {
          natural: '¥0',
          lpg: '¥0'
        },
        panelColor: {
          black: '¥0',
          white: '+¥150',
          gray: '+¥100',
          gold: '+¥300'
        },
        installation: {
          basic: '免费',
          premium: '+¥200'
        },
        warranty: {
          standard: '¥0',
          extended: '+¥300'
        }
      };
      
      // 更新配置详情
      const gasTypeItem = document.querySelector('.config-item[data-type="gasType"]');
      if (gasTypeItem) {
        gasTypeItem.querySelector('.item-value').textContent = configLabels.gasType[currentConfig.gasType];
        gasTypeItem.querySelector('.item-price').textContent = configPriceLabels.gasType[currentConfig.gasType];
        console.log('已更新气源类型显示:', configLabels.gasType[currentConfig.gasType]);
      }
      
      const panelColorItem = document.querySelector('.config-item[data-type="panelColor"]');
      if (panelColorItem) {
        panelColorItem.querySelector('.item-value').textContent = configLabels.panelColor[currentConfig.panelColor];
        panelColorItem.querySelector('.item-price').textContent = configPriceLabels.panelColor[currentConfig.panelColor];
        console.log('已更新面板颜色显示:', configLabels.panelColor[currentConfig.panelColor]);
        
        // 更新颜色点
        const colorIndicator = panelColorItem.querySelector('.color-indicator');
        if (colorIndicator) {
          const colorMap = {
            black: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
            white: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
            gray: 'linear-gradient(135deg, #718096 0%, #4a5568 100%)',
            gold: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
          };
          colorIndicator.style.background = colorMap[currentConfig.panelColor];
        }
      }
      
      const installationItem = document.querySelector('.config-item[data-type="installation"]');
      if (installationItem) {
        installationItem.querySelector('.item-value').textContent = configLabels.installation[currentConfig.installation];
        installationItem.querySelector('.item-price').textContent = configPriceLabels.installation[currentConfig.installation];
        console.log('已更新安装服务显示:', configLabels.installation[currentConfig.installation]);
      }
      
      const warrantyItem = document.querySelector('.config-item[data-type="warranty"]');
      if (warrantyItem) {
        warrantyItem.querySelector('.item-value').textContent = configLabels.warranty[currentConfig.warranty];
        warrantyItem.querySelector('.item-price').textContent = configPriceLabels.warranty[currentConfig.warranty];
        console.log('已更新质保服务显示:', configLabels.warranty[currentConfig.warranty]);
      }
    }
    
    // 计算总价
    function calculateTotalPrice() {
      let total = configPrices.base;
      total += configPrices.panelColor[currentConfig.panelColor] || 0;
      total += configPrices.installation[currentConfig.installation] || 0;
      total += configPrices.warranty[currentConfig.warranty] || 0;
      return total;
    }
    
    // 应用配置到主页面
    function applyConfiguration() {
      const totalPrice = calculateTotalPrice();
      const finalPrice = totalPrice - 500; // 减去优惠
      
      // 更新主页面价格
      const mainPriceElement = document.querySelector('.current-price .amount');
      if (mainPriceElement) {
        animateNumber(mainPriceElement, parseInt(mainPriceElement.textContent.replace(/,/g, '')), finalPrice);
      }
      
      // 更新悬浮栏价格
      const miniPrice = document.querySelector('.mini-price');
      if (miniPrice) {
        miniPrice.textContent = `¥${finalPrice.toLocaleString()}`;
      }
      
      showToast('配置应用成功', `最终价格：¥${finalPrice.toLocaleString()}`, 'success');
      closeConfigModal();
    }
    
    // 立即下单
    function buyWithConfiguration() {
      const totalPrice = calculateTotalPrice();
      const finalPrice = totalPrice - 500; // 减去优惠
      const configLabels = {
        gasType: { natural: '天然气', lpg: '液化气' },
        panelColor: { black: '雅致黑', white: '珍珠白', gray: '银灰色' },
        installation: { basic: '基础安装', premium: '高级安装' },
        warranty: { standard: '标准质保', extended: '延长质保' }
      };
      
      showToast('订单创建成功', `配置：${configLabels.panelColor[currentConfig.panelColor]}，最终价格：¥${finalPrice.toLocaleString()}`, 'success');
      console.log('购买配置:', currentConfig, '最终价格:', finalPrice);
      
      // 关闭配置模态框
      setTimeout(() => {
        closeConfigModal();
      }, 1200);
    }
    
    // 绑定事件监听器
    configButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        openConfigModal();
      });
    });
    
    if (closeButton) closeButton.addEventListener('click', closeConfigModal);
    if (resetButton) resetButton.addEventListener('click', resetConfig);
    if (applyButton) applyButton.addEventListener('click', applyConfiguration);
    if (buyButton) buyButton.addEventListener('click', buyWithConfiguration);
    if (backdrop) backdrop.addEventListener('click', closeConfigModal);
    
    // 步骤导航
    if (prevButton) {
      prevButton.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('上一步按钮被点击，当前步骤:', currentStep);
        if (currentStep > 1) {
          showStep(currentStep - 1);
          updateProgress();
        }
      });
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('下一步按钮被点击，当前步骤:', currentStep);
        if (currentStep < totalSteps) {
          showStep(currentStep + 1);
          updateProgress();
        } else {
          // 完成配置
          applyConfiguration();
        }
      });
    }
    
    // 步骤导航点击
    document.addEventListener('click', function(e) {
      const stepNavItem = e.target.closest('.step-nav-item');
      if (stepNavItem && modal.classList.contains('active')) {
        const step = parseInt(stepNavItem.getAttribute('data-step'));
        if (step) {
          console.log('点击步骤导航:', step);
          showStep(step);
          updateProgress();
        }
      }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeConfigModal();
      }
    });
    
    // 配置选项点击事件
    document.addEventListener('click', function(e) {
      const configCard = e.target.closest('.option-card, .config-card, .color-card, .color-option, .service-card');
      if (configCard && modal.classList.contains('active')) {
        console.log('配置选项被点击:', configCard);
        const input = configCard.querySelector('input[type="radio"]');
        if (input) {
          console.log('找到input元素:', input.name, input.value);
          const configType = input.name;
          const configValue = input.value;
          const groupName = getConfigGroupName(configType);
          
          // 更新配置状态
          if (groupName) {
            currentConfig[groupName] = configValue;
            // 同步到全局，供其他模块读取
            window.__productCurrentConfig = { ...currentConfig };
            console.log('配置已更新:', groupName, '=', configValue);
            console.log('当前完整配置:', currentConfig);
          }
          
          // 更新UI状态
          const configGroup = configCard.closest('.config-step');
          if (configGroup) {
            configGroup.querySelectorAll('.option-card, .config-card, .color-card, .color-option, .service-card').forEach(card => {
              if (card.querySelector(`input[name="${configType}"]`)) {
                card.classList.remove('active', 'selected');
              }
            });
          }
          configCard.classList.add('active', 'selected');
          input.checked = true;
          
          // 更新配置总结
          updateConfigSummary();
        }
      }
    });
    
    // 获取配置组名称
    function getConfigGroupName(inputName) {
      const nameMap = {
        'gasType': 'gasType',
        'panelColor': 'panelColor',
        'installation': 'installation',
        'warranty': 'warranty'
      };
      return nameMap[inputName];
    }
    
    // 数字动画函数
    function animateNumber(element, startValue, endValue, duration = 1000) {
      const start = performance.now();
      const change = endValue - startValue;
      
      function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + change * easedProgress);
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }
      
      requestAnimationFrame(update);
    }
    
    // 初始化默认配置
    resetConfig();
    
    // 初始化步骤显示
    showStep(1);
  }

  // 初始化问答功能
  function initQAFeatures() {
    initQAToggle();
    initQAFilter();
    initQASearch();
  }

  // 问答展开折叠功能
  function initQAToggle() {
    const qaItems = document.querySelectorAll('.qa-item');
    
    qaItems.forEach(item => {
        const question = item.querySelector('.qa-question');
        if (question) {
            question.addEventListener('click', function() {
                const isActive = item.classList.contains('active');
                
                // 关闭所有其他问答项
                qaItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // 切换当前问答项状态
                if (isActive) {
                    item.classList.remove('active');
                } else {
                    item.classList.add('active');
                }
            });
        }
    });
  }

  // 问答筛选功能
  function initQAFilter() {
    const filterBtns = document.querySelectorAll('.qa-filter .filter-btn');
    const qaItems = document.querySelectorAll('.qa-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有活跃状态
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // 添加当前按钮活跃状态
            this.classList.add('active');
            
            const filterText = this.textContent.trim();
            
            qaItems.forEach(item => {
                const category = item.querySelector('.question-category');
                if (filterText === '全部' || (category && category.textContent.trim() === filterText)) {
                    item.style.display = 'block';
                    // 添加淡入动画
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
  }

  // 问答搜索功能
  function initQASearch() {
    const searchInput = document.querySelector('.qa-search-input');
    const qaItems = document.querySelectorAll('.qa-item');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            qaItems.forEach(item => {
                const questionText = item.querySelector('.question-content h4').textContent.toLowerCase();
                const answerText = item.querySelector('.answer-content').textContent.toLowerCase();
                
                const matches = searchTerm === '' || 
                              questionText.includes(searchTerm) || 
                              answerText.includes(searchTerm);
                
                if (matches) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        }, 300));
    }
  }

  // 全局事件代理：保障按钮可点击打开模态框
  document.addEventListener('click', function(e) {
    const consultTrigger = e.target.closest('.btn-consult');
    if (consultTrigger) {
      const consultModal = document.getElementById('consultationModal');
      if (consultModal) {
        consultModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
      return;
    }
    const configTrigger = e.target.closest('.btn-add-cart');
    if (configTrigger) {
      const configModal = document.getElementById('configModal');
      if (configModal) {
        configModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }
  });

  // 全局关闭代理：点击遮罩/关闭按钮/取消按钮/ESC 关闭对应模态框
  function deactivateModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('active');
    // 若无任何模态框处于打开状态，则恢复滚动
    const anyActive = document.querySelector('.consultation-modal.active, .config-modal.active');
    if (!anyActive) document.body.style.overflow = '';
  }

  document.addEventListener('click', function(e) {
    // 咨询模态框：遮罩/关闭/取消
    if (e.target.closest('#closeModal') || e.target.closest('#cancelConsult') || (e.target.classList && e.target.classList.contains('modal-overlay') && e.target.closest('#consultationModal'))) {
      deactivateModal(document.getElementById('consultationModal'));
      return;
    }
    // 配置模态框：遮罩/关闭
    if (e.target.closest('#closeConfigModal') || (e.target.classList && (e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-overlay')) && e.target.closest('#configModal'))) {
      deactivateModal(document.getElementById('configModal'));
      return;
    }
  });

  // ESC 全局关闭
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (document.getElementById('configModal')?.classList.contains('active')) {
        deactivateModal(document.getElementById('configModal'));
      } else if (document.getElementById('consultationModal')?.classList.contains('active')) {
        deactivateModal(document.getElementById('consultationModal'));
      }
    }
  });

  // 错误处理
  window.addEventListener('error', function(e) {
    console.warn('页面脚本错误:', e.error);
  });

  // 立即下单按钮下拉菜单功能
  function initBuyNowDropdown() {
    const dropdownContainer = document.querySelector('.btn-buy-now-dropdown');
    const buyNowButton = document.getElementById('buyNowMainButton');
    const dropdownMenu = document.getElementById('buyDropdownMenu');
    const contactOrderOption = document.getElementById('contactOrderOption');
    
    if (!dropdownContainer || !buyNowButton || !dropdownMenu) return;
    
    let isDropdownOpen = false;
    
    // 点击主按钮切换下拉菜单
    buyNowButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown();
    });
    
    // 切换下拉菜单显示/隐藏
    function toggleDropdown() {
      isDropdownOpen = !isDropdownOpen;
      
      if (isDropdownOpen) {
        openDropdown();
      } else {
        closeDropdown();
      }
    }
    
    // 打开下拉菜单
    function openDropdown() {
      dropdownContainer.classList.add('active');
      isDropdownOpen = true;
      
      // 添加打开动画
      setTimeout(() => {
        if (dropdownMenu) {
          dropdownMenu.style.animation = 'dropdownSlideIn 0.3s ease';
        }
      }, 10);
      
      // 为文档添加点击监听，用于关闭下拉菜单
      setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
      }, 100);
    }
    
    // 关闭下拉菜单
    function closeDropdown() {
      dropdownContainer.classList.remove('active');
      isDropdownOpen = false;
      
      // 移除文档点击监听
      document.removeEventListener('click', handleOutsideClick);
    }
    
    // 处理点击下拉菜单外部区域
    function handleOutsideClick(e) {
      if (!dropdownContainer.contains(e.target)) {
        closeDropdown();
      }
    }
    
    // 处理联系下单选项点击
    if (contactOrderOption) {
      contactOrderOption.addEventListener('click', function(e) {
        e.preventDefault();
        closeDropdown();
        
        // 触发联系下单模态框
        const contactOrderModal = document.getElementById('contactOrderModal');
        if (contactOrderModal) {
          contactOrderModal.classList.add('active');
          document.body.style.overflow = 'hidden';
          
          // 更新配置信息到联系下单模态框
          updateContactOrderConfig();
        }
        
        // 显示提示
        showToast('联系下单', '正在为您打开下单窗口...', 'info', 1500);
      });
    }
    
    // 阻止下拉菜单内部点击事件冒泡
    dropdownMenu.addEventListener('click', function(e) {
      // 阻止所有下拉菜单内部点击的冒泡
      e.stopPropagation();
      
      // 如果点击的是京东商店选项
      if (e.target.closest('.jd-option')) {
        closeDropdown();
        showToast('跳转中', '正在为您打开京东商店...', 'info', 1500);
        return;
      }
      
      // 如果点击的是联系下单选项，已经在上面单独处理了
    });
    
    // 键盘支持
    buyNowButton.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown();
      } else if (e.key === 'Escape' && isDropdownOpen) {
        closeDropdown();
      }
    });
    
    // 悬停效果增强
    buyNowButton.addEventListener('mouseenter', function() {
      if (!isDropdownOpen) {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(255, 107, 53, 0.4)';
      }
    });
    
    buyNowButton.addEventListener('mouseleave', function() {
      if (!isDropdownOpen) {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(255, 107, 53, 0.3)';
      }
    });
    
    // 为下拉选项添加点击水波纹效果
    const dropdownOptions = dropdownMenu.querySelectorAll('.dropdown-option');
    dropdownOptions.forEach(option => {
      option.addEventListener('click', function(e) {
        // 创建水波纹效果
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 107, 53, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: rippleEffect 0.6s linear;
          pointer-events: none;
          z-index: 1000;
        `;
        
        // 确保选项有相对定位
        if (getComputedStyle(this).position === 'static') {
          this.style.position = 'relative';
        }
        
        this.appendChild(ripple);
        
        setTimeout(() => {
          if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
          }
        }, 600);
      });
    });
    
    // 添加水波纹动画CSS（如果还没有的话）
    if (!document.querySelector('#ripple-effect-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-effect-styles';
      style.textContent = `
        @keyframes rippleEffect {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // 错误处理
  window.addEventListener('error', function(e) {
    console.warn('页面脚本错误:', e.error);
  });

  // 联系下单模态框功能
  function initContactOrderModal() {
    const modal = document.getElementById('contactOrderModal');
    const closeButton = document.getElementById('closeContactOrderModal');
    const cancelButton = document.getElementById('cancelContactOrder');
    const backdrop = modal?.querySelector('.modal-backdrop');
    const form = document.getElementById('contactOrderForm');
    const quantityInput = document.getElementById('orderQuantity');
    const quantityDecrease = document.getElementById('orderQuantityDecrease');
    const quantityIncrease = document.getElementById('orderQuantityIncrease');
    
    if (!modal || !form) return;
    
    // 打开模态框
    function openContactOrderModal() {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      updateContactOrderConfig();
      
      // 聚焦到第一个输入框
      setTimeout(() => {
        const firstInput = form.querySelector('input:not([readonly])');
        if (firstInput) firstInput.focus();
      }, 300);
    }
    
    // 关闭模态框
    function closeContactOrderModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      form.reset();
      
      // 重置数量为1
      if (quantityInput) quantityInput.value = '1';
      updateOrderPrice();
    }
    
    // 绑定关闭事件
    if (closeButton) closeButton.addEventListener('click', closeContactOrderModal);
    if (cancelButton) cancelButton.addEventListener('click', closeContactOrderModal);
    if (backdrop) backdrop.addEventListener('click', closeContactOrderModal);
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeContactOrderModal();
      }
    });
    
    // 数量控制
    if (quantityDecrease) {
      quantityDecrease.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value) || 1;
        if (currentValue > 1) {
          quantityInput.value = currentValue - 1;
          updateOrderPrice();
        }
      });
    }
    
    if (quantityIncrease) {
      quantityIncrease.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value) || 1;
        if (currentValue < 99) {
          quantityInput.value = currentValue + 1;
          updateOrderPrice();
        }
      });
    }
    
    if (quantityInput) {
      quantityInput.addEventListener('input', function() {
        let value = parseInt(this.value) || 1;
        value = Math.max(1, Math.min(99, value));
        this.value = value;
        updateOrderPrice();
      });
    }
    
    // 表单提交处理
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const orderData = {};
      formData.forEach((value, key) => {
        orderData[key] = value;
      });
      
      // 添加配置信息
      orderData.quantity = quantityInput.value;
      orderData.productName = '星火Pro 智能燃气灶';
      orderData.productModel = 'RD-GS-XH2023';
      orderData.totalPrice = calculateOrderTotal();
      
      // 获取当前配置
      const currentConfig = getCurrentConfig();
      orderData.configuration = currentConfig;
      
      // 验证必填项
      const requiredFields = ['customerName', 'contact'];
      const missingFields = requiredFields.filter(field => !orderData[field] || orderData[field].trim() === '');
      
      if (missingFields.length > 0) {
        const fieldNames = {
          'customerName': '姓名',
          'contact': '联系方式'
        };
        const missingFieldNames = missingFields.map(field => fieldNames[field] || field).join('、');
        showToast('表单验证失败', `请填写：${missingFieldNames}`, 'error', 2000);
        return;
      }
      
      // 验证联系方式格式
      if (orderData.contact && orderData.contact.trim() !== '') {
        const contactValidation = validateContactFormat(orderData.contact);
        if (!contactValidation.valid) {
          showToast('格式验证失败', '请输入正确的联系方式', 'error', 2000);
          return;
        }
      }
      
      // 显示提交状态
      const submitBtn = form.querySelector('.btn-submit-order');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>提交中...</span>';
      submitBtn.disabled = true;
      
      // 模拟提交
      setTimeout(() => {
        showToast('订单提交成功', '我们会尽快联系您确认订单详情', 'success', 3000);
        
        // 延迟关闭模态框
        setTimeout(() => {
          closeContactOrderModal();
        }, 1500);
        
        // 恢复按钮状态
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // 这里可以添加实际的API调用
        console.log('联系下单数据:', orderData);
      }, 2000);
    });
    
    // 联系方式格式验证函数
    function validateContactFormat(contact) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const wechatRegex = /^([a-zA-Z][\w-]{5,19}|[0-9]{5,11}|[a-zA-Z0-9_-]{4,20})$/;
      
      if (phoneRegex.test(contact)) {
        return { valid: true, type: 'phone' };
      } else if (emailRegex.test(contact)) {
        return { valid: true, type: 'email' };
      } else if (wechatRegex.test(contact)) {
        return { valid: true, type: 'wechat' };
      } else {
        return { valid: false, type: 'unknown' };
      }
    }
    
    // 实时验证
    const contactInput = document.getElementById('orderContact');
    if (contactInput) {
      contactInput.addEventListener('input', function() {
        const contact = this.value.trim();
        if (contact === '') {
          this.style.borderColor = '#e9ecef';
          return;
        }
        
        const validation = validateContactFormat(contact);
        this.style.borderColor = validation.valid ? '#4CAF50' : '#e74c3c';
      });
    }
    
    // 暴露打开函数
    window.openContactOrderModal = openContactOrderModal;
  }
  
  // 更新联系下单配置信息
  function updateContactOrderConfig() {
    const currentConfig = getCurrentConfig();
    
    // 更新气源类型
    const gasTypeElement = document.getElementById('orderGasType');
    if (gasTypeElement) {
      gasTypeElement.textContent = currentConfig.gasType === 'natural' ? '天然气' : '液化气';
    }
    
    // 更新面板颜色
    const panelColorElement = document.getElementById('orderPanelColor');
    const colorIndicator = document.getElementById('orderColorIndicator');
    if (panelColorElement && colorIndicator) {
      const colorLabels = {
        black: '雅致黑',
        white: '珍珠白',
        gray: '银灰色',
        gold: '香槟金'
      };
      
      const colorMap = {
        black: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
        white: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
        gray: 'linear-gradient(135deg, #718096 0%, #4a5568 100%)',
        gold: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
      };
      
      panelColorElement.textContent = colorLabels[currentConfig.panelColor];
      colorIndicator.style.background = colorMap[currentConfig.panelColor];
    }
    
    // 更新安装服务
    const installationElement = document.getElementById('orderInstallation');
    if (installationElement) {
      installationElement.textContent = currentConfig.installation === 'basic' ? '基础安装（免费）' : '高级安装（+¥200）';
    }
    
    // 更新质保服务
    const warrantyElement = document.getElementById('orderWarranty');
    if (warrantyElement) {
      warrantyElement.textContent = currentConfig.warranty === 'standard' ? '标准质保（3年）' : '延长质保（5年，+¥300）';
    }
    
    // 更新价格
    updateOrderPrice();
  }
  
  // 获取当前配置
  function getCurrentConfig() {
    // 1) 优先返回全局共享配置（来自配置菜单选择）
    if (window.__productCurrentConfig) {
      return { ...window.__productCurrentConfig };
    }
    // 2) 其次返回配置模态内的当前状态
    const configModal = document.getElementById('configModal');
    if (configModal && typeof currentConfig !== 'undefined') {
      return { ...currentConfig };
    }
    
    // 3) 回退到默认配置
    return {
      gasType: 'natural',
      panelColor: 'black',
      installation: 'basic',
      warranty: 'standard'
    };
  }
  
  // 计算订单总价
  function calculateOrderTotal() {
    const currentConfig = getCurrentConfig();
    const quantity = parseInt(document.getElementById('orderQuantity')?.value) || 1;
    
    let basePrice = 2499;
    let configPrice = 0;
    
    // 面板颜色加价
    const panelPrices = { black: 0, white: 150, gray: 100, gold: 300 };
    configPrice += panelPrices[currentConfig.panelColor] || 0;
    
    // 安装服务加价
    const installationPrices = { basic: 0, premium: 200 };
    configPrice += installationPrices[currentConfig.installation] || 0;
    
    // 质保服务加价
    const warrantyPrices = { standard: 0, extended: 300 };
    configPrice += warrantyPrices[currentConfig.warranty] || 0;
    
    return (basePrice + configPrice) * quantity;
  }
  
  // 更新订单价格显示
  function updateOrderPrice() {
    const totalPrice = calculateOrderTotal();
    const priceElement = document.getElementById('orderTotalPrice');
    if (priceElement) {
      priceElement.textContent = totalPrice.toLocaleString();
    }
  }

  // 错误处理
  window.addEventListener('error', function(e) {
    console.warn('页面脚本错误:', e.error);
  });

})(); 