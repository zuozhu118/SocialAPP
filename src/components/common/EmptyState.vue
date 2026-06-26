<template>
  <view class="empty-state">
    <view class="empty-state__icon">
      <slot name="icon">
        <text class="empty-state__icon-text">📭</text>
      </slot>
    </view>
    <text class="empty-state__title">{{ title }}</text>
    <text v-if="desc" class="empty-state__desc">{{ desc }}</text>
    <slot name="action" />
  </view>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '暂无内容'
  },
  desc: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
.empty-state {
  @include flex-column;
  align-items: center;
  justify-content: center;
  padding: $spacing-2xl $spacing-lg;
  
  &__icon {
    margin-bottom: $spacing-md;
  }
  
  &__icon-text {
    font-size: 48px;
  }
  
  &__title {
    font-size: $font-size-md;
    color: $text-secondary;
    margin-bottom: $spacing-sm;
  }
  
  &__desc {
    font-size: $font-size-sm;
    color: $text-helper;
  }
}
</style>