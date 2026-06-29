<template>
  <view class="realname-page">
    <!-- 导航栏 -->
    <view class="realname-navbar">
      <text class="realname-navbar__back" @click="handleBack">‹</text>
      <text class="realname-navbar__title">实名认证</text>
      <view class="realname-navbar__right"></view>
    </view>

    <!-- 步骤指示器 -->
    <view class="realname-steps">
      <view 
        v-for="(step, index) in steps" 
        :key="index"
        class="realname-steps__item"
        :class="{
          'realname-steps__item--active': index + 1 <= currentStep,
          'realname-steps__item--done': index + 1 < currentStep
        }"
      >
        <view class="realname-steps__number">{{ index + 1 }}</view>
        <text class="realname-steps__label">{{ step }}</text>
      </view>
    </view>

    <!-- 步骤1：上传身份证 -->
    <view v-if="currentStep === 1" class="realname-content">
      <text class="realname-content__title">上传身份证照片</text>
      <text class="realname-content__desc">请拍摄或上传清晰的身份证正反面</text>
      
      <view class="realname-upload">
        <view class="realname-upload__item" @click="uploadFront">
          <image 
            v-if="frontImage" 
            class="realname-upload__image" 
            :src="frontImage" 
            mode="aspectFill"
          />
          <view v-else class="realname-upload__placeholder">
            <text class="realname-upload__icon">📷</text>
            <text class="realname-upload__text">身份证正面</text>
          </view>
        </view>
        
        <view class="realname-upload__item" @click="uploadBack">
          <image 
            v-if="backImage" 
            class="realname-upload__image" 
            :src="backImage" 
            mode="aspectFill"
          />
          <view v-else class="realname-upload__placeholder">
            <text class="realname-upload__icon">📷</text>
            <text class="realname-upload__text">身份证反面</text>
          </view>
        </view>
      </view>

      <button 
        class="realname-content__btn" 
        @click="nextStep"
        :disabled="!frontImage || !backImage"
      >
        下一步
      </button>
    </view>

    <!-- 步骤2：人脸识别 -->
    <view v-if="currentStep === 2" class="realname-content">
      <text class="realname-content__title">人脸识别</text>
      <text class="realname-content__desc">请进行活体检测，确保本人操作</text>
      
      <view class="realname-face">
          <view class="realname-face__box">
              <view class="realname-face__icon-wrapper">
                  <text class="realname-face__icon">👤</text>
              </view>
              <text class="realname-face__text">请将面部放入框内</text>
              <view class="realname-face__frame"></view>
          </view>
      </view>

      <button class="realname-content__btn" @click="startFaceAuth">
        开始识别
      </button>
    </view>

    <!-- 步骤3：完成 -->
    <view v-if="currentStep === 3" class="realname-content realname-content--success">
      <text class="realname-content__success-icon">✅</text>
      <text class="realname-content__success-title">认证成功！</text>
      <text class="realname-content__success-desc">您已完成实名认证，</text>
      <text class="realname-content__success-desc">现在可以开始匹配了</text>
      
      <button class="realname-content__btn" @click="goToMatch">
        开始匹配
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const currentStep = ref(1)
const steps = ['上传身份证', '人脸识别', '完成']
const frontImage = ref('')
const backImage = ref('')

const handleBack = () => {
  uni.navigateBack()
}

const uploadFront = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      frontImage.value = res.tempFilePaths[0]
    }
  })
}

const uploadBack = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      backImage.value = res.tempFilePaths[0]
    }
  })
}

const nextStep = () => {
  currentStep.value = 2
}

const startFaceAuth = () => {
  uni.showLoading({
    title: '识别中...'
  })
  
  setTimeout(() => {
    uni.hideLoading()
    currentStep.value = 3
  }, 1500)
}

const goToMatch = () => {
  uni.switchTab({
    url: '/pages/match/index'
  })
}
</script>

<style lang="scss" scoped>
.realname-page {
  min-height: 100vh;
  background-color: #FAFAFA;
}

.realname-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E5E5E5;
}

.realname-navbar__back {
  font-size: 28px;
  color: #333333;
  cursor: pointer;
}

.realname-navbar__title {
  font-size: 18px;
  font-weight: 500;
  color: #333333;
}

.realname-navbar__right {
  width: 30px;
}

.realname-steps {
  display: flex;
  justify-content: space-between;
  padding: 24px 24px 20px;
  background-color: #FFFFFF;
}

.realname-steps__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.realname-steps__item::after {
  content: '';
  position: absolute;
  top: 14px;
  left: 60%;
  width: 80%;
  height: 2px;
  background-color: #E5E5E5;
}

.realname-steps__item:last-child::after {
  display: none;
}

.realname-steps__item--active::after {
  background-color: #A8B89A;
}

.realname-steps__item--done::after {
  background-color: #A8B89A;
}

.realname-steps__number {
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

.realname-steps__item--active .realname-steps__number {
  color: #FFFFFF;
  background-color: #A8B89A;
}

.realname-steps__item--done .realname-steps__number {
  color: #FFFFFF;
  background-color: #8AA07B;
}

.realname-steps__label {
  font-size: 12px;
  color: #999999;
  margin-top: 4px;
}

.realname-steps__item--active .realname-steps__label {
  color: #A8B89A;
}

.realname-content {
  padding: 24px;
}

.realname-content--success {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 60px;
}

.realname-content__title {
  font-size: 18px;
  font-weight: 500;
  color: #333333;
  display: block;
}

.realname-content__desc {
  font-size: 14px;
  color: #666666;
  margin-top: 4px;
  display: block;
}

.realname-upload {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

.realname-upload__item {
  flex: 1;
  height: 180px;
  border-radius: 12px;
  border: 2px dashed #E5E5E5;
  overflow: hidden;
  cursor: pointer;
}

.realname-upload__image {
  width: 100%;
  height: 100%;
}

.realname-upload__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.realname-upload__icon {
  font-size: 32px;
}

.realname-upload__text {
  font-size: 13px;
  color: #999999;
  margin-top: 8px;
}

.realname-content__btn {
  width: 100%;
  height: 48px;
  background-color: #A8B89A;
  color: #FFFFFF;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  margin-top: 24px;
}

.realname-content__btn:disabled {
  background-color: #E5E5E5;
  color: #999999;
}

.realname-face {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.realname-face__box {
  position: relative;
  width: 280px;
  height: 280px;
  border-radius: 16px;
  background-color: #F0F0F0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.realname-face__icon {
  font-size: 48px;
}

.realname-face__text {
  font-size: 14px;
  color: #666666;
  margin-top: 12px;
}

.realname-face__frame {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  border: 2px solid #A8B89A;
  border-radius: 12px;
}

.realname-content__success-icon {
  font-size: 64px;
}

.realname-content__success-title {
  font-size: 22px;
  font-weight: 500;
  color: #333333;
  margin-top: 16px;
}

.realname-content__success-desc {
  font-size: 14px;
  color: #666666;
}
</style>