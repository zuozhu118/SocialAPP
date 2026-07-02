<template>
  <view 
    class="auth-badge" 
    :class="[
      `auth-badge--${type}`,
      { 'auth-badge--double': double }
    ]"
    :style="{ width: size + 'px', height: size + 'px', fontSize: (size * 0.5) + 'px' }"
  >
    <text class="auth-badge__icon">{{ icon }}</text>
  </view>
</template>

<script setup>
const props = defineProps({
  // 认证类型: realname | education | work
  type: {
    type: String,
    required: true,
    validator: (val) => ['realname', 'education', 'work'].includes(val)
  },
  // 是否双认证（带描边特效）
  double: {
    type: Boolean,
    default: false
  },
  // 尺寸
  size: {
    type: Number,
    default: 24
  }
})

const iconMap = {
  realname: '🛡️',
  education: '🎓',
  work: '💼'
}

const icon = iconMap[props.type] || '✓'
</script>

<style lang="scss" scoped>
.auth-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  font-weight: $font-weight-medium;
  line-height: 1;
  box-shadow: $shadow-card;
  transition: all $duration-fast ease;
  
  &--realname {
    background-color: $primary-color;
    color: #FFFFFF;
  }
  
  &--education {
    background-color: $primary-dark;
    color: #FFFFFF;
  }
  
  &--work {
    background-color: $primary-color;
    color: #FFFFFF;
  }
  
  &--double {
    box-shadow: 0 0 0 2px $bg-card, 0 0 0 4px $primary-color;
  }
  
  &__icon {
    line-height: 1;
  }
}
</style>