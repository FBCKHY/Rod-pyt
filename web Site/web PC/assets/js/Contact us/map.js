/**
 * 联系我们 - 地图加载脚本
 * 
 * 描述：加载并初始化地图组件，显示公司办公地点位置
 * 用途：在联系我们页面展示公司位置信息
 * 
 * 创建日期：2025-07-15
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化地图
    initContactMap();
});

/**
 * 初始化联系我们页面地图
 */
function initContactMap() {
    const mapContainer = document.getElementById('contact-map');
    
    if (!mapContainer) {
        console.warn('⚠️ 地图容器未找到');
        return;
    }
    
    console.log('✅ 初始化地图组件');
    
    // 移除地图占位符
    const mapPlaceholder = document.querySelector('.map-placeholder');
    if (mapPlaceholder) {
        // 渐变淡出效果
        mapPlaceholder.style.opacity = '0';
        setTimeout(() => {
            mapPlaceholder.style.display = 'none';
        }, 500);
    }
    
    try {
        // 检查Leaflet地图API是否加载
        if (typeof L !== 'undefined') {
            // 地图初始化参数
            const shanghai = [31.2304, 121.4737]; // 上海坐标
            const zoom = 13;
            
            // 创建地图实例
            const map = L.map(mapContainer, {
                center: shanghai,
                zoom: zoom,
                scrollWheelZoom: false // 禁用滚轮缩放，提高用户体验
            });
            
            // 加载地图瓦片
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);
            
            // 添加容电科技总部标记
            const headquartersIcon = L.icon({
                iconUrl: '../assets/images/components/map-marker.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });
            
            // 添加标记点
            addCompanyMarkers(map, headquartersIcon);
            
            // 调整地图容器样式
            mapContainer.style.height = '450px';
            mapContainer.style.borderRadius = '10px';
            mapContainer.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
            
            // 延迟刷新地图大小，确保正确渲染
            setTimeout(() => {
                map.invalidateSize();
            }, 500);
        } else {
            // Leaflet未加载，显示静态地图
            showStaticMap(mapContainer);
        }
    } catch (error) {
        console.error('地图加载失败:', error);
        showStaticMap(mapContainer);
    }
}

/**
 * 添加公司位置标记
 * @param {Object} map - Leaflet地图实例
 * @param {Object} icon - 自定义图标对象
 */
function addCompanyMarkers(map, icon) {
    // 公司地点数据
    const locations = [
        {
            name: '容电科技总部',
            position: [31.2304, 121.4737],
            address: '上海市浦东新区张江高科技园区博云路2号',
            phone: '400-800-8888',
            isHeadquarters: true
        },
        {
            name: '容电科技北京分公司',
            position: [39.9042, 116.4074],
            address: '北京市朝阳区建国路88号',
            phone: '010-6789-5678',
            isHeadquarters: false
        },
        {
            name: '容电科技深圳分公司',
            position: [22.5431, 114.0579],
            address: '深圳市南山区科技园南区',
            phone: '0755-8765-4321',
            isHeadquarters: false
        }
    ];
    
    // 添加所有位置标记
    locations.forEach(location => {
        const marker = L.marker(location.position, {
            icon: icon,
            title: location.name
        }).addTo(map);
        
        // 创建弹出信息
        const popupContent = `
            <div class="map-popup">
                <h3>${location.name}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${location.address}</p>
                <p><i class="fas fa-phone"></i> ${location.phone}</p>
                ${location.isHeadquarters ? '<span class="headquarters-badge">总部</span>' : ''}
            </div>
        `;
        
        // 添加弹出信息
        marker.bindPopup(popupContent);
        
        // 如果是总部，默认打开弹出窗口
        if (location.isHeadquarters) {
            marker.openPopup();
        }
    });
}

/**
 * 显示静态地图（地图API加载失败时的备用方案）
 * @param {HTMLElement} container - 地图容器元素
 */
function showStaticMap(container) {
    console.log('⚠️ 地图API加载失败，显示静态地图');
    
    // 创建静态地图HTML
    const staticMapHTML = `
        <div class="static-map">
            <img src="../assets/images/Contact us/map/office-map.jpg" alt="容电科技办公位置地图" class="img-fluid">
            <div class="static-map-overlay">
                <div class="map-location-marker">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>容电科技总部</span>
                </div>
                <p class="map-address">
                    <strong>地址:</strong> 上海市浦东新区张江高科技园区博云路2号
                </p>
                <p class="map-phone">
                    <strong>电话:</strong> 400-800-8888
                </p>
            </div>
        </div>
    `;
    
    container.innerHTML = staticMapHTML;
} 