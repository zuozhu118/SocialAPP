<template>
  <view class="skeleton" :class="[`skeleton--${type}`]">
    <view class="skeleton__avatar" v-if="hasAvatar" />
    <view class="skeleton__body">
      <view class="skeleton__line" v-for="i in lines" :key="i" />
      <view class="skeleton__line skeleton__line--short" v-if="hasSub" />
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'card' // card | list | comment
  },
  lines: {
    type: Number,
    default: 3
  },
  hasAvatar: {
    type: Boolean,
    default: true
  },
  hasSub: {
    type: Boolean,
    default: true
  }
})
</script>

<style lang="scss" scoped>
.skeleton {
  background-color: $bg-card;
  border-radius: $radius-card;
  padding: $spacing-md;
  display: flex;
  gap: $spacing-md;
  animation: shimmer 1.5s ease-in-out infinite;
  
  &--list {
    border-radius: 0;
    padding: $spacing-md $page-padding-x;
    border-bottom: 1px solid $border-light;
  }
  
  &--comment {
    padding: $spacing-sm 0;
    border-radius: 0;
  }
  
  &__avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    flex-shrink: 0;
    background: linear-gradient(90deg, $bg-page 25%, $border-light 50%, $bg-page 75%);
    background-size: 200% 100%;
  }
  
  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }
  
  &__line {
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(90deg, $bg-page 25%, $border-light 50%, $bg-page 75%);
    background-size: 200% 100%;
    
    &--short {
      width: 60%;
    }
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>