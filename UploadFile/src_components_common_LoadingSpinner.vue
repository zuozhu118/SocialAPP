<template>
  <view class="loading-spinner" :class="{ 'loading-spinner--full': full }">
    <view class="loading-spinner__dot" />
    <view class="loading-spinner__dot" />
    <view class="loading-spinner__dot" />
  </view>
</template>

<script setup>
defineProps({
  full: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  
  &--full {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: $z-index-modal;
  }
  
  &__dot {
    width: 8px;
    height: 8px;
    background-color: $primary-color;
    border-radius: 50%;
    animation: loading-bounce 1.4s ease-in-out infinite both;
    
    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
    
    &:nth-child(3) {
      animation-delay: 0;
    }
  }
}

@keyframes loading-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>