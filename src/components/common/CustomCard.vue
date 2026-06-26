<template>
  <view class="custom-card" :class="[customClass]">
    <slot />
  </view>
</template>

<script setup>
defineProps({
  customClass: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
.custom-card {
  @include card;
  padding: $spacing-md;
}
</style>