<template>
  <view class="work-page">
    <!-- 导航栏 -->
    <view class="work-navbar">
      <text class="work-navbar__back" @click="handleBack">‹</text>
      <text class="work-navbar__title">工作认证</text>
      <view class="work-navbar__right"></view>
    </view>

    <!-- 认证说明 -->
    <view class="work-header">
      <view class="work-header__icon">💼</view>
      <text class="work-header__title">工作认证</text>
      <text class="work-header__desc">上传工牌、在职证明或企业邮箱截图，通过审核后获得专属标识</text>
      <view class="work-header__badge">认证后 +5次微信申请权益</view>
    </view>

    <!-- 认证步骤 -->
    <view class="work-steps">
      <view 
        v-for="(step, index) in steps" 
        :key="index"
        class="work-steps__item"
        :class="{
          'work-steps__item--active': index + 1 <= currentStep,
          'work-steps__item--done': index + 1 < currentStep
        }"
      >
        <view class="work-steps__number">{{ index + 1 }}</view>
        <text class="work-steps__label">{{ step }}</text>
        <view v-if="index < steps.length - 1" class="work-steps__line"></view>
      </view>
    </view>

    <!-- 步骤1：选择认证方式 -->
    <view v-if="currentStep === 1" class="work-content">
      <text class="work-content__title">选择认证方式</text>
      
      <view 
        v-for="(item, index) in authMethods" 
        :key="index"
        class="work-method"
        :class="{ 'work-method--active': selectedMethod === index }"
        @click="selectedMethod = index"
      >
        <text class="work-method__icon">{{ item.icon }}</text>
        <view class="work-method__body">
          <text class="work-method__title">{{ item.title }}</text>
          <text class="work-method__desc">{{ item.desc }}</text>
        </view>
        <view class="work-method__check">
          {{ selectedMethod === index ? '✓' : '' }}
        </view>
      </view>

      <button 
        class="work-content__btn" 
        @click="nextStep"
        :disabled="selectedMethod === null"
      >
        下一步
      </button>
    </view>

    <!-- 步骤2：上传凭证 + 填写信息 -->
    <view v-if="currentStep === 2" class="work-content">
      <text class="work-content__title">上传凭证</text>
      <text class="work-content__desc">
        {{ selectedMethod === 0 ? '请上传工牌或工作证照片' : 
           selectedMethod === 1 ? '请上传在职证明或收入证明' : 
           '请上传企业邮箱登录页面或邮件截图' }}
      </text>

      <view class="work-upload">
        <view 
          class="work-upload__area"
          :class="{ 'work-upload__area--filled': credentialImage }"
          @click="uploadCredential"
        >
          <image 
            v-if="credentialImage" 
            class="work-upload__image" 
            :src="credentialImage" 
            mode="aspectFill"
          />
          <view v-else class="work-upload__placeholder">
            <text class="work-upload__icon">📷</text>
            <text class="work-upload__text">点击上传凭证</text>
            <text class="work-upload__hint">支持 jpg、png 格式</text>
          </view>
        </view>
      </view>

      <!-- 企业名称（选填） -->
      <view class="work-form">
        <view class="work-form__item">
          <text class="work-form__label">企业名称</text>
          <input 
            class="work-form__input" 
            type="text"
            placeholder="选填，填写后可提高可信度"
            v-model="companyName"
          />
        </view>
        <view class="work-form__item">
          <text class="work-form__label">职位</text>
          <input 
            class="work-form__input" 
            type="text"
            placeholder="选填，如：产品经理"
            v-model="position"
          />
        </view>
      </view>

      <!-- 隐私说明 -->
      <view class="work-privacy">
        <text class="work-privacy__icon">🔒</text>
        <text class="work-privacy__text">企业信息仅用于认证审核，不会对外公开</text>
      </view>

      <view class="work-content__actions">
        <button class="work-content__btn work-content__btn--secondary" @click="prevStep">
          上一步
        </button>
        <button 
          class="work-content__btn" 
          @click="submitAuth"
          :disabled="!credentialImage"
        >
          提交认证
        </button>
      </view>
    </view>

    <!-- 步骤3：审核中 -->
    <view v-if="currentStep === 3" class="work-content work-content--center">
      <view class="work-status">
        <text class="work-status__icon">⏳</text>
        <text class="work-status__title">审核中</text>
        <text class="work-status__desc">我们会在 1-3 个工作日内完成审核</text>
        <text class="work-status__desc">审核通过后将获得工作认证标识</text>
      </view>
      <button class="work-content__btn" @click="goToProfile">
        返回个人主页
      </button>
    </view>

    <!-- 步骤4：认证成功 -->
    <view v-if="currentStep === 4" class="work-content work-content--center">
      <view class="work-status work-status--success">
        <text class="work-status__icon">✅</text>
        <text class="work-status__title">认证成功！</text>
        <text class="work-status__desc">您已获得工作认证标识</text>
        <view class="work-status__reward">
          🎁 获得 5 次微信申请权益
        </view>
      </view>
      <button class="work-content__btn" @click="goToProfile">
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
const companyName = ref('')
const position = ref('')

const steps = ['选择方式', '上传凭证', '审核']
const authMethods = [
  { icon: '🪪', title: '工牌/工作证', desc: '上传工牌或工作证照片' },
  { icon: '📄', title: '在职证明', desc: '上传在职证明或收入证明' },
  { icon: '✉️', title: '企业邮箱', desc: '上传企业邮箱页面截图' }
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
.work-page {
  min-height: 100vh;
  background-color: #FAFAFA;
  padding-bottom: 24px;
}

.work-navbar {
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

.work-navbar__back {
  font-size: 28px;
  color: #333333;
  cursor: pointer;
}

.work-navbar__title {
  font-size: 18px;
  font-weight: 500;
  color: #333333;
}

.work-navbar__right {
  width: 30px;
}

.work-header {
  background: linear-gradient(135deg, #A8B89A, #8AA07B);
  margin: 12px 24px;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.work-header__icon {
  font-size: 40px;
}

.work-header__title {
  font-size: 18px;
  font-weight: 500;
  color: #FFFFFF;
  margin-top: 4px;
}

.work-header__desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-top: 4px;
}

.work-header__badge {
  margin-top: 10px;
  padding: 4px 16px;
  font-size: 12px;
  color: #A8B89A;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
}

.work-steps {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  background-color: #FFFFFF;
  margin: 0 24px 12px;
  border-radius: 16px;
  position: relative;
}

.work-steps__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.work-steps__number {
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

.work-steps__item--active .work-steps__number {
  color: #FFFFFF;
  background-color: #A8B89A;
}

.work-steps__item--done .work-steps__number {
  color: #FFFFFF;
  background-color: #8AA07B;
}

.work-steps__label {
  font-size: 11px;
  color: #999999;
  margin-top: 4px;
}

.work-steps__item--active .work-steps__label {
  color: #A8B89A;
}

.work-steps__line {
  position: absolute;
  top: 14px;
  left: 60%;
  width: 80%;
  height: 2px;
  background-color: #E5E5E5;
}

.work-steps__item--active .work-steps__line {
  background-color: #A8B89A;
}

.work-steps__item--done .work-steps__line {
  background-color: #A8B89A;
}

.work-steps__item:last-child .work-steps__line {
  display: none;
}

.work-content {
  padding: 0 24px;
}

.work-content--center {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40px;
}

.work-content__title {
  font-size: 17px;
  font-weight: 500;
  color: #333333;
  display: block;
}

.work-content__desc {
  font-size: 14px;
  color: #666666;
  display: block;
  margin-top: 4px;
}

.work-method {
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

.work-method--active {
  border-color: #A8B89A;
  background-color: #F2F5EF;
}

.work-method__icon {
  font-size: 24px;
}

.work-method__body {
  flex: 1;
}

.work-method__title {
  font-size: 15px;
  font-weight: 500;
  color: #333333;
  display: block;
}

.work-method__desc {
  font-size: 13px;
  color: #666666;
  display: block;
}

.work-method__check {
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

.work-upload {
  margin-top: 16px;
}

.work-upload__area {
  width: 100%;
  height: 200px;
  border: 2px dashed #E5E5E5;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.work-upload__area--filled {
  border-color: #A8B89A;
}

.work-upload__image {
  width: 100%;
  height: 100%;
}

.work-upload__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.work-upload__icon {
  font-size: 40px;
}

.work-upload__text {
  font-size: 15px;
  color: #666666;
  margin-top: 8px;
}

.work-upload__hint {
  font-size: 12px;
  color: #999999;
  margin-top: 4px;
}

.work-form {
  margin-top: 16px;
}

.work-form__item {
  margin-bottom: 12px;
}

.work-form__label {
  font-size: 14px;
  color: #666666;
  display: block;
  margin-bottom: 4px;
}

.work-form__input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  background-color: #FAFAFA;
  border-radius: 12px;
  font-size: 15px;
  color: #333333;
  border: 1px solid #E5E5E5;
}

.work-form__input:focus {
  border-color: #A8B89A;
}

.work-privacy {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 10px 14px;
  background-color: #F2F5EF;
  border-radius: 10px;
}

.work-privacy__icon {
  font-size: 16px;
}

.work-privacy__text {
  font-size: 13px;
  color: #666666;
}

.work-content__actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.work-content__btn {
  flex: 1;
  height: 48px;
  background-color: #A8B89A;
  color: #FFFFFF;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  border: none;
}

.work-content__btn:disabled {
  background-color: #E5E5E5;
  color: #999999;
}

.work-content__btn--secondary {
  background-color: #FFFFFF;
  color: #666666;
  border: 1px solid #E5E5E5;
}

.work-content__btn--secondary:active {
  background-color: #FAFAFA;
}

.work-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.work-status__icon {
  font-size: 56px;
}

.work-status__title {
  font-size: 20px;
  font-weight: 500;
  color: #333333;
  margin-top: 12px;
}

.work-status__desc {
  font-size: 14px;
  color: #666666;
  margin-top: 4px;
}

.work-status__reward {
  margin-top: 12px;
  padding: 8px 20px;
  font-size: 14px;
  color: #A8B89A;
  background-color: #F2F5EF;
  border-radius: 20px;
}
</style>