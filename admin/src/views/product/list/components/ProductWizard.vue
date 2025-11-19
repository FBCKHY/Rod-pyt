<!-- 三步骤产品创建向导 -->
<template>
  <ElDialog
    v-model="visible"
    :title="isEdit ? '编辑产品' : '新增产品'"
    :width="900"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 步骤指示器 -->
    <ElSteps :active="currentStep" finish-status="success" align-center class="wizard-steps">
      <ElStep title="制作产品卡片" description="设计产品在列表页的展示样式" />
      <ElStep title="上传详情页文件" description="上传产品详情页的HTML、CSS、JS文件" />
      <ElStep title="配置产品信息" description="设置产品分类、标签和推广位置" />
    </ElSteps>

    <!-- 步骤内容 -->
    <div class="wizard-content">
      <!-- 第一步：制作产品卡片 -->
      <div v-show="currentStep === 0" class="step-content">
        <ElCard shadow="never" class="card-maker">
          <template #header>
            <div class="card-maker-header">
              <span>产品卡片制作</span>
              <ElTooltip content="产品卡片将显示在网站首页、分类页等产品列表中">
                <ElIcon><QuestionFilled /></ElIcon>
              </ElTooltip>
            </div>
          </template>

          <div class="card-maker-body">
            <!-- 左侧：表单 -->
            <div class="form-section">
              <ElForm :model="cardForm" :rules="cardRules" ref="cardFormRef" label-width="100px">
                <ElFormItem label="产品名称" prop="name">
                  <ElInput 
                    v-model="cardForm.name" 
                    placeholder="请输入产品名称"
                    @input="updateCardPreview"
                  />
                </ElFormItem>
                
                <ElFormItem label="产品型号" prop="model">
                  <ElInput 
                    v-model="cardForm.model" 
                    placeholder="请输入产品型号"
                    @input="updateCardPreview"
                  />
                </ElFormItem>
                
                <ElFormItem label="产品价格" prop="price">
                  <ElInputNumber 
                    v-model="cardForm.price" 
                    :min="0" 
                    :precision="2"
                    placeholder="0.00"
                    @change="updateCardPreview"
                  />
                  <span class="form-tip">元</span>
                </ElFormItem>
                
                <ElFormItem label="卡片主图" prop="cardImage">
                  <ElUpload
                    class="card-image-uploader"
                    action="#"
                    :show-file-list="false"
                    :before-upload="beforeUpload"
                    :http-request="handleImageUpload"
                    accept="image/jpeg,image/png,image/webp"
                  >
                    <img v-if="cardForm.cardImage" :src="displayCardImage" class="card-image" />
                    <ElIcon v-else class="card-image-uploader-icon"><Plus /></ElIcon>
                  </ElUpload>
                  <div class="form-tip">建议尺寸：300x300像素，支持JPG、PNG格式</div>
                </ElFormItem>
                
                <ElFormItem label="产品标签" prop="tag">
                  <ElSelect 
                    v-model="cardForm.tag" 
                    placeholder="请选择产品标签"
                    @change="updateCardPreview"
                    clearable
                  >
                    <ElOption label="热销" value="热销" />
                    <ElOption label="新品" value="新品" />
                    <ElOption label="特价" value="特价" />
                    <ElOption label="推荐" value="推荐" />
                  </ElSelect>
                </ElFormItem>
                
                <ElFormItem label="产品特性" prop="features">
                  <div class="features-input">
                    <div
                      v-for="(feature, index) in cardForm.features"
                      :key="index"
                      class="feature-row"
                    >
                      <ElSelect 
                        v-model="cardForm.features[index].icon"
                        placeholder="选择图标"
                        @change="updateCardPreview"
                        style="width: 120px; margin-right: 8px;"
                      >
                        <ElOption label="✓ 对勾" value="fas fa-check" />
                        <ElOption label="★ 星形" value="fas fa-star" />
                        <ElOption label="❤ 爱心" value="fas fa-heart" />
                        <ElOption label="⚡ 闪电" value="fas fa-bolt" />
                        <ElOption label="🔒 安全" value="fas fa-shield-alt" />
                        <ElOption label="🎯 目标" value="fas fa-bullseye" />
                        <ElOption label="💎 钻石" value="fas fa-gem" />
                        <ElOption label="🚀 火箭" value="fas fa-rocket" />
                      </ElSelect>
                      <ElInput
                        v-model="cardForm.features[index].text"
                        placeholder="请输入产品特性"
                        @input="updateCardPreview"
                        style="flex: 1;"
                      >
                        <template #append>
                          <ElButton @click="removeFeature(index)" :icon="Minus" />
                        </template>
                      </ElInput>
                    </div>
                    <ElButton @click="addFeature" :icon="Plus" type="primary" link>
                      添加特性
                    </ElButton>
                  </div>
                </ElFormItem>
                
                <ElFormItem label="销售数量" prop="sales">
                  <ElInputNumber 
                    v-model="cardForm.sales" 
                    :min="0" 
                    placeholder="0"
                    @change="updateCardPreview"
                  />
                  <span class="form-tip">件</span>
                </ElFormItem>
              </ElForm>
            </div>

            <!-- 右侧：卡片预览 -->
            <div class="preview-section">
              <div class="preview-title">实时预览</div>
              <div class="card-preview" id="product-card-preview">
                <a href="#" class="product-card-link" @click.prevent>
                  <div class="product-card">
                    <div class="product-tag" v-if="cardForm.tag">{{ cardForm.tag }}</div>
                    <div class="product-image">
                      <img 
                        v-if="cardForm.cardImage" 
                        :src="displayCardImage" 
                        :alt="cardForm.name || '产品图片'"
                        loading="eager"
                      />
                      <div v-else class="placeholder-image">
                        <ElIcon><Picture /></ElIcon>
                        <span>暂无图片</span>
                      </div>
                    </div>
                    <div class="product-content">
                      <h3 class="product-name">{{ cardForm.name || '产品名称' }}</h3>
                      <h4 class="product-model">{{ cardForm.model || '产品型号' }}</h4>
                      <ul class="product-features">
                        <li v-for="(feature, index) in cardForm.features" :key="index">
                          <i :class="feature.icon"></i>
                          <span>{{ feature.text }}</span>
                        </li>
                        <li v-if="!cardForm.features || cardForm.features.length === 0">
                          <i class="fas fa-check"></i>
                          <span>产品特性待添加</span>
                        </li>
                      </ul>
                      <div class="product-details-footer">
                        <div class="product-price-container">
                          <span class="product-price">{{ (cardForm.price || 0) % 1 === 0 ? (cardForm.price || 0).toFixed(0) : (cardForm.price || 0).toFixed(2) }}</span>
                          <span class="product-sales">已售 {{ cardForm.sales || 0 }}</span>
                        </div>
                        <button class="btn-details">查看详情</button>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </ElCard>
      </div>

      <!-- 第二步：上传详情页文件 -->
      <div v-show="currentStep === 1" class="step-content">
        <ElCard shadow="never" class="file-uploader">
          <template #header>
            <div class="uploader-header">
              <span>上传产品详情页文件</span>
              <ElTooltip content="需要上传包含index.html、style.css、script.js的完整产品详情页">
                <ElIcon><QuestionFilled /></ElIcon>
              </ElTooltip>
            </div>
          </template>

          <div class="uploader-body">
            <!-- 文件要求说明 -->
            <ElAlert
              title="文件上传要求"
              type="info"
              :closable="false"
              show-icon
              class="upload-requirements"
            >
              <template #default>
                <ul>
                  <li>请上传一个完整的产品详情“文件夹”：</li>
                  <li>根目录需包含且仅包含 1 个 <code>*.html</code> 文件</li>
                  <li>必须包含子目录：<code>图片/</code> 与 <code>样式逻辑/</code></li>
                  <li><code>样式逻辑/</code> 内必须且仅有 1 个 <code>.css</code> 与 1 个 <code>.js</code>（直接位于该文件夹）</li>
                  <li>产品型号以第一步填写为准，与文件夹名无关</li>
                </ul>
              </template>
            </ElAlert>

            <!-- 目录拖拽/选择 文件夹 -->
            <div class="directory-drop-zone" @dragover.prevent.capture @drop.prevent.capture.stop="handleDirectoryDrop">
              <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
              <div class="el-upload__text">将整个文件夹拖到此处，或点击下方按钮选择文件夹</div>
              <div class="el-upload__tip">文件夹需包含：根目录HTML、子目录“图片/”、子目录“样式逻辑/”(1CSS+1JS)</div>
              <ElButton type="primary" plain style="margin-top: 12px" @click="triggerFolderSelect">从文件夹选择</ElButton>
              <input ref="folderInputRef" type="file" webkitdirectory directory multiple style="display:none" @change="handleFolderSelect" />
            </div>

            <!-- 文件夹结构校验状态 -->
            <div class="file-validation" v-if="folderFiles.length > 0">
              <div class="validation-title">文件夹结构校验：</div>
              <div class="validation-list">
                <div class="validation-item" :class="folderStats.rootHtmlCount === 1 ? 'validation-success' : 'validation-error'">
                  <ElIcon>
                    <Check v-if="folderStats.rootHtmlCount === 1" />
                    <Close v-else />
                  </ElIcon>
                  <span>根目录 HTML 文件（1个）</span>
                  <span class="status-text">{{ folderStats.rootHtmlCount }}/1</span>
                </div>
                <div class="validation-item" :class="folderStats.cssCount === 1 ? 'validation-success' : 'validation-error'">
                  <ElIcon>
                    <Check v-if="folderStats.cssCount === 1" />
                    <Close v-else />
                  </ElIcon>
                  <span>样式逻辑/ 内 CSS（1个）</span>
                  <span class="status-text">{{ folderStats.cssCount }}/1</span>
                </div>
                <div class="validation-item" :class="folderStats.jsCount === 1 ? 'validation-success' : 'validation-error'">
                  <ElIcon>
                    <Check v-if="folderStats.jsCount === 1" />
                    <Close v-else />
                  </ElIcon>
                  <span>样式逻辑/ 内 JS（1个）</span>
                  <span class="status-text">{{ folderStats.jsCount }}/1</span>
                </div>
                <div class="validation-item" :class="folderStats.hasImages ? 'validation-success' : 'validation-error'">
                  <ElIcon>
                    <Check v-if="folderStats.hasImages" />
                    <Close v-else />
                  </ElIcon>
                  <span>图片/ 子文件夹</span>
                  <span class="status-text">{{ folderStats.hasImages ? '已检测' : '未检测' }}</span>
                </div>
              </div>
            </div>

            <!-- 已上传文件（编辑模式） -->
            <ElCard v-if="isEdit && productFiles.files && productFiles.files.length" class="uploaded-files" shadow="never">
              <template #header>
                <span>已上传的详情页文件</span>
                <div style="margin-left:auto; display:inline-flex; gap:8px; align-items:center">
                  <ElButton type="primary" link size="small" @click="refreshProductFiles">刷新</ElButton>
                  <ElButton type="success" link size="small" @click="previewMainDetailPage">预览详情页面</ElButton>
                </div>
              </template>
              <ul>
                <li v-for="f in productFiles.files" :key="f" class="uploaded-file-item">
                  <ElIcon style="margin-right:6px"><Document /></ElIcon>
                  <span class="file-link" @click="onFileClick(f)">{{ f }}</span>
                  <ElButton v-if="isCodeFile(f)" link size="small" @click="viewCode(f)">查看代码</ElButton>
                  <ElButton link size="small" @click="openFile(f)">预览</ElButton>
                  <ElButton link size="small" @click="downloadFile(f)">下载</ElButton>
                </li>
              </ul>
            </ElCard>
          </div>
        </ElCard>
      </div>

      <!-- 第三步：配置产品信息 -->
      <div v-show="currentStep === 2" class="step-content">
        <ElCard shadow="never" class="product-config">
          <template #header>
            <span>配置产品基础信息</span>
          </template>

          <ElForm :model="configForm" :rules="configRules" ref="configFormRef" label-width="120px">
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="产品分类" prop="categoryId">
                  <ElCascader
                    v-model="categoryPath"
                    :options="categoryOptions"
                    :props="{ checkStrictly: true, emitPath: true, expandTrigger: 'hover' }"
                    placeholder="请选择父分类 / 子分类"
                    clearable
                    style="width: 100%"
                    @change="onCategoryPathChange"
                  />
                </ElFormItem>
              </ElCol>
              
              <ElCol :span="12">
                <ElFormItem label="推广位置" prop="promoPosition">
                  <ElSelect 
                    v-model="configForm.promoPosition" 
                    placeholder="请选择推广位置"
                    style="width: 100%"
                  >
                    <ElOption label="首页Banner位" value="homepage_banner" />
                    <ElOption label="分类页置顶" value="category_top" />
                    <ElOption label="首页推荐" value="homepage_recommend" />
                    <ElOption label="不参与推广" value="none" />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElFormItem label="产品标签" prop="tags">
              <div class="form-tip">标签已在第一步选择，无需再次设置</div>
            </ElFormItem>

            <ElFormItem label="产品状态" prop="status">
              <ElRadioGroup v-model="configForm.status">
                <ElRadio value="draft">草稿（暂不发布）</ElRadio>
                <ElRadio value="active">立即发布</ElRadio>
              </ElRadioGroup>
            </ElFormItem>

            <ElFormItem label="排序权重" prop="sortOrder">
              <ElInputNumber 
                v-model="configForm.sortOrder" 
                :min="0" 
                :max="9999"
                placeholder="0"
              />
              <div class="form-tip">数字越大排序越靠前，默认为0</div>
            </ElFormItem>
          </ElForm>
        </ElCard>

        <!-- 已配置信息（编辑模式预览） -->
        <ElCard v-if="isEdit" shadow="never" style="margin-top:12px">
          <template #header>
            <span>已配置信息预览</span>
          </template>
          <ul>
            <li>标签：{{ cardForm.tag || '—' }}</li>
            <li>销售数量：{{ cardForm.sales }}</li>
            <li>特性：
              <ul style="margin-top:4px">
                <li v-for="(ft, i) in cardForm.features" :key="i">
                  <i :class="ft.icon" style="margin-right:6px"></i>{{ ft.text }}
                </li>
              </ul>
            </li>
            <li>分类：{{ displayCategoryName }}</li>
            <li>推广：{{ configForm.promoPosition }}</li>
            <li>状态：{{ configForm.status }}</li>
            <li>排序权重：{{ configForm.sortOrder }}</li>
          </ul>
        </ElCard>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="wizard-footer">
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton v-if="currentStep > 0" @click="prevStep">上一步</ElButton>
        <ElButton 
          v-if="currentStep < 2" 
          type="primary" 
          @click="nextStep"
          :loading="isValidating"
          :disabled="isUploadingImage"
        >
          下一步
        </ElButton>
        <ElButton 
          v-else 
          type="primary" 
          @click="handleSubmit"
          :loading="isSubmitting"
          :disabled="isUploadingImage"
        >
          创建产品
        </ElButton>
      </div>
    </template>
  </ElDialog>

  <!-- 追加：代码预览弹窗 -->
  <ElDialog v-model="codePreview.visible" :title="`查看代码 - ${codePreview.filename}`" width="70%">
    <div class="code-viewer">
      <pre><code>{{ codePreview.content }}</code></pre>
    </div>
    <template #footer>
      <ElButton @click="codePreview.visible = false">关闭</ElButton>
      <ElButton type="primary" @click="downloadFile(codePreview.filename)">下载此文件</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/http'
import {
  Plus,
  Minus,
  QuestionFilled,
  UploadFilled,
  Check,
  Close,
  Picture,
  Document
} from '@element-plus/icons-vue'
import type { CascaderOption } from 'element-plus'

// Props 和 Emits
interface EditProductItem {
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

interface Props {
  modelValue: boolean
  product?: EditProductItem | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 类型定义
interface CategoryItem {
  id: number
  name: string
  children?: CategoryItem[] // 用于树形结构
}

interface TagItem {
  id: number
  name: string
  color: string
}

interface UploadFile {
  name: string
  raw?: File
}

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.product?.id)

const currentStep = ref(0)
const isValidating = ref(false)
const isSubmitting = ref(false)
const isUploadingImage = ref(false)

// 第一步：卡片制作表单
const cardFormRef = ref()
const cardForm = reactive({
  name: '',
  model: '',
  price: 0,
  cardImage: '',
  tag: '',
  features: [
    { icon: 'fas fa-check', text: '高品质材料' },
    { icon: 'fas fa-bolt', text: '节能环保' },
    { icon: 'fas fa-heart', text: '智能控制' }
  ],
  sales: 0
})

const cardRules = {
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  model: [{ required: true, message: '请输入产品型号', trigger: 'blur' }],
  price: [{ required: true, message: '请输入产品价格', trigger: 'blur' }],
  cardImage: [{ required: true, message: '请上传产品主图', trigger: 'change' }]
}

// 第二步：文件上传
const uploadedFiles = ref<any[]>([])
const requiredFiles = ['index.html', 'style.css', 'script.js']

// 文件夹上传（主）
const folderInputRef = ref<HTMLInputElement | null>(null)
const folderFiles = ref<any[]>([])
const folderStats = reactive({
  baseRoot: '',
  hasImages: false,
  cssCount: 0,
  jsCount: 0,
  rootHtmlCount: 0
})
const isFolderValid = computed(() => folderStats.hasImages && folderStats.cssCount === 1 && folderStats.jsCount === 1 && folderStats.rootHtmlCount === 1)

const getBaseRootByPaths = (paths: string[]): string => {
  if (!paths.length) return ''
  const parts = paths[0].split('/')
  if (parts[0] === '@' && parts.length >= 2) return `${parts[0]}/${parts[1]}`
  return parts[0]
}

const triggerFolderSelect = () => {
  folderInputRef.value?.click()
}

const handleFolderSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  const files = Array.from(input.files)
  validateAndSetFolder(files)
}

const handleDirectoryDrop = async (e: DragEvent) => {
  const items = e.dataTransfer?.items
  if (!items || items.length === 0) return

  const collected: File[] = []

  const traverseEntry = async (entry: any, prefix = ''): Promise<void> => {
    if (!entry) return
    if (entry.isFile) {
      await new Promise<void>((resolve) => {
        entry.file((file: File) => {
          ;(file as any).webkitRelativePath = prefix + entry.name
          collected.push(file)
          resolve()
        })
      })
    } else if (entry.isDirectory) {
      const reader = entry.createReader()
      await new Promise<void>((resolve) => {
        reader.readEntries(async (entries: any[]) => {
          for (const ent of entries) {
            await traverseEntry(ent, prefix + entry.name + '/')
          }
          resolve()
        })
      })
    }
  }

  for (let i = 0; i < items.length; i++) {
    const item: any = items[i]
    const entry = item.webkitGetAsEntry?.()
    if (entry) {
      await traverseEntry(entry, '')
    }
  }

  validateAndSetFolder(collected)
}

const validateAndSetFolder = (files: File[]) => {
  const paths = files.map(f => ((f as any).webkitRelativePath || f.name).replace(/\\/g, '/'))
  const baseRoot = getBaseRootByPaths(paths)
  const rootLen = baseRoot ? baseRoot.split('/').length : 0

  // 统计
  const hasImages = paths.some(p => p.startsWith(`${baseRoot}/图片/`))
  const styleLogic = paths.filter(p => p.startsWith(`${baseRoot}/样式逻辑/`))
  const immediate = styleLogic.filter(p => p.split('/').length === rootLen + 2)
  const cssCount = immediate.filter(p => p.toLowerCase().endsWith('.css')).length
  const jsCount = immediate.filter(p => p.toLowerCase().endsWith('.js')).length
  const rootHtmlCount = paths.filter(p => p.split('/').length === rootLen + 1 && p.toLowerCase().endsWith('.html')).length

  folderStats.baseRoot = baseRoot
  folderStats.hasImages = hasImages
  folderStats.cssCount = cssCount
  folderStats.jsCount = jsCount
  folderStats.rootHtmlCount = rootHtmlCount

  // 保存文件列表（保持相对路径）
  folderFiles.value = files.map(f => ({
    name: f.name,
    file: f,
    relativePath: ((f as any).webkitRelativePath || f.name).replace(/\\/g, '/')
  }))
}

// 第三步：配置表单
const configFormRef = ref()
const configForm = reactive({
  categoryId: undefined as number | undefined,
  promoPosition: 'none',
  status: 'draft',
  sortOrder: 0
})

const configRules = {
  categoryId: [{ required: true, message: '请选择产品分类', trigger: 'change' }]
}

// 动态分类
const categories = ref<CategoryItem[]>([])
const categoryOptions = ref<CascaderOption[]>([])
const categoryPath = ref<number[]>([])

// 加载树形分类（含层级）
async function loadCategoriesTree() {
  try {
    const res = await request.get<any>({ url: '/product-categories', params: { includeProducts: 'true' } })
    const data = (res?.data || []) as CategoryItem[]
    categories.value = data
    categoryOptions.value = mapToCascaderOptions(data)
    // 若已有选中分类，回填路径
    if (configForm.categoryId) {
      const p = findCategoryPathById(configForm.categoryId, data)
      categoryPath.value = p || []
      // 若排序为0则立即填充
      if (!isEdit.value && (!configForm.sortOrder || Number(configForm.sortOrder) === 0)) {
        const node: any = findCategoryById(configForm.categoryId, data)
        if (node && typeof node.productCount === 'number') {
          const next = Number(node.productCount) + 1
          configForm.sortOrder = Number.isFinite(next) ? next : 1
        } else {
          autoFillSortOrderForCategory(configForm.categoryId)
        }
      }
    } else {
      categoryPath.value = []
    }
  } catch {}
}

function mapToCascaderOptions(list: CategoryItem[] | undefined): CascaderOption[] {
  if (!list || list.length === 0) return []
  return list.map((c) => {
    const children = mapToCascaderOptions(c.children)
    const option: any = {
      label: c.name,
      value: c.id,
    }
    if (children.length > 0) option.children = children
    return option as CascaderOption
  })
}

function findCategoryPathById(id: number, list: CategoryItem[], path: number[] = []): number[] | null {
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

function findCategoryById(id: number | undefined, list: CategoryItem[]): CategoryItem | null {
  if (id == null) return null
  for (const node of list) {
    if (node.id === id) return node
    if (node.children && node.children.length) {
      const found = findCategoryById(id, node.children)
      if (found) return found
    }
  }
  return null
}

function onCategoryPathChange(value: any) {
  const arr = Array.isArray(value) ? value : (value != null ? [value] : [])
  if (arr.length > 0) {
    const last = arr[arr.length - 1]
    const num = typeof last === 'number' ? last : Number(last)
    configForm.categoryId = Number.isFinite(num) ? num : undefined
  } else {
    configForm.categoryId = undefined
  }
  if (!isEdit.value && configForm.categoryId != null) {
    // 先从分类树的 productCount 直接推算，立即生效
    const node: any = findCategoryById(configForm.categoryId, categories.value)
    if (node && typeof node.productCount === 'number') {
      const next = Number(node.productCount) + 1
      configForm.sortOrder = Number.isFinite(next) ? next : 1
    } else {
      autoFillSortOrderForCategory(configForm.categoryId)
    }
  }
}

watch(() => configForm.categoryId, (newId) => {
  if (!isEdit.value && newId != null && (!configForm.sortOrder || Number(configForm.sortOrder) === 0)) {
    const node: any = findCategoryById(newId as number, categories.value)
    if (node && typeof node.productCount === 'number') {
      const next = Number(node.productCount) + 1
      configForm.sortOrder = Number.isFinite(next) ? next : 1
    } else {
      autoFillSortOrderForCategory(newId as number)
    }
  }
})

async function autoFillSortOrderForCategory(categoryId: number) {
  try {
    // 取当前分类下按 sortOrder DESC 的第一条，得到最大排序
    const res = await request.get<any>({
      url: '/products',
      params: { categoryId, page: 1, limit: 1 }
    })
    const maxItem = (res?.data?.items || [])[0]
    const maxOrder = Number(maxItem?.sortOrder || 0)
    const nextOrder = (Number.isFinite(maxOrder) ? maxOrder : 0) + 1
    configForm.sortOrder = nextOrder
  } catch {
    // 失败则退化为1
    configForm.sortOrder = 1
  }
}

// 在打开对话框或进入第三步时加载分类树
watch(() => currentStep.value, (step) => {
  if (step === 2) loadCategoriesTree()
})

onMounted(() => {
  if (currentStep.value === 2) loadCategoriesTree()
})

const availableTags = ref<TagItem[]>([
  { id: 1, name: '新品', color: '#ff4d4f' },
  { id: 2, name: '热卖', color: '#52c41a' },
  { id: 3, name: '特价', color: '#faad14' },
  { id: 4, name: '推荐', color: '#1890ff' }
])
// 第三步不再设置标签，保留第一步卡片标签

// 方法
const addFeature = () => {
  cardForm.features.push({ icon: 'fas fa-check', text: '' })
  updateCardPreview()
}

const removeFeature = (index: number) => {
  if (cardForm.features.length > 1) {
    cardForm.features.splice(index, 1)
  } else {
    cardForm.features[0] = { icon: 'fas fa-check', text: '' }
  }
  updateCardPreview()
}

const updateCardPreview = async () => {
  await nextTick()
  // Vue的响应式模板会自动更新预览内容
}

const beforeUpload = (file: File) => {
  const isSupported = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
  if (!isSupported) {
    ElMessage.error('仅支持 JPG/PNG/WebP 格式')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const handleImageUpload = async (options: any) => {
  const file = options.file as File
  const form = new FormData()
  form.append('image', file)
  isUploadingImage.value = true
  // 先用本地预览占位，提升感知
  try {
    const blobUrl = URL.createObjectURL(file)
    setPreviewImage(blobUrl)
  } catch {}
  try {
    const res: any = await request.request({
      url: '/products/card-image',
      method: 'POST',
      data: form
    })
    const url = res?.data?.url
    if (url) {
      const serverUrlAbs = toAbsoluteUrl(url)
      const ok = await preloadImage(serverUrlAbs)
      if (ok) {
        setPreviewImage(serverUrlAbs)
        options?.onSuccess && options.onSuccess({ url }, file)
      } else {
        ElMessage.error('图片保存成功，但加载失败，请稍后重试')
        options?.onError && options.onError(new Error('image load failed'))
      }
    } else {
      ElMessage.error('图片上传失败')
      options?.onError && options.onError(new Error('invalid response'))
    }
  } catch (e) {
    ElMessage.error('图片上传失败')
    options?.onError && options.onError(e)
  } finally {
    isUploadingImage.value = false
  }
}

const beforeFileUpload = (file: File) => {
  // 检查文件名是否符合要求
  if (!requiredFiles.includes(file.name)) {
    ElMessage.error(`文件名不符合要求，只允许上传: ${requiredFiles.join(', ')}`)
    return false
  }
  
  // 检查是否已经上传过同名文件
  const exists = uploadedFiles.value.some(f => f.name === file.name)
  if (exists) {
    ElMessage.warning(`文件 ${file.name} 已存在，将替换原文件`)
    // 移除原文件
    uploadedFiles.value = uploadedFiles.value.filter(f => f.name !== file.name)
  }
  
  return true
}

const handleFileUpload = (options: any) => {
  const file = options.file
  uploadedFiles.value.push({
    name: file.name,
    raw: file
  })
  return Promise.resolve()
}

const handleFileRemove = (file: UploadFile) => {
  uploadedFiles.value = uploadedFiles.value.filter(f => f.name !== file.name)
}

const isFileUploaded = (fileName: string) => {
  return uploadedFiles.value.some(f => f.name === fileName)
}

const getFileValidationClass = (fileName: string) => {
  return isFileUploaded(fileName) ? 'validation-success' : 'validation-error'
}

const isAllFilesUploaded = computed(() => {
  return requiredFiles.every(fileName => isFileUploaded(fileName))
})

const nextStep = async () => {
  isValidating.value = true
  
  try {
    if (currentStep.value === 0) {
      // 验证第一步表单
      await cardFormRef.value?.validate()
    } else if (currentStep.value === 1) {
      // 验证第二步：文件夹结构；若编辑且已有文件列表，则允许跳过重新上传
      const canSkip = isEdit.value && productFiles.files && productFiles.files.length > 0
      if (!isFolderValid.value && !canSkip) {
        ElMessage.error('请上传包含根HTML、图片/、样式逻辑/(1CSS+1JS)的完整文件夹，或使用已上传的文件')
        return
      }
    }
    
    currentStep.value++
  } catch (error) {
    // 表单验证失败
  } finally {
    isValidating.value = false
  }
}

const prevStep = () => {
  currentStep.value--
}

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    // 验证第三步表单
    await configFormRef.value?.validate()

    // 禁止在图片仍为本地预览(Blob)时提交
    if (cardForm.cardImage && cardForm.cardImage.startsWith('blob:')) {
      ElMessage.error('图片仍在上传或未保存，请稍候或重新上传')
      isSubmitting.value = false
      return
    }
    
    // 1) 创建/更新产品：包含卡片制作与配置信息（包含型号model）
    const createPayload: any = {
      name: cardForm.name,
      model: cardForm.model,
      price: cardForm.price,
      cardImage: cardForm.cardImage,
      tag: cardForm.tag,
      features: JSON.parse(JSON.stringify(cardForm.features || [])),
      sales: cardForm.sales,
      categoryId: configForm.categoryId,
      promoPosition: configForm.promoPosition,
      status: configForm.status,
      sortOrder: configForm.sortOrder
    }
    let productId: number | undefined
    if (isEdit.value && props.product) {
      const updateRes = await request.put<any>({ url: `/products/${props.product.id}`, data: createPayload })
      const updated = (updateRes as any)?.data
      productId = updated?.id || props.product.id
    } else {
      const createRes = await request.post<any>({ url: '/products', data: createPayload })
      const created = (createRes as any)?.data
      productId = created?.id
    }
    if (!productId) {
      ElMessage.error('创建产品失败：未返回ID')
      return
    }

    // 2) 上传文件夹：将所有文件通过FormData发往 /api/products/{id}/files，并携带relativePaths[]
    if (folderFiles.value.length > 0) {
      const formData = new FormData()
      for (const f of folderFiles.value) {
        formData.append('files', f.file)
        formData.append('relativePaths[]', f.relativePath)
      }
      await request.request({
        url: `/products/${productId}/files`,
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
    
    ElMessage.success(isEdit.value ? '产品更新成功' : '产品创建成功')
    emit('success')
    handleClose()
  } catch (error) {
    ElMessage.error(isEdit.value ? '产品更新失败' : '产品创建失败')
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  visible.value = false
  // 重置表单
  currentStep.value = 0
  Object.assign(cardForm, {
    name: '',
    model: '',
    price: 0,
    cardImage: '',
    features: [
      { icon: 'fas fa-check', text: '高品质材料' },
      { icon: 'fas fa-bolt', text: '节能环保' },
      { icon: 'fas fa-heart', text: '智能控制' }
    ]
  })
  // 重置第二步（文件夹）
  folderFiles.value = []
  folderStats.baseRoot = ''
  folderStats.hasImages = false
  folderStats.cssCount = 0
  folderStats.jsCount = 0
  folderStats.rootHtmlCount = 0

  uploadedFiles.value = []
  Object.assign(configForm, {
    categoryId: null,
    promoPosition: 'none',
    status: 'draft',
    sortOrder: 0
  })
  categoryPath.value = [] // 重置分类路径选择器
}

const prefillFromProduct = async () => {
  if (!props.product) return
  // 先用已传入的基本字段回填
  Object.assign(cardForm, {
    name: props.product.name || '',
    model: props.product.model || '',
    price: props.product.price != null ? Number(props.product.price) : 0,
    cardImage: props.product.cardImage || '',
    tag: (props.product as any).tag || '',
    features: (props.product as any).features || cardForm.features,
    sales: (props.product as any).sales != null ? Number((props.product as any).sales) : 0
  })
  Object.assign(configForm, {
    categoryId: props.product.category?.id || (props.product as any).categoryId || undefined,
    promoPosition: (props.product.promoPosition as any) || 'none',
    status: (props.product.status as any) || 'draft',
    sortOrder: ((props.product as any).sortOrder != null ? Number((props.product as any).sortOrder) : 0)
  })

  // 再请求后端详情进行深度回填（确保拿到tag、sales、features等完整信息）
  try {
    if (props.product?.id) {
      const res = await request.get<any>({ url: `/products/${props.product.id}` })
      const p = res?.data || {}
      Object.assign(cardForm, {
        name: p.name ?? cardForm.name,
        model: p.model ?? cardForm.model,
        price: p.price != null ? Number(p.price) : cardForm.price,
        cardImage: p.cardImage ?? cardForm.cardImage,
        tag: p.tag ?? cardForm.tag,
        features: Array.isArray(p.features) ? p.features : cardForm.features,
        sales: p.sales != null ? Number(p.sales) : cardForm.sales
      })
      Object.assign(configForm, {
        categoryId: p.category?.id ?? p.categoryId ?? configForm.categoryId,
        promoPosition: p.promoPosition ?? configForm.promoPosition,
        status: p.status ?? configForm.status,
        sortOrder: p.sortOrder != null ? Number(p.sortOrder) : configForm.sortOrder
      })
    }
  } catch {}

  currentStep.value = 0
  await nextTick()
  updateCardPreview()
}

const productFiles = reactive<{ filePath: string | null; files: string[] }>({ filePath: null, files: [] })
const getPublicFileUrl = (rel: string) => {
  if (!productFiles.filePath) return '#'
  const relPath = `/${productFiles.filePath}/${rel}`.replace(/\\/g, '/')
  return toAbsoluteUrl(relPath)
}
const refreshProductFiles = async () => {
  if (!props.product?.id) return
  try {
    const res = await request.get<any>({ url: `/products/${props.product.id}/files` })
    productFiles.filePath = res?.data?.filePath || null
    productFiles.files = res?.data?.files || []
  } catch {}
}

// 预览与下载文件
const openFile = (rel: string) => {
  const url = getPublicFileUrl(rel)
  if (!url || url === '#') return
  window.open(url, '_blank', 'noopener,noreferrer')
}

const downloadFile = async (rel: string) => {
  const url = getPublicFileUrl(rel)
  if (!url || url === '#') return
  try {
    const res = await fetch(url, { credentials: 'omit' })
    if (!res.ok) throw new Error('network')
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = rel.split('/').pop() || 'file'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      URL.revokeObjectURL(a.href)
      a.remove()
    }, 0)
  } catch {
    ElMessage.error('下载失败')
  }
}
const displayCategoryName = computed(() => {
  const id = configForm.categoryId
  const node = findCategoryById(id, categories.value)
  return node?.name || '未分类'
})

// 监听对话框打开，加载数据，并在编辑模式下回填
watch(visible, async (newVal) => {
  if (newVal) {
      try {
    await loadCategoriesTree()
  } catch {}

    // 打开时若传入了产品，直接回填
    if (props.product) {
      await prefillFromProduct()
      await refreshProductFiles()
    }
  }
})

// 当传入的product变化时（例如列表点不同的“编辑”），立即回填
watch(() => props.product, async (val) => {
  if (val) {
    await prefillFromProduct()
    await refreshProductFiles()
  }
})

watch(() => cardForm.name, () => {
  updateCardPreview()
})

watch(() => cardForm.model, () => {
  updateCardPreview()
})

// 生成可访问的完整URL（将 /uploads 等相对路径前缀为后端域名）
const apiBase = (import.meta as any).env?.VITE_API_URL || ''
const apiOrigin = apiBase.replace(/\/api\/?$/, '')
const toAbsoluteUrl = (u?: string) => {
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  if (u.startsWith('/')) return apiOrigin + u
  return u
}

const displayCardImage = computed(() => toAbsoluteUrl(cardForm.cardImage))

// 预加载图片，成功才切换到服务端地址
const preloadImage = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

const lastPreviewUrl = ref<string | null>(null)
const setPreviewImage = (url: string) => {
  // 释放旧的 blob 资源
  try {
    if (lastPreviewUrl.value && lastPreviewUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(lastPreviewUrl.value)
    }
  } catch {}
  lastPreviewUrl.value = url
  cardForm.cardImage = url
  updateCardPreview()
}

const codePreview = reactive({
  visible: false,
  filename: '',
  language: '',
  content: ''
})

const isCodeFile = (rel: string) => /\.(html?|css|js)$/i.test(rel)

const detectLanguage = (rel: string): string => {
  const r = rel.toLowerCase()
  if (r.endsWith('.html') || r.endsWith('.htm')) return 'html'
  if (r.endsWith('.css')) return 'css'
  if (r.endsWith('.js')) return 'javascript'
  return 'text'
}

const onFileClick = (rel: string) => {
  if (isCodeFile(rel)) {
    viewCode(rel)
  } else {
    openFile(rel)
  }
}

const viewCode = async (rel: string) => {
  const url = getPublicFileUrl(rel)
  if (!url || url === '#') return
  try {
    const res = await fetch(url, { credentials: 'omit' })
    const text = await res.text()
    codePreview.filename = rel
    codePreview.language = detectLanguage(rel)
    codePreview.content = text
    codePreview.visible = true
  } catch (e) {
    ElMessage.error('读取文件失败')
  }
}

const findMainHtml = (): string | null => {
  if (!productFiles.files || productFiles.files.length === 0) return null
  const files = productFiles.files
  const idx = files.find((f: string) => /(^|\/)index\.html$/i.test(f))
  if (idx) return idx
  const anyHtml = files.find((f: string) => /\.html?$/i.test(f))
  return anyHtml || null
}

const previewMainDetailPage = () => {
  const mainHtml = findMainHtml()
  if (!mainHtml) {
    ElMessage.error('未找到可预览的 HTML 文件')
    return
  }
  openFile(mainHtml)
}

// 已移除重复的 generateCascaderOptions，使用 mapToCascaderOptions
</script>

<style scoped lang="scss">
.wizard-steps {
  margin-bottom: 30px;
}

.wizard-content {
  min-height: 400px;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

// 第一步：卡片制作样式
.card-maker {
  .card-maker-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .card-maker-body {
    display: flex;
    gap: 30px;
    
    .form-section {
      flex: 1;
    }
    
    .preview-section {
      width: 280px;
      
      .preview-title {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 16px;
        color: #606266;
      }
      
      .card-preview {
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        padding: 16px;
        background-color: #fafafa;
        
        .product-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
          transition: all 0.3s ease;
          
          .product-card {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 14px 22px rgba(0, 0, 0, 0.10);
            transition: all 0.3s ease;
            height: 100%;
            position: relative;
            
            &:hover {
              transform: translateY(-5px);
              box-shadow: 0 18px 30px rgba(0, 0, 0, 0.18);
            }
            
            .product-tag {
              position: absolute;
              top: 15px;
              right: 15px;
              background-color: #dc3545;
              color: #ffffff;
              font-size: 12px;
              font-weight: 500;
              padding: 4px 10px;
              border-radius: 4px;
              z-index: 2;
            }
            
            .product-image {
              width: 100%;
              padding-top: 100%;
              position: relative;
              overflow: hidden;
              
              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
                position: absolute;
                top: 0;
                left: 0;
              }
              
              .placeholder-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background-color: #f5f7fa;
                color: #909399;
                
                .el-icon {
                  font-size: 24px;
                  margin-bottom: 8px;
                }
              }
            }
            
            &:hover .product-image img {
              transform: scale(1.05);
            }
            
            .product-content {
              padding: 20px;
              
              .product-name {
                display: block;
                font-size: 18px;
                font-weight: 600;
                color: #1f1f1f !important;
                margin: 0 0 8px;
                line-height: 1.4;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              
              .product-model {
                display: block;
                font-size: 14px;
                color: #7a7a7a !important;
                margin: 0 0 12px 0;
                line-height: 1.4;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              
              .product-features {
                list-style: none;
                padding: 0;
                margin: 0 0 20px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                
                li {
                  display: flex;
                  align-items: center;
                  font-size: 14px;
                  color: #6C757D;
                  
                  i {
                    width: 16px;
                    margin-right: 8px;
                    color: #074E9C;
                  }
                }
              }
              
              .product-details-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                
                .product-price-container {
                  display: flex;
                  flex-direction: column;
                  
                  .product-price {
                    font-size: 20px;
                    font-weight: 700;
                    color: #074E9C;
                    position: relative;
                    
                    &::before {
                      content: '¥';
                      font-size: 14px;
                      position: relative;
                      top: -2px;
                      margin-right: 2px;
                    }
                  }
                  
                  .product-sales {
                    font-size: 12px;
                    color: #6C757D;
                  }
                }
                
                .btn-details {
                  background-color: #074E9C;
                  color: #ffffff;
                  border: none;
                  border-radius: 4px;
                  padding: 8px 15px;
                  font-size: 14px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: background-color 0.2s ease;
                  
                  &:hover {
                    background-color: #1976D2;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

.card-image-uploader {
  .card-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 6px;
  }
  
  .card-image-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    text-align: center;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: .3s;
    
    &:hover {
      border-color: #409eff;
    }
  }
}

.features-input {
  .el-button {
    margin-top: 8px;
  }
  
  .feature-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    
    .el-select {
      flex-shrink: 0;
    }
    
    .el-input {
      flex: 1;
    }
  }
}

.form-tip {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}

// 第二步：文件上传样式
.file-uploader {
  .uploader-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .upload-requirements {
    margin-bottom: 20px;
    
    ul {
      margin: 0;
      padding-left: 20px;
      
      li {
        margin-bottom: 4px;
        
        code {
          background-color: #f5f5f5;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: Consolas, Monaco, monospace;
        }
      }
    }
  }
  
  .detail-files-uploader {
    margin-bottom: 20px;
  }

  .directory-drop-zone {
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    background-color: #f5f7fa;
    color: #909399;
    transition: border-color 0.3s ease;

    &:hover {
      border-color: #409eff;
    }
  }
  
  .file-validation {
    .validation-title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 12px;
      color: #606266;
    }
    
    .validation-list {
      .validation-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        margin-bottom: 4px;
        border-radius: 4px;
        
        &.validation-success {
          background-color: #f0f9ff;
          color: #067f46;
        }
        
        &.validation-error {
          background-color: #fef2f2;
          color: #dc2626;
        }
        
        .status-text {
          margin-left: auto;
          font-size: 12px;
        }
      }
    }
  }
}

// 第三步：配置样式
.product-config {
  .form-tip {
    display: block;
    margin-top: 4px;
    margin-left: 0;
  }
}

.wizard-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.uploaded-file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}
.file-link {
  cursor: pointer;
  color: var(--el-color-primary);
  text-decoration: underline;
}

.code-viewer {
  max-height: 70vh;
  overflow: auto;
  background: #0b1520;
  border: 1px solid #0f253d;
  border-radius: 6px;
  padding: 12px;
  pre {
    margin: 0;
    color: #e0e6ef;
    font-family: Consolas, Monaco, 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.6;
    white-space: pre;
  }
}
</style> 