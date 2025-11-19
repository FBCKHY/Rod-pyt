<template>
  <div class="subscription-settings-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon class="title-icon"><Setting /></el-icon>
          订阅设置
        </h1>
        <p class="page-subtitle">配置订阅系统参数和模板</p>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Check" @click="saveAllSettings">
          保存所有设置
        </el-button>
      </div>
    </div>

    <!-- 设置选项卡 -->
    <el-tabs v-model="activeTab" class="settings-tabs">
      <!-- 基础设置 -->
      <el-tab-pane label="基础设置" name="basic">
        <div class="settings-section">
          <div class="section-header">
            <h3>订阅功能配置</h3>
            <p>配置订阅系统的基本参数</p>
          </div>

          <el-form :model="basicSettings" label-width="150px" class="settings-form">
            <el-form-item label="启用订阅功能">
              <el-switch
                v-model="basicSettings.enabled"
                active-text="启用"
                inactive-text="禁用"
              />
              <div class="form-tip">关闭后，用户将无法进行新的订阅</div>
            </el-form-item>

            <el-form-item label="自动确认订阅">
              <el-switch
                v-model="basicSettings.autoConfirm"
                active-text="自动确认"
                inactive-text="需要确认"
              />
              <div class="form-tip">开启后，用户订阅无需邮件确认</div>
            </el-form-item>

            <el-form-item label="允许重复订阅">
              <el-switch
                v-model="basicSettings.allowDuplicate"
                active-text="允许"
                inactive-text="不允许"
              />
              <div class="form-tip">是否允许同一联系方式多次订阅</div>
            </el-form-item>

            <el-form-item label="订阅频率限制">
              <el-input-number
                v-model="basicSettings.rateLimit"
                :min="1"
                :max="100"
                controls-position="right"
              />
              <span class="unit">次/小时</span>
              <div class="form-tip">同一IP地址每小时最多订阅次数</div>
            </el-form-item>

            <el-form-item label="数据保留期限">
              <el-input-number
                v-model="basicSettings.dataRetention"
                :min="30"
                :max="3650"
                controls-position="right"
              />
              <span class="unit">天</span>
              <div class="form-tip">取消订阅的数据保留天数</div>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 邮件模板 -->
      <el-tab-pane label="邮件模板" name="email">
        <div class="settings-section">
          <div class="section-header">
            <h3>邮件模板管理</h3>
            <p>配置订阅确认和通知邮件模板</p>
          </div>

          <div class="template-tabs">
            <el-tabs v-model="activeEmailTab" type="card">
              <el-tab-pane label="订阅确认邮件" name="confirm">
                <div class="template-editor">
                  <el-form :model="emailTemplates.confirm" label-width="100px">
                    <el-form-item label="邮件主题">
                      <el-input
                        v-model="emailTemplates.confirm.subject"
                        placeholder="请输入邮件主题"
                      />
                    </el-form-item>

                    <el-form-item label="发件人名称">
                      <el-input
                        v-model="emailTemplates.confirm.senderName"
                        placeholder="请输入发件人名称"
                      />
                    </el-form-item>

                    <el-form-item label="邮件内容">
                      <el-input
                        v-model="emailTemplates.confirm.content"
                        type="textarea"
                        :rows="10"
                        placeholder="请输入邮件内容，支持HTML格式"
                      />
                    </el-form-item>

                    <el-form-item>
                      <el-button type="primary" @click="previewEmail('confirm')">
                        预览邮件
                      </el-button>
                      <el-button @click="sendTestEmail('confirm')">
                        发送测试邮件
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>

              <el-tab-pane label="欢迎邮件" name="welcome">
                <div class="template-editor">
                  <el-form :model="emailTemplates.welcome" label-width="100px">
                    <el-form-item label="邮件主题">
                      <el-input
                        v-model="emailTemplates.welcome.subject"
                        placeholder="请输入邮件主题"
                      />
                    </el-form-item>

                    <el-form-item label="发件人名称">
                      <el-input
                        v-model="emailTemplates.welcome.senderName"
                        placeholder="请输入发件人名称"
                      />
                    </el-form-item>

                    <el-form-item label="邮件内容">
                      <el-input
                        v-model="emailTemplates.welcome.content"
                        type="textarea"
                        :rows="10"
                        placeholder="请输入邮件内容，支持HTML格式"
                      />
                    </el-form-item>

                    <el-form-item>
                      <el-button type="primary" @click="previewEmail('welcome')">
                        预览邮件
                      </el-button>
                      <el-button @click="sendTestEmail('welcome')">
                        发送测试邮件
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>

              <el-tab-pane label="取消订阅邮件" name="unsubscribe">
                <div class="template-editor">
                  <el-form :model="emailTemplates.unsubscribe" label-width="100px">
                    <el-form-item label="邮件主题">
                      <el-input
                        v-model="emailTemplates.unsubscribe.subject"
                        placeholder="请输入邮件主题"
                      />
                    </el-form-item>

                    <el-form-item label="发件人名称">
                      <el-input
                        v-model="emailTemplates.unsubscribe.senderName"
                        placeholder="请输入发件人名称"
                      />
                    </el-form-item>

                    <el-form-item label="邮件内容">
                      <el-input
                        v-model="emailTemplates.unsubscribe.content"
                        type="textarea"
                        :rows="10"
                        placeholder="请输入邮件内容，支持HTML格式"
                      />
                    </el-form-item>

                    <el-form-item>
                      <el-button type="primary" @click="previewEmail('unsubscribe')">
                        预览邮件
                      </el-button>
                      <el-button @click="sendTestEmail('unsubscribe')">
                        发送测试邮件
                      </el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>

          <div class="template-variables">
            <h4>可用变量</h4>
            <div class="variables-grid">
              <div class="variable-item">
                <code>{{ '{{name}}' }}</code>
                <span>用户姓名</span>
              </div>
              <div class="variable-item">
                <code>{{ '{{email}}' }}</code>
                <span>用户邮箱</span>
              </div>
              <div class="variable-item">
                <code>{{ '{{confirmUrl}}' }}</code>
                <span>确认链接</span>
              </div>
              <div class="variable-item">
                <code>{{ '{{unsubscribeUrl}}' }}</code>
                <span>取消订阅链接</span>
              </div>
              <div class="variable-item">
                <code>{{ '{{siteName}}' }}</code>
                <span>网站名称</span>
              </div>
              <div class="variable-item">
                <code>{{ '{{date}}' }}</code>
                <span>当前日期</span>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 自动化规则 -->
      <el-tab-pane label="自动化规则" name="automation">
        <div class="settings-section">
          <div class="section-header">
            <h3>自动化规则</h3>
            <p>配置订阅相关的自动化处理规则</p>
          </div>

          <div class="automation-rules">
            <div class="rule-card">
              <div class="rule-header">
                <h4>自动清理规则</h4>
                <el-switch v-model="automationRules.autoCleanup.enabled" />
              </div>
              <div class="rule-content">
                <el-form :model="automationRules.autoCleanup" label-width="120px">
                  <el-form-item label="清理周期">
                    <el-select v-model="automationRules.autoCleanup.interval">
                      <el-option label="每天" value="daily" />
                      <el-option label="每周" value="weekly" />
                      <el-option label="每月" value="monthly" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="清理条件">
                    <el-checkbox-group v-model="automationRules.autoCleanup.conditions">
                      <el-checkbox value="unconfirmed">未确认订阅超过7天</el-checkbox>
                      <el-checkbox value="inactive">非活跃用户超过90天</el-checkbox>
                      <el-checkbox value="bounced">邮件退回超过3次</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </el-form>
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-header">
                <h4>欢迎邮件规则</h4>
                <el-switch v-model="automationRules.welcomeEmail.enabled" />
              </div>
              <div class="rule-content">
                <el-form :model="automationRules.welcomeEmail" label-width="120px">
                  <el-form-item label="发送延迟">
                    <el-input-number
                      v-model="automationRules.welcomeEmail.delay"
                      :min="0"
                      :max="1440"
                      controls-position="right"
                    />
                    <span class="unit">分钟</span>
                  </el-form-item>
                  <el-form-item label="发送条件">
                    <el-radio-group v-model="automationRules.welcomeEmail.condition">
                      <el-radio value="immediate">立即发送</el-radio>
                      <el-radio value="confirmed">确认后发送</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-form>
              </div>
            </div>

            <div class="rule-card">
              <div class="rule-header">
                <h4>重复订阅检测</h4>
                <el-switch v-model="automationRules.duplicateDetection.enabled" />
              </div>
              <div class="rule-content">
                <el-form :model="automationRules.duplicateDetection" label-width="120px">
                  <el-form-item label="检测范围">
                    <el-checkbox-group v-model="automationRules.duplicateDetection.scope">
                      <el-checkbox value="email">邮箱地址</el-checkbox>
                      <el-checkbox value="phone">手机号码</el-checkbox>
                      <el-checkbox value="ip">IP地址</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                  <el-form-item label="处理方式">
                    <el-radio-group v-model="automationRules.duplicateDetection.action">
                      <el-radio value="reject">拒绝订阅</el-radio>
                      <el-radio value="update">更新信息</el-radio>
                      <el-radio value="notify">仅通知</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 高级设置 -->
      <el-tab-pane label="高级设置" name="advanced">
        <div class="settings-section">
          <div class="section-header">
            <h3>高级配置</h3>
            <p>系统级别的高级配置选项</p>
          </div>

          <el-form :model="advancedSettings" label-width="150px" class="settings-form">
            <el-form-item label="API访问控制">
              <el-switch
                v-model="advancedSettings.apiAccess"
                active-text="开放"
                inactive-text="限制"
              />
              <div class="form-tip">是否允许外部API访问订阅数据</div>
            </el-form-item>

            <el-form-item label="数据加密">
              <el-switch
                v-model="advancedSettings.dataEncryption"
                active-text="启用"
                inactive-text="禁用"
              />
              <div class="form-tip">对敏感数据进行加密存储</div>
            </el-form-item>

            <el-form-item label="审计日志">
              <el-switch
                v-model="advancedSettings.auditLog"
                active-text="启用"
                inactive-text="禁用"
              />
              <div class="form-tip">记录所有订阅相关操作日志</div>
            </el-form-item>

            <el-form-item label="缓存策略">
              <el-select v-model="advancedSettings.cacheStrategy">
                <el-option label="无缓存" value="none" />
                <el-option label="内存缓存" value="memory" />
                <el-option label="Redis缓存" value="redis" />
              </el-select>
              <div class="form-tip">选择数据缓存策略以提升性能</div>
            </el-form-item>

            <el-form-item label="备份频率">
              <el-select v-model="advancedSettings.backupFrequency">
                <el-option label="不备份" value="none" />
                <el-option label="每日备份" value="daily" />
                <el-option label="每周备份" value="weekly" />
                <el-option label="每月备份" value="monthly" />
              </el-select>
              <div class="form-tip">自动备份订阅数据的频率</div>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 邮件预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="邮件预览"
      width="600px"
    >
      <div class="email-preview" v-html="previewContent"></div>
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting, Check } from '@element-plus/icons-vue'
import { useSettingStore } from '@/store/modules/setting'

// 响应式数据
const activeTab = ref('basic')
const activeEmailTab = ref('confirm')
const previewDialogVisible = ref(false)
const previewContent = ref('')

// 基础设置
const basicSettings = reactive({
  enabled: true,
  autoConfirm: false,
  allowDuplicate: false,
  rateLimit: 10,
  dataRetention: 365
})

// 邮件模板
const emailTemplates = reactive({
  confirm: {
    subject: '请确认您的订阅',
    senderName: '融点科技',
    content: `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <h2>确认您的订阅</h2>
  <p>亲爱的 {{name}}，</p>
  <p>感谢您订阅我们的服务！请点击下面的链接确认您的订阅：</p>
  <p><a href="{{confirmUrl}}" style="background: #409eff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">确认订阅</a></p>
  <p>如果您没有订阅我们的服务，请忽略此邮件。</p>
  <p>此致<br>{{siteName}} 团队</p>
</div>
    `
  },
  welcome: {
    subject: '欢迎加入我们！',
    senderName: '融点科技',
    content: `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <h2>欢迎加入我们！</h2>
  <p>亲爱的 {{name}}，</p>
  <p>欢迎订阅我们的服务！我们将为您提供最新的产品资讯和行业动态。</p>
  <p>您可以随时通过以下链接取消订阅：</p>
  <p><a href="{{unsubscribeUrl}}">取消订阅</a></p>
  <p>感谢您的信任！</p>
  <p>此致<br>{{siteName}} 团队</p>
</div>
    `
  },
  unsubscribe: {
    subject: '订阅已取消',
    senderName: '融点科技',
    content: `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <h2>订阅已取消</h2>
  <p>亲爱的 {{name}}，</p>
  <p>您的订阅已成功取消。如果这不是您的操作，请联系我们。</p>
  <p>如果您改变主意，随时欢迎重新订阅我们的服务。</p>
  <p>感谢您曾经的支持！</p>
  <p>此致<br>{{siteName}} 团队</p>
</div>
    `
  }
})

// 自动化规则
const automationRules = reactive({
  autoCleanup: {
    enabled: true,
    interval: 'weekly',
    conditions: ['unconfirmed', 'inactive']
  },
  welcomeEmail: {
    enabled: true,
    delay: 5,
    condition: 'confirmed'
  },
  duplicateDetection: {
    enabled: true,
    scope: ['email', 'phone'],
    action: 'update'
  }
})

// 高级设置
const advancedSettings = reactive({
  apiAccess: false,
  dataEncryption: true,
  auditLog: true,
  cacheStrategy: 'memory',
  backupFrequency: 'weekly'
})

// 计算属性
const settingStore = useSettingStore()
const isDarkMode = computed(() => settingStore.isDark)

// 保存所有设置
const saveAllSettings = async () => {
  try {
    // 这里应该调用API保存设置
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('设置已保存')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 预览邮件
const previewEmail = (type: string) => {
  const template = emailTemplates[type as keyof typeof emailTemplates]
  let content = template.content
  
  // 替换变量
  content = content.replace(/\{\{name\}\}/g, '张三')
  content = content.replace(/\{\{email\}\}/g, 'zhangsan@example.com')
  content = content.replace(/\{\{siteName\}\}/g, '融点科技')
  content = content.replace(/\{\{date\}\}/g, new Date().toLocaleDateString())
  content = content.replace(/\{\{confirmUrl\}\}/g, 'https://example.com/confirm')
  content = content.replace(/\{\{unsubscribeUrl\}\}/g, 'https://example.com/unsubscribe')
  
  previewContent.value = content
  previewDialogVisible.value = true
}

// 发送测试邮件
const sendTestEmail = async (type: string) => {
  try {
    const { value: email } = await ElMessageBox.prompt('请输入测试邮箱地址', '发送测试邮件', {
      confirmButtonText: '发送',
      cancelButtonText: '取消',
      inputPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      inputErrorMessage: '请输入正确的邮箱地址'
    })
    
    // 这里应该调用API发送测试邮件
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success(`测试邮件已发送到 ${email}`)
  } catch (error) {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
.subscription-settings-page {
  padding: 24px;
  background: var(--el-bg-color-page);
  min-height: 100vh;
  transition: all 0.3s ease;

  // 页面头部
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .header-left {
      .page-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 28px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 8px 0;

        .title-icon {
          font-size: 32px;
          color: #409eff;
        }
      }

      .page-subtitle {
        color: var(--el-text-color-regular);
        font-size: 14px;
        margin: 0;
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  // 设置选项卡
  .settings-tabs {
    background: var(--el-bg-color);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .settings-section {
      .section-header {
        margin-bottom: 24px;

        h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        p {
          margin: 0;
          color: var(--el-text-color-regular);
          font-size: 14px;
        }
      }

      .settings-form {
        .form-tip {
          font-size: 12px;
          color: var(--el-text-color-regular);
          margin-top: 4px;
        }

        .unit {
          margin-left: 8px;
          color: var(--el-text-color-regular);
          font-size: 14px;
        }
      }
    }
  }

  // 模板编辑器
  .template-editor {
    margin-bottom: 24px;
  }

  .template-variables {
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
    padding: 16px;
    margin-top: 24px;

    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .variables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;

      .variable-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: var(--el-bg-color);
        border-radius: 4px;

        code {
          background: var(--el-fill-color-light);
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 12px;
          color: #409eff;
        }

        span {
          font-size: 12px;
          color: var(--el-text-color-regular);
        }
      }
    }
  }

  // 自动化规则
  .automation-rules {
    display: grid;
    gap: 20px;

    .rule-card {
      background: var(--el-fill-color-lighter);
      border-radius: 8px;
      padding: 20px;

      .rule-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }

      .rule-content {
        .unit {
          margin-left: 8px;
          color: var(--el-text-color-regular);
          font-size: 14px;
        }
      }
    }
  }

  // 邮件预览
  .email-preview {
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    padding: 20px;
    background: #fff;
    max-height: 400px;
    overflow-y: auto;
  }

  // 深色模式适配
  &.dark-mode {
    .settings-tabs,
    .rule-card {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    }

    .email-preview {
      background: var(--el-bg-color);
      border-color: var(--el-border-color);
    }
  }
}
</style>
