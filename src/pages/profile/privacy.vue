<template>
  <view class="privacy-page">
    <!-- 导航栏 -->
    <view class="privacy-navbar">
      <text class="privacy-navbar__back" @click="handleBack">‹</text>
      <text class="privacy-navbar__title">隐私设置</text>
      <view class="privacy-navbar__right"></view>
    </view>

    <!-- 设置列表 -->
    <view class="privacy-list">
      <!-- 动态隐私 -->
      <view class="privacy-group">
        <text class="privacy-group__title">动态隐私</text>
        
        <view 
          v-for="(item, index) in dynamicPrivacyOptions" 
          :key="index"
          class="privacy-item"
          @click="selectDynamicPrivacy(index)"
        >
          <view class="privacy-item__left">
            <text class="privacy-item__icon">{{ item.icon }}</text>
            <view class="privacy-item__body">
              <text class="privacy-item__label">{{ item.label }}</text>
              <text class="privacy-item__desc">{{ item.desc }}</text>
            </view>
          </view>
          <view class="privacy-item__check">
            {{ dynamicPrivacy === index ? '✓' : '' }}
          </view>
        </view>
      </view>

      <!-- 联系方式权限 -->
      <view class="privacy-group">
        <text class="privacy-group__title">联系方式</text>
        
        <view class="privacy-switch">
          <view class="privacy-switch__left">
            <text class="privacy-switch__label">允许他人申请微信</text>
            <text class="privacy-switch__desc">关闭后他人无法向你发起微信申请</text>
          </view>
          <view 
            class="privacy-switch__toggle"
            :class="{ 'privacy-switch__toggle--on': allowWechat }"
            @click="allowWechat = !allowWechat"
          >
            <view class="privacy-switch__thumb"></view>
          </view>
        </view>

        <view class="privacy-item" @click="showWechatCondition">
          <view class="privacy-item__left">
            <text class="privacy-item__icon">🔑</text>
            <view class="privacy-item__body">
              <text class="privacy-item__label">申请条件</text>
              <text class="privacy-item__desc">{{ wechatConditionText }}</text>
            </view>
          </view>
          <text class="privacy-item__arrow">›</text>
        </view>
      </view>

      <!-- 其他设置 -->
      <view class="privacy-group">
        <text class="privacy-group__title">其他</text>
        
        <view class="privacy-switch">
          <view class="privacy-switch__left">
            <text class="privacy-switch__label">同城推荐</text>
            <text class="privacy-switch__desc">关闭后不会在同城推荐中显示</text>
          </view>
          <view 
            class="privacy-switch__toggle"
            :class="{ 'privacy-switch__toggle--on': showLocal }"
            @click="showLocal = !showLocal"
          >
            <view class="privacy-switch__thumb"></view>
          </view>
        </view>

        <view class="privacy-item" @click="handleHideInfo">
          <view class="privacy-item__left">
            <text class="privacy-item__icon">👁️</text>
            <view class="privacy-item__body">
              <text class="privacy-item__label">隐藏资料</text>
              <text class="privacy-item__desc">选择哪些资料对外隐藏</text>
            </view>
          </view>
          <text class="privacy-item__arrow">›</text>
        </view>
      </view>

      <!-- 注销账号 -->
      <view class="privacy-group">
        <button class="privacy-delete" @click="handleDeleteAccount">注销账号</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const dynamicPrivacy = ref(0)
const allowWechat = ref(true)
const showLocal = ref(true)
const wechatCondition = ref(0)

const dynamicPrivacyOptions = [
  { icon: '🌍', label: '全部可见', desc: '所有人可以查看你的动态' },
  { icon: '👥', label: '仅匹配好友', desc: '只有匹配好友可以查看' },
  { icon: '🔒', label: '仅自己可见', desc: '只有你自己可以查看' }
]

const wechatConditionText = ref('无门槛，所有人可申请')

const wechatConditions = [
  '无门槛，所有人可申请',
  '仅双认证用户可申请',
  '年龄差超限自动拦截'
]

const selectDynamicPrivacy = (index) => {
  dynamicPrivacy.value = index
  uni.showToast({
    title: '已更新',
    icon: 'success'
  })
}

const showWechatCondition = () => {
  uni.showActionSheet({
    itemList: wechatConditions,
    success: (res) => {
      wechatCondition.value = res.tapIndex
      wechatConditionText.value = wechatConditions[res.tapIndex]
    }
  })
}

const handleHideInfo = () => {
  uni.showToast({
    title: '隐藏资料开发中',
    icon: 'none'
  })
}

const handleDeleteAccount = () => {
  uni.showModal({
    title: '⚠️ 警告',
    content: '注销后账号将无法恢复，所有数据将被清除，确定要注销吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showModal({
          title: '再次确认',
          content: '注销后实名信息将保留用于风控，确定继续？',
          success: (res2) => {
            if (res2.confirm) {
              uni.showToast({
                title: '账号已注销',
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
    }
  })
}

const handleBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.privacy-page {
  min-height: 100vh;
  background-color: #FAFAFA;
  padding-bottom: 24px;
}

.privacy-navbar {
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

.privacy-navbar__back {
  font-size: 28px;
  color: #333333;
  cursor: pointer;
}

.privacy-navbar__title {
  font-size: 18px;
  font-weight: 500;
  color: #333333;
}

.privacy-navbar__right {
  width: 30px;
}

.privacy-list {
  padding: 0 24px;
  margin-top: 12px;
}

.privacy-group {
  background-color: #FFFFFF;
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
}

.privacy-group__title {
  display: block;
  padding: 12px 16px 4px;
  font-size: 13px;
  color: #999999;
}

.privacy-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #F5F5F5;
  cursor: pointer;
}

.privacy-item:last-child {
  border-bottom: none;
}

.privacy-item__left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.privacy-item__icon {
  font-size: 18px;
}

.privacy-item__body {
  flex: 1;
}

.privacy-item__label {
  font-size: 15px;
  color: #333333;
  display: block;
}

.privacy-item__desc {
  font-size: 12px;
  color: #999999;
  display: block;
}

.privacy-item__check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #A8B89A;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.privacy-item__arrow {
  font-size: 16px;
  color: #CCCCCC;
}

.privacy-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #F5F5F5;
}

.privacy-switch:last-child {
  border-bottom: none;
}

.privacy-switch__left {
  flex: 1;
}

.privacy-switch__label {
  font-size: 15px;
  color: #333333;
  display: block;
}

.privacy-switch__desc {
  font-size: 12px;
  color: #999999;
  display: block;
}

.privacy-switch__toggle {
  width: 50px;
  height: 30px;
  border-radius: 15px;
  background-color: #E5E5E5;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
}

.privacy-switch__toggle--on {
  background-color: #A8B89A;
}

.privacy-switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: #FFFFFF;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.privacy-switch__toggle--on .privacy-switch__thumb {
  left: 22px;
}

.privacy-delete {
  width: 100%;
  height: 48px;
  background-color: #FFFFFF;
  color: #BF8B8B;
  font-size: 15px;
  border: none;
  border-radius: 0;
}

.privacy-delete:active {
  background-color: #FAFAFA;
}
</style>