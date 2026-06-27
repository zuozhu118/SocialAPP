<template>
  <view class="equity-page">
    <!-- 导航栏 -->
    <view class="equity-navbar">
      <text class="equity-navbar__back" @click="handleBack">‹</text>
      <text class="equity-navbar__title">权益中心</text>
      <view class="equity-navbar__right"></view>
    </view>

    <!-- 权益概览 -->
    <view class="equity-overview">
      <text class="equity-overview__title">我的权益</text>
      <view class="equity-overview__grid">
        <view class="equity-overview__item">
          <text class="equity-overview__number">{{ applyCount }}</text>
          <text class="equity-overview__label">微信申请次数</text>
          <text class="equity-overview__sub">今日可用</text>
        </view>
        <view class="equity-overview__item">
          <text class="equity-overview__number">{{ exposureCards }}</text>
          <text class="equity-overview__label">同城曝光卡</text>
          <text class="equity-overview__sub">可用</text>
        </view>
        <view class="equity-overview__item">
          <text class="equity-overview__number">{{ authCount }}</text>
          <text class="equity-overview__label">认证数量</text>
          <text class="equity-overview__sub">认证越多权重越高</text>
        </view>
      </view>
    </view>

    <!-- 权益列表 -->
    <view class="equity-list">
      <view class="equity-group">
        <text class="equity-group__title">🎁 可用权益</text>
        
        <view class="equity-item">
          <view class="equity-item__icon">💳</view>
          <view class="equity-item__body">
            <text class="equity-item__label">微信申请次数</text>
            <text class="equity-item__desc">每日10次，认证额外奖励</text>
          </view>
          <view class="equity-item__right">
            <text class="equity-item__count">{{ applyCount }}</text>
            <text class="equity-item__unit">次</text>
          </view>
        </view>

        <view class="equity-item" @click="useExposureCard">
          <view class="equity-item__icon">📢</view>
          <view class="equity-item__body">
            <text class="equity-item__label">同城曝光卡</text>
            <text class="equity-item__desc">24小时加权曝光</text>
          </view>
          <view class="equity-item__right">
            <text class="equity-item__count">{{ exposureCards }}</text>
            <text class="equity-item__unit">张</text>
            <text class="equity-item__action" v-if="exposureCards > 0">使用</text>
          </view>
        </view>
      </view>

      <view class="equity-group">
        <text class="equity-group__title">📋 获取方式</text>
        
        <view class="equity-item">
          <view class="equity-item__icon">🎓</view>
          <view class="equity-item__body">
            <text class="equity-item__label">学历认证</text>
            <text class="equity-item__desc">完成学历认证</text>
          </view>
          <view class="equity-item__right">
            <text class="equity-item__reward">+5次</text>
          </view>
        </view>

        <view class="equity-item">
          <view class="equity-item__icon">💼</view>
          <view class="equity-item__body">
            <text class="equity-item__label">工作认证</text>
            <text class="equity-item__desc">完成工作认证</text>
          </view>
          <view class="equity-item__right">
            <text class="equity-item__reward">+5次</text>
          </view>
        </view>

        <view class="equity-item">
          <view class="equity-item__icon">⭐</view>
          <view class="equity-item__body">
            <text class="equity-item__label">优质动态</text>
            <text class="equity-item__desc">动态被标记为优质</text>
          </view>
          <view class="equity-item__right">
            <text class="equity-item__reward">+3次</text>
          </view>
        </view>

        <view class="equity-item">
          <view class="equity-item__icon">📅</view>
          <view class="equity-item__body">
            <text class="equity-item__label">连续签到</text>
            <text class="equity-item__desc">连续签到7天</text>
          </view>
          <view class="equity-item__right">
            <text class="equity-item__reward">+1曝光卡</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const applyCount = ref(10)
const exposureCards = ref(3)
const authCount = ref(2)

const handleBack = () => {
  uni.navigateBack()
}

const useExposureCard = () => {
  if (exposureCards.value <= 0) {
    uni.showToast({
      title: '暂无曝光卡可用',
      icon: 'none'
    })
    return
  }
  
  uni.showModal({
    title: '使用曝光卡',
    content: '确认使用1张同城曝光卡？24小时内增加曝光',
    success: (res) => {
      if (res.confirm) {
        exposureCards.value--
        uni.showToast({
          title: '已使用，曝光提升中',
          icon: 'success'
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.equity-page {
  min-height: 100vh;
  background-color: #FAFAFA;
  padding-bottom: 24px;
}

.equity-navbar {
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

.equity-navbar__back {
  font-size: 28px;
  color: #333333;
  cursor: pointer;
}

.equity-navbar__title {
  font-size: 18px;
  font-weight: 500;
  color: #333333;
}

.equity-navbar__right {
  width: 30px;
}

.equity-overview {
  background: linear-gradient(135deg, #A8B89A, #8AA07B);
  margin: 12px 24px;
  border-radius: 20px;
  padding: 20px;
}

.equity-overview__title {
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  display: block;
  margin-bottom: 16px;
}

.equity-overview__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.equity-overview__item {
  text-align: center;
}

.equity-overview__number {
  font-size: 28px;
  font-weight: 600;
  color: #FFFFFF;
  display: block;
}

.equity-overview__label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  display: block;
  margin-top: 2px;
}

.equity-overview__sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  display: block;
}

.equity-list {
  padding: 0 24px;
}

.equity-group {
  background-color: #FFFFFF;
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
}

.equity-group__title {
  display: block;
  padding: 12px 16px 4px;
  font-size: 13px;
  color: #999999;
}

.equity-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #F5F5F5;
}

.equity-item:last-child {
  border-bottom: none;
}

.equity-item__icon {
  font-size: 20px;
  margin-right: 12px;
}

.equity-item__body {
  flex: 1;
}

.equity-item__label {
  font-size: 15px;
  color: #333333;
  display: block;
}

.equity-item__desc {
  font-size: 12px;
  color: #999999;
  display: block;
}

.equity-item__right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.equity-item__count {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}

.equity-item__unit {
  font-size: 12px;
  color: #666666;
}

.equity-item__action {
  padding: 2px 12px;
  font-size: 12px;
  color: #A8B89A;
  background-color: #F2F5EF;
  border-radius: 12px;
  cursor: pointer;
}

.equity-item__action:active {
  opacity: 0.6;
}

.equity-item__reward {
  font-size: 14px;
  font-weight: 500;
  color: #A8B89A;
}
</style>