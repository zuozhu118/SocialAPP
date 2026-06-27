<template>
  <view class="publish-page">
    <!-- 导航栏 -->
    <view class="publish-navbar">
      <text class="publish-navbar__back" @click="handleBack">✕</text>
      <text class="publish-navbar__title">发布动态</text>
      <text class="publish-navbar__publish" @click="handlePublish">发布</text>
    </view>

    <!-- 内容输入 -->
    <view class="publish-content">
      <textarea 
        class="publish-content__input" 
        placeholder="分享你的生活...（至少10个字）"
        v-model="content"
        maxlength="500"
        :auto-height="true"
      />
      <text class="publish-content__count">{{ content.length }}/500</text>
    </view>

    <!-- 图片上传 -->
    <view class="publish-images">
      <text class="publish-images__title">添加图片（最多9张）</text>
      <view class="publish-images__list">
        <view 
          v-for="(img, index) in images" 
          :key="index"
          class="publish-images__item"
        >
          <image class="publish-images__img" :src="img" mode="aspectFill" />
          <view class="publish-images__delete" @click="removeImage(index)">✕</view>
        </view>
        <view 
          v-if="images.length < 9" 
          class="publish-images__add"
          @click="chooseImage"
        >
          <text class="publish-images__add-icon">+</text>
          <text class="publish-images__add-text">添加图片</text>
        </view>
      </view>
    </view>

    <!-- 位置标签 -->
    <view class="publish-location">
      <text class="publish-location__label">📍 位置标签</text>
      <view class="publish-location__select" @click="chooseLocation">
        <text :class="location ? 'publish-location__selected' : 'publish-location__placeholder'">
          {{ location || '添加位置，获得更多曝光' }}
        </text>
        <text class="publish-location__arrow">›</text>
      </view>
    </view>

    <!-- 隐私设置 -->
    <view class="publish-privacy">
      <text class="publish-privacy__label">🔒 谁可以看</text>
      <view 
        v-for="(item, index) in privacyOptions" 
        :key="index"
        class="publish-privacy__option"
        :class="{ 'publish-privacy__option--active': privacy === index }"
        @click="privacy = index"
      >
        <text class="publish-privacy__icon">{{ item.icon }}</text>
        <text class="publish-privacy__text">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const content = ref('')
const images = ref([])
const location = ref('')
const privacy = ref(0)

const privacyOptions = [
  { icon: '🌍', label: '全部可见' },
  { icon: '👥', label: '仅匹配好友' },
  { icon: '🔒', label: '仅自己可见' }
]

const handleBack = () => {
  if (content.value || images.value.length > 0) {
    uni.showModal({
      title: '提示',
      content: '确定要退出吗？内容将不会被保存',
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
  const remain = 9 - images.value.length
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

const chooseLocation = () => {
  uni.chooseLocation({
    success: (res) => {
      location.value = res.name || res.address
    }
  })
}

const handlePublish = () => {
  if (content.value.length < 10) {
    uni.showToast({
      title: '内容至少10个字',
      icon: 'none'
    })
    return
  }
  
  if (images.value.length === 0) {
    uni.showToast({
      title: '请至少添加1张图片',
      icon: 'none'
    })
    return
  }
  
  uni.showLoading({
    title: '发布中...'
  })
  
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '发布成功！',
      icon: 'success'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  }, 1500)
}
</script>

<style lang="scss" scoped>
.publish-page {
  min-height: 100vh;
  background-color: #FAFAFA;
}

.publish-navbar {
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

.publish-navbar__back {
  font-size: 20px;
  color: #333333;
  cursor: pointer;
  padding: 4px 8px;
}

.publish-navbar__title {
  font-size: 18px;
  font-weight: 500;
  color: #333333;
}

.publish-navbar__publish {
  font-size: 16px;
  font-weight: 500;
  color: #A8B89A;
  cursor: pointer;
  padding: 4px 8px;
}

.publish-navbar__publish:active {
  opacity: 0.6;
}

.publish-content {
  background-color: #FFFFFF;
  margin: 12px 24px;
  border-radius: 16px;
  padding: 16px;
  position: relative;
}

.publish-content__input {
  width: 100%;
  min-height: 120px;
  font-size: 16px;
  color: #333333;
  line-height: 1.8;
  resize: none;
}

.publish-content__count {
  position: absolute;
  bottom: 12px;
  right: 16px;
  font-size: 12px;
  color: #999999;
}

.publish-images {
  background-color: #FFFFFF;
  margin: 12px 24px;
  border-radius: 16px;
  padding: 16px;
}

.publish-images__title {
  font-size: 14px;
  color: #666666;
  display: block;
  margin-bottom: 12px;
}

.publish-images__list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.publish-images__item {
  position: relative;
  padding-bottom: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.publish-images__img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.publish-images__delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.publish-images__add {
  padding-bottom: 100%;
  border: 2px dashed #E5E5E5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.publish-images__add-icon {
  font-size: 32px;
  color: #999999;
}

.publish-images__add-text {
  font-size: 12px;
  color: #999999;
  margin-top: 4px;
}

.publish-location {
  background-color: #FFFFFF;
  margin: 12px 24px;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.publish-location__label {
  font-size: 14px;
  color: #666666;
}

.publish-location__select {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.publish-location__placeholder {
  font-size: 14px;
  color: #999999;
}

.publish-location__selected {
  font-size: 14px;
  color: #333333;
}

.publish-location__arrow {
  font-size: 18px;
  color: #999999;
}

.publish-privacy {
  background-color: #FFFFFF;
  margin: 12px 24px;
  border-radius: 16px;
  padding: 16px;
}

.publish-privacy__label {
  font-size: 14px;
  color: #666666;
  display: block;
  margin-bottom: 12px;
}

.publish-privacy__option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.publish-privacy__option--active {
  background-color: #F2F5EF;
}

.publish-privacy__icon {
  font-size: 16px;
}

.publish-privacy__text {
  font-size: 14px;
  color: #333333;
}
</style>