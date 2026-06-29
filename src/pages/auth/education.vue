<template>
  <view class="education-page">
    <!-- 导航栏 -->
    <view class="education-navbar">
      <text class="education-navbar__back" @click="handleBack">‹</text>
      <text class="education-navbar__title">学历认证</text>
      <view class="education-navbar__right"></view>
    </view>

    <!-- 认证说明 -->
    <view class="education-header">
      <view class="education-header__icon">🎓</view>
      <text class="education-header__title">学历认证</text>
      <text class="education-header__desc">上传学信网截图或毕业证书，通过审核后获得专属标识</text>
      <view class="education-header__badge">认证后 +5次微信申请权益</view>
    </view>

    <!-- 认证步骤 -->
    <view class="education-steps">
      <view 
        v-for="(step, index) in steps" 
        :key="index"
        class="education-steps__item"
        :class="{
          'education-steps__item--active': index + 1 <= currentStep,
          'education-steps__item--done': index + 1 < currentStep
        }"
      >
        <view class="education-steps__number">{{ index + 1 }}</view>
        <text class="education-steps__label">{{ step }}</text>
        <view v-if="index < steps.length - 1" class="education-steps__line"></view>
      </view>
    </view>

    <!-- 步骤1：选择认证方式 -->
    <view v-if="currentStep === 1" class="education-content">
      <text class="education-content__title">选择认证方式</text>
      
      <view 
        v-for="(item, index) in authMethods" 
        :key="index"
        class="education-method"
        :class="{ 'education-method--active': selectedMethod === index }"
        @click="selectedMethod = index"
      >
        <text class="education-method__icon">{{ item.icon }}</text>
        <view class="education-method__body">
          <text class="education-method__title">{{ item.title }}</text>
          <text class="education-method__desc">{{ item.desc }}</text>
        </view>
        <view class="education-method__check">
          {{ selectedMethod === index ? '✓' : '' }}
        </view>
      </view>

      <button 
        class="education-content__btn" 
        @click="nextStep"
        :disabled="selectedMethod === null"
      >
        下一步
      </button>
    </view>

    <!-- 步骤2：上传凭证 -->
    <view v-if="currentStep === 2" class="education-content">
      <text class="education-content__title">上传凭证</text>
      <text class="education-content__desc">
        {{ selectedMethod === 0 ? '请上传学信网在线验证报告截图' : '请上传毕业证书或学位证书照片' }}
      </text>

      <view class="education-upload">
        <view 
          class="education-upload__area"
          :class="{ 'education-upload__area--filled': credentialImage }"
          @click="uploadCredential"
        >
          <image 
            v-if="credentialImage" 
            class="education-upload__image" 
            :src="credentialImage" 
            mode="aspectFill"
          />
          <view v-else class="education-upload__placeholder">
            <text class="education-upload__icon">📷</text>
            <text class="education-upload__text">点击上传凭证</text>
            <text class="education-upload__hint">支持 jpg、png 格式</text>
          </view>
        </view>
      </view>

      <!-- 示例图 -->
      <view class="education-example">
        <text class="education-example__title">📖 示例图</text>
        <view class="education-example__images">
          <view v-if="selectedMethod === 0" class="education-example__item">
            <image class="education-example__img" src="/static/images/xuexin-example.png" mode="aspectFill" />
            <text class="education-example__label">学信网在线验证报告</text>
          </view>
          <view v-else class="education-example__item">
            <image class="education-example__img" src="/static/images/diploma-example.png" mode="aspectFill" />
            <text class="education-example__label">毕业证书示例</text>
          </view>
        </view>
      </view>

      <view class="education-content__actions">
        <button class="education-content__btn education-content__btn--secondary" @click="prevStep">
          上一步
        </button>
        <button 
          class="education-content__btn" 
          @click="submitAuth"
          :disabled="!credentialImage"
        >
          提交认证
        </button>
      </view>
    </view>

    <!-- 步骤3：审核中 -->
    <view v-if="currentStep === 3" class="education-content education-content--center">
      <view class="education-status">
        <text class="education-status__icon">⏳</text>
        <text class="education-status__title">审核中</text>
        <text class="education-status__desc">我们会在 1-3 个工作日内完成审核</text>
        <text class="education-status__desc">审核通过后将获得学历认证标识</text>
      </view>
      <button class="education-content__btn" @click="goToProfile">
        返回个人主页
      </button>
    </view>

    <!-- 步骤4：认证成功 -->
    <view v-if="currentStep === 4" class="education-content education-content--center">
      <view class="education-status education-status--success">
        <text class="education-status__icon">✅</text>
        <text class="education-status__title">认证成功！</text>
        <text class="education-status__desc">您已获得学历认证标识</text>
        <view class="education-status__reward">
          🎁 获得 5 次微信申请权益
        </view>
      </view>
      <button class="education-content__btn" @click="goToProfile">
        返回个人主页
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const currentStep = ref(1)
const selectedMethod = ref(null)
const credentialImage = ref('')

const steps = ['选择方式', '上传凭证', '审核']
const authMethods = [
  { icon: '📄', title: '学信网截图', desc: '上传学信网在线验证报告截图' },
  { icon: '📜', title: '毕业证书', desc: '上传毕业证书或学位证书照片' }
]

const handleBack = () => {
  if (currentStep.value > 1) {
    uni.showModal({
      title: '提示',
      content: '确定要退出吗？认证进度将丢失',
      success: (res) => {
        if (res.confirm) {
          uni.navigateBack()
        }
      }
    })
  } else {
    uni.navigateBack()
  }
}

const uploadCredential = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      credentialImage.value = res.tempFilePaths[0]
    }
  })
}

const nextStep = () => {
  if (selectedMethod.value === null) {
    uni.showToast({
      title: '请选择认证方式',
      icon: 'none'
    })
    return
  }
  currentStep.value = 2
}

const prevStep = () => {
  currentStep.value = 1
}

const submitAuth = () => {
  if (!credentialImage.value) {
    uni.showToast({
      title: '请上传凭证',
      icon: 'none'
    })
    return
  }
  
  uni.showLoading({
    title: '提交中...'
  })
  
  setTimeout(() => {
    uni.hideLoading()
    currentStep.value = 3
    
    // 模拟审核通过（3秒后自动跳到成功页）
    setTimeout(() => {
      currentStep.value = 4
      uni.showToast({
        title: '认证通过！',
        icon: 'success'
      })
    }, 2000)
  }, 1000)
}

const goToProfile = () => {
  uni.switchTab({
    url: '/pages/profile/index'
  })
}
</script>

<style lang="scss" scoped>
.education-page {
  min-height: 100vh;
  background-color: #FAFAFA;
  padding-bottom: 24px;
}

.education-navbar {
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

.education-navbar__back {
  font-size: 28px;
  color: #333333;
  cursor: pointer;
}

.education-navbar__title {
  font-size: 18px;
  font-weight: 500;
  color: #333333;
}

.education-navbar__right {
  width: 30px;
}

.education-header {
  background: linear-gradient(135deg, #A8B89A, #8AA07B);
  margin: 12px 24px;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.education-header__icon {
  font-size: 40px;
}

.education-header__title {
  font-size: 18px;
  font-weight: 500;
  color: #FFFFFF;
  margin-top: 4px;
}

.education-header__desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-top: 4px;
}

.education-header__badge {
  margin-top: 10px;
  padding: 4px 16px;
  font-size: 12px;
  color: #A8B89A;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
}

.education-steps {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  background-color: #FFFFFF;
  margin: 0 24px 12px;
  border-radius: 16px;
  position: relative;
}

.education-steps__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.education-steps__number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #999999;
  background-color: #F0F0F0;
  z-index: 1;
}

.education-steps__item--active .education-steps__number {
  color: #FFFFFF;
  background-color: #A8B89A;
}

.education-steps__item--done .education-steps__number {
  color: #FFFFFF;
  background-color: #8AA07B;
}

.education-steps__label {
  font-size: 11px;
  color: #999999;
  margin-top: 4px;
}

.education-steps__item--active .education-steps__label {
  color: #A8B89A;
}

.education-steps__line {
  position: absolute;
  top: 14px;
  left: 60%;
  width: 80%;
  height: 2px;
  background-color: #E5E5E5;
}

.education-steps__item--active .education-steps__line {
  background-color: #A8B89A;
}

.education-steps__item--done .education-steps__line {
  background-color: #A8B89A;
}

.education-steps__item:last-child .education-steps__line {
  display: none;
}

.education-content {
  padding: 0 24px;
}

.education-content--center {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40px;
}

.education-content__title {
  font-size: 17px;
  font-weight: 500;
  color: #333333;
  display: block;
}

.education-content__desc {
  font-size: 14px;
  color: #666666;
  display: block;
  margin-top: 4px;
}

.education-method {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background-color: #FFFFFF;
  border-radius: 12px;
  margin-top: 10px;
  border: 2px solid transparent;
  cursor: pointer;
}

.education-method--active {
  border-color: #A8B89A;
  background-color: #F2F5EF;
}

.education-method__icon {
  font-size: 24px;
}

.education-method__body {
  flex: 1;
}

.education-method__title {
  font-size: 15px;
  font-weight: 500;
  color: #333333;
  display: block;
}

.education-method__desc {
  font-size: 13px;
  color: #666666;
  display: block;
}

.education-method__check {
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

.education-upload {
  margin-top: 16px;
}

.education-upload__area {
  width: 100%;
  height: 200px;
  border: 2px dashed #E5E5E5;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.education-upload__area--filled {
  border-color: #A8B89A;
}

.education-upload__image {
  width: 100%;
  height: 100%;
}

.education-upload__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.education-upload__icon {
  font-size: 40px;
}

.education-upload__text {
  font-size: 15px;
  color: #666666;
  margin-top: 8px;
}

.education-upload__hint {
  font-size: 12px;
  color: #999999;
  margin-top: 4px;
}

.education-example {
  margin-top: 16px;
}

.education-example__title {
  font-size: 14px;
  color: #666666;
  display: block;
  margin-bottom: 8px;
}

.education-example__images {
  display: flex;
  gap: 12px;
}

.education-example__item {
  flex: 1;
}

.education-example__img {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  background-color: #F0F0F0;
}

.education-example__label {
  font-size: 12px;
  color: #999999;
  text-align: center;
  display: block;
  margin-top: 4px;
}

.education-content__actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.education-content__btn {
  flex: 1;
  height: 48px;
  background-color: #A8B89A;
  color: #FFFFFF;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  border: none;
}

.education-content__btn:disabled {
  background-color: #E5E5E5;
  color: #999999;
}

.education-content__btn--secondary {
  background-color: #FFFFFF;
  color: #666666;
  border: 1px solid #E5E5E5;
}

.education-content__btn--secondary:active {
  background-color: #FAFAFA;
}

.education-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.education-status__icon {
  font-size: 56px;
}

.education-status__title {
  font-size: 20px;
  font-weight: 500;
  color: #333333;
  margin-top: 12px;
}

.education-status__desc {
  font-size: 14px;
  color: #666666;
  margin-top: 4px;
}

.education-status__reward {
  margin-top: 12px;
  padding: 8px 20px;
  font-size: 14px;
  color: #A8B89A;
  background-color: #F2F5EF;
  border-radius: 20px;
}
</style>