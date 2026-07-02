<template>
  <view v-if="visible" class="filter-panel-overlay" @click="handleClose">
    <view class="filter-panel" @click.stop>
      <view class="filter-panel__header">
        <text class="filter-panel__title">匹配设置</text>
        <text class="filter-panel__reset" @click="resetFilter">重置</text>
      </view>
      
      <scroll-view class="filter-panel__body" scroll-y>
        <!-- 年龄 -->
        <view class="filter-section">
          <text class="filter-section__title">年龄</text>
          <view class="filter-section__options">
            <view 
              v-for="range in ageRanges" 
              :key="range.label"
              class="filter-section__option"
              :class="{ 'filter-section__option--active': filters.age === range.value }"
              @click="filters.age = range.value"
            >
              {{ range.label }}
            </view>
          </view>
        </view>
        
        <!-- 城市 -->
        <view class="filter-section">
          <text class="filter-section__title">城市</text>
          <view class="filter-section__options">
            <view 
              v-for="city in cities" 
              :key="city"
              class="filter-section__option"
              :class="{ 'filter-section__option--active': filters.city === city }"
              @click="filters.city = city"
            >
              {{ city }}
            </view>
          </view>
        </view>
        
        <!-- 学历 -->
        <view class="filter-section">
          <text class="filter-section__title">学历</text>
          <view class="filter-section__options">
            <view 
              v-for="edu in educationLevels" 
              :key="edu"
              class="filter-section__option"
              :class="{ 'filter-section__option--active': filters.education === edu }"
              @click="filters.education = edu"
            >
              {{ edu }}
            </view>
          </view>
        </view>
        
        <!-- 认证要求 -->
        <view class="filter-section">
          <text class="filter-section__title">认证要求</text>
          <view class="filter-section__options">
            <view 
              v-for="auth in authOptions" 
              :key="auth.label"
              class="filter-section__option"
              :class="{ 'filter-section__option--active': filters.auth === auth.value }"
              @click="filters.auth = auth.value"
            >
              {{ auth.label }}
            </view>
          </view>
        </view>
      </scroll-view>
      
      <view class="filter-panel__footer">
        <button class="filter-panel__btn filter-panel__btn--cancel" @click="handleClose">
          取消
        </button>
        <button class="filter-panel__btn filter-panel__btn--apply" @click="handleApply">
          确认筛选
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'apply'])

const filters = ref({
  age: 'all',
  city: '全部',
  education: '全部',
  auth: 'all'
})

const ageRanges = [
  { label: '全部', value: 'all' },
  { label: '18-22', value: '18-22' },
  { label: '23-27', value: '23-27' },
  { label: '28-32', value: '28-32' },
  { label: '33+', value: '33+' }
]

const cities = ['全部', '北京', '上海', '深圳', '广州', '杭州', '成都', '武汉', '其他']
const educationLevels = ['全部', '大专', '本科', '硕士', '博士']
const authOptions = [
  { label: '全部', value: 'all' },
  { label: '已实名', value: 'realname' },
  { label: '已认证', value: 'certified' }
]

const handleClose = () => {
  emit('update:visible', false)
}

const resetFilter = () => {
  filters.value = {
    age: 'all',
    city: '全部',
    education: '全部',
    auth: 'all'
  }
}

const handleApply = () => {
  emit('apply', { ...filters.value })
  handleClose()
}
</script>

<style lang="scss" scoped>
.filter-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: $z-index-modal;
  display: flex;
  align-items: flex-end;
  animation: fadeIn $duration-fast ease;
}

.filter-panel {
  background-color: $bg-card;
  border-radius: $radius-card $radius-card 0 0;
  width: 100%;
  max-height: 80vh;
  animation: slideUp $duration-base ease;
  
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md $spacing-lg;
    border-bottom: 1px solid $border-light;
  }
  
  &__title {
    font-size: $font-size-md;
    font-weight: $font-weight-medium;
    color: $text-primary;
  }
  
  &__reset {
    font-size: $font-size-sm;
    color: $text-helper;
    cursor: pointer;
    
    &:active {
      opacity: 0.6;
    }
  }
  
  &__body {
    padding: $spacing-md $spacing-lg;
    max-height: 60vh;
  }
  
  &__footer {
    display: flex;
    gap: $spacing-sm;
    padding: $spacing-md $spacing-lg $spacing-lg;
    border-top: 1px solid $border-light;
  }
  
  &__btn {
    flex: 1;
    height: 44px;
    border-radius: $radius-btn;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    border: none;
    
    &:active {
      transform: scale(0.98);
    }
    
    &--cancel {
      background-color: $bg-page;
      color: $text-secondary;
    }
    
    &--apply {
      background-color: $primary-color;
      color: #FFFFFF;
    }
  }
}

.filter-section {
  margin-bottom: $spacing-lg;
  
  &__title {
    display: block;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $text-primary;
    margin-bottom: $spacing-sm;
  }
  
  &__options {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
  }
  
  &__option {
    padding: 4px 16px;
    font-size: $font-size-xs;
    color: $text-secondary;
    background-color: $bg-page;
    border-radius: 16px;
    cursor: pointer;
    transition: all $duration-fast ease;
    border: 1px solid transparent;
    
    &--active {
      color: $primary-color;
      background-color: $primary-light-bg;
      border-color: $primary-color;
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>