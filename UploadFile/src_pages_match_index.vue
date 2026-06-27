<template>
  <view class="match-page">
    <!-- 自定义导航栏 -->
    <view class="match-navbar">
      <view class="match-navbar__title">真实交友</view>
      <view class="match-navbar__right">
        <text class="match-navbar__icon">🔍</text>
        <text class="match-navbar__icon">⚙️</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="match-filter">
      <scroll-view scroll-x class="match-filter__scroll" show-scrollbar="false">
        <view class="match-filter__tags">
          <view 
            v-for="(filter, index) in filterOptions" 
            :key="index"
            class="match-filter__tag"
            :class="{ 'match-filter__tag--active': filter.active }"
            @click="toggleFilter(index)"
          >
            {{ filter.label }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 匹配卡片区域 -->
    <view class="match-cards">
      <view 
        v-for="(user, index) in matchUsers" 
        :key="user.id"
        class="match-card"
        :style="getCardStyle(index)"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- 卡片图片 -->
        <view class="match-card__image-wrapper">
          <image 
            class="match-card__image" 
            :src="user.avatar" 
            mode="aspectFill"
          />
          <!-- 用户认证标签 -->
          <view class="match-card__badges">
            <view v-if="user.auth.realName" class="match-card__badge">
              <text class="match-card__badge-icon">✓</text>
              已实名
            </view>
            <view v-if="user.auth.education" class="match-card__badge match-card__badge--dark">
              <text class="match-card__badge-icon">🎓</text>
              学历认证
            </view>
            <view v-if="user.auth.work" class="match-card__badge match-card__badge--dark">
              <text class="match-card__badge-icon">💼</text>
              在职认证
            </view>
          </view>
        </view>

        <!-- 用户信息 -->
        <view class="match-card__info">
          <view class="match-card__header">
            <text class="match-card__name">{{ user.name }}</text>
            <text class="match-card__age">{{ user.age }}岁</text>
          </view>
          <view class="match-card__detail">
            <text class="match-card__detail-text">{{ user.city }}</text>
            <text class="match-card__detail-dot">·</text>
            <text class="match-card__detail-text">{{ user.education }}</text>
          </view>
          <view class="match-card__tags">
            <text 
              v-for="(tag, idx) in user.tags" 
              :key="idx"
              class="match-card__tag"
            >
              {{ tag }}
            </text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="match-card__actions">
          <button class="match-card__btn match-card__btn--skip" @click="handleSkip(index)">
            ✕ 跳过
          </button>
          <button class="match-card__btn match-card__btn--like" @click="handleLike(index)">
            ❤️ 喜欢
          </button>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="matchUsers.length === 0" class="match-empty">
        <text class="match-empty__icon">🔍</text>
        <text class="match-empty__title">暂无匹配用户</text>
        <text class="match-empty__desc">稍后再来看看吧</text>
      </view>
    </view>

    <!-- 底部提示 -->
    <view class="match-footer">
      <text class="match-footer__text">💡 双向喜欢才能交换微信哦</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// ===== 假数据 =====
const matchUsers = ref([
  {
    id: 1,
    name: '林小鹿',
    age: 24,
    avatar: 'https://picsum.photos/400/500?random=1',
    city: '北京',
    education: '本科',
    tags: ['摄影', '旅行', '咖啡'],
    auth: {
      realName: true,
      education: true,
      work: false
    }
  },
  {
    id: 2,
    name: '陈橘子',
    age: 26,
    avatar: 'https://picsum.photos/400/500?random=2',
    city: '上海',
    education: '硕士',
    tags: ['瑜伽', '阅读', '音乐'],
    auth: {
      realName: true,
      education: true,
      work: true
    }
  },
  {
    id: 3,
    name: '周小白',
    age: 23,
    avatar: 'https://picsum.photos/400/500?random=3',
    city: '深圳',
    education: '本科',
    tags: ['健身', '画画', '养猫'],
    auth: {
      realName: true,
      education: false,
      work: true
    }
  },
  {
    id: 4,
    name: '吴晴天',
    age: 27,
    avatar: 'https://picsum.photos/400/500?random=4',
    city: '杭州',
    education: '本科',
    tags: ['音乐', '美食', '旅行'],
    auth: {
      realName: true,
      education: true,
      work: true
    }
  },
  {
    id: 5,
    name: '郑小暖',
    age: 25,
    avatar: 'https://picsum.photos/400/500?random=5',
    city: '成都',
    education: '硕士',
    tags: ['摄影', '阅读', '咖啡'],
    auth: {
      realName: true,
      education: false,
      work: false
    }
  }
])

const filterOptions = ref([
  { label: '全部', active: true },
  { label: '同城', active: false },
  { label: '本科+', active: false },
  { label: '认证用户', active: false },
  { label: '近期活跃', active: false }
])

// ===== 触摸滑动逻辑 =====
let startX = 0
let startY = 0
let currentIndex = 0

const handleTouchStart = (e) => {
  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
}

const handleTouchMove = (e) => {
  // 滑动逻辑
}

const handleTouchEnd = (e) => {
  const endX = e.changedTouches[0].clientX
  const endY = e.changedTouches[0].clientY
  const diffX = endX - startX
  const diffY = endY - startY

  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
    if (diffX > 0) {
      // 向右滑 - 喜欢
      handleLike(0)
    } else {
      // 向左滑 - 跳过
      handleSkip(0)
    }
  }
}

// ===== 操作方法 =====
const getCardStyle = (index) => {
  if (index === 0) {
    return {
      transform: 'scale(1)',
      zIndex: 10
    }
  }
  if (index === 1) {
    return {
      transform: 'scale(0.95) translateY(10px)',
      zIndex: 9
    }
  }
  if (index === 2) {
    return {
      transform: 'scale(0.9) translateY(20px)',
      zIndex: 8
    }
  }
  return {
    transform: `scale(${1 - index * 0.05}) translateY(${index * 10}px)`,
    zIndex: 10 - index
  }
}

const handleLike = (index) => {
  if (matchUsers.value.length === 0) return
  uni.showToast({
    title: '❤️ 已喜欢',
    icon: 'success'
  })
  // 移除当前卡片
  matchUsers.value.splice(index, 1)
  // 重置索引
  currentIndex = 0
}

const handleSkip = (index) => {
  if (matchUsers.value.length === 0) return
  uni.showToast({
    title: '已跳过',
    icon: 'none'
  })
  matchUsers.value.splice(index, 1)
  currentIndex = 0
}

const toggleFilter = (index) => {
  filterOptions.value.forEach((item, i) => {
    item.active = i === index
  })
}

// ===== 生命周期 =====
onMounted(() => {
  console.log('匹配页加载完成')
})
</script>

<style lang="scss" scoped>
.match-page {
  min-height: 100vh;
  background-color: #FAFAFA;
  padding-bottom: 20px;
}

// ----- 导航栏 -----
.match-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E5E5E5;
  
  &__title {
    font-size: 20px;
    font-weight: 500;
    color: #333333;
  }
  
  &__right {
    display: flex;
    gap: 16px;
  }
  
  &__icon {
    font-size: 20px;
  }
}

// ----- 筛选栏 -----
.match-filter {
  padding: 12px 24px;
  background-color: #FFFFFF;
  
  &__scroll {
    white-space: nowrap;
  }
  
  &__tags {
    display: inline-flex;
    gap: 8px;
  }
  
  &__tag {
    display: inline-block;
    padding: 6px 16px;
    font-size: 14px;
    color: #666666;
    background-color: #FAFAFA;
    border-radius: 20px;
    white-space: nowrap;
    transition: all 0.2s;
    
    &--active {
      color: #A8B89A;
      background-color: #F2F5EF;
      border: 1px solid #A8B89A;
    }
  }
}

// ----- 匹配卡片 -----
.match-cards {
  position: relative;
  padding: 16px 24px;
  height: calc(100vh - 220px);
}

.match-card {
  position: absolute;
  top: 0;
  left: 24px;
  right: 24px;
  background-color: #FFFFFF;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  
  &__image-wrapper {
    position: relative;
    width: 100%;
    padding-bottom: 125%;
  }
  
  &__image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  
  &__badges {
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  
  &__badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 500;
    color: #A8B89A;
    background-color: #F2F5EF;
    border-radius: 12px;
    
    &--dark {
      color: #FFFFFF;
      background-color: #8AA07B;
    }
  }
  
  &__badge-icon {
    font-size: 12px;
  }
  
  &__info {
    padding: 16px 16px 12px;
  }
  
  &__header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 4px;
  }
  
  &__name {
    font-size: 18px;
    font-weight: 500;
    color: #333333;
  }
  
  &__age {
    font-size: 14px;
    color: #666666;
  }
  
  &__detail {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #666666;
    margin-bottom: 8px;
  }
  
  &__detail-dot {
    margin: 0 6px;
  }
  
  &__tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  
  &__tag {
    padding: 2px 12px;
    font-size: 12px;
    color: #666666;
    background-color: #FAFAFA;
    border-radius: 12px;
  }
  
  &__actions {
    display: flex;
    gap: 16px;
    padding: 0 16px 20px;
  }
  
  &__btn {
    flex: 1;
    height: 44px;
    border-radius: 22px;
    font-size: 16px;
    font-weight: 500;
    border: none;
    
    &--skip {
      background-color: #FFFFFF;
      color: #666666;
      border: 1px solid #E5E5E5;
    }
    
    &--like {
      background-color: #F2F5EF;
      color: #A8B89A;
      border: 1px solid #A8B89A;
    }
  }
}

// ----- 空状态 -----
.match-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 80px;
  
  &__icon {
    font-size: 64px;
    margin-bottom: 16px;
  }
  
  &__title {
    font-size: 18px;
    color: #333333;
    margin-bottom: 8px;
  }
  
  &__desc {
    font-size: 14px;
    color: #999999;
  }
}

// ----- 底部提示 -----
.match-footer {
  text-align: center;
  padding: 16px 0 8px;
  
  &__text {
    font-size: 12px;
    color: #999999;
  }
}
</style>