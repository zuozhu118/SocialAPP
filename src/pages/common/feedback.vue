<template>
  <view class="feedback-page">
    <!-- 导航栏 -->
    <view class="feedback-navbar">
      <text class="feedback-navbar__back" @click="handleBack">‹</text>
      <text class="feedback-navbar__title">意见反馈</text>
      <text class="feedback-navbar__submit" @click="handleSubmit">提交</text>
    </view>

    <!-- 反馈内容 -->
    <view class="feedback-content">
      <!-- 反馈类型 -->
      <view class="feedback-section">
        <text class="feedback-section__title">反馈类型</text>
        <view class="feedback-types">
          <view 
            v-for="(item, index) in feedbackTypes" 
            :key="index"
            class="feedback-types__item"
            :class="{ 'feedback-types__item--active': selectedType === index }"
            @click="selectedType = index"
          >
            <text class="feedback-types__icon">{{ item.icon }}</text>
            <text class="feedback-types__label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <!-- 反馈内容输入 -->
      <view class="feedback-section">
        <text class="feedback-section__title">详细描述</text>
        <view class="feedback-textarea-wrapper">
          <textarea 
            class="feedback-textarea" 
            placeholder="请详细描述您的问题或建议，我们会认真对待每一条反馈"
            v-model="content"
            maxlength="500"
            :auto-height="true"
          />
          <text class="feedback-textarea__count">{{ content.length }}/500</text>
        </view>
      </view>

      <!-- 截图上传 -->
      <view class="feedback-section">
        <text class="feedback-section__title">截图（选填）</text>
        <text class="feedback-section__desc">上传相关截图有助于我们更快解决问题</text>
        <view class="feedback-images">
          <view 
            v-for="(img, index) in images" 
            :key="index"
            class="feedback-images__item"
          >
            <image class="feedback-images__img" :src="img" mode="aspectFill" />
            <view class="feedback-images__delete" @click="removeImage(index)">✕</view>
          </view>
          <view 
            v-if="images.length < 6" 
            class="feedback-images__add"
            @click="chooseImage"
          >
            <text class="feedback-images__add-icon">+</text>
            <text class="feedback-images__add-text">添加截图</text>
          </view>
        </view>
      </view>

      <!-- 联系方式 -->
      <view class="feedback-section">
        <text class="feedback-section__title">联系方式（选填）</text>
        <text class="feedback-section__desc">方便我们联系您了解详细情况</text>
        <input 
          class="feedback-input" 
          type="text"
          placeholder="请输入手机号或微信号"
          v-model="contact"
        />
      </view>
    </view>

    <!-- 底部提示 -->
    <view class="feedback-footer">
      <text class="feedback-footer__text">感谢您的反馈，我们会认真对待每一条建议 ❤️</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const selectedType = ref(0)
const content = ref('')
const images = ref([])
const contact = ref('')

const feedbackTypes = [
  { icon: '🐛', label: 'Bug反馈' },
  { icon: '💡', label: '功能建议' },
  { icon: '😊', label: '用户体验' },
  { icon: '🔒', label: '隐私安全' },
  { icon: '📢', label: '举报投诉' },
  { icon: '❓', label: '其他问题' }
]

const handleBack = () => {
  if (content.value || images.value.length > 0) {
    uni.showModal({
      title: '提示',
      content: '确定要退出吗？反馈内容将不会被保存',
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

const chooseImage = () => {
  const remain = 6 - images.value.length
  uni.chooseImage({
    count: remain,
    success: (res) => {
      images.value.push(...res.tempFilePaths)
    }
  })
}

const removeImage = (index) => {
  images.value.splice(index, 1)
}

const handleSubmit = () => {
  if (!content.value.trim()) {
    uni.showToast({
      title: '请填写详细描述',
      icon: 'none'
    })
    return
  }
  
  if (content.value.length < 10) {
    uni.showToast({
      title: '描述至少10个字',
      icon: 'none'
    })
    return
  }
  
  uni.showLoading({
    title: '提交中...'
  })
  
  // 模拟提交
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '反馈已提交！感谢您',
      icon: 'success'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  }, 1000)
}
</script>

<style lang="scss" scoped>
.feedback-page {
  min-height: 100vh;
  background-color: #FAFAFA;
  padding-bottom: 20px;
}

.feedback-navbar {
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

.feedback-navbar__back {
  font-size: 28px;
  color: #333333;
  cursor: pointer;
}

.feedback-navbar__title {
  font-size: 18px;
  font-weight: 500;
  color: #333333;
}

.feedback-navbar__submit {
  font-size: 16px;
  font-weight: 500;
  color: #A8B89A;
  cursor: pointer;
  padding: 4px 8px;
}

.feedback-navbar__submit:active {
  opacity: 0.6;
}

.feedback-content {
  padding: 12px 24px;
}

.feedback-section {
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
}

.feedback-section__title {
  font-size: 15px;
  font-weight: 500;
  color: #333333;
  display: block;
  margin-bottom: 6px;
}

.feedback-section__desc {
  font-size: 13px;
  color: #999999;
  display: block;
  margin-bottom: 12px;
}

.feedback-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.feedback-types__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background-color: #FAFAFA;
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.feedback-types__item--active {
  border-color: #A8B89A;
  background-color: #F2F5EF;
}

.feedback-types__icon {
  font-size: 24px;
}

.feedback-types__label {
  font-size: 12px;
  color: #666666;
  margin-top: 4px;
}

.feedback-textarea-wrapper {
  position: relative;
}

.feedback-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px 14px;
  background-color: #FAFAFA;
  border-radius: 12px;
  font-size: 15px;
  color: #333333;
  line-height: 1.8;
  resize: none;
  border: 1px solid #E5E5E5;
}

.feedback-textarea:focus {
  border-color: #A8B89A;
}

.feedback-textarea__count {
  position: absolute;
  bottom: 12px;
  right: 14px;
  font-size: 12px;
  color: #999999;
}

.feedback-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feedback-images__item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.feedback-images__img {
  width: 100%;
  height: 100%;
}

.feedback-images__delete {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.feedback-images__add {
  width: 80px;
  height: 80px;
  border: 2px dashed #E5E5E5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.feedback-images__add-icon {
  font-size: 28px;
  color: #999999;
}

.feedback-images__add-text {
  font-size: 11px;
  color: #999999;
  margin-top: 2px;
}

.feedback-input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  background-color: #FAFAFA;
  border-radius: 12px;
  font-size: 15px;
  color: #333333;
  border: 1px solid #E5E5E5;
}

.feedback-input:focus {
  border-color: #A8B89A;
}

.feedback-footer {
  text-align: center;
  padding: 12px 0;
}

.feedback-footer__text {
  font-size: 13px;
  color: #999999;
}
</style>