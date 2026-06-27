<template>
  <view class="anti-fraud-page">
    <!-- 导航栏 -->
    <view class="anti-fraud-navbar">
      <text class="anti-fraud-navbar__back" @click="handleBack">‹</text>
      <text class="anti-fraud-navbar__title">反诈专区</text>
      <view class="anti-fraud-navbar__right"></view>
    </view>

    <!-- 顶部盾牌 -->
    <view class="anti-fraud-header">
      <view class="anti-fraud-header__icon">🛡️</view>
      <text class="anti-fraud-header__title">安全守护</text>
      <text class="anti-fraud-header__desc">平台提醒您：交友需谨慎，守好钱袋子</text>
    </view>

    <!-- 常见骗局 -->
    <view class="anti-fraud-section">
      <text class="anti-fraud-section__title">🔔 常见骗局</text>
      
      <view class="anti-fraud-card">
        <view class="anti-fraud-card__icon">💔</view>
        <view class="anti-fraud-card__body">
          <text class="anti-fraud-card__title">杀猪盘诈骗</text>
          <text class="anti-fraud-card__desc">伪装高富帅/白富美，建立感情后诱导投资、赌博</text>
          <text class="anti-fraud-card__tag">⚠️ 高风险</text>
        </view>
      </view>

      <view class="anti-fraud-card">
        <view class="anti-fraud-card__icon">💰</view>
        <view class="anti-fraud-card__body">
          <text class="anti-fraud-card__title">诱导转账</text>
          <text class="anti-fraud-card__desc">以生病、急事、投资等理由要求转账汇款</text>
          <text class="anti-fraud-card__tag">⚠️ 高风险</text>
        </view>
      </view>

      <view class="anti-fraud-card">
        <view class="anti-fraud-card__icon">📱</view>
        <view class="anti-fraud-card__body">
          <text class="anti-fraud-card__title">虚假身份</text>
          <text class="anti-fraud-card__desc">伪造身份信息、学历、工作，骗取信任</text>
          <text class="anti-fraud-card__tag">⚠️ 中风险</text>
        </view>
      </view>
    </view>

    <!-- 防骗指南 -->
    <view class="anti-fraud-section">
      <text class="anti-fraud-section__title">🛡️ 防骗指南</text>
      
      <view class="anti-fraud-tip">
        <text class="anti-fraud-tip__number">1</text>
        <view class="anti-fraud-tip__body">
          <text class="anti-fraud-tip__title">核实身份</text>
          <text class="anti-fraud-tip__desc">优先选择已完成实名、学历、工作三重认证的用户</text>
        </view>
      </view>

      <view class="anti-fraud-tip">
        <text class="anti-fraud-tip__number">2</text>
        <view class="anti-fraud-tip__body">
          <text class="anti-fraud-tip__title">拒绝转账</text>
          <text class="anti-fraud-tip__desc">任何理由的转账要求都是诈骗，请立即举报</text>
        </view>
      </view>

      <view class="anti-fraud-tip">
        <text class="anti-fraud-tip__number">3</text>
        <view class="anti-fraud-tip__body">
          <text class="anti-fraud-tip__title">线下见面</text>
          <text class="anti-fraud-tip__desc">选择公共场所，告知亲友，保持警惕</text>
        </view>
      </view>

      <view class="anti-fraud-tip">
        <text class="anti-fraud-tip__number">4</text>
        <view class="anti-fraud-tip__body">
          <text class="anti-fraud-tip__title">及时举报</text>
          <text class="anti-fraud-tip__desc">发现可疑行为立即举报，平台会优先处理</text>
        </view>
      </view>
    </view>

    <!-- 维权通道 -->
    <view class="anti-fraud-section">
      <text class="anti-fraud-section__title">📞 维权通道</text>
      
      <view class="anti-fraud-actions">
        <button class="anti-fraud-actions__btn" @click="handleReport">
          📋 立即举报
        </button>
        <button class="anti-fraud-actions__btn" @click="handlePolice">
          🚨 报警指引
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
const handleBack = () => {
  uni.navigateBack()
}

const handleReport = () => {
  uni.navigateTo({
    url: '/pages/common/report'
  })
}

const handlePolice = () => {
  uni.showModal({
    title: '报警指引',
    content: '如遇诈骗，请立即拨打 110 报警，并保留所有聊天记录、转账凭证等证据。',
    showCancel: false
  })
}
</script>

<style lang="scss" scoped>
.anti-fraud-page {
  min-height: 100vh;
  background-color: #FAFAFA;
  padding-bottom: 24px;
}

.anti-fraud-navbar {
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

.anti-fraud-navbar__back {
  font-size: 28px;
  color: #333333;
  cursor: pointer;
}

.anti-fraud-navbar__title {
  font-size: 18px;
  font-weight: 500;
  color: #333333;
}

.anti-fraud-navbar__right {
  width: 30px;
}

.anti-fraud-header {
  background: linear-gradient(135deg, #A8B89A, #8AA07B);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.anti-fraud-header__icon {
  font-size: 48px;
}

.anti-fraud-header__title {
  font-size: 20px;
  font-weight: 500;
  color: #FFFFFF;
  margin-top: 8px;
}

.anti-fraud-header__desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4px;
}

.anti-fraud-section {
  background-color: #FFFFFF;
  margin: 12px 24px;
  border-radius: 20px;
  padding: 16px;
}

.anti-fraud-section__title {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  display: block;
  margin-bottom: 12px;
}

.anti-fraud-card {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #F5F5F5;
}

.anti-fraud-card:last-child {
  border-bottom: none;
}

.anti-fraud-card__icon {
  font-size: 28px;
}

.anti-fraud-card__body {
  flex: 1;
}

.anti-fraud-card__title {
  font-size: 15px;
  font-weight: 500;
  color: #333333;
  display: block;
}

.anti-fraud-card__desc {
  font-size: 13px;
  color: #666666;
  margin: 2px 0;
  display: block;
}

.anti-fraud-card__tag {
  font-size: 11px;
  color: #BF8B8B;
  display: inline-block;
  margin-top: 4px;
}

.anti-fraud-tip {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #F5F5F5;
}

.anti-fraud-tip:last-child {
  border-bottom: none;
}

.anti-fraud-tip__number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #F2F5EF;
  color: #A8B89A;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  flex-shrink: 0;
}

.anti-fraud-tip__body {
  flex: 1;
}

.anti-fraud-tip__title {
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  display: block;
}

.anti-fraud-tip__desc {
  font-size: 13px;
  color: #666666;
  display: block;
}

.anti-fraud-actions {
  display: flex;
  gap: 12px;
}

.anti-fraud-actions__btn {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  background-color: #F2F5EF;
  color: #A8B89A;
}

.anti-fraud-actions__btn:active {
  opacity: 0.7;
}
</style>