<!-- 产品列表管理 -->
<template>
  <div class="product-list-page art-full-height">
    <!-- 页面头部：新增按钮 + 页面标题 -->
    <ElCard class="header-card" :class="{ 'header-card-dark': isDark }" shadow="never">
      <div class="header-content">
        <div class="header-left">
          <h3>产品管理</h3>
          <p>管理企业产品信息，包括产品卡片、详情页面和分类标签</p>
        </div>
        <div class="header-right">
          <ElButton 
            type="primary" 
            :icon="Plus" 
            size="large"
            @click="openAddProductWizard"
          >
            新增产品
          </ElButton>
        </div>
      </div>
    </ElCard>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧：分类管理 -->
      <ElCard class="category-sidebar" shadow="never">
        <template #header>
          <div class="category-header">
            <h4>分类管理</h4>
            <ElButton 
              type="primary" 
              :icon="Plus" 
              size="small" 
              text
              @click="openCategoryDialog"
            >
              新增分类
            </ElButton>
          </div>
        </template>
        
        <div class="category-list">
          <div 
            class="category-item"
            :class="{ active: selectedCategoryId === null }"
            @click="selectCategory(null)"
            draggable="true"
            @dragstart.prevent
          >
            <ElIcon class="category-toggle placeholder"></ElIcon>
            <ElIcon class="category-icon"><List /></ElIcon>
            <span class="category-name">全部产品</span>
          </div>

          <!-- 父分类和对应的子分类 -->
          <template v-for="parent in categories" :key="parent.id">
            <!-- 父分类 -->
            <div 
              class="category-item parent"
              :class="{ active: selectedCategoryId === parent.id, 'drag-over': dragOverId === parent.id }"
              :style="{ paddingLeft: '16px' }"
              draggable="true"
              @dragstart="handleParentDragStart(parent)"
              @dragover.prevent="handleDragOver(parent)"
              @drop="handleParentDrop(parent)"
              @dragend="handleDragEnd"
              @click="selectCategory(parent.id)"
            >
              <ElIcon 
                class="category-toggle"
                v-if="(parent.children && parent.children.length)"
                @click.stop="toggleExpand(parent.id)"
              >
                <component :is="isExpanded(parent.id) ? ArrowDown : ArrowRight" />
              </ElIcon>
              <ElIcon v-else class="category-toggle placeholder"></ElIcon>

              <ElIcon v-if="parent.icon" class="category-icon">
                <component :is="parent.icon" />
              </ElIcon>
                          <span class="category-name">{{ parent.name }}</span>
            <div class="category-actions">
                <ElButton size="small" class="add-btn" circle @click.stop="startAddChild(parent)">
                  <ElIcon><Plus /></ElIcon>
                </ElButton>
                <ElButton size="small" class="edit-btn" circle @click.stop="editCategory(parent)">
                  <ElIcon><Edit /></ElIcon>
                </ElButton>
                <ElButton size="small" class="delete-btn" circle @click.stop="deleteCategory(parent)">
                  <ElIcon><Delete /></ElIcon>
                </ElButton>
              </div>
            </div>

            <!-- 当前父分类的子分类列表 -->
            <div v-if="isExpanded(parent.id)" class="children-list">
              <div 
                v-for="child in (parent.children || [])"
                :key="child.id"
                class="category-item child"
                :class="{ active: selectedCategoryId === child.id, 'drag-over': dragOverId === child.id }"
                :style="{ paddingLeft: '32px' }"
                draggable="true"
                @dragstart="handleChildDragStart(child, parent.id)"
                @dragover.prevent="handleDragOver(child)"
                @drop="handleChildDrop(child, parent.id)"
                @dragend="handleDragEnd"
                @click="selectCategory(child.id)"
              >
                <ElIcon class="category-toggle placeholder"></ElIcon>
                <ElIcon v-if="child.icon" class="category-icon">
                  <component :is="child.icon" />
                </ElIcon>
                <span class="category-name">{{ child.name }}</span>
                <ElTag size="small" class="product-count">{{ child.productCount || 0 }}</ElTag>
                <div class="category-actions">
                  <ElButton size="small" class="edit-btn" circle @click.stop="editCategory(child)">
                    <ElIcon><Edit /></ElIcon>
                  </ElButton>
                  <ElButton size="small" class="delete-btn" circle @click.stop="deleteCategory(child)">
                    <ElIcon><Delete /></ElIcon>
                  </ElButton>
                </div>
              </div>

              <!-- 当前父分类的行内添加子分类输入 -->
              <div v-if="addingChildForId === parent.id" class="category-item add-child">
                <ElIcon class="category-toggle placeholder"></ElIcon>
                <ElInput
                  v-model="newChildName"
                  size="small"
                  placeholder="子分类名称"
                  style="flex: 1; max-width: 160px; margin-right: 8px;"
                  @keyup.enter="confirmAddChild(parent.id)"
                  ref="childNameInput"
                />
                <ElButton size="small" class="confirm-btn" @click="confirmAddChild(parent.id)">
                  确认
                </ElButton>
                <ElButton size="small" class="cancel-btn" @click="cancelAddChild">
                  取消
                </ElButton>
              </div>
            </div>
          </template>
        </div>
      </ElCard>

      <!-- 右侧：产品列表 -->
      <div class="product-content">
        <!-- 搜索和筛选栏 -->
        <ElCard class="search-card" shadow="never">
          <div class="search-wrapper">
            <div class="search-left">
              <h4 class="search-title">产品筛选</h4>
              <p class="search-subtitle">快速找到您需要的产品</p>
            </div>
            <div class="search-form">
              <ElForm :model="searchForm" inline>
                <div class="search-main-row">
                  <div class="form-row">
                    <ElFormItem label="产品名称" class="search-item">
                      <ElInput
                        v-model="searchForm.name"
                        placeholder="请输入产品名称"
                        clearable
                        style="width: 220px"
                        @input="handleSearch"
                      >
                        <template #prefix>
                          <ElIcon><Search /></ElIcon>
                        </template>
                      </ElInput>
                    </ElFormItem>
                    
                    <ElFormItem label="产品状态" class="search-item">
                      <ElSelect
                        v-model="searchForm.status"
                        placeholder="请选择状态"
                        clearable
                        style="width: 160px"
                        @change="handleSearch"
                      >
                        <ElOption label="已发布" value="active">
                          <ElIcon style="margin-right: 8px; color: var(--el-color-success)"><CircleCheck /></ElIcon>
                          已发布
                        </ElOption>
                        <ElOption label="草稿" value="draft">
                          <ElIcon style="margin-right: 8px; color: var(--el-color-warning)"><Edit /></ElIcon>
                          草稿
                        </ElOption>
                        <ElOption label="已下架" value="inactive">
                          <ElIcon style="margin-right: 8px; color: var(--el-color-danger)"><CircleClose /></ElIcon>
                          已下架
                        </ElOption>
                      </ElSelect>
                    </ElFormItem>
                    
                    <ElFormItem label="推广位置" class="search-item">
                      <ElSelect
                        v-model="searchForm.promoPosition"
                        placeholder="请选择推广位置"
                        clearable
                        style="width: 170px"
                        @change="handleSearch"
                      >
                        <ElOption label="首页Banner" value="homepage_banner">
                          <ElIcon style="margin-right: 8px; color: var(--el-color-danger)"><Star /></ElIcon>
                          首页Banner
                        </ElOption>
                        <ElOption label="分类置顶" value="category_top">
                          <ElIcon style="margin-right: 8px; color: var(--el-color-warning)"><Top /></ElIcon>
                          分类置顶
                        </ElOption>
                        <ElOption label="首页推荐" value="homepage_recommend">
                          <ElIcon style="margin-right: 8px; color: var(--el-color-success)"><Medal /></ElIcon>
                          首页推荐
                        </ElOption>
                        <ElOption label="不推广" value="none">
                          <ElIcon style="margin-right: 8px; color: var(--el-color-info)"><Minus /></ElIcon>
                          不推广
                        </ElOption>
                      </ElSelect>
                    </ElFormItem>
                  </div>
                  
                  <div class="form-actions">
                    <ElButton type="primary" @click="handleSearch" class="search-btn">
                      <ElIcon><Search /></ElIcon>
                      搜索产品
                    </ElButton>
                    <ElButton @click="resetSearch" class="reset-btn">
                      <ElIcon><RefreshLeft /></ElIcon>
                      重置筛选
                    </ElButton>
                  </div>
                </div>
              </ElForm>
            </div>
          </div>
        </ElCard>

        <!-- 产品列表 - 重新设计的现代化界面 -->
        <ElCard class="product-grid-card" shadow="never">
          <!-- 头部操作栏 -->
          <div class="grid-header">
            <div class="header-left">
              <div class="category-info">
                <div class="category-icon-wrapper">
                  <ElIcon class="category-icon"><Filter /></ElIcon>
                </div>
                <div class="category-text">
                  <span class="category-label">当前分类</span>
                  <span class="category-name">{{ getCurrentCategoryName() }}</span>
                </div>
              </div>
              <div class="stats-info">
                <div class="stat-item">
                  <ElIcon class="stat-icon"><DataLine /></ElIcon>
                  <span class="stat-text">总计 {{ pagination.total }} 个产品</span>
                </div>
                <div v-if="selectedRows.length > 0" class="selected-info">
                  <ElIcon><Check /></ElIcon>
                  <span>已选择 {{ selectedRows.length }} 项</span>
                </div>
              </div>
            </div>
            <div class="header-right">
              <div class="view-controls">
                <ElButtonGroup class="view-toggle">
                  <ElButton 
                    :type="viewMode === 'grid' ? 'primary' : ''"
                    @click="viewMode = 'grid'"
                    size="small"
                  >
                    <ElIcon><Grid /></ElIcon>
                    网格
                  </ElButton>
                  <ElButton 
                    :type="viewMode === 'table' ? 'primary' : ''"
                    @click="viewMode = 'table'"
                    size="small"
                  >
                    <ElIcon><List /></ElIcon>
                    表格
                  </ElButton>
                </ElButtonGroup>
              </div>
              <div class="header-actions">
                <!-- 简化的排序下拉菜单 -->
                <ElDropdown v-model:visible="sortDropdownVisible" :hide-on-click="false" placement="bottom-end">
                  <ElButton class="action-btn sort-btn modern-sort-trigger" size="small">
                    <ElIcon class="sort-icon"><Filter /></ElIcon>
                    排序
                    <ElIcon class="arrow-icon"><ArrowDown /></ElIcon>
                  </ElButton>
                  <template #dropdown>
                    <div class="compact-sort-dropdown">
                      <!-- 排序菜单头部 -->
                      <div class="sort-header">
                        <ElIcon><Filter /></ElIcon>
                        <span>排序方式</span>
                      </div>
                      
                      <!-- 排序选项 -->
                      <div class="sort-options">
                        <!-- 默认排序 -->
                        <div class="sort-option" @click.stop="toggleSort('sortOrder')">
                          <div class="option-icon">
                            <ElIcon><Star /></ElIcon>
                          </div>
                          <div class="option-content">
                            <span class="option-label">默认排序</span>
                            <span class="option-desc">{{ getSortDesc('sortOrder') }}</span>
                          </div>
                          <div class="option-status">
                            <ElIcon v-if="sortBy === 'sortOrder'">
                              <component :is="sortDir === 'asc' ? ArrowUp : ArrowDown" />
                            </ElIcon>
                          </div>
                        </div>
                        
                        <!-- 时间排序 -->
                        <div class="sort-option" @click.stop="toggleSort('createdAt')">
                          <div class="option-icon">
                            <ElIcon><Calendar /></ElIcon>
                          </div>
                          <div class="option-content">
                            <span class="option-label">按时间</span>
                            <span class="option-desc">{{ getSortDesc('createdAt') }}</span>
                          </div>
                          <div class="option-status">
                            <ElIcon v-if="sortBy === 'createdAt'">
                              <component :is="sortDir === 'asc' ? ArrowUp : ArrowDown" />
                            </ElIcon>
                          </div>
                        </div>
                        
                        <!-- 价格排序 -->
                        <div class="sort-option" @click.stop="toggleSort('price')">
                          <div class="option-icon">
                            <ElIcon><Money /></ElIcon>
                          </div>
                          <div class="option-content">
                            <span class="option-label">按价格</span>
                            <span class="option-desc">{{ getSortDesc('price') }}</span>
                          </div>
                          <div class="option-status">
                            <ElIcon v-if="sortBy === 'price'">
                              <component :is="sortDir === 'asc' ? ArrowUp : ArrowDown" />
                            </ElIcon>
                          </div>
                        </div>
                        
                        <!-- 销量排序 -->
                        <div class="sort-option" @click.stop="toggleSort('sales')">
                          <div class="option-icon">
                            <ElIcon><TrendCharts /></ElIcon>
                          </div>
                          <div class="option-content">
                            <span class="option-label">按销量</span>
                            <span class="option-desc">{{ getSortDesc('sales') }}</span>
                          </div>
                          <div class="option-status">
                            <ElIcon v-if="sortBy === 'sales'">
                              <component :is="sortDir === 'asc' ? ArrowUp : ArrowDown" />
                            </ElIcon>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </ElDropdown>
                <ElDropdown @command="handleBatchAction" v-if="selectedRows.length > 0">
                  <ElButton type="warning" size="small">
                    批量操作 <ElIcon class="el-icon--right"><ArrowDown /></ElIcon>
                  </ElButton>
                  <template #dropdown>
                    <ElDropdownMenu>
                      <ElDropdownItem command="batch-publish">批量发布</ElDropdownItem>
                      <ElDropdownItem command="batch-unpublish">批量下架</ElDropdownItem>
                      <ElDropdownItem command="batch-delete" divided>批量删除</ElDropdownItem>
                    </ElDropdownMenu>
                  </template>
                </ElDropdown>
                <ElButton 
                  class="action-btn export-btn" 
                  @click="exportData" 
                  :loading="isExporting"
                  size="small"
                >
                  <ElIcon><Download /></ElIcon>
                  导出
                </ElButton>
                <ElButton 
                  class="action-btn refresh-btn" 
                  @click="refreshData" 
                  :loading="isLoading"
                  size="small"
                >
                  <ElIcon><Refresh /></ElIcon>
                  刷新
                </ElButton>
              </div>
            </div>
          </div>

          <!-- 产品网格视图 -->
          <div v-show="viewMode === 'grid'" class="product-grid-container">
            <div v-if="isLoading" class="loading-container">
              <ElSkeleton :rows="3" animated />
            </div>
            <div v-else class="product-grid">
              <div 
                v-for="product in productList" 
                :key="product.id"
                class="product-card"
                :class="{ 'selected': isProductSelected(product) }"
                @click="toggleProductSelection(product)"
              >
                <!-- 选择框 -->
                <div class="card-checkbox">
                  <ElCheckbox 
                    :model-value="isProductSelected(product)"
                    @change="toggleProductSelection(product)"
                    @click.stop
                    class="purple-checkbox"
                  />
                </div>

                <!-- 产品图片 -->
                <div class="card-image-section">
                  <div class="image-container">
                    <img 
                      v-if="product.cardImage" 
                      :src="toAbsoluteUrl(product.cardImage)" 
                      :alt="product.name"
                      class="product-image"
                    />
                    <div v-else class="no-image-placeholder">
                      <ElIcon><Picture /></ElIcon>
                      <span>暂无图片</span>
                    </div>
                  </div>
                  <!-- 状态徽章 -->
                  <div class="status-badge" :class="getStatusClass(product.status)">
                    {{ getStatusText(product.status) }}
                  </div>
                  <!-- 推广标识 -->
                  <div v-if="product.promoPosition !== 'none'" class="promo-badge">
                    <ElIcon><Star /></ElIcon>
                    {{ getPromoText(product.promoPosition) }}
                  </div>
                </div>

                <!-- 产品信息 -->
                <div class="card-content">
                  <div class="product-header">
                    <h4 class="product-title">{{ product.name }}</h4>
                    <div class="product-price">
                      <span v-if="product.price" class="price-value">¥{{ product.price }}</span>
                      <span v-else class="price-placeholder">价格面议</span>
                    </div>
                  </div>

                  <div class="product-meta">
                    <div class="meta-item">
                      <ElIcon class="meta-icon"><FolderOpened /></ElIcon>
                      <span class="meta-text">
                        {{ product.category?.name || '未分类' }}
                      </span>
                    </div>
                    <div class="meta-item">
                      <ElIcon class="meta-icon"><Calendar /></ElIcon>
                      <span class="meta-text">{{ formatDate(product.createdAt) }}</span>
                    </div>
                  </div>

                  <!-- 标签 -->
                  <div v-if="product.tags && product.tags.length" class="product-tags">
                    <ElTag 
                      v-for="tag in product.tags.slice(0, 2)" 
                      :key="tag.id"
                      :color="tag.color"
                      size="small"
                      class="tag-item"
                    >
                      {{ tag.name }}
                    </ElTag>
                    <span v-if="product.tags.length > 2" class="more-tags">
                      +{{ product.tags.length - 2 }}
                    </span>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="card-actions">
                  <ElButton 
                    type="primary" 
                    size="small" 
                    @click.stop="editProduct(product)"
                    class="action-btn edit-btn"
                  >
                    <ElIcon><Edit /></ElIcon>
                    编辑
                  </ElButton>
                  <ElButton 
                    :type="product.status === 'active' ? 'warning' : 'success'"
                    size="small" 
                    @click.stop="toggleStatus(product)"
                    class="action-btn status-btn"
                  >
                    <ElIcon>
                      <component :is="product.status === 'active' ? ArrowDown : ArrowUp" />
                    </ElIcon>
                    {{ product.status === 'active' ? '下架' : '上架' }}
                  </ElButton>
                  <ElDropdown @command="(cmd) => handleProductAction(cmd, product)" trigger="click">
                    <ElButton size="small" class="action-btn more-btn" @click.stop>
                      <ElIcon><MoreFilled /></ElIcon>
                    </ElButton>
                    <template #dropdown>
                      <ElDropdownMenu>
                        <ElDropdownItem command="copy">复制产品</ElDropdownItem>
                        <ElDropdownItem command="view">预览详情</ElDropdownItem>
                        <ElDropdownItem command="move">移动分类</ElDropdownItem>
                        <ElDropdownItem command="delete" divided>删除产品</ElDropdownItem>
                      </ElDropdownMenu>
                    </template>
                  </ElDropdown>
                </div>
              </div>
            </div>
          </div>

          <!-- 传统表格视图 -->
          <div v-show="viewMode === 'table'" class="table-view-container">
            <div class="table-wrapper">
              <ElTable
                :data="productList"
                :loading="isLoading"
                stripe
                style="width: 100%"
                @selection-change="handleSelectionChange"
                class="product-table enhanced-table"
              >
                <ElTableColumn type="selection" width="55" />
                
                <!-- 产品卡片预览列 -->
                <ElTableColumn label="预览" width="100" align="center">
                  <template #default="{ row }">
                    <div class="table-product-preview">
                      <img 
                        v-if="row.cardImage" 
                        :src="toAbsoluteUrl(row.cardImage)" 
                        :alt="row.name"
                        class="preview-image"
                      />
                      <div v-else class="preview-placeholder">
                        <ElIcon><Picture /></ElIcon>
                      </div>
                    </div>
                  </template>
                </ElTableColumn>
                
                <ElTableColumn prop="name" label="产品名称" min-width="180">
                  <template #default="{ row }">
                    <div class="product-name-cell">
                      <span class="name-text">{{ row.name }}</span>
                      <div class="name-meta">
                        ID: {{ row.id }} | {{ formatDate(row.createdAt) }}
                      </div>
                    </div>
                  </template>
                </ElTableColumn>
                
                <ElTableColumn prop="category" label="分类" width="120" align="center">
                  <template #default="{ row }">
                    <div class="table-cell-centered">
                      <ElTag v-if="row.category" :type="getCategoryTagType(row.category.name)" size="small" class="enhanced-category-tag">
                        {{ row.category.name }}
                      </ElTag>
                      <span v-else class="text-gray">未分类</span>
                    </div>
                  </template>
                </ElTableColumn>
                
                <ElTableColumn prop="tags" label="标签" width="150" align="center">
                  <template #default="{ row }">
                    <div class="table-tag-list-centered">
                      <ElTag 
                        v-for="tag in row.tags?.slice(0, 2)" 
                        :key="tag.id"
                        size="small"
                        class="enhanced-tag"
                        :style="{ 
                          backgroundColor: tag.color, 
                          color: '#ffffff',
                          fontWeight: '600',
                          marginRight: '4px',
                          marginBottom: '2px',
                          border: 'none',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                        }"
                      >
                        {{ tag.name }}
                      </ElTag>
                      <span v-if="row.tags && row.tags.length > 2" class="more-indicator-enhanced">
                        +{{ row.tags.length - 2 }}
                      </span>
                    </div>
                  </template>
                </ElTableColumn>
                
                <ElTableColumn prop="promoPosition" label="推广" width="100" align="center">
                  <template #default="{ row }">
                    <div class="table-cell-centered">
                      <ElTag :type="getPromoTagType(row.promoPosition)" size="small" class="enhanced-promo-tag">
                        {{ getPromoText(row.promoPosition) }}
                      </ElTag>
                    </div>
                  </template>
                </ElTableColumn>
                
                <ElTableColumn prop="price" label="价格" width="100" sortable align="center">
                  <template #default="{ row }">
                    <div class="table-cell-centered">
                      <span v-if="row.price" class="price-display-enhanced">¥{{ row.price }}</span>
                      <span v-else class="text-gray">-</span>
                    </div>
                  </template>
                </ElTableColumn>
                
                <ElTableColumn prop="status" label="状态" width="90" align="center">
                  <template #default="{ row }">
                    <div class="table-cell-centered">
                      <ElTag :type="getStatusTagType(row.status)" size="small" class="enhanced-status-tag">
                        {{ getStatusText(row.status) }}
                      </ElTag>
                    </div>
                  </template>
                </ElTableColumn>
                
                <ElTableColumn label="操作" width="180" fixed="right" align="center">
                  <template #default="{ row }">
                    <div class="table-actions-centered">
                      <ElButton link type="primary" size="small" @click="editProduct(row)" class="action-button">
                        编辑
                      </ElButton>
                      <ElButton link :type="row.status === 'active' ? 'warning' : 'success'" size="small" @click="toggleStatus(row)" class="action-button">
                        {{ row.status === 'active' ? '下架' : '上架' }}
                      </ElButton>
                      <ElDropdown @command="(cmd) => handleProductAction(cmd, row)" trigger="click">
                        <ElButton link type="info" size="small" class="action-button">
                          更多 <ElIcon class="el-icon--right"><ArrowDown /></ElIcon>
                        </ElButton>
                        <template #dropdown>
                          <ElDropdownMenu>
                            <ElDropdownItem command="copy">复制</ElDropdownItem>
                            <ElDropdownItem command="view">预览</ElDropdownItem>
                            <ElDropdownItem command="move">移动</ElDropdownItem>
                            <ElDropdownItem command="delete" divided>删除</ElDropdownItem>
                          </ElDropdownMenu>
                        </template>
                      </ElDropdown>
                    </div>
                  </template>
                </ElTableColumn>
              </ElTable>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <div class="pagination-info">
              <span class="pagination-text">
                显示第 {{ (pagination.current - 1) * pagination.size + 1 }} - 
                {{ Math.min(pagination.current * pagination.size, pagination.total) }} 条，
                共 {{ pagination.total }} 条数据
              </span>
            </div>
            <ElPagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.size"
              :page-sizes="[12, 24, 48, 96]"
              :total="pagination.total"
              layout="sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              class="pagination-control"
            />
          </div>
        </ElCard>
      </div>
    </div>

    <!-- 三步骤新增产品向导 -->
    <ProductWizard 
      v-model="showWizard"
      :product="currentProduct"
      @success="handleProductCreated"
    />

    <!-- 分类管理对话框 -->
    <CategoryDialog 
      v-model="showCategoryDialog"
      :category="currentCategory"
      @success="handleCategoryCreated"
    />

    <!-- 移动分类对话框 -->
    <ElDialog
      v-model="moveDialogVisible"
      title="移动分类"
      width="480px"
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <div class="move-category-form">
        <div class="field">
          <span class="label">目标分类</span>
          <ElCascader
            v-model="moveTargetPath"
            :options="categoryOptions"
            :props="{ checkStrictly: true, emitPath: true, expandTrigger: 'hover' }"
            clearable
            placeholder="请选择父分类/子分类"
            style="width: 100%;"
          />
        </div>
        <div class="hint">提示：可选任意层级（父级或子级），最终会移动到所选层级。</div>
      </div>
      <template #footer>
        <ElButton @click="handleCloseMoveDialog">取消</ElButton>
        <ElButton type="primary" :disabled="!moveTargetPath.length" @click="confirmMoveCategory">确认</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/http'
import { storeToRefs } from 'pinia'
import { useSettingStore } from '@/store/modules/setting'
import {
  Plus,
  Search,
  RefreshLeft,
  Download,
  Refresh,
  Edit,
  Delete,
  List,
  Picture,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  CircleCheck,
  CircleClose,
  Star,
  Top,
  Medal,
  Minus,
  Filter,
  DataLine,
  Grid,
  Check,
  FolderOpened,
  Calendar,
  MoreFilled,
  Money,
  TrendCharts,
  Sort
} from '@element-plus/icons-vue'

// 组件引入
import ProductWizard from './components/ProductWizard.vue'
import CategoryDialog from './components/CategoryDialog.vue'

defineOptions({ name: 'ProductList' })

// 类型定义
interface ProductItem {
  id: number
  name: string
  cardImage?: string
  category?: { id: number; name: string }
  tags?: { id: number; name: string; color: string }[]
  promoPosition: string
  price?: number
  status: string
  createdAt: string
}

interface CategoryItem {
  id: number
  name: string
  icon?: string
  productCount?: number
  children?: CategoryItem[]
  parentId?: number
  description?: string
  sortOrder?: number
  status?: string
}

// 添加联合类型用于断言
type EditProductItem = {
  id: number
  name: string
  model?: string
  price?: number
  cardImage?: string
  categoryId?: number
  promoPosition?: 'none' | 'homepage_banner' | 'category_top' | 'homepage_recommend'
  status?: 'active' | 'inactive' | 'draft'
  sortOrder?: number
  category?: { id: number }
}

// Store 状态
const settingStore = useSettingStore()
const { isDark } = storeToRefs(settingStore)

// 响应式数据
const isLoading = ref(false)
const isExporting = ref(false)
const showWizard = ref(false)
const showCategoryDialog = ref(false)
const selectedCategoryId = ref<number | null>(null)
const currentCategory = ref<CategoryItem | null>(null)
const currentProduct = ref<EditProductItem | null>(null)
const viewMode = ref<'grid' | 'table'>('grid')

// 搜索表单
const searchForm = reactive({
  name: '',
  status: '',
  promoPosition: ''
})

// 展开与拖拽、子分类添加状态
const expandedParentIds = ref<Set<number>>(new Set())
const draggingId = ref<number | null>(null)
const dragLevel = ref<'parent' | 'child' | null>(null)
const dragSourceParentId = ref<number | null>(null)
const dragOverId = ref<number | null>(null)
const addingChildForId = ref<number | null>(null)
const newChildName = ref('')

// 分页
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

// 新增：排序状态
const sortBy = ref<'createdAt' | 'sales' | 'price' | 'sortOrder'>('sortOrder')
const sortDir = ref<'asc' | 'desc'>('asc')
const sortDropdownVisible = ref(false)

// 表格数据
const productList = ref<ProductItem[]>([])
const categories = ref<CategoryItem[]>([])
const selectedRows = ref<ProductItem[]>([])

// 新增：分类级联选项（使用 Element Plus 的类型）
import type { CascaderOption } from 'element-plus'

function mapCategoryToOptions(list: CategoryItem[] | undefined): CascaderOption[] {
  if (!list || list.length === 0) return []
  return list.map((c) => ({
    label: c.name,
    value: c.id,
    children: mapCategoryToOptions(c.children)
  })) as CascaderOption[]
}

const categoryOptions = computed<CascaderOption[]>(() => mapCategoryToOptions(categories.value))

// 统计：递归计算总数
function sumProducts(list: CategoryItem[]): number {
  return list.reduce((sum, cat) => {
    const selfCount = cat.productCount || 0
    const childrenCount = cat.children && cat.children.length ? sumProducts(cat.children) : 0
    return sum + selfCount + childrenCount
  }, 0)
}

const totalProducts = computed(() => sumProducts(categories.value))

function sumCategoryProducts(cat: CategoryItem): number {
  const selfCount = cat.productCount || 0
  const childrenCount = cat.children && cat.children.length ? sumProducts(cat.children) : 0
  return selfCount + childrenCount
}

function findCategoryById(id: number, list: CategoryItem[]): CategoryItem | null {
  for (const c of list) {
    if (c.id === id) return c
    if (c.children && c.children.length) {
      const found = findCategoryById(id, c.children)
      if (found) return found
    }
  }
  return null
}

// 获取当前分类名称（支持子分类）
const getCurrentCategoryName = () => {
  if (!selectedCategoryId.value) return '全部产品'
  const node = findCategoryById(selectedCategoryId.value, categories.value)
  return node?.name || '未知分类'
}

// 展开/收起
function isExpanded(id: number): boolean {
  return expandedParentIds.value.has(id)
}
function toggleExpand(id: number): void {
  if (expandedParentIds.value.has(id)) expandedParentIds.value.delete(id)
  else expandedParentIds.value.add(id)
}

// 默认展开全部有子级的父类
function expandAllParents(list: CategoryItem[]): void {
  const ids: number[] = []
  const walk = (arr: CategoryItem[]) => {
    for (const c of arr) {
      if (c.children && c.children.length) {
        ids.push(c.id)
        walk(c.children)
      }
    }
  }
  walk(list)
  expandedParentIds.value = new Set(ids)
}

// 添加子分类（行内）
function startAddChild(parent: CategoryItem): void {
  addingChildForId.value = parent.id
  newChildName.value = ''
  
  // 自动展开父分类以显示输入框
  expandedParentIds.value.add(parent.id)
  
  // 延迟聚焦到输入框
  nextTick(() => {
    const input = document.querySelector('.category-item.add-child .el-input__inner') as HTMLInputElement
    if (input) {
      input.focus()
    }
  })
}
async function confirmAddChild(parentId: number): Promise<void> {
  const parent = findCategoryById(parentId, categories.value)
  if (!parent) return
  const name = newChildName.value.trim()
  if (!name) {
    ElMessage.warning('请输入子分类名称')
    return
  }
  try {
    await request.post({
      url: '/product-categories',
      params: {
        name,
        parentId,
        status: 'active',
        sortOrder: (parent.children?.length || 0) + 1
      }
    })
    ElMessage.success(`子分类"${name}"添加成功`)
    addingChildForId.value = null
    newChildName.value = ''
    await loadCategories()
    expandedParentIds.value.add(parentId)
  } catch (e) {
    ElMessage.error('添加子分类失败')
  }
}
function cancelAddChild(): void {
  addingChildForId.value = null
  newChildName.value = ''
}

// 拖拽排序（仅限同级）
function reorderWithin(list: CategoryItem[], sourceId: number, targetId: number): void {
  const from = list.findIndex(i => i.id === sourceId)
  const to = list.findIndex(i => i.id === targetId)
  if (from === -1 || to === -1 || from === to) return
  const [moved] = list.splice(from, 1)
  list.splice(to, 0, moved)
}

function handleParentDragStart(item: CategoryItem): void {
  draggingId.value = item.id
  dragLevel.value = 'parent'
  dragSourceParentId.value = null
}
function handleChildDragStart(item: CategoryItem, parentId: number): void {
  draggingId.value = item.id
  dragLevel.value = 'child'
  dragSourceParentId.value = parentId
}
function handleDragOver(item: CategoryItem): void {
  dragOverId.value = item.id
}
async function persistCategoryOrder() {
  // 将当前树形结构扁平化并生成 sortOrder
  const list: { id: number; sortOrder: number }[] = []
  const walk = (arr: CategoryItem[]) => {
    arr.forEach((c, idx) => {
      list.push({ id: c.id, sortOrder: idx + 1 })
      if (c.children && c.children.length) walk(c.children)
    })
  }
  walk(categories.value)
  try {
    await request.put({ url: '/product-categories/sort-order', params: { categories: list } })
  } catch {}
}
function handleParentDrop(target: CategoryItem): void {
  if (dragLevel.value !== 'parent' || draggingId.value == null) return
  reorderWithin(categories.value, draggingId.value, target.id)
  dragOverId.value = null
  persistCategoryOrder()
}
function handleChildDrop(target: CategoryItem, parentId: number): void {
  if (dragLevel.value !== 'child' || draggingId.value == null) return
  if (dragSourceParentId.value !== parentId) return // 仅同级
  const parent = findCategoryById(parentId, categories.value)
  if (!parent || !parent.children) return
  reorderWithin(parent.children, draggingId.value, target.id)
  dragOverId.value = null
  persistCategoryOrder()
}
function handleDragEnd(): void {
  draggingId.value = null
  dragLevel.value = null
  dragSourceParentId.value = null
  dragOverId.value = null
}

// 状态相关方法
const getStatusTagType = (status: string): 'success' | 'warning' | 'danger' | 'info' => {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    'active': 'success',
    'draft': 'warning', 
    'inactive': 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    'active': '已发布',
    'draft': '草稿',
    'inactive': '已下架'
  }
  return map[status] || status
}

const getCategoryTagType = (categoryName: string): 'primary' | 'success' | 'warning' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    '厨房电器': 'primary',
    '智能设备': 'success',
    '配件': 'warning'
  }
  return typeMap[categoryName] || 'info'
}

const getPromoTagType = (position: string): 'danger' | 'warning' | 'success' | 'info' => {
  const map: Record<string, 'danger' | 'warning' | 'success' | 'info'> = {
    'homepage_banner': 'danger',
    'category_top': 'warning',
    'homepage_recommend': 'success',
    'none': 'info'
  }
  return map[position] || 'info'
}

const getPromoText = (position: string): string => {
  const map: Record<string, string> = {
    'homepage_banner': '首页Banner',
    'category_top': '分类置顶',
    'homepage_recommend': '首页推荐',
    'none': '未指定'
  }
  return map[position] || position
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 事件处理方法
const handleSearch = () => {
  pagination.current = 1
  loadProductList()
}

const resetSearch = () => {
  searchForm.name = ''
  searchForm.status = ''
  searchForm.promoPosition = ''
  pagination.current = 1
  loadProductList()
}

const handleSelectionChange = (rows: ProductItem[]) => {
  selectedRows.value = rows
}

const handleSizeChange = () => {
  loadProductList()
}

const handleCurrentChange = () => {
  loadProductList()
}

// 分类相关方法
const selectCategory = (categoryId: number | null) => {
  selectedCategoryId.value = categoryId
  handleSearch()
}

const openCategoryDialog = () => {
  currentCategory.value = null
  showCategoryDialog.value = true
}

const editCategory = (category: CategoryItem) => {
  currentCategory.value = category
  showCategoryDialog.value = true
}

const deleteCategory = async (category: CategoryItem) => {
  try {
    await ElMessageBox.confirm(
      `确定删除分类"${category.name}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await request.del({ url: `/product-categories/${category.id}` })
    ElMessage.success('分类删除成功')
    loadCategories()
  } catch {
    // 用户取消
  }
}

const handleCategoryCreated = () => {
  loadCategories()
}

// 添加新分类到列表
const addNewCategory = (categoryData: CategoryItem) => {
  if (categoryData.parentId) {
    // 添加为子分类
    const parentCategory = findCategoryById(categoryData.parentId, categories.value)
    if (parentCategory) {
      if (!parentCategory.children) {
        parentCategory.children = []
      }
      parentCategory.children.push(categoryData)
      // 自动展开父分类以显示新添加的子分类
      expandedParentIds.value.add(categoryData.parentId)
    }
  } else {
    // 添加为父分类
    categories.value.push(categoryData)
  }
}

// 更新现有分类
const updateExistingCategory = (categoryData: CategoryItem) => {
  const category = findCategoryById(categoryData.id, categories.value)
  if (category) {
    Object.assign(category, categoryData)
  }
}

// 产品相关方法
const openAddProductWizard = () => {
  currentProduct.value = null // 清空当前产品，表示新增模式
  showWizard.value = true
}

const editProduct = (product: ProductItem) => {
  // 规范 promoPosition 的字面量类型
  const p = product.promoPosition as 'none' | 'homepage_banner' | 'category_top' | 'homepage_recommend'
  currentProduct.value = {
    id: product.id,
    name: product.name,
    model: (product as any).model,
    price: product.price,
    cardImage: product.cardImage,
    categoryId: product.category?.id,
    promoPosition: p,
    status: product.status as 'active' | 'inactive' | 'draft',
    sortOrder: (product as any).sortOrder,
    category: product.category ? { id: product.category.id } : undefined
  }
  showWizard.value = true // 打开产品向导
  console.log('编辑产品:', product)
}

const toggleStatus = async (product: ProductItem) => {
  const newStatus = product.status === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(
      `确定${action}产品"${product.name}"吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await request.put({ url: `/products/${product.id}`, params: { status: newStatus } })
    product.status = newStatus
    ElMessage.success(`产品${action}成功`)
    loadProductList()
  } catch {
    // 用户取消
  }
}

const deleteProduct = async (product: ProductItem) => {
  try {
    await ElMessageBox.confirm(
      `确定删除产品"${product.name}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await request.del({ url: `/products/${product.id}` })
    ElMessage.success('产品删除成功')
    loadProductList()
  } catch {
    // 用户取消
  }
}

const handleProductCreated = () => {
  currentProduct.value = null // 清空当前产品状态
  loadProductList()
  loadCategories()
}

const exportData = () => {
  isExporting.value = true
  setTimeout(() => {
    isExporting.value = false
    ElMessage.success('导出成功')
  }, 2000)
}

const refreshData = () => {
  loadProductList()
  loadCategories()
}

// 新增方法：视图切换和产品选择相关
const isProductSelected = (product: ProductItem) => {
  return selectedRows.value.some(item => item.id === product.id)
}

const toggleProductSelection = (product: ProductItem) => {
  const index = selectedRows.value.findIndex(item => item.id === product.id)
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(product)
  }
}

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    'active': 'status-active',
    'draft': 'status-draft',
    'inactive': 'status-inactive'
  }
  return map[status] || 'status-default'
}

const handleBatchAction = async (command: string) => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要操作的产品')
    return
  }

  try {
    switch (command) {
      case 'batch-publish':
        await ElMessageBox.confirm(
          `确定要发布选中的 ${selectedRows.value.length} 个产品吗？`,
          '批量发布确认',
          { type: 'warning' }
        )
        // TODO: 调用批量发布API
        ElMessage.success('批量发布成功')
        break
      case 'batch-unpublish':
        await ElMessageBox.confirm(
          `确定要下架选中的 ${selectedRows.value.length} 个产品吗？`,
          '批量下架确认',
          { type: 'warning' }
        )
        // TODO: 调用批量下架API
        ElMessage.success('批量下架成功')
        break
      case 'batch-delete':
        await ElMessageBox.confirm(
          `确定要删除选中的 ${selectedRows.value.length} 个产品吗？此操作不可恢复。`,
          '批量删除确认',
          { type: 'error' }
        )
        // TODO: 调用批量删除API
        ElMessage.success('批量删除成功')
        break
    }
    selectedRows.value = []
    loadProductList()
  } catch {
    // 用户取消操作
  }
}

const handleProductAction = async (command: string, product: ProductItem) => {
  try {
    switch (command) {
      case 'copy':
        // TODO: 实现复制产品功能
        ElMessage.success('产品复制成功')
        break
      case 'view':
        await openProductPreview(product)
        break
      case 'move':
        openMoveCategory(product)
        break
      case 'delete':
        await deleteProduct(product)
        break
    }
  } catch (error) {
    console.error('操作失败:', error)
  }
}

// 新增：根据产品ID计算详情页预览URL（优先后端文件列表接口，回退到默认路径）
async function getProductPreviewUrl(productId: number): Promise<string | null> {
  // 1) 优先调用后端文件列表接口，寻找 .html 文件
  try {
    const res = await request.get<any>({ url: `/products/${productId}/files` })
    const data = res?.data as { filePath?: string | null; files?: string[] } | undefined
    const base = (data?.filePath || '').replace(/^\/+/, '') // 去除开头斜杠，保持相对路径
    const files = Array.isArray(data?.files) ? data!.files : []

    if (base && files.length) {
      // 优先产品详情首页文件名，其次任意第一个 HTML
      const preferred = files.find(f => /产品详情\.html?$/i.test(f))
      const anyHtml = files.find(f => /\.html?$/i.test(f))
      const htmlFile = preferred || anyHtml
      if (htmlFile) {
        const urlPath = `/${base.replace(/\/+$/, '')}/${htmlFile.replace(/^\/+/, '')}`
        return toAbsoluteUrl(urlPath)
      }
    }
  } catch {
    // 忽略，走回退方案
  }

  // 2) 回退：尝试 /products/product_${id}/产品详情.html
  const fallback = `/products/product_${productId}/产品详情.html`
  return toAbsoluteUrl(fallback)
}

// 新增：打开预览窗口
async function openProductPreview(product: ProductItem): Promise<void> {
  const url = await getProductPreviewUrl(product.id)
  if (!url) {
    ElMessage.warning('未找到该产品的详情页，请先上传详情页文件')
    return
  }
  // 由于后端 CSP frame-ancestors 仅允许 self，这里使用新窗口打开而非内嵌 iframe
  window.open(url, '_blank')
}

// 新增：移动分类对话框逻辑
const moveDialogVisible = ref(false)
const moveProductRef = ref<ProductItem | null>(null)
const moveTargetPath = ref<number[]>([])

function findCategoryPathById(
  id: number,
  list: CategoryItem[],
  path: number[] = []
): number[] | null {
  for (const node of list) {
    const newPath = [...path, node.id]
    if (node.id === id) return newPath
    if (node.children && node.children.length) {
      const p = findCategoryPathById(id, node.children, newPath)
      if (p) return p
    }
  }
  return null
}

function openMoveCategory(product: ProductItem) {
  moveProductRef.value = product
  // 定位默认路径：当前分类（若有）对应的路径
  const currentId = product.category?.id
  moveTargetPath.value = currentId ? (findCategoryPathById(currentId, categories.value) || []) : []
  moveDialogVisible.value = true
}

async function confirmMoveCategory() {
  if (!moveProductRef.value) return
  const path = moveTargetPath.value || []
  if (path.length === 0) {
    ElMessage.warning('请选择要移动到的分类（可选父级或子级）')
    return
  }
  const targetCategoryId = path[path.length - 1]
  try {
    await request.put({ url: `/products/${moveProductRef.value.id}`, params: { categoryId: targetCategoryId } })
    ElMessage.success('移动分类成功')
    handleCloseMoveDialog()
    loadProductList()
    loadCategories()
  } catch {
    ElMessage.error('移动分类失败')
  }
}

function handleCloseMoveDialog() {
  moveDialogVisible.value = false
  moveProductRef.value = null
  moveTargetPath.value = []
}

// 数据加载方法
const loadProductList = async () => {
  isLoading.value = true
  try {
    const params: Record<string, any> = {
      page: pagination.current,
      limit: pagination.size,
    }
    if (selectedCategoryId.value) params.categoryId = selectedCategoryId.value
    if (searchForm.status) params.status = searchForm.status
    if (searchForm.promoPosition) params.promoPosition = searchForm.promoPosition
    if (searchForm.name) params.search = searchForm.name
    // 携带排序条件
    if (sortBy.value) params.sortBy = sortBy.value
    if (sortDir.value) params.sortDir = sortDir.value

    const res = await request.get<any>({
      url: '/products',
      params
    })

    const items = res?.data?.items || []
    const total = res?.data?.total || 0
    productList.value = items as ProductItem[]
    pagination.total = total
  } catch (error) {
    ElMessage.error('加载产品列表失败')
  } finally {
    isLoading.value = false
  }
}

const loadCategories = async () => {
  try {
    const res = await request.get<any>({
      url: '/product-categories',
      params: { includeProducts: 'true' }
    })
    categories.value = (res?.data || []) as CategoryItem[]
    // 规范化每个分类节点的 productCount（后端注入或回退到 products.length）
    normalizeCategoryCounts(categories.value)
    // 默认不展开分类，用户需要手动点击展开
    expandedParentIds.value = new Set()
  } catch (error) {
    ElMessage.error('加载分类列表失败')
  }
}

function normalizeCategoryCounts(list: CategoryItem[] | undefined): void {
  if (!list || list.length === 0) return
  for (const c of list) {
    const anyC = c as any
    const cnt = anyC.productCount ?? (Array.isArray(anyC.products) ? anyC.products.length : 0)
    anyC.productCount = Number(cnt) || 0
    if (c.children && c.children.length) normalizeCategoryCounts(c.children)
  }
}

// 生命周期
onMounted(() => {
  loadProductList()
  loadCategories()
})

const apiBase = (import.meta as any).env?.VITE_API_URL || ''
const apiOrigin = apiBase.replace(/\/api\/?$/, '')
const toAbsoluteUrl = (u?: string) => {
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  if (u.startsWith('/')) return apiOrigin + u
  return u
}

const applySort = (by: 'createdAt'|'sales'|'price'|'sortOrder', dir: 'asc'|'desc') => {
  sortBy.value = by
  sortDir.value = dir
  pagination.current = 1
  sortDropdownVisible.value = false
  loadProductList()
}

// 新增：切换排序方法（点击一次正序，再点击一次倒序）
const toggleSort = (by: 'createdAt'|'sales'|'price'|'sortOrder') => {
  if (sortBy.value === by) {
    // 如果是同一个字段，切换排序方向
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    // 如果是不同字段，设置为默认方向
    sortBy.value = by
    if (by === 'createdAt') {
      sortDir.value = 'desc' // 时间默认最新优先
    } else if (by === 'price' || by === 'sales') {
      sortDir.value = 'desc' // 价格和销量默认从高到低
    } else {
      sortDir.value = 'asc' // 权重默认从低到高
    }
  }
  pagination.current = 1
  sortDropdownVisible.value = false
  loadProductList()
}

// 新增：获取排序描述文字
const getSortDesc = (by: 'createdAt'|'sales'|'price'|'sortOrder') => {
  if (sortBy.value !== by) {
    // 未选中状态显示默认描述
    const defaultDescs = {
      'sortOrder': '按权重排序',
      'createdAt': '按时间排序', 
      'price': '按价格排序',
      'sales': '按销量排序'
    }
    return defaultDescs[by]
  }
  
  // 选中状态显示当前排序方向
  const descs = {
    'sortOrder': sortDir.value === 'asc' ? '权重从低到高' : '权重从高到低',
    'createdAt': sortDir.value === 'asc' ? '最早优先' : '最新优先',
    'price': sortDir.value === 'asc' ? '价格从低到高' : '价格从高到低',
    'sales': sortDir.value === 'asc' ? '销量从低到高' : '销量从高到低'
  }
  return descs[by]
}
</script>

<style scoped lang="scss">
.product-list-page {
  padding: 20px;
  min-height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  
  .header-card {
    margin-bottom: 24px;
    border-radius: 16px;
    border: 1px solid var(--art-border-color);
    background: var(--art-main-bg-color);
    box-shadow: var(--art-box-shadow-sm);
    z-index: 10;
    position: relative;
    
    :deep(.el-card__body) {
      padding: 24px !important;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0;
      
      .header-left {
        flex: 1;
        
        h3 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a !important;
          letter-spacing: -0.5px;
          transition: color 0.2s ease;
          line-height: 1.2;
        }
        
        p {
          margin: 0;
          color: #666666 !important;
          font-size: 15px;
          font-weight: 400;
          line-height: 1.5;
          transition: color 0.2s ease;
        }
      }
      
      .header-right {
        .el-button {
          border-radius: 12px;
          font-weight: 600;
          padding: 12px 24px;
          font-size: 14px;
          background: rgb(var(--art-primary));
          border: none;
          box-shadow: 0 4px 12px rgba(var(--art-primary), 0.3);
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          color: white;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(var(--art-primary), 0.4);
            background: rgba(var(--art-primary), 0.9);
          }
        }
      }
    }
  }

  // 深色主题样式 - 使用系统标准配色
  .header-card.header-card-dark {
    background: var(--art-main-bg-color) !important;
    background-color: var(--art-main-bg-color) !important;
    border: 1px solid var(--art-border-color) !important;
    border-color: var(--art-border-color) !important;
    box-shadow: var(--art-box-shadow-sm) !important;
    
    &.el-card {
      background: var(--art-main-bg-color) !important;
      background-color: var(--art-main-bg-color) !important;
      border-color: var(--art-border-color) !important;
    }
    
    :deep(.el-card__body) {
      background: var(--art-main-bg-color) !important;
      background-color: var(--art-main-bg-color) !important;
    }
    
    .header-content {
      background: transparent !important;
      
      .header-left {
        h3 {
          color: var(--art-text-gray-900) !important;
        }
        
        p {
          color: var(--art-text-gray-600) !important;
        }
      }
    }
  }
  
      .main-content {
      display: flex;
      gap: 20px;
      align-items: flex-start;
      flex: 1;
      min-height: 0;
    
          .category-sidebar {
        width: 300px;
        flex-shrink: 0;
        max-height: calc(100vh - 150px);
        overflow-y: auto;
        border-radius: 12px;
        border: 1px solid var(--art-border-color);
        background: var(--art-main-bg-color);
        position: sticky;
        top: 20px;
      
      .category-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid var(--art-border-color);
        
        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--art-text-gray-800);
          transition: color 0.2s ease;
        }
      }
      
      .category-list {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        .category-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          margin-bottom: 4px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          border: 1px solid var(--art-border-color);
          writing-mode: horizontal-tb;
          text-orientation: mixed;
          background: var(--art-main-bg-color);
          box-shadow: var(--art-box-shadow-xs);
          min-height: 44px;
          
          &:hover {
            background-color: rgba(var(--art-hoverColor), 0.5);
            border-color: var(--art-gray-300);
          }
          
          &.active {
            background: rgba(var(--art-bg-primary), 0.8);
            border-color: rgb(var(--art-primary));
            box-shadow: 0 2px 4px rgba(var(--art-primary), 0.15);
            
            .category-name {
              color: rgb(var(--art-primary));
              font-weight: 600;
            }
          }

          &.drag-over {
            background: rgba(var(--art-bg-warning), 0.6);
            border-color: rgb(var(--art-warning));
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(var(--art-warning), 0.25);
          }

          &.dragging {
            opacity: 0.5;
            transform: rotate(2deg);
          }
          
          .category-toggle {
            width: 18px;
            height: 18px;
            margin-right: 6px;
            color: var(--art-text-gray-600);
            cursor: pointer;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            flex-shrink: 0;
            
            &:hover {
              background-color: rgba(var(--art-hoverColor), 0.5);
              color: var(--art-text-gray-700);
            }
            
            &.placeholder { 
              visibility: hidden; 
            }
          }
          
          .category-icon {
            margin-right: 10px;
            font-size: 16px;
            color: rgb(var(--art-primary));
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(var(--art-bg-primary), 0.5);
            border-radius: 5px;
            border: 1px solid rgba(var(--art-primary), 0.2);
            transition: all 0.2s ease;
            flex-shrink: 0;
          }
          
          .category-name {
            flex: 1;
            font-size: 14px !important;
            color: var(--art-text-gray-800) !important;
            line-height: 1.4;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            direction: ltr;
            text-align: left;
            letter-spacing: 0.1px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
            transition: color 0.2s ease;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            text-indent: 0 !important;
            min-width: 60px;
            max-width: 180px;
          }
          
          .product-count {
            margin-left: 8px;
            margin-right: 4px;
            background: rgba(var(--art-bg-secondary), 0.6);
            color: rgb(var(--art-secondary));
            border: 1px solid rgba(var(--art-secondary), 0.2);
            font-weight: 500;
            font-size: 11px;
            padding: 4px 8px;
            border-radius: 12px;
            letter-spacing: 0.3px;
            font-family: system-ui, -apple-system, sans-serif;
            min-width: 22px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(var(--art-secondary), 0.1);
            line-height: 1.2;
          }
          
          .category-actions {
            margin-left: auto;
            margin-right: 8px;
            display: flex;
            gap: 3px;
            opacity: 0;
            transition: all 0.3s ease;
            
            .el-button {
              width: 28px;
              height: 28px;
              border-radius: 6px;
              border: none;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
              padding: 0;
              margin: 0;
              
              &:hover {
                transform: scale(1.08) translateY(-1px);
                box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
              }
              
              .el-icon {
                font-size: 13px;
              }
              
              &.add-btn {
                background: rgb(var(--art-success));
                color: white;
                box-shadow: 0 2px 4px rgba(var(--art-success), 0.25);
                
                &:hover {
                  box-shadow: 0 4px 8px rgba(var(--art-success), 0.35);
                  background: rgba(var(--art-success), 0.9);
                }
              }
              
              &.edit-btn {
                background: rgb(var(--art-primary));
                color: white;
                box-shadow: 0 2px 4px rgba(var(--art-primary), 0.25);
                
                &:hover {
                  box-shadow: 0 4px 8px rgba(var(--art-primary), 0.35);
                  background: rgba(var(--art-primary), 0.9);
                }
              }
              
              &.delete-btn {
                background: rgb(var(--art-danger));
                color: white;
                box-shadow: 0 2px 4px rgba(var(--art-danger), 0.25);
                
                &:hover {
                  box-shadow: 0 4px 8px rgba(var(--art-danger), 0.35);
                  background: rgba(var(--art-danger), 0.9);
                }
              }
            }
          }
          
          &:hover .category-actions {
            opacity: 1;
          }
        }

        // 子分类特殊样式
        .children-list {
          margin-left: 0;
          position: relative;
          
          &::before {
            content: '';
            position: absolute;
            left: 36px;
            top: 0;
            bottom: 0;
            width: 1px;
            background: linear-gradient(to bottom, var(--art-gray-300) 0%, var(--art-gray-300) 80%, transparent 100%);
            border-radius: 0.5px;
          }
          
          .category-item.child {
            margin-left: 20px;
            margin-bottom: 2px;
            background: rgba(var(--art-hoverColor), 0.2);
            border-left: 3px solid rgb(var(--art-primary));
            border-radius: 0 8px 8px 0;
            position: relative;
            box-shadow: 0 1px 2px rgba(var(--art-primary), 0.08);
            min-height: 36px;
            
            &::before {
              content: '';
              position: absolute;
              left: -10px;
              top: 50%;
              width: 8px;
              height: 1px;
              background: linear-gradient(90deg, var(--art-gray-300) 0%, rgb(var(--art-primary)) 100%);
              border-radius: 0.5px;
            }
            
            &:hover {
              background-color: rgba(var(--art-hoverColor), 0.5);
              border-left-color: var(--art-gray-500);
            }
            
            &.active {
              background: rgba(var(--art-bg-success), 0.6);
              border-left-color: rgb(var(--art-success));
              
              .category-name {
                color: rgb(var(--art-success));
                font-weight: 600;
              }
            }
            
             .category-name {
               font-size: 13px !important;
               color: var(--art-text-gray-700) !important;
               font-weight: 500;
               white-space: nowrap;
               overflow: hidden;
               text-overflow: ellipsis;
               direction: ltr;
               text-align: left;
               letter-spacing: 0.1px;
               font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
               transition: color 0.2s ease;
               display: block !important;
               visibility: visible !important;
               opacity: 1 !important;
               text-indent: 0 !important;
               min-width: 50px;
               max-width: 110px;
               line-height: 1.3;
             }
            
            .product-count {
              background: rgba(var(--art-bg-success), 0.4);
              color: rgb(var(--art-success));
              border-color: rgba(var(--art-success), 0.2);
              font-size: 10px;
              padding: 3px 6px;
              min-width: 20px;
            }
          }
        }

        // 添加子分类输入框样式
        .category-item.add-child {
          background: rgba(var(--art-bg-warning), 0.4);
          border: 1px dashed rgb(var(--art-warning));
          margin-left: 20px;
          padding: 10px 14px;
          
          .el-input {
            flex: 1;
            margin-right: 8px;
            
            .el-input__wrapper {
              border-radius: 6px;
              border: 1px solid rgb(var(--art-warning));
              background-color: var(--art-main-bg-color);
            }
          }
          
          .el-button {
            border-radius: 6px;
            font-size: 12px;
            height: 28px;
            
            &.confirm-btn {
              background: rgb(var(--art-warning));
              color: white;
              border: none;
              
              &:hover {
                background: rgba(var(--art-warning), 0.9);
              }
            }
            
            &.cancel-btn {
              background: var(--art-main-bg-color);
              color: var(--art-text-gray-600);
              border: 1px solid var(--art-border-color);
              
              &:hover {
                background: rgba(var(--art-hoverColor), 0.5);
              }
            }
          }
        }

        // 分类分割线
        .category-item + .category-item.child {
          margin-top: 4px;
        }
        
        .children-list + .category-item {
          margin-top: 8px;
          position: relative;
          
          &::before {
            content: '';
            position: absolute;
            top: -4px;
            left: 12px;
            right: 12px;
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, var(--art-gray-300) 50%, transparent 100%);
          }
        }
      }
    }
    
          .product-content {
        flex: 1;
        overflow: visible;
        min-height: 0;
      
      .search-card {
        margin-bottom: 20px;
        border-radius: 16px;
        border: 1px solid var(--art-border-color);
        background: var(--art-main-bg-color);
        overflow: hidden;
        
        .search-wrapper {
          padding: 24px;
          
          .search-left {
            margin-bottom: 20px;
            
            .search-title {
              margin: 0 0 8px 0;
              font-size: 18px;
              font-weight: 600;
              color: var(--art-text-gray-800);
              display: flex;
              align-items: center;
              gap: 8px;
              
              &::before {
                content: '';
                width: 4px;
                height: 18px;
                background: linear-gradient(135deg, rgb(var(--art-primary)) 0%, rgb(var(--art-secondary)) 100%);
                border-radius: 2px;
              }
            }
            
            .search-subtitle {
              margin: 0;
              font-size: 14px;
              color: var(--art-text-gray-600);
              margin-left: 12px;
            }
          }
          
          .search-form {
            .search-main-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              gap: 24px;
              
              @media (max-width: 1200px) {
                flex-direction: column;
                align-items: stretch;
                gap: 16px;
              }
            }
            
            .form-row {
              display: flex;
              flex-wrap: wrap;
              gap: 16px;
              flex: 1;
              
              .search-item {
                margin-bottom: 0 !important;
                
                :deep(.el-form-item__label) {
                  font-weight: 500;
                  color: var(--art-text-gray-700);
                  font-size: 14px;
                  line-height: 1.5;
                }
                
                :deep(.el-input) {
                  .el-input__wrapper {
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    
                    &:hover {
                      border-color: rgb(var(--art-primary));
                      box-shadow: 0 0 0 2px rgba(var(--art-primary), 0.1);
                    }
                    
                    &.is-focus {
                      border-color: rgb(var(--art-primary));
                      box-shadow: 0 0 0 3px rgba(var(--art-primary), 0.15);
                    }
                  }
                }
                
                :deep(.el-select) {
                  .el-input__wrapper {
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    
                    &:hover {
                      border-color: rgb(var(--art-primary));
                      box-shadow: 0 0 0 2px rgba(var(--art-primary), 0.1);
                    }
                    
                    &.is-focus {
                      border-color: rgb(var(--art-primary));
                      box-shadow: 0 0 0 3px rgba(var(--art-primary), 0.15);
                    }
                  }
                }
              }
            }
            
            .form-actions {
              display: flex;
              gap: 12px;
              flex-shrink: 0;
              
              @media (max-width: 1200px) {
                justify-content: flex-end;
              }
              
              @media (max-width: 768px) {
                justify-content: stretch;
                
                .search-btn,
                .reset-btn {
                  flex: 1;
                }
              }
              
              .search-btn {
                background: linear-gradient(135deg, rgb(var(--art-primary)) 0%, rgba(var(--art-primary), 0.8) 100%);
                border: none;
                border-radius: 10px;
                font-weight: 500;
                padding: 12px 24px;
                box-shadow: 0 4px 12px rgba(var(--art-primary), 0.3);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                white-space: nowrap;
                
                &:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 8px 20px rgba(var(--art-primary), 0.4);
                }
              }
              
              .reset-btn {
                background: var(--art-main-bg-color);
                border: 1px solid var(--art-border-color);
                border-radius: 10px;
                color: var(--art-text-gray-600);
                font-weight: 500;
                padding: 12px 24px;
                transition: all 0.3s ease;
                white-space: nowrap;
                
                &:hover {
                  background: rgba(var(--art-hoverColor), 0.5);
                  border-color: var(--art-gray-400);
                  transform: translateY(-1px);
                }
              }
            }
          }
        }
      }
      
      .product-grid-card {
        border-radius: 16px;
        border: 1px solid var(--art-border-color);
        background: var(--art-main-bg-color);
        overflow: hidden;
        
        .grid-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px 24px 20px 24px;
          background: linear-gradient(135deg, var(--art-main-bg-color) 0%, rgba(var(--art-hoverColor), 0.3) 100%);
          border-bottom: 1px solid var(--art-border-color);
          
          .header-left {
            display: flex;
            flex-direction: column;
            gap: 16px;
            
            .category-info {
              display: flex;
              align-items: center;
              gap: 12px;
              
              .category-icon-wrapper {
                width: 40px;
                height: 40px;
                background: rgba(var(--art-bg-primary), 0.8);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid rgba(var(--art-primary), 0.2);
                
                .category-icon {
                  width: 20px;
                  height: 20px;
                  color: rgb(var(--art-primary));
                }
              }
              
              .category-text {
                display: flex;
                flex-direction: column;
                
                .category-label {
                  font-size: 12px;
                  color: var(--art-text-gray-500);
                  font-weight: 500;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                
                .category-name {
                  font-size: 18px;
                  font-weight: 600;
                  color: var(--art-text-gray-800);
                  margin-top: 2px;
                }
              }
            }
            
            .stats-info {
              display: flex;
              align-items: center;
              gap: 16px;
              
              .stat-item {
                display: flex;
                align-items: center;
                gap: 8px;
                
                .stat-icon {
                  width: 16px;
                  height: 16px;
                  color: rgb(var(--art-secondary));
                }
                
                .stat-text {
                  font-size: 14px;
                  color: var(--art-text-gray-600);
                  font-weight: 500;
                }
              }
              
              .selected-info {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: rgba(var(--art-bg-warning), 0.8);
                color: rgb(var(--art-warning));
                border-radius: 8px;
                font-size: 12px;
                font-weight: 500;
                animation: pulse 2s infinite;
              }
            }
          }
          
          .header-right {
            display: flex;
            align-items: center;
            gap: 16px;
            
            .view-controls {
              .view-toggle {
                .el-button {
                  padding: 8px 12px;
                  border-radius: 8px;
                  font-size: 12px;
                  
                  .el-icon {
                    margin-right: 4px;
                  }
                }
              }
            }
            
                          .header-actions {
                display: flex;
                gap: 8px;
                
                .action-btn {
                  border-radius: 8px;
                  font-weight: 500;
                  padding: 8px 16px;
                  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                  font-size: 13px;
                  
                  &.modern-sort-trigger {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    color: white;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    position: relative;
                    overflow: hidden;
                    
                    &::before {
                      content: '';
                      position: absolute;
                      top: 0;
                      left: -100%;
                      width: 100%;
                      height: 100%;
                      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                      transition: left 0.5s;
                    }
                    
                    &:hover {
                      transform: translateY(-2px);
                      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                      
                      &::before {
                        left: 100%;
                      }
                      
                      .arrow-icon {
                        transform: rotate(180deg);
                      }
                    }
                    
                    .sort-icon {
                      font-size: 14px;
                    }
                    
                    .arrow-icon {
                      font-size: 12px;
                      transition: transform 0.3s ease;
                    }
                  }
                  
                  &.export-btn {
                    background: linear-gradient(135deg, rgb(var(--art-success)) 0%, rgba(var(--art-success), 0.8) 100%);
                    border: none;
                    color: white;
                    box-shadow: 0 2px 6px rgba(var(--art-success), 0.3);
                    
                    &:hover {
                      transform: translateY(-1px);
                      box-shadow: 0 4px 12px rgba(var(--art-success), 0.4);
                    }
                  }
                  
                  &.refresh-btn {
                    background: var(--art-main-bg-color);
                    border: 1px solid var(--art-border-color);
                    color: var(--art-text-gray-600);
                    
                    &:hover {
                      background: rgba(var(--art-hoverColor), 0.5);
                      border-color: rgb(var(--art-primary));
                      color: rgb(var(--art-primary));
                      transform: translateY(-1px);
                    }
                  }
                }
              }
          }
        }
        
        // 产品网格视图样式
        .product-grid-container {
          padding: 24px;
          min-height: 400px;
          overflow: visible;
          
          .loading-container {
            padding: 40px;
          }
          
          .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            
            @media (max-width: 768px) {
              grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
              gap: 16px;
            }
            
            .product-card {
              background: var(--art-main-bg-color);
              border: 1px solid var(--art-border-color);
              border-radius: 16px;
              overflow: hidden;
              transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
              cursor: pointer;
              position: relative;
              
              &:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
                border-color: rgb(var(--art-primary));
              }
              
              &.selected {
                border-color: rgb(var(--art-primary));
                box-shadow: 0 0 0 3px rgba(var(--art-primary), 0.15);
              }
              
              .card-checkbox {
                position: absolute;
                top: 12px;
                left: 12px;
                z-index: 2;
                // 去掉白色背景卡片，只保留checkbox
                
                // 紫蓝色checkbox样式
                :deep(.purple-checkbox) {
                  .el-checkbox__input {
                    .el-checkbox__inner {
                      width: 20px;
                      height: 20px;
                      border-radius: 4px;
                      border: 2px solid #8b5cf6; // 紫蓝色边框
                      background-color: transparent;
                      transition: all 0.3s ease;
                      
                      &:after {
                        border-color: white;
                        border-width: 2px;
                      }
                    }
                    
                    &.is-checked .el-checkbox__inner {
                      background-color: #8b5cf6; // 紫蓝色背景
                      border-color: #8b5cf6;
                      transform: scale(1.1);
                      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
                    }
                    
                    &.is-indeterminate .el-checkbox__inner {
                      background-color: #8b5cf6;
                      border-color: #8b5cf6;
                    }
                    
                    &:hover .el-checkbox__inner {
                      border-color: #a78bfa; // 浅一点的紫蓝色
                      transform: scale(1.05);
                    }
                  }
                  
                  &:hover .el-checkbox__input .el-checkbox__inner {
                    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.15);
                  }
                }
              }
              
              .card-image-section {
                position: relative;
                height: 200px;
                overflow: hidden;
                background: linear-gradient(135deg, rgba(var(--art-hoverColor), 0.3) 0%, rgba(var(--art-hoverColor), 0.1) 100%);
                
                .image-container {
                  width: 100%;
                  height: 100%;
                  
                  .product-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                  }
                  
                  .no-image-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: var(--art-text-gray-500);
                    font-size: 14px;
                    
                    .el-icon {
                      font-size: 40px;
                      margin-bottom: 8px;
                      opacity: 0.6;
                    }
                  }
                }
                
                .status-badge {
                  position: absolute;
                  top: 12px;
                  right: 12px;
                  padding: 4px 8px;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  backdrop-filter: blur(4px);
                  
                  &.status-active {
                    background: rgba(var(--art-success), 0.9);
                    color: white;
                  }
                  
                  &.status-draft {
                    background: rgba(var(--art-warning), 0.9);
                    color: white;
                  }
                  
                  &.status-inactive {
                    background: rgba(var(--art-danger), 0.9);
                    color: white;
                  }
                }
                
                .promo-badge {
                  position: absolute;
                  bottom: 12px;
                  left: 12px;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  padding: 4px 8px;
                  background: rgba(var(--art-warning), 0.9);
                  color: white;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: 600;
                  backdrop-filter: blur(4px);
                  
                  .el-icon {
                    font-size: 12px;
                  }
                }
              }
              
              .card-content {
                padding: 20px;
                
                .product-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 12px;
                  
                  .product-title {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--art-text-gray-800);
                    line-height: 1.4;
                    flex: 1;
                    margin-right: 12px;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                  }
                  
                  .product-price {
                    .price-value {
                      font-size: 18px;
                      font-weight: 700;
                      color: rgb(var(--art-danger));
                    }
                    
                    .price-placeholder {
                      font-size: 14px;
                      color: var(--art-text-gray-500);
                      font-style: italic;
                    }
                  }
                }
                
                .product-meta {
                  display: flex;
                  flex-direction: column;
                  gap: 8px;
                  margin-bottom: 16px;
                  
                  .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    
                    .meta-icon {
                      width: 14px;
                      height: 14px;
                      color: var(--art-text-gray-500);
                    }
                    
                    .meta-text {
                      font-size: 13px;
                      color: var(--art-text-gray-600);
                    }
                  }
                }
                
                .product-tags {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 6px;
                  margin-bottom: 16px;
                  
                  .tag-item {
                    font-size: 11px;
                    padding: 3px 8px;
                    border-radius: 6px !important;
                    font-weight: 600 !important;
                    letter-spacing: 0.3px !important;
                    min-width: 45px;
                    text-align: center;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) !important;
                    border: none !important;
                    color: #ffffff !important;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
                    transition: all 0.2s ease;
                    
                    &:hover {
                      transform: translateY(-1px);
                      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25) !important;
                    }
                  }
                  
                  .more-tags {
                    font-size: 11px;
                    color: #ffffff;
                    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-weight: 600;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                    min-width: 45px;
                    text-align: center;
                    transition: all 0.2s ease;
                    
                    &:hover {
                      transform: translateY(-1px);
                      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
                    }
                  }
                }
              }
              
              .card-actions {
                padding: 0 20px 20px 20px;
                display: flex;
                gap: 8px;
                
                .action-btn {
                  flex: 1;
                  border-radius: 8px;
                  font-size: 12px;
                  padding: 8px 12px;
                  transition: all 0.2s ease;
                  
                  &.edit-btn {
                    background: rgb(var(--art-primary));
                    border: none;
                    color: white;
                    
                    &:hover {
                      background: rgba(var(--art-primary), 0.9);
                      transform: translateY(-1px);
                    }
                  }
                  
                  &.status-btn {
                    &:hover {
                      transform: translateY(-1px);
                    }
                  }
                  
                  &.more-btn {
                    background: var(--art-main-bg-color);
                    border: 1px solid var(--art-border-color);
                    color: var(--art-text-gray-600);
                    flex: 0 0 auto;
                    width: 32px;
                    padding: 8px;
                    
                    &:hover {
                      border-color: rgb(var(--art-primary));
                      color: rgb(var(--art-primary));
                    }
                  }
                }
              }
            }
          }
        }
        
        // 增强表格视图样式
        .table-view-container {
          min-height: 400px;
          overflow: visible;
          
          .table-wrapper {
            .enhanced-table {
              :deep(.el-table__header) {
                th {
                  background: rgba(var(--art-hoverColor), 0.3) !important;
                  border-bottom: 1px solid var(--art-border-color);
                  
                  .cell {
                    font-weight: 600;
                    color: var(--art-text-gray-700);
                    font-size: 14px;
                    text-align: center !important;
                    justify-content: center !important;
                  }
                  
                  // 产品名称列保持左对齐
                  &:nth-child(3) .cell {
                    text-align: left !important;
                    justify-content: flex-start !important;
                  }
                }
              }
              
              :deep(.el-table__body) {
                tr {
                  transition: all 0.2s ease;
                  
                  &:hover {
                    background: rgba(var(--art-hoverColor), 0.5) !important;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                  }
                  
                  td {
                    border-bottom: 1px solid var(--art-border-color);
                    padding: 16px 12px;
                    vertical-align: middle;
                    
                    .cell {
                      color: var(--art-text-gray-700);
                      font-size: 14px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      min-height: 50px;
                    }
                    
                    // 产品名称列保持左对齐
                    &:nth-child(3) .cell {
                      justify-content: flex-start;
                    }
                  }
                }
              }
            }
            
            .table-product-preview {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 100%;
              
              .preview-image {
                width: 50px;
                height: 50px;
                object-fit: cover;
                border-radius: 8px;
                border: 2px solid var(--art-border-color);
                transition: all 0.3s ease;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                
                &:hover {
                  transform: scale(1.2);
                  border-color: rgb(var(--art-primary));
                  box-shadow: 0 4px 12px rgba(var(--art-primary), 0.3);
                  z-index: 10;
                }
              }
              
              .preview-placeholder {
                width: 50px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, rgba(var(--art-hoverColor), 0.4) 0%, rgba(var(--art-hoverColor), 0.2) 100%);
                border: 2px dashed var(--art-gray-400);
                border-radius: 8px;
                color: var(--art-text-gray-500);
                transition: all 0.3s ease;
                
                &:hover {
                  border-color: rgb(var(--art-primary));
                  background: linear-gradient(135deg, rgba(var(--art-bg-primary), 0.3) 0%, rgba(var(--art-bg-primary), 0.1) 100%);
                  color: rgb(var(--art-primary));
                  transform: scale(1.05);
                }
                
                .el-icon {
                  font-size: 20px;
                  opacity: 0.6;
                }
              }
            }
            
            .product-name-cell {
              .name-text {
                font-weight: 600;
                color: var(--art-text-gray-800);
                font-size: 14px;
                line-height: 1.4;
              }
              
              .name-meta {
                font-size: 12px;
                color: var(--art-text-gray-500);
                margin-top: 4px;
              }

            }
            
            // 表格居中对齐容器
            .table-cell-centered {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100%;
              height: 100%;
              min-height: 50px;
            }
            
            // 标签列表居中
            .table-tag-list-centered {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              align-items: center;
              gap: 4px;
              
              .enhanced-tag {
                border-radius: 6px !important;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) !important;
                font-weight: 600 !important;
                letter-spacing: 0.3px !important;
                min-width: 45px;
                text-align: center;
                transition: all 0.2s ease;
                
                &:hover {
                  transform: translateY(-1px);
                  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25) !important;
                }
              }
              
              .more-indicator-enhanced {
                font-size: 11px;
                color: #ffffff;
                background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
                padding: 3px 8px;
                border-radius: 10px;
                font-weight: 600;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.2);
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
              }
            }
            
            // 增强的分类标签
            .enhanced-category-tag {
              font-weight: 600 !important;
              letter-spacing: 0.2px !important;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12) !important;
              border-radius: 6px !important;
              min-width: 60px;
              text-align: center;
              
              &.el-tag--primary {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
                border: 1px solid #3b82f6 !important;
                color: #ffffff !important;
              }
              
              &.el-tag--success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
                border: 1px solid #10b981 !important;
                color: #ffffff !important;
              }
              
              &.el-tag--warning {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
                border: 1px solid #f59e0b !important;
                color: #ffffff !important;
              }
              
              &.el-tag--info {
                background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
                border: 1px solid #6b7280 !important;
                color: #ffffff !important;
              }
            }
            
            // 增强的推广标签
            .enhanced-promo-tag {
              font-weight: 600 !important;
              letter-spacing: 0.2px !important;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) !important;
              border-radius: 6px !important;
              min-width: 70px;
              text-align: center;
              
              &.el-tag--danger {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
                border: 1px solid #ef4444 !important;
                color: #ffffff !important;
              }
              
              &.el-tag--warning {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
                border: 1px solid #f59e0b !important;
                color: #ffffff !important;
              }
              
              &.el-tag--success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
                border: 1px solid #10b981 !important;
                color: #ffffff !important;
              }
              
              &.el-tag--info {
                background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
                border: 1px solid #6b7280 !important;
                color: #ffffff !important;
              }
            }
            
            // 增强的状态标签
            .enhanced-status-tag {
              font-weight: 600 !important;
              letter-spacing: 0.2px !important;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15) !important;
              border-radius: 6px !important;
              min-width: 65px;
              text-align: center;
              
              &.el-tag--success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
                border: 1px solid #10b981 !important;
                color: #ffffff !important;
              }
              
              &.el-tag--warning {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
                border: 1px solid #f59e0b !important;
                color: #ffffff !important;
              }
              
              &.el-tag--danger {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
                border: 1px solid #ef4444 !important;
                color: #ffffff !important;
              }
            }
            
            // 增强的价格显示
            .price-display-enhanced {
              font-weight: 700;
              color: #dc2626;
              font-size: 15px;
              background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
              padding: 4px 12px;
              border-radius: 8px;
              border: 1px solid #fecaca;
              display: inline-block;
              min-width: 70px;
              text-align: center;
              box-shadow: 0 2px 4px rgba(220, 38, 38, 0.15);
            }
            
            // 操作按钮居中
            .table-actions-centered {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 8px;
              
              .action-button {
                font-size: 12px;
                padding: 4px 8px;
                font-weight: 500;
                border-radius: 4px;
                transition: all 0.2s ease;
                
                &:hover {
                  transform: translateY(-1px);
                }
              }
            }
          }
        }
        
                  .text-gray {
            color: var(--art-text-gray-500);
          }
          
        .pagination-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
          padding: 20px 24px;
          background: rgba(var(--art-hoverColor), 0.2);
          border-top: 1px solid var(--art-border-color);
          
          .pagination-info {
            .pagination-text {
              font-size: 14px;
              color: var(--art-text-gray-600);
              font-weight: 500;
            }
          }
          
          .pagination-control {
            :deep(.el-pagination) {
              .el-pager {
                li {
                  border-radius: 8px;
                  margin: 0 2px;
                  color: var(--art-text-gray-600);
                  font-weight: 500;
                  transition: all 0.3s ease;
                  
                  &.is-active {
                    background: linear-gradient(135deg, rgb(var(--art-primary)) 0%, rgba(var(--art-primary), 0.8) 100%);
                    color: white;
                    box-shadow: 0 2px 6px rgba(var(--art-primary), 0.3);
                  }
                  
                  &:hover:not(.is-active) {
                    background: rgba(var(--art-hoverColor), 0.6);
                    color: rgb(var(--art-primary));
                  }
                }
              }
              
              .btn-prev,
              .btn-next {
                border-radius: 8px;
                background: var(--art-main-bg-color);
                border: 1px solid var(--art-border-color);
                color: var(--art-text-gray-600);
                font-weight: 500;
                transition: all 0.3s ease;
                
                &:hover {
                  background: rgba(var(--art-hoverColor), 0.5);
                  border-color: rgb(var(--art-primary));
                  color: rgb(var(--art-primary));
                }
                
                &:disabled {
                  background: rgba(var(--art-hoverColor), 0.3);
                  border-color: var(--art-gray-300);
                  color: var(--art-text-gray-400);
                }
              }
              
              .el-select {
                .el-input__wrapper {
                  border-radius: 8px;
                  border: 1px solid var(--art-border-color);
                  transition: all 0.3s ease;
                  
                  &:hover {
                    border-color: rgb(var(--art-primary));
                  }
                }
              }
              
              .el-input {
                .el-input__wrapper {
                  border-radius: 8px;
                  border: 1px solid var(--art-border-color);
                  transition: all 0.3s ease;
                  
                  &:hover {
                    border-color: rgb(var(--art-primary));
                  }
                  
                  &.is-focus {
                    border-color: rgb(var(--art-primary));
                    box-shadow: 0 0 0 2px rgba(var(--art-primary), 0.15);
                  }
                }
              }
            }
          }
          
          @media (max-width: 768px) {
            flex-direction: column;
            gap: 16px;
            
            .pagination-info {
              text-align: center;
            }
          }
        }
      }
    }
  }
  
  // 移动端适配和滚动优化
  @media (max-width: 768px) {
    .product-list-page {
      padding: 12px;
    }
    
    .header-card {
      margin-bottom: 16px;
      
      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
        
        .header-left {
          text-align: center;
          
          h3 {
            font-size: 24px;
          }
          
          p {
            font-size: 14px;
          }
        }
        
        .header-right {
          display: flex;
          justify-content: center;
        }
      }
    }
    
    .main-content {
      flex-direction: column;
      min-height: auto;
      
      .category-sidebar {
        width: 100%;
        max-height: 400px;
        position: relative;
        top: 0;
        margin-bottom: 20px;
      }
      
      .product-content {
        width: 100%;
      }
    }
  }
  
  // 确保全局滚动正常
  :deep(.layout-content) {
    overflow: visible !important;
    min-height: auto !important;
  }
  
  :deep(.art-page-view) {
    overflow: visible !important;
    min-height: auto !important;
  }
  
  // 确保头部区域可见
  :deep(.art-full-height) {
    height: auto !important;
    min-height: auto !important;
  }
  
  // 调试：确保头部卡片可见
  .header-card {
    visibility: visible !important;
    opacity: 1 !important;
    display: block !important;
    
    // 添加背景色确保可见
    background-color: #ffffff !important;
    border: 1px solid #e5e7eb !important;
  }
}

// 全局下拉选项样式
:deep(.el-select-dropdown) {
  border-radius: 12px;
  border: 1px solid var(--art-border-color);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  
  .el-select-dropdown__item {
    padding: 12px 16px;
    font-size: 14px;
    color: var(--art-text-gray-700);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    
    &:hover {
      background: rgba(var(--art-hoverColor), 0.6);
      color: rgb(var(--art-primary));
    }
    
    &.is-selected {
      background: rgba(var(--art-bg-primary), 0.8);
      color: rgb(var(--art-primary));
      font-weight: 500;
    }
    
    .el-icon {
      margin-right: 8px;
      font-size: 16px;
    }
  }
}

// 修复下拉菜单样式和z-index问题
:deep(.el-dropdown-menu) {
  border-radius: 12px;
  border: 1px solid var(--art-border-color);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  background: var(--art-main-bg-color);
  z-index: 9999 !important;
  overflow: hidden;
  
  .el-dropdown-menu__item {
    padding: 12px 16px;
    font-size: 14px;
    color: var(--art-text-gray-700);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    background: var(--art-main-bg-color);
    
    &:hover {
      background: rgba(var(--art-hoverColor), 0.6);
      color: rgb(var(--art-primary));
    }
    
    &:focus {
      background: rgba(var(--art-hoverColor), 0.6);
      color: rgb(var(--art-primary));
    }
    
    &.is-divided {
      border-top: 1px solid var(--art-border-color);
    }
    
    .el-icon {
      margin-right: 8px;
      font-size: 16px;
    }
  }
}

// 动画效果
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.children-list {
  animation: slideInDown 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.category-item {
  &.active {
    animation: pulse 2s infinite;
  }
  
  &:nth-child(odd) {
    animation: fadeInUp 0.6s ease-out;
  }
  
  &:nth-child(even) {
    animation: fadeInUp 0.6s ease-out 0.1s both;
  }
}

// 拖拽时的全局样式
.dragging-active .category-item:not(.dragging) {
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
}

// 简化的排序下拉菜单样式
:deep(.el-dropdown__popper) {
  &:has(.compact-sort-dropdown) {
    border: none !important;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12) !important;
    border-radius: 12px !important;
    overflow: hidden !important;
    backdrop-filter: blur(10px) !important;
    background: rgba(255, 255, 255, 0.98) !important;
    padding: 0 !important;
    
    .el-dropdown-menu {
      border: none !important;
      box-shadow: none !important;
      border-radius: 12px !important;
      background: transparent !important;
      padding: 0 !important;
    }
  }
}

.compact-sort-dropdown {
  width: 280px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 12px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  
  .sort-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    
    .el-icon {
      font-size: 16px;
    }
  }
  
  .sort-options {
    padding: 8px 0;
    
    .sort-option {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      
      &:hover {
        background: linear-gradient(90deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
        transform: translateX(2px);
        
        &::before {
          opacity: 1;
          transform: scaleY(1);
        }
      }
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%) scaleY(0);
        width: 3px;
        height: 70%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 0 2px 2px 0;
        opacity: 0;
        transition: all 0.3s ease;
      }
      
      .option-icon {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        border: 1px solid rgba(0, 0, 0, 0.06);
        
        .el-icon {
          font-size: 14px;
          color: #6b7280;
        }
      }
      
      .option-content {
        flex: 1;
        
        .option-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 2px;
          line-height: 1.2;
        }
        
        .option-desc {
          display: block;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.2;
        }
      }
      
      .option-status {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .el-icon {
          font-size: 16px;
          color: #667eea;
          transition: all 0.2s ease;
        }
      }
      
      // 选中状态的特殊样式
      &:has(.option-status .el-icon) {
        background: linear-gradient(90deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%);
        
        .option-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          
          .el-icon {
            color: white;
          }
        }
        
        .option-label {
          color: #667eea;
        }
        
        &::before {
          opacity: 1;
          transform: scaleY(1);
        }
      }
    }
  }
}

// 深色主题适配
:root.dark {
  .compact-sort-dropdown {
    background: linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.95) 100%);
    
    .sort-options {
      .sort-option {
        &:hover {
          background: linear-gradient(90deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
        }
        
        .option-icon {
          background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
          border-color: rgba(255, 255, 255, 0.1);
          
          .el-icon {
            color: #9ca3af;
          }
        }
        
        .option-content {
          .option-label {
            color: #f9fafb;
          }
          
          .option-desc {
            color: #9ca3af;
          }
        }
        
        &:has(.option-status .el-icon) {
          background: linear-gradient(90deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
          
          .option-icon {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            
            .el-icon {
              color: white;
            }
          }
          
          .option-label {
            color: #a78bfa;
          }
        }
      }
    }
  }
}

// 动画效果
@keyframes checkmark-bounce {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

// 下拉菜单出现动画
:deep(.el-dropdown__popper) {
  &:has(.modern-sort-dropdown) {
    animation: dropdown-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@keyframes dropdown-slide-in {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style> 
