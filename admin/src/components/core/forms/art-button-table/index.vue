<!-- 表格按钮 -->
<template>
  <ElTooltip :content="tooltipText" :disabled="!tooltipText" placement="top">
    <div
      :class="['btn-text', buttonClass]"
      :style="{ backgroundColor: buttonBgColor, color: iconColor }"
      :text="text"
      @click="handleClick"
    >
      <ElIcon v-if="iconComponent" :size="16">
        <component :is="iconComponent" />
      </ElIcon>
      <i v-else-if="iconContent" class="iconfont-sys" v-html="iconContent"></i>
      <span v-if="text" class="btn-text-label">{{ text }}</span>
    </div>
  </ElTooltip>
</template>

<script setup lang="ts">
  import { BgColorEnum } from '@/enums/appEnum'
  import { Edit, Delete, View, Lock, CircleCheck, CircleClose } from '@element-plus/icons-vue'
  import type { Component } from 'vue'

  defineOptions({ name: 'ArtButtonTable' })

  interface Props {
    /** 按钮类型 */
    type?: 'add' | 'edit' | 'delete' | 'more' | 'view' | 'reset' | 'enable' | 'disable'
    /** 按钮图标 */
    icon?: string
    /** 按钮文字 */
    text?: string
    /** 按钮样式类 */
    iconClass?: BgColorEnum
    /** icon 颜色 */
    iconColor?: string
    /** 按钮背景色 */
    buttonBgColor?: string
    /** tooltip 提示文字 */
    tooltip?: string
  }

  const props = withDefaults(defineProps<Props>(), {})

  const emit = defineEmits<{
    (e: 'click'): void
  }>()

  // 默认按钮配置
  const defaultButtons = {
    add: { icon: '&#xe602;', color: BgColorEnum.PRIMARY, tooltip: '新增', component: null },
    edit: { icon: '&#xe642;', color: BgColorEnum.SECONDARY, tooltip: '编辑', component: Edit },
    delete: { icon: '&#xe783;', color: BgColorEnum.ERROR, tooltip: '删除', component: Delete },
    view: { icon: '&#xe689;', color: BgColorEnum.INFO, tooltip: '查看', component: View },
    reset: { icon: '&#xe6df;', color: BgColorEnum.WARNING, tooltip: '重置密码', component: Lock },
    enable: { icon: '&#xe6df;', color: BgColorEnum.SUCCESS, tooltip: '启用', component: CircleCheck },
    disable: { icon: '&#xe6df;', color: BgColorEnum.INFO, tooltip: '禁用', component: CircleClose },
    more: { icon: '&#xe6df;', color: '', tooltip: '更多', component: null }
  } as const

  // 获取图标组件
  const iconComponent = computed<Component | null>(() => {
    if (props.type && defaultButtons[props.type as keyof typeof defaultButtons]) {
      return defaultButtons[props.type as keyof typeof defaultButtons].component
    }
    return null
  })

  // 获取图标内容（兼容旧的 iconfont）
  const iconContent = computed(() => {
    return props.icon || (props.type ? defaultButtons[props.type as keyof typeof defaultButtons]?.icon : '') || ''
  })

  // 获取按钮样式类
  const buttonClass = computed(() => {
    return props.iconClass || (props.type ? defaultButtons[props.type as keyof typeof defaultButtons]?.color : '') || ''
  })

  // 获取 tooltip 文字
  const tooltipText = computed(() => {
    return props.tooltip || (props.type ? defaultButtons[props.type as keyof typeof defaultButtons]?.tooltip : '') || ''
  })

  const handleClick = () => {
    emit('click')
  }
</script>

<style scoped lang="scss">
  .btn-text {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 34px;
    height: 34px;
    padding: 0 10px;
    margin-right: 4px;
    font-size: 13px;
    line-height: 1;
    color: #666;
    cursor: pointer;
    background-color: rgba(var(--art-gray-200-rgb), 0.7);
    border-radius: 6px;
    transition: all 0.2s ease-in-out;
    vertical-align: middle;

    &:hover {
      background-color: rgba(var(--art-gray-300-rgb), 0.5);
      transform: translateY(-1px);
    }

    &:last-child {
      margin-right: 0;
    }

    .btn-text-label {
      font-size: 12px;
      white-space: nowrap;
      line-height: 1;
    }
  }
</style>
