<template>
  <view class="settings-page">
    <!-- 导航栏 -->
    <view class="settings-navbar">
      <text class="settings-navbar__back" @click="handleBack">‹</text>
      <text class="settings-navbar__title">设置</text>
      <view class="settings-navbar__right"></view>
    </view>

    <!-- 设置列表 -->
    <view class="settings-list">
      <view class="settings-group">
        <text class="settings-group__title">账号设置</text>
        
        <view class="settings-item" @click="handleEditProfile">
          <text class="settings-item__icon">👤</text>
          <text class="settings-item__label">编辑资料</text>
          <text class="settings-item__arrow">›</text>
        </view>
        
        <view class="settings-item" @click="handleChangePhone">
          <text class="settings-item__icon">📱</text>
          <text class="settings-item__label">更换手机号</text>
          <text class="settings-item__arrow">›</text>
        </view>
        
        <view class="settings-item" @click="handlePassword">
          <text class="settings-item__icon">🔐</text>
          <text class="settings-item__label">修改密码</text>
          <text class="settings-item__arrow">›</text>
        </view>
      </view>

      <view class="settings-group">
        <text class="settings-group__title">隐私设置</text>
        
        <view class="settings-item" @click="handlePrivacy">
          <text class="settings-item__icon">🔒</text>
          <text class="settings-item__label">隐私设置</text>
          <text class="settings-item__desc">动态、联系方式</text>
          <text class="settings-item__arrow">›</text>
        </view>
        
        <view class="settings-item" @click="handleBlacklist">
          <text class="settings-item__icon">🚫</text>
          <text class="settings-item__label">黑名单</text>
          <text class="settings-item__desc">0人</text>
          <text class="settings-item__arrow">›</text>
        </view>
      </view>

      <view class="settings-group">
        <text class="settings-group__title">其他</text>
        
        <view class="settings-item" @click="handleAntiFraud">
          <text class="settings-item__icon">🛡️</text>
          <text class="settings-item__label">反诈专区</text>
          <text class="settings-item__arrow">›</text>
        </view>
        
        <view class="settings-item" @click="handleFeedback">
          <text class="settings-item__icon">💬</text>
          <text class="settings-item__label">意见反馈</text>
          <text class="settings-item__arrow">›</text>
        </view>
        
        <view class="settings-item" @click="handleAbout">
          <text class="settings-item__icon">ℹ️</text>
          <text class="settings-item__label">关于我们</text>
          <text class="settings-item__desc">v1.0.0</text>
          <text class="settings-item__arrow">›</text>
        </view>
      </view>

      <view class="settings-group">
        <button class="settings-logout" @click="handleLogout">退出登录</button>
      </view>
    </view>
  </view>
</template>

<script setup>
const handleBack = () => {
  uni.navigateBack()
}

const handleEditProfile = () => {
  uni.showToast({
    title: '编辑资料开发中',
    icon: 'none'
  })
}

const handleChangePhone = () => {
  uni.showToast({
    title: '更换手机号开发中',
    icon: 'none'
  })
}

const handlePassword = () => {
  uni.showToast({
    title: '修改密码开发中',
    icon: 'none'
  })
}

const handlePrivacy = () => {
  uni.navigateTo({
    url: '/pages/profile/privacy'
  })
}

const handleBlacklist = () => {
  uni.showToast({
    title: '黑名单开发中',
    icon: 'none'
  })
}

const handleAntiFraud = () => {
  uni.navigateTo({
    url: '/pages/common/anti-fraud'
  })
}

const handleFeedback = () => {
  uni.showToast({
    title: '意见反馈开发中',
    icon: 'none'
  })
}

const handleAbout = () => {
  uni.showModal({
    title: '关于我们',
    content: '真实交友 v1.0.0\n一个真实、纯净、安心的交友平台',
    showCancel: false
  })
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '已退出',
          icon: 'success'
        })
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/match/index'
          })
        }, 500)
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background-color: #FAFAFA;
  padding-bottom: 24px;
}

.settings-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E5E5E5;
  position: sticky;
  top: 0;
  z-index: 10;
}

.settings-navbar__back {
  font-size: 28px;
  color: #333333;
  cursor: pointer;
}

.settings-navbar__title {
  font-size: 18px;
  font-weight: 500;
  color: #333333;
}

.settings-navbar__right {
  width: 30px;
}

.settings-list {
  padding: 0 24px;
  margin-top: 12px;
}

.settings-group {
  background-color: #FFFFFF;
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
}

.settings-group__title {
  display: block;
  padding: 12px 16px 4px;
  font-size: 13px;
  color: #999999;
}

.settings-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #F5F5F5;
  cursor: pointer;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item:active {
  background-color: #FAFAFA;
}

.settings-item__icon {
  font-size: 18px;
  margin-right: 12px;
}

.settings-item__label {
  flex: 1;
  font-size: 15px;
  color: #333333;
}

.settings-item__desc {
  font-size: 13px;
  color: #999999;
  margin-right: 8px;
}

.settings-item__arrow {
  font-size: 16px;
  color: #CCCCCC;
}

.settings-logout {
  width: 100%;
  height: 48px;
  background-color: #FFFFFF;
  color: #BF8B8B;
  font-size: 16px;
  border: none;
  border-radius: 0;
}

.settings-logout:active {
  background-color: #FAFAFA;
}
</style>