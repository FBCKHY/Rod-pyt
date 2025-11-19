<!-- 分类管理对话框 -->
<template>
  <ElDialog
    v-model="visible"
    :title="isEdit ? '编辑分类' : '新增分类'"
    width="540px"
    @close="handleClose"
    :close-on-click-modal="false"
    align-center
    draggable
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="90px"
      label-position="left"
      class="category-form"
    >
      <ElFormItem label="分类名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入分类名称" />
      </ElFormItem>
      
      <ElFormItem label="父分类" prop="parentId">
        <ElSelect 
          v-model="formData.parentId" 
          placeholder="请选择父分类（可选）"
          clearable
          style="width: 100%"
        >
          <ElOption
            v-for="category in availableParents"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </ElSelect>
      </ElFormItem>
      
      <ElFormItem label="分类图标" prop="icon">
        <ElSelect 
          v-model="formData.icon" 
          placeholder="请选择图标（可选）"
          clearable
          style="width: 100%"
        >
          <ElOption
            v-for="icon in iconOptions"
            :key="icon.value"
            :label="icon.label"
            :value="icon.value"
          >
            <ElIcon style="margin-right: 8px">
              <component :is="icon.component" />
            </ElIcon>
            {{ icon.label }}
          </ElOption>
        </ElSelect>
      </ElFormItem>
      
      <ElFormItem label="分类描述" prop="description">
        <ElInput 
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入分类描述（可选）"
        />
      </ElFormItem>
      
      <ElFormItem label="排序权重" prop="sortOrder">
        <ElInputNumber 
          v-model="formData.sortOrder" 
          :min="0" 
          :max="9999"
          placeholder="0"
        />
        <span class="form-tip">数字越大排序越靠前</span>
      </ElFormItem>
      
      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="formData.status">
          <ElRadio value="active">启用</ElRadio>
          <ElRadio value="inactive">禁用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton 
        type="primary" 
        @click="handleSubmit"
        :loading="isSubmitting"
      >
        {{ isEdit ? '更新' : '创建' }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/http'
import {
  Coffee,
  Monitor,
  Tools,
  House,
  Goods,
  Box,
  ShoppingBag,
  Star
} from '@element-plus/icons-vue'

// Props 和 Emits
interface Props {
  modelValue: boolean
  category?: CategoryItem | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', categoryData?: CategoryItem): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 类型定义
interface CategoryItem {
  id: number
  name: string
  parentId?: number | undefined
  icon?: string
  description?: string
  sortOrder?: number
  status?: string
}

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.category)
const isSubmitting = ref(false)

const formRef = ref()
const formData = reactive({
  name: '',
  parentId: undefined as number | undefined,
  icon: '',
  description: '',
  sortOrder: 0,
  status: 'active'
})

const formRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '分类名称长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// 图标选项
const iconOptions = [
  { label: '咖啡', value: 'Coffee', component: Coffee },
  { label: '显示器', value: 'Monitor', component: Monitor },
  { label: '工具', value: 'Tools', component: Tools },
  { label: '房屋', value: 'House', component: House },
  { label: '商品', value: 'Goods', component: Goods },
  { label: '盒子', value: 'Box', component: Box },
  { label: '购物袋', value: 'ShoppingBag', component: ShoppingBag },
  { label: '星星', value: 'Star', component: Star }
]

// 可选父分类（排除当前编辑的分类）
const availableParents = ref<CategoryItem[]>([])

// 方法
const loadAvailableParents = async () => {
  try {
    const res = await request.get<any>({ url: '/product-categories/flat', params: { status: 'active' } })
    availableParents.value = (res?.data || []).map((c: any) => ({ id: c.id, name: c.name }))
    
    // 如果是编辑模式，排除当前分类和其子分类
    if (isEdit.value && props.category) {
      availableParents.value = availableParents.value.filter(
        cat => cat.id !== props.category!.id
      )
    }
  } catch (error) {
    ElMessage.error('加载分类列表失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    isSubmitting.value = true
    
    // 提交到后端
    if (isEdit.value && props.category) {
      await request.put({ url: `/product-categories/${props.category.id}`, params: {
        name: formData.name,
        parentId: formData.parentId || undefined,
        icon: formData.icon || undefined,
        description: formData.description || undefined,
        sortOrder: formData.sortOrder || 0,
        status: formData.status || 'active'
      } })
    } else {
      await request.post({ url: '/product-categories', params: {
        name: formData.name,
        parentId: formData.parentId || undefined,
        icon: formData.icon || undefined,
        description: formData.description || undefined,
        sortOrder: formData.sortOrder || 0,
        status: formData.status || 'active'
      } })
    }
    
    ElMessage.success(isEdit.value ? '分类更新成功' : '分类创建成功')
    
    // 交给父组件刷新
    emit('success')
    handleClose()
  } catch (error) {
    if (error !== false) { // 表单验证失败时error为false
      ElMessage.error('操作失败，请重试')
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  visible.value = false
  // 重置表单
  Object.assign(formData, {
    name: '',
    parentId: undefined,
    icon: '',
    description: '',
    sortOrder: 0,
    status: 'active'
  })
  formRef.value?.resetFields()
}

// 监听对话框打开，初始化数据
watch(visible, (newVal) => {
  if (newVal) {
    loadAvailableParents()
    
    // 如果是编辑模式，填充表单数据
    if (isEdit.value && props.category) {
      Object.assign(formData, {
        name: props.category.name,
        parentId: props.category.parentId || undefined,
        icon: props.category.icon || '',
        description: props.category.description || '',
        sortOrder: props.category.sortOrder || 0,
        status: props.category.status || 'active'
      })
    }
  }
})
</script>

<style scoped lang="scss">
.category-form {
  padding: 20px 0;
  
  :deep(.el-form-item) {
    margin-bottom: 24px;
    
    .el-form-item__label {
      font-weight: 500;
      color: #374151;
      font-size: 14px;
      line-height: 1.5;
    }
    
    .el-input__wrapper {
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      transition: all 0.2s ease;
      
      &:hover {
        border-color: #3b82f6;
      }
      
      &.is-focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }
    
    .el-select {
      .el-input__wrapper {
        &:hover {
          border-color: #3b82f6;
        }
        
        &.is-focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      }
    }
    
    .el-textarea__inner {
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      transition: all 0.2s ease;
      
      &:hover {
        border-color: #3b82f6;
      }
      
      &:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }
    
    .el-input-number {
      width: 100%;
      
      .el-input__wrapper {
        &:hover {
          border-color: #3b82f6;
        }
        
        &.is-focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      }
    }
    
    .el-radio-group {
      .el-radio {
        margin-right: 24px;
        
        .el-radio__label {
          font-weight: 500;
          color: #374151;
        }
      }
    }
  }
}

.form-tip {
  color: #6b7280;
  font-size: 12px;
  margin-left: 8px;
  font-style: italic;
}

:deep(.el-select-dropdown__item) {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  
  &:hover {
    background-color: #f3f4f6;
  }
  
  .el-icon {
    margin-right: 8px;
    color: #6b7280;
  }
}

:deep(.el-dialog__header) {
  padding: 24px 24px 12px 24px;
  border-bottom: 1px solid #f3f4f6;
  
  .el-dialog__title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
  }
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 24px 24px;
  border-top: 1px solid #f3f4f6;
  
  .el-button {
    border-radius: 8px;
    font-weight: 500;
    padding: 10px 20px;
    
    &.el-button--primary {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border: none;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
      
      &:hover {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        transform: translateY(-1px);
      }
    }
    
    &:not(.el-button--primary) {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      color: #374151;
      
      &:hover {
        background: #f3f4f6;
        border-color: #d1d5db;
      }
    }
  }
}
</style> 