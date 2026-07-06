<template>
  <view class="profile-page">
    <!-- 个人信息头部 -->
    <view class="profile-header">
      <view class="profile-header__main">
        <view class="profile-header__avatar-wrap">
          <image 
            class="profile-header__avatar"
            src="https://picsum.photos/200/200?random=30"
            mode="aspectFill" 
          />
          <!-- 认证等级对勾，和他人页规则统一 -->
          <view class="avatar-auth-icon" :class="'auth-level-' + getAuthLevel(authStatus)" v-if="authStatus.realName">
            <text class="icon icon-check"></text>
          </view>
        </view>

        <view class="profile-header__info">
          <view class="profile-header__name-row">
            <text class="profile-header__name">小鹿同学</text>
            <text class="profile-header__edit" @click="goToMyProfile">
              编辑资料 <text class="icon icon-arrow-right"></text>
            </text>
          </view>
          <!-- 平台ID -->
          <text class="profile-header__id">ID：{{ userId }}</text>
        </view>
      </view>

      <!-- 认证状态区：明确文字标注，三列横向排列 -->
      <view class="auth-status-card">
        <view class="auth-status__item" :class="{ 'is-active': authStatus.realName }" @click="goToRealNameAuth">
          <text class="auth-status__icon icon icon-id-card"></text>
          <view class="auth-status__text">
            <text class="auth-status__label">实名认证</text>
            <text class="auth-status__value">{{ authStatus.realName ? '已认证' : '去认证' }}</text>
          </view>
        </view>
        <view class="auth-status__item" :class="{ 'is-active': authStatus.education }" @click="goToEducationAuth">
          <text class="auth-status__icon icon icon-graduation"></text>
          <view class="auth-status__text">
            <text class="auth-status__label">学历认证</text>
            <text class="auth-status__value">{{ authStatus.education ? '已认证' : '去认证' }}</text>
          </view>
        </view>
        <view class="auth-status__item" :class="{ 'is-active': authStatus.work }" @click="goToWorkAuth">
          <text class="auth-status__icon icon icon-briefcase"></text>
          <view class="auth-status__text">
            <text class="auth-status__label">工作认证</text>
            <text class="auth-status__value">{{ authStatus.work ? '已认证' : '去认证' }}</text>
          </view>
        </view>
      </view>

      <!-- 资料完善度 -->
      <view class="profile-progress" @click="goToMyProfile">
        <view class="profile-progress__bar">
          <view class="profile-progress__fill" :style="{ width: profileProgress + '%' }"></view>
        </view>
        <text class="profile-progress__text">资料完善度 {{ profileProgress }}%，完善后匹配更精准</text>
      </view>
    </view>

    <!-- 核心数据统计卡 -->
    <view class="stats-card">
      <view class="stats-card__item" @click="goToLikeList('send')">
        <text class="stats-card__num">{{ likeSendCount }}</text>
        <text class="stats-card__label">我喜欢的</text>
      </view>
      <view class="stats-card__divider"></view>
      <view class="stats-card__item" @click="goToLikeList('receive')">
        <text class="stats-card__num">{{ likeReceiveCount }}</text>
        <text class="stats-card__label">喜欢我的</text>
      </view>
      <view class="stats-card__divider"></view>
      <view class="stats-card__item" @click="goToVisitorList">
        <text class="stats-card__num">{{ visitorCount }}</text>
        <text class="stats-card__label">最近来访</text>
      </view>
    </view>

    <!-- 我的勋章入口 -->
    <view class="entry-card">
      <view class="entry-card__item" @click="goToMedalWall">
        <view class="entry-card__icon entry-card__icon--purple">
          <text class="icon icon-medal"></text>
        </view>
        <view class="entry-card__info">
          <text class="entry-card__title">我的勋章</text>
          <text class="entry-card__sub">已获得 {{ medalCount }} 枚荣誉勋章</text>
        </view>
        <text class="entry-card__arrow icon icon-arrow-right"></text>
      </view>
    </view>

    <!-- 工具菜单 -->
    <view class="menu-card">
      <view class="menu-card__item" @click="goToEquity">
        <text class="menu-card__icon icon icon-gift" />
        <text class="menu-card__label">权益中心</text>
        <text class="menu-card__arrow icon icon-arrow-right"></text>
      </view>
      <view class="menu-card__item" @click="goToPrivacy">
        <text class="menu-card__icon icon icon-lock" />
        <text class="menu-card__label">隐私设置</text>
        <text class="menu-card__arrow icon icon-arrow-right"></text>
      </view>
      <view class="menu-card__item" @click="goToSafetyCenter">
        <text class="menu-card__icon icon icon-shield" style="color: #FF9800;" />
        <text class="menu-card__label">安全中心</text>
        <text class="menu-card__arrow icon icon-arrow-right"></text>
      </view>
      <view class="menu-card__item" @click="goToAntiFraud">
        <text class="menu-card__icon icon icon-flag" />
        <text class="menu-card__label">反诈专区</text>
        <text class="menu-card__arrow icon icon-arrow-right"></text>
      </view>
      <view class="menu-card__item" @click="handleFeedback">
        <text class="menu-card__icon icon icon-comment" />
        <text class="menu-card__label">意见反馈</text>
        <text class="menu-card__arrow icon icon-arrow-right"></text>
      </view>
      <view class="menu-card__item" @click="goToSettings">
        <text class="menu-card__icon icon icon-settings" />
        <text class="menu-card__label">设置</text>
        <text class="menu-card__arrow icon icon-arrow-right"></text>
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="page-bottom-placeholder"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// ===== 状态数据 =====
const userId = ref('10086520') // 平台唯一ID

const authStatus = ref({
  realName: true,
  education: false,
  work: false
})
const profileProgress = ref(75)

// 核心统计数据
const likeSendCount = ref(12)
const likeReceiveCount = ref(8)
const visitorCount = ref(26)

// 勋章数据
const medalCount = ref(4)

// 认证等级计算，和他人页规则统一
const getAuthLevel = (auth) => {
  let level = 0
  if (auth.realName) level = 1
  if (auth.realName && auth.education) level = 2
  if (auth.realName && auth.education && auth.work) level = 3
  return level
}

// ===== 跳转方法 =====
// 跳转自己的个人主页（编辑资料）
const goToMyProfile = () => {
    uni.navigateTo({ url: '/pages/profile/edit' })
}

// 认证页面跳转
const goToRealNameAuth = () => {
  uni.navigateTo({ url: '/pages/auth/realname' })
}
const goToEducationAuth = () => {
  uni.navigateTo({ url: '/pages/auth/education' })
}
const goToWorkAuth = () => {
  uni.navigateTo({ url: '/pages/auth/work' })
}

// 喜欢/访客列表
const goToLikeList = (type) => {
  uni.navigateTo({ url: `/pages/user/like-list?type=${type}` })
}
const goToVisitorList = () => {
  uni.navigateTo({ url: '/pages/user/visitor-list' })
}

// 勋章墙
const goToMedalWall = () => {
  uni.navigateTo({ url: '/pages/user/medal-wall' })
}

// 其他页面跳转
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
const handleFeedback = () => {
  uni.navigateTo({ url: '/pages/common/feedback' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.profile-page {
  min-height: 100vh;
  background-color: $bg-page;
}

// ----- 个人信息头部 -----
.profile-header {
  background-color: $bg-card;
  padding: $spacing-lg $page-padding-x $spacing-md;
  margin-bottom: 12px;
}

.profile-header__main {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: $spacing-md;
}

.profile-header__avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.profile-header__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: $bg-page;
  border: 2px solid $bg-card;
  box-shadow: $shadow-card;
  display: block;
}

// 头像认证对勾，和他人页完全统一
.avatar-auth-icon {
  position: absolute;
  right: 0;
  bottom: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid $bg-card;

  .icon {
    font-size: 11px;
    color: #FFFFFF;
    line-height: 1;
  }

  &.auth-level-1 {
    background-color: transparent;
    border: 1.5px solid #81D4A0;
    .icon {
      color: #81D4A0;
      font-size: 10px;
    }
  }

  &.auth-level-2 {
    background-color: #2ED573;
    border: 2px solid $bg-card;
  }

  &.auth-level-3 {
    background: linear-gradient(135deg, #FFD700, #FFB74D);
    border: 2px solid $bg-card;
    box-shadow: 0 0 6px rgba(255, 183, 77, 0.4);
  }
}

.profile-header__info {
  flex: 1;
  min-width: 0;
}

.profile-header__name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.profile-header__name {
  font-size: 20px;
  font-weight: $font-weight-medium;
  color: $text-primary;
  line-height: 1.2;
}

.profile-header__edit {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: $primary-color;
  cursor: pointer;

  .icon {
    font-size: 11px;
  }

  &:active {
    opacity: 0.7;
  }
}

.profile-header__id {
  font-size: 12px;
  color: $text-helper;
  display: block;
}

// ----- 认证状态卡片 -----
.auth-status-card {
  display: flex;
  gap: 8px;
  margin-bottom: $spacing-md;
}

.auth-status__item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 8px;
  border-radius: 10px;
  background-color: $bg-page;
  cursor: pointer;
  transition: all $duration-fast ease;

  &:active {
    transform: scale(0.98);
  }

  &.is-active {
    background-color: rgba(46, 213, 115, 0.08);

    .auth-status__icon {
      color: #2ED573;
    }
    .auth-status__value {
      color: #2E7D32;
    }
  }
}

.auth-status__icon {
  flex-shrink: 0;
  font-size: 18px;
  color: $text-helper;
}

.auth-status__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.auth-status__label {
  font-size: 12px;
  color: $text-primary;
  line-height: 1.2;
}

.auth-status__value {
  font-size: 11px;
  color: $primary-color;
  font-weight: $font-weight-regular;
  line-height: 1.2;
}

// 资料完善度
.profile-progress {
  cursor: pointer;

  &:active {
    opacity: 0.8;
  }

  &__bar {
    width: 100%;
    height: 4px;
    background-color: $bg-page;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 6px;
  }

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, $primary-color, $primary-dark);
    border-radius: 2px;
    transition: width $duration-slow ease;
  }

  &__text {
    font-size: 11px;
    color: $text-helper;
  }
}

// ----- 核心数据统计卡 -----
.stats-card {
  display: flex;
  align-items: center;
  background-color: $bg-card;
  margin: 0 $page-padding-x 12px;
  border-radius: $radius-card;
  padding: $spacing-md 0;
  box-shadow: $shadow-card;
}

.stats-card__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  &:active {
    opacity: 0.7;
  }
}

.stats-card__num {
  font-size: 20px;
  font-weight: $font-weight-medium;
  color: $text-primary;
  line-height: 1.2;
}

.stats-card__label {
  font-size: 12px;
  color: $text-helper;
}

.stats-card__divider {
  width: 1px;
  height: 32px;
  background-color: $border-light;
}

// ----- 勋章入口卡片 -----
.entry-card {
  background-color: $bg-card;
  margin: 0 $page-padding-x 12px;
  border-radius: $radius-card;
  overflow: hidden;
  box-shadow: $shadow-card;
}

.entry-card__item {
  display: flex;
  align-items: center;
  padding: 14px $spacing-md;
  cursor: pointer;

  &:active {
    background-color: $bg-page;
  }
}

.entry-card__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $spacing-sm;
  flex-shrink: 0;

  .icon {
    font-size: 18px;
    color: #FFFFFF;
  }

  &--purple {
    background: linear-gradient(135deg, #9C27B0, #7B1FA2);
  }
}

.entry-card__info {
  flex: 1;
  min-width: 0;
}

.entry-card__title {
  display: block;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin-bottom: 2px;
}

.entry-card__sub {
  display: block;
  font-size: 11px;
  color: $text-helper;
}

.entry-card__arrow {
  font-size: 12px;
  color: $text-helper;
}

// ----- 工具菜单 -----
.menu-card {
  background-color: $bg-card;
  margin: 0 $page-padding-x 12px;
  border-radius: $radius-card;
  overflow: hidden;
  box-shadow: $shadow-card;
}

.menu-card__item {
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

.menu-card__icon {
  font-size: 18px;
  color: $text-secondary;
  margin-right: $spacing-sm;
}

.menu-card__label {
  flex: 1;
  font-size: $font-size-sm;
  color: $text-primary;
}

.menu-card__arrow {
  font-size: 12px;
  color: $text-helper;
}

// 底部占位
.page-bottom-placeholder {
  height: 20px;
}
</style>