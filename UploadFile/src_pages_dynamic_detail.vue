<template>
  <view class="detail-page">
    <!-- 导航栏 -->
    <view class="detail-navbar">
      <text class="detail-navbar__back" @click="handleBack">‹</text>
      <text class="detail-navbar__title">动态详情</text>
      <text class="detail-navbar__more">⋯</text>
    </view>

    <!-- 动态内容 -->
    <scroll-view class="detail-content" scroll-y>
      <!-- 用户信息 -->
      <view class="detail-user">
        <image class="detail-user__avatar" :src="detail.userAvatar" mode="aspectFill" />
        <view class="detail-user__info">
          <view class="detail-user__name">
            {{ detail.userName }}
            <view v-if="detail.auth.realName" class="detail-user__badge">✓ 已实名</view>
          </view>
          <text class="detail-user__time">{{ detail.time }}</text>
        </view>
        <view v-if="detail.isQuality" class="detail-user__quality">优质</view>
      </view>

      <!-- 动态图片 -->
      <view class="detail-images">
        <image 
          v-for="(img, index) in detail.images" 
          :key="index"
          class="detail-images__item"
          :class="{ 'detail-images__item--single': detail.images.length === 1 }"
          :src="img" 
          mode="aspectFill"
          @click="previewImage(index)"
        />
      </view>

      <!-- 动态文字 -->
      <view class="detail-text">
        <text class="detail-text__content">{{ detail.content }}</text>
        <text v-if="detail.location" class="detail-text__location">📍 {{ detail.location }}</text>
      </view>

      <!-- 互动栏 -->
      <view class="detail-actions">
        <view class="detail-actions__item" @click="handleLike">
          <text class="detail-actions__icon">❤️</text>
          <text class="detail-actions__count">{{ detail.likes }}</text>
        </view>
        <view class="detail-actions__item" @click="handleComment">
          <text class="detail-actions__icon">💬</text>
          <text class="detail-actions__count">{{ detail.comments }}</text>
        </view>
        <view class="detail-actions__item" @click="handleShare">
          <text class="detail-actions__icon">🔗</text>
        </view>
        <view class="detail-actions__item" @click="handleReport">
          <text class="detail-actions__icon">🚩</text>
        </view>
      </view>

      <!-- 评论列表 -->
      <view class="detail-comments">
        <view class="detail-comments__title">全部评论 ({{ detail.comments }})</view>
        <view 
          v-for="(comment, index) in comments" 
          :key="index"
          class="detail-comments__item"
        >
          <image class="detail-comments__avatar" :src="comment.avatar" mode="aspectFill" />
          <view class="detail-comments__body">
            <view class="detail-comments__name">{{ comment.name }}</view>
            <text class="detail-comments__text">{{ comment.text }}</text>
            <text class="detail-comments__time">{{ comment.time }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 评论输入 -->
    <view class="detail-input">
      <input 
        class="detail-input__field" 
        type="text"
        placeholder="说点什么..."
        v-model="commentText"
        @confirm="submitComment"
      />
      <button class="detail-input__btn" @click="submitComment" :disabled="!commentText">
        发送
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onLoad } from 'vue'

const commentText = ref('')
const detail = ref({
  id: 1,
  userName: '林小鹿',
  userAvatar: 'https://picsum.photos/100/100?random=10',
  auth: { realName: true },
  time: '2小时前',
  content: '今天的阳光真好，在咖啡馆看了一下午的书📖 有小伙伴推荐好看的书吗？',
  images: ['https://picsum.photos/400/300?random=20', 'https://picsum.photos/400/300?random=21'],
  location: '北京·三里屯',
  likes: 23,
  comments: 8,
  isQuality: true
})

const comments = ref([
  {
    name: '陈橘子',
    avatar: 'https://picsum.photos/100/100?random=11',
    text: '好美呀！这是哪家咖啡馆？',
    time: '1小时前'
  },
  {
    name: '周小白',
    avatar: 'https://picsum.photos/100/100?random=12',
    text: '推荐《百年孤独》！',
    time: '30分钟前'
  }
])

const handleBack = () => {
  uni.navigateBack()
}

const previewImage = (index) => {
  uni.previewImage({
    current: index,
    urls: detail.value.images
  })
}

const handleLike = () => {
  detail.value.likes++
  uni.showToast({
    title: '已点赞 ❤️',
    icon: 'success'
  })
}

const handleComment = () => {
  // 聚焦到输入框
}

const handleShare = () => {
  uni.showToast({
    title: '分享功能开发中',
    icon: 'none'
  })
}

const handleReport = () => {
  uni.navigateTo({
    url: '/pages/common/report'
  })
}

const submitComment = () => {
  if (!commentText.value.trim()) return
  
  comments.value.unshift({
    name: '我',
    avatar: 'https://picsum.photos/100/100?random=30',
    text: commentText.value,
    time: '刚刚'
  })
  
  detail.value.comments++
  commentText.value = ''
  
  uni.showToast({
    title: '评论成功',
    icon: 'success'
  })
}

onLoad((options) => {
  console.log('动态ID:', options.id)
})
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background-color: #FAFAFA;
}

.detail-navbar {
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

.detail-navbar__back {
  font-size: 28px;
  color: #333333;
  cursor: pointer;
}

.detail-navbar__title {
  font-size: 18px;
  font-weight: 500;
  color: #333333;
}

.detail-navbar__more {
  font-size: 20px;
  color: #666666;
}

.detail-content {
  height: calc(100vh - 120px);
  padding: 0 24px;
}

.detail-user {
  display: flex;
  align-items: center;
  padding: 16px 0;
}

.detail-user__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: #FAFAFA;
}

.detail-user__info {
  flex: 1;
  margin-left: 12px;
}

.detail-user__name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #333333;
}

.detail-user__badge {
  font-size: 11px;
  font-weight: 400;
  color: #A8B89A;
  background-color: #F2F5EF;
  padding: 1px 8px;
  border-radius: 10px;
}

.detail-user__time {
  font-size: 12px;
  color: #999999;
}

.detail-user__quality {
  padding: 2px 12px;
  font-size: 11px;
  font-weight: 500;
  color: #FFFFFF;
  background-color: #A8B89A;
  border-radius: 10px;
}

.detail-images {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-bottom: 12px;
}

.detail-images__item {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  background-color: #FAFAFA;
}

.detail-images__item--single {
  grid-column: 1 / -1;
  height: 300px;
}

.detail-text {
  padding: 8px 0 16px;
}

.detail-text__content {
  font-size: 15px;
  color: #333333;
  line-height: 1.8;
}

.detail-text__location {
  display: block;
  font-size: 13px;
  color: #999999;
  margin-top: 8px;
}

.detail-actions {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid #E5E5E5;
  border-bottom: 1px solid #E5E5E5;
  gap: 32px;
}

.detail-actions__item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.detail-actions__item:active {
  opacity: 0.6;
}

.detail-actions__icon {
  font-size: 18px;
}

.detail-actions__count {
  font-size: 13px;
  color: #666666;
}

.detail-comments {
  padding: 16px 0;
}

.detail-comments__title {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 16px;
}

.detail-comments__item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #F5F5F5;
}

.detail-comments__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: #FAFAFA;
}

.detail-comments__body {
  flex: 1;
}

.detail-comments__name {
  font-size: 13px;
  font-weight: 500;
  color: #333333;
}

.detail-comments__text {
  display: block;
  font-size: 14px;
  color: #666666;
  margin: 2px 0;
}

.detail-comments__time {
  font-size: 11px;
  color: #999999;
}

.detail-input {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background-color: #FFFFFF;
  border-top: 1px solid #E5E5E5;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

.detail-input__field {
  flex: 1;
  height: 36px;
  padding: 0 14px;
  background-color: #F5F5F5;
  border-radius: 18px;
  font-size: 14px;
}

.detail-input__btn {
  height: 36px;
  padding: 0 20px;
  background-color: #A8B89A;
  color: #FFFFFF;
  border-radius: 18px;
  font-size: 14px;
  border: none;
}

.detail-input__btn:disabled {
  background-color: #E5E5E5;
  color: #999999;
}
</style>