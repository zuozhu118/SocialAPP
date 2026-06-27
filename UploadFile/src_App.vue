<template>
  <view class="app">
    <slot />
  </view>
</template>

<script>
export default {
  onLaunch() {
    console.log('App Launch')
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  }
}
</script>

<style lang="scss">
.app {
  min-height: 100vh;
  background-color: $bg-page;
}
</style>