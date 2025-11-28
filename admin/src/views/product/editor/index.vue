<template>
  <div class="visual-editor-page">
    <ElCard class="header-card" shadow="never">
      <div class="header-content">
        <div class="header-left">
          <ElButton :icon="ArrowLeft" @click="goBack">返回</ElButton>
          <div class="title-group">
            <h3>可视化编辑器</h3>
            <p>编辑产品详情页面 - {{ productName }}</p>
          </div>
        </div>
        <div class="header-right">
          <ElButton :icon="View" @click="previewPage">预览</ElButton>
          <ElButton type="primary" :icon="Select" @click="saveConfig" :loading="saving">
            保存配置
          </ElButton>
        </div>
      </div>
    </ElCard>

    <div class="editor-container">
      <iframe
        ref="editorFrame"
        :src="editorUrl"
        class="editor-iframe"
        @load="onIframeLoad"
      ></iframe>
    </div>

    <!-- 预览对话框 -->
    <ElDialog v-model="previewVisible" title="预览" width="90%" top="5vh">
      <iframe :src="previewUrl" class="preview-iframe"></iframe>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, View, Select } from '@element-plus/icons-vue'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()

const productId = computed(() => route.query.id as string)
const productName = ref('加载中...')
const editorFrame = ref<HTMLIFrameElement>()
const saving = ref(false)
const previewVisible = ref(false)

// 编辑器URL - 指向产品详情页面模板
const editorUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_EDITOR_URL || 'http://localhost:8080'
  return `${baseUrl}/产品详情页面模版/通用模板/产品详情.html?productId=${productId.value}&edit=true`
})

// 预览URL
const previewUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_EDITOR_URL || 'http://localhost:8080'
  return `${baseUrl}/产品详情页面模版/通用模板/产品详情.html?productId=${productId.value}`
})

// 加载产品信息
const loadProduct = async () => {
  try {
    const res = await request.get<any>({
      url: `/products/${productId.value}`
    })
    // 兼容两种格式
    const responseData = res?.data || res
    if (responseData) {
      productName.value = responseData.name || '未命名产品'
    }
  } catch (error) {
    console.error('加载产品失败:', error)
    ElMessage.error('加载产品信息失败')
  }
}

// iframe加载完成
const onIframeLoad = () => {
  console.log('编辑器加载完成')
  // 可以在这里与iframe通信，传递产品数据
  if (editorFrame.value?.contentWindow) {
    editorFrame.value.contentWindow.postMessage(
      {
        type: 'INIT_EDITOR',
        productId: productId.value
      },
      '*'
    )
  }
}

// 保存配置
const saveConfig = async () => {
  if (!editorFrame.value?.contentWindow) {
    ElMessage.error('编辑器未加载')
    return
  }

  saving.value = true
  try {
    // 从iframe获取配置
    editorFrame.value.contentWindow.postMessage(
      { type: 'GET_CONFIG' },
      '*'
    )

    // 监听配置返回
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'CONFIG_DATA') {
        const config = event.data.config
        
        // 保存到后端
        await request.put({
          url: `/products/${productId.value}/config`,
          data: {
            config: JSON.stringify(config),
            version: new Date().getTime()
          }
        })

        ElMessage.success('配置保存成功')
        window.removeEventListener('message', handleMessage)
        saving.value = false
      }
    }

    window.addEventListener('message', handleMessage)

    // 5秒超时
    setTimeout(() => {
      window.removeEventListener('message', handleMessage)
      if (saving.value) {
        saving.value = false
        ElMessage.error('保存超时')
      }
    }, 5000)
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存配置失败')
    saving.value = false
  }
}

// 预览页面
const previewPage = () => {
  previewVisible.value = true
}

// 返回
const goBack = () => {
  router.back()
}

onMounted(() => {
  if (productId.value) {
    loadProduct()
  } else {
    ElMessage.error('缺少产品ID')
    router.back()
  }
})
</script>

<style scoped lang="scss">
.visual-editor-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.header-card {
  margin-bottom: 16px;
  
  :deep(.el-card__body) {
    padding: 16px 24px;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-group {
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  p {
    margin: 4px 0 0;
    font-size: 14px;
    color: #909399;
  }
}

.header-right {
  display: flex;
  gap: 12px;
}

.editor-container {
  flex: 1;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.editor-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-iframe {
  width: 100%;
  height: 70vh;
  border: none;
}
</style>
