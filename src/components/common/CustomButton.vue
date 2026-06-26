<template>
  <button
    class="custom-btn"
    :class="[
      `custom-btn--${type}`,
      { 'custom-btn--block': block },
      { 'custom-btn--disabled': disabled }
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  // 按钮类型: primary | secondary | danger
  type: {
    type: String,
    default: 'primary'
  },
  // 是否块级按钮（宽度100%）
  block: {
    type: Boolean,
    default: false
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = (e) => {
  if (props.disabled) return
  emit('click', e)
}
</script>

<style lang="scss" scoped>
.custom-btn {
  @include button-base;
  
  &--primary {
    @include button-primary;
  }
  
  &--secondary {
    @include button-secondary;
  }
  
  &--danger {
    @include button-base;
    background-color: $bg-card;
    border: 1px solid $color-warning;
    color: $color-warning;
    
    &:active {
      opacity: 0.7;
    }
    
    &:disabled {
      background-color: $disabled-bg;
      border-color: $border-light;
      color: $text-helper;
      cursor: not-allowed;
      opacity: 1;
    }
  }
  
  &--block {
    width: 100%;
  }
}
</style>