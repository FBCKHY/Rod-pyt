<!-- 用户搜索栏 -->
<template>
  <ArtSearchBar
    v-model:filter="searchFormState"
    :items="formItems"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import type { SearchChangeParams, SearchFormItem } from '@/types'

  interface Emits {
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }

  const props = defineProps<{
    filter: Record<string, any>
  }>()

  const emit = defineEmits<Emits>()

  const searchFormState = ref({ ...props.filter })

  watch(
    () => props.filter,
    (newFilter) => {
      searchFormState.value = { ...newFilter }
    },
    { deep: true, immediate: true }
  )

  // 重置表单
  const handleReset = () => {
    searchFormState.value = { ...props.filter }
    emit('reset')
  }

  // 搜索处理
  const handleSearch = () => {
    emit('search', searchFormState.value)
  }

  const handleFormChange = (params: SearchChangeParams): void => {
    // 表单项变更处理
  }

  // --- 表单配置项 ---
  const formItems: SearchFormItem[] = [
    {
      label: '关键词',
      prop: 'keyword',
      type: 'input',
      config: {
        clearable: true,
        placeholder: '搜索用户名、昵称、邮箱'
      },
      onChange: handleFormChange
    },
    {
      label: '状态',
      prop: 'status',
      type: 'select',
      config: {
        clearable: true,
        placeholder: '请选择状态'
      },
      options: [
        { label: '正常', value: 'active' },
        { label: '禁用', value: 'inactive' },
        { label: '已删除', value: 'deleted' }
      ],
      onChange: handleFormChange
    },
    {
      label: '部门',
      prop: 'department',
      type: 'input',
      config: {
        clearable: true,
        placeholder: '请输入部门'
      },
      onChange: handleFormChange
    },
    {
      label: '角色',
      prop: 'role',
      type: 'input',
      config: {
        clearable: true,
        placeholder: '请输入角色代码'
      },
      onChange: handleFormChange
    }
  ]
</script>
