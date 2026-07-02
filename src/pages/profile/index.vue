<template>
  <view class="profile-page">
    <!-- 导航栏 -->
    <view class="profile-navbar">
      <text class="profile-navbar__title">我的</text>
      <view class="profile-navbar__right">
        <text class="profile-navbar__icon icon icon-settings" @click="goToSettings" />
      </view>
    </view>

    <!-- 个人信息 -->
    <view class="profile-header">
      <view class="profile-header__avatar-wrapper">
        <image 
          class="profile-header__avatar"
          src="https://picsum.photos/200/200?random=30"
          mode="aspectFill" 
        />
        <view class="profile-header__edit" @click="handleEditAvatar">
          <text class="icon icon-camera" />
        </view>
      </view>

      <text class="profile-header__name">小鹿同学</text>

      <!-- 认证徽章 -->
      <view class="profile-header__badges">
        <view 
          class="profile-header__badge" 
          :class="{ 'profile-header__badge--done': authStatus.realName }"
          @click="goToRealNameAuth"
        >
          <AuthBadge type="realname" :size="18" />
          <text>{{ authStatus.realName ? '已实名' : '实名认证' }}</text>
        </view>
        <view 
          class="profile-header__badge"
          :class="{ 'profile-header__badge--done': authStatus.education }"
          @click="goToEducationAuth"
        >
          <AuthBadge type="education" :size="18" />
          <text>{{ authStatus.education ? '学历认证' : '学历认证' }}</text>
        </view>
        <view 
          class="profile-header__badge"
          :class="{ 'profile-header__badge--done': authStatus.work }"
          @click="goToWorkAuth"
        >
          <AuthBadge type="work" :size="18" />
          <text>{{ authStatus.work ? '工作认证' : '工作认证' }}</text>
        </view>
      </view>

      <!-- 资料完善度 -->
      <view class="profile-header__progress">
        <view class="profile-header__progress-bar">
          <view class="profile-header__progress-fill" :style="{ width: profileProgress + '%' }"></view>
        </view>
        <text class="profile-header__progress-text">资料完善度 {{ profileProgress }}%</text>
      </view>

      <!-- 快捷认证入口 -->
      <view class="profile-header__auth-hint" v-if="!authStatus.education || !authStatus.work">
        <text class="profile-header__auth-hint-text">
          💡 完成双认证，匹配优先级提升 50%
        </text>
        <view class="profile-header__auth-hint-actions">
          <text v-if="!authStatus.education" class="profile-header__auth-hint-btn" @click="goToEducationAuth">
            🎓 学历认证
          </text>
          <text v-if="!authStatus.work" class="profile-header__auth-hint-btn" @click="goToWorkAuth">
            💼 工作认证
          </text>
        </view>
      </view>
    </view>

    <!-- 签到 + 权益概览 -->
    <view class="profile-stats">
      <view class="profile-stats__item" @click="goToCheckin">
        <text class="profile-stats__icon">📅</text>
        <view class="profile-stats__info">
          <text class="profile-stats__label">连续签到</text>
          <text class="profile-stats__value">{{ checkinDays }}天</text>
        </view>
        <text class="profile-stats__arrow">›</text>
      </view>
      <view class="profile-stats__divider"></view>
      <view class="profile-stats__item" @click="goToEquity">
        <text class="profile-stats__icon">🎁</text>
        <view class="profile-stats__info">
          <text class="profile-stats__label">今日申请</text>
          <text class="profile-stats__value">{{ applyCount }}次</text>
        </view>
        <text class="profile-stats__arrow">›</text>
      </view>
      <view class="profile-stats__divider"></view>
      <view class="profile-stats__item" @click="goToEquity">
        <text class="profile-stats__icon">📢</text>
        <view class="profile-stats__info">
          <text class="profile-stats__label">曝光卡</text>
          <text class="profile-stats__value">{{ exposureCards }}张</text>
        </view>
        <text class="profile-stats__arrow">›</text>
      </view>
    </view>

    <!-- 基础资料 -->
    <view class="profile-card">
      <view class="profile-card__title">基础资料</view>
      <view class="profile-card__grid">
        <view class="profile-card__item">
          <text class="profile-card__label">性别</text>
          <text class="profile-card__value">女</text>
        </view>
        <view class="profile-card__item">
          <text class="profile-card__label">年龄</text>
          <text class="profile-card__value">24岁</text>
        </view>
        <view class="profile-card__item">
          <text class="profile-card__label">城市</text>
          <text class="profile-card__value">北京</text>
        </view>
        <view class="profile-card__item">
          <text class="profile-card__label">身高</text>
          <text class="profile-card__value">165cm</text>
        </view>
        <view class="profile-card__item">
          <text class="profile-card__label">学历</text>
          <text class="profile-card__value">本科</text>
        </view>
        <view class="profile-card__item">
          <text class="profile-card__label">情感需求</text>
          <text class="profile-card__value">恋爱</text>
        </view>
      </view>
      <view class="profile-card__edit" @click="goToEditProfile">
        <text class="icon icon-edit" /> 编辑资料
      </view>
    </view>

    <!-- 生活标签 -->
    <view class="profile-card">
      <view class="profile-card__title">生活标签</view>
      <view class="profile-card__tags">
        <text class="profile-card__tag">📷 摄影</text>
        <text class="profile-card__tag">✈️ 旅行</text>
        <text class="profile-card__tag">☕ 咖啡</text>
        <text class="profile-card__tag">📚 阅读</text>
        <text class="profile-card__tag">🎵 音乐</text>
      </view>
    </view>

    <!-- 我的动态 -->
    <view class="profile-card">
      <view class="profile-card__header">
        <text class="profile-card__title">我的动态</text>
        <text class="profile-card__more" @click="goToMyDynamics">查看全部 ›</text>
      </view>
      <view class="profile-dynamics">
        <view 
          v-for="(item, index) in myDynamics" 
          :key="item.id"
          class="profile-dynamics__item"
          @click="goToDynamicDetail(item.id)"
        >
          <image class="profile-dynamics__image" :src="item.image" mode="aspectFill" />
          <view class="profile-dynamics__overlay">
            <text class="profile-dynamics__count">❤️ {{ item.likes }}</text>
          </view>
        </view>
        <view class="profile-dynamics__item profile-dynamics__add" @click="goToPublish">
          <text class="profile-dynamics__add-icon">+</text>
          <text class="profile-dynamics__add-text">发布动态</text>
        </view>
      </view>
    </view>

    <!-- 底部菜单 -->
    <view class="profile-menu">
      <view class="profile-menu__item" @click="goToEquity">
        <text class="profile-menu__icon icon icon-gift" />
        <text class="profile-menu__label">权益中心</text>
        <text class="profile-menu__arrow">›</text>
      </view>
      <view class="profile-menu__item" @click="goToPrivacy">
        <text class="profile-menu__icon icon icon-lock" />
        <text class="profile-menu__label">隐私设置</text>
        <text class="profile-menu__arrow">›</text>
      </view>
      <view class="profile-menu__item" @click="goToSafetyCenter">
        <text class="profile-menu__icon icon icon-shield" style="color: $color-warning;" />
        <text class="profile-menu__label">安全中心</text>
        <text class="profile-menu__arrow">›</text>
      </view>
      <view class="profile-menu__item" @click="goToAntiFraud">
        <text class="profile-menu__icon icon icon-flag" />
        <text class="profile-menu__label">反诈专区</text>
        <text class="profile-menu__arrow">›</text>
      </view>
      <view class="profile-menu__item" @click="handleFeedback">
        <text class="profile-menu__icon icon icon-comment" />
        <text class="profile-menu__label">意见反馈</text>
        <text class="profile-menu__arrow">›</text>
      </view>
      <view class="profile-menu__item" @click="goToSettings">
        <text class="profile-menu__icon icon icon-settings" />
        <text class="profile-menu__label">设置</text>
        <text class="profile-menu__arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import AuthBadge from '@/components/common/AuthBadge.vue'

// ===== 状态 =====
const authStatus = ref({
  realName: true,
  education: false,
  work: false
})

const profileProgress = ref(75)
const checkinDays = ref(7)
const applyCount = ref(10)
const exposureCards = ref(3)

const myDynamics = ref([
  { id: 1, image: 'https://picsum.photos/200/200?random=40', likes: 23 },
  { id: 2, image: 'https://picsum.photos/200/200?random=41', likes: 45 },
  { id: 3, image: 'https://picsum.photos/200/200?random=42', likes: 12 },
  { id: 4, image: 'https://picsum.photos/200/200?random=43', likes: 67 }
])

// ===== 跳转方法 =====
const goToSettings = () => {
  uni.navigateTo({ url: '/pages/profile/settings' })
}

const goToEquity = () => {
  uni.navigateTo({ url: '/pages/profile/equity' })
}

const goToPrivacy = () => {
  uni.navigateTo({ url: '/pages/profile/privacy' })
}

const goToAntiFraud = () => {
  uni.navigateTo({ url: '/pages/common/antiFraud' })
}

const goToSafetyCenter = () => {
  uni.showToast({ title: '安全中心开发中', icon: 'none' })
}

const goToCheckin = () => {
  uni.showToast({ title: '签到成功！', icon: 'success' })
  checkinDays.value++
}

const goToRealNameAuth = () => {
  uni.navigateTo({ url: '/pages/auth/realname' })
}

const goToEducationAuth = () => {
  uni.navigateTo({ url: '/pages/auth/education' })
}

const goToWorkAuth = () => {
  uni.navigateTo({ url: '/pages/auth/work' })
}

const goToEditProfile = () => {
  uni.showToast({ title: '编辑资料开发中', icon: 'none' })
}

const handleEditAvatar = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      uni.showToast({ title: '头像更新成功', icon: 'success' })
    }
  })
}

const goToMyDynamics = () => {
  uni.showToast({ title: '全部动态开发中', icon: 'none' })
}

const goToDynamicDetail = (id) => {
  uni.navigateTo({ url: `/pages/dynamic/detail?id=${id}` })
}

const goToPublish = () => {
  uni.navigateTo({ url: '/pages/dynamic/publish' })
}

const handleFeedback = () => {
  uni.navigateTo({ url: '/pages/common/feedback' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.profile-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: $spacing-lg;
}

// ----- 导航栏 -----
.profile-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px $page-padding-x;
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba($border-light, 0.5);
  position: sticky;
  top: 0;
  z-index: $z-index-sticky;
}

.profile-navbar__title {
  font-size: $font-size-xl;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.profile-navbar__right {
  display: flex;
  gap: $spacing-md;
}

.profile-navbar__icon {
  font-size: 20px;
  color: $text-secondary;
  cursor: pointer;
  
  &:active {
    opacity: 0.6;
  }
}

// ----- 个人信息 -----
.profile-header {
  background-color: $bg-card;
  padding: $spacing-xl $page-padding-x $spacing-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid $border-light;
}

.profile-header__avatar-wrapper {
  position: relative;
  margin-bottom: $spacing-md;
}

.profile-header__avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: $bg-page;
  border: 2px solid $bg-card;
  box-shadow: $shadow-card;
}

.profile-header__edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background-color: $primary-color;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid $bg-card;
  cursor: pointer;
  
  &:active {
    opacity: 0.8;
  }
  
  .icon {
    font-size: 14px;
    color: #FFFFFF;
  }
}

.profile-header__name {
  font-size: $font-size-xl;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.profile-header__badges {
  display: flex;
  gap: $spacing-sm;
  margin-top: $spacing-sm;
  flex-wrap: wrap;
  justify-content: center;
}

.profile-header__badge {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: 4px 12px 4px 6px;
  font-size: $font-size-xs;
  color: $text-helper;
  background-color: $bg-page;
  border-radius: 20px;
  cursor: pointer;
  transition: all $duration-fast ease;
  border: 1px solid $border-light;
  
  &--done {
    color: $primary-color;
    background-color: $primary-light-bg;
    border-color: $primary-color;
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.profile-header__progress {
  width: 100%;
  margin-top: $spacing-md;
}

.profile-header__progress-bar {
  width: 100%;
  height: 4px;
  background-color: $bg-page;
  border-radius: 2px;
  overflow: hidden;
}

.profile-header__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $primary-color, $primary-dark);
  border-radius: 2px;
  transition: width $duration-slow ease;
}

.profile-header__progress-text {
  display: block;
  font-size: $font-size-xs;
  color: $text-helper;
  text-align: center;
  margin-top: $spacing-xs;
}

.profile-header__auth-hint {
  margin-top: $spacing-md;
  padding: $spacing-sm $spacing-md;
  background-color: $primary-light-bg;
  border-radius: $radius-sm;
  width: 100%;
  text-align: center;
}

.profile-header__auth-hint-text {
  font-size: $font-size-sm;
  color: $text-secondary;
  display: block;
}

.profile-header__auth-hint-actions {
  display: flex;
  gap: $spacing-sm;
  margin-top: $spacing-sm;
  justify-content: center;
}

.profile-header__auth-hint-btn {
  padding: 4px 16px;
  font-size: $font-size-xs;
  color: $primary-color;
  background-color: $bg-card;
  border-radius: 16px;
  cursor: pointer;
  border: 1px solid $primary-color;
  
  &:active {
    opacity: 0.7;
  }
}

// ----- 签到+权益概览 -----
.profile-stats {
  display: flex;
  background-color: $bg-card;
  margin: $spacing-sm $page-padding-x;
  border-radius: $radius-card;
  padding: $spacing-sm 0;
  box-shadow: $shadow-card;
}

.profile-stats__item {
  flex: 1;
  display: flex;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  cursor: pointer;
  gap: $spacing-sm;
  
  &:active {
    opacity: 0.7;
  }
}

.profile-stats__icon {
  font-size: 20px;
}

.profile-stats__info {
  flex: 1;
}

.profile-stats__label {
  display: block;
  font-size: $font-size-xs;
  color: $text-helper;
}

.profile-stats__value {
  display: block;
  font-size: $font-size-md;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.profile-stats__arrow {
  font-size: 18px;
  color: $text-helper;
}

.profile-stats__divider {
  width: 1px;
  background-color: $border-light;
}

// ----- 卡片 -----
.profile-card {
  background-color: $bg-card;
  margin: $spacing-sm $page-padding-x;
  border-radius: $radius-card;
  padding: $spacing-md;
  box-shadow: $shadow-card;
}

.profile-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-sm;
}

.profile-card__title {
  font-size: $font-size-md;
  font-weight: $font-weight-medium;
  color: $text-primary;
}

.profile-card__more {
  font-size: $font-size-xs;
  color: $text-helper;
  cursor: pointer;
  
  &:active {
    opacity: 0.6;
  }
}

.profile-card__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-xs $spacing-md;
}

.profile-card__item {
  display: flex;
  justify-content: space-between;
  padding: $spacing-xs 0;
}

.profile-card__label {
  font-size: $font-size-sm;
  color: $text-helper;
}

.profile-card__value {
  font-size: $font-size-sm;
  color: $text-primary;
}

.profile-card__edit {
  text-align: center;
  margin-top: $spacing-sm;
  padding-top: $spacing-sm;
  border-top: 1px solid $border-light;
  font-size: $font-size-sm;
  color: $text-helper;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  
  &:active {
    opacity: 0.6;
  }
  
  .icon {
    font-size: 14px;
  }
}

.profile-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.profile-card__tag {
  padding: 4px 14px;
  font-size: $font-size-sm;
  color: $text-secondary;
  background-color: $bg-page;
  border-radius: 14px;
}

// ----- 我的动态 -----
.profile-dynamics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-xs;
}

.profile-dynamics__item {
  position: relative;
  padding-bottom: 100%;
  border-radius: $radius-xs;
  overflow: hidden;
  cursor: pointer;
  
  &:active {
    transform: scale(0.98);
  }
}

.profile-dynamics__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.profile-dynamics__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-xs $spacing-sm;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
}

.profile-dynamics__count {
  font-size: $font-size-xs;
  color: #FFFFFF;
}

.profile-dynamics__add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: $bg-page;
  border: 2px dashed $border-light;
  border-radius: $radius-xs;
  cursor: pointer;
  
  &:active {
    background-color: $border-light;
  }
}

.profile-dynamics__add-icon {
  font-size: 28px;
  color: $text-helper;
}

.profile-dynamics__add-text {
  font-size: $font-size-xs;
  color: $text-helper;
  margin-top: $spacing-xs;
}

// ----- 底部菜单 -----
.profile-menu {
  background-color: $bg-card;
  margin: $spacing-sm $page-padding-x;
  border-radius: $radius-card;
  overflow: hidden;
  box-shadow: $shadow-card;
}

.profile-menu__item {
  display: flex;
  align-items: center;
  padding: 14px $spacing-md;
  border-bottom: 1px solid $border-light;
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background-color: $bg-page;
  }
}

.profile-menu__icon {
  font-size: 18px;
  color: $text-secondary;
  margin-right: $spacing-sm;
}

.profile-menu__label {
  flex: 1;
  font-size: $font-size-sm;
  color: $text-primary;
}

.profile-menu__arrow {
  font-size: 16px;
  color: $text-helper;
}
</style>