<!-- pages/user/visitor-list.vue -->
<template>
    <view class="visitor-list-page">
        <!-- 顶部导航 -->
        <view class="visitor-list-navbar">
            <text class="visitor-list-navbar__back icon icon-arrow-left" @click="goBack"></text>
            <text class="visitor-list-navbar__title">最近来访</text>
            <view class="visitor-list-navbar__placeholder"></view>
        </view>

        <!-- 统计数据 -->
        <view class="visitor-list-stats">
            <view class="visitor-list-stats__item">
                <text class="visitor-list-stats__num">{{ todayCount }}</text>
                <text class="visitor-list-stats__label">今日来访</text>
            </view>
            <view class="visitor-list-stats__divider"></view>
            <view class="visitor-list-stats__item">
                <text class="visitor-list-stats__num">{{ totalCount }}</text>
                <text class="visitor-list-stats__label">总来访</text>
            </view>
            <view class="visitor-list-stats__divider"></view>
            <view class="visitor-list-stats__item" @click="goToPrivacy">
                <text class="visitor-list-stats__link">隐私设置</text>
                <text class="visitor-list-stats__label">可关闭来访记录</text>
            </view>
        </view>

        <!-- 访客列表 -->
        <scroll-view scroll-y class="visitor-list-scroll" show-scrollbar="false">
            <view v-if="visitorList.length === 0" class="visitor-list-empty">
                <text class="visitor-list-empty__icon icon icon-user"></text>
                <text class="visitor-list-empty__title">暂无访客</text>
                <text class="visitor-list-empty__desc">完善资料提高曝光，让更多人看到你</text>
                <button class="visitor-list-empty__btn" @click="goToEditProfile">完善资料</button>
            </view>

            <view v-else>
                <!-- 今日来访 -->
                <view v-if="todayVisitors.length > 0" class="visitor-list-section">
                    <text class="visitor-list-section__title">今日</text>
                    <view v-for="(visitor, idx) in todayVisitors" 
                          :key="'today-' + idx"
                          class="visitor-list-item"
                          @click="goToUserProfile(visitor.id)">
                        <image class="visitor-list-item__avatar" :src="visitor.avatar" mode="aspectFill" />
                        <view class="visitor-list-item__info">
                            <view class="visitor-list-item__name-row">
                                <text class="visitor-list-item__name">{{ visitor.name }}</text>
                                <text class="visitor-list-item__gender" :class="visitor.gender === 'female' ? 'is-female' : 'is-male'">
                                    {{ visitor.gender === 'female' ? '♀' : '♂' }}
                                </text>
                                <view class="visitor-list-item__auth-badges">
                                    <text v-if="visitor.auth.realName" class="auth-badge auth-badge--real">实名</text>
                                    <text v-if="visitor.auth.education" class="auth-badge auth-badge--edu">学历</text>
                                    <text v-if="visitor.auth.work" class="auth-badge auth-badge--work">工作</text>
                                </view>
                            </view>
                            <text class="visitor-list-item__meta">{{ visitor.age }}岁 · {{ visitor.occupation }} · {{ visitor.district }}</text>
                        </view>
                        <view class="visitor-list-item__time">{{ visitor.visitTime }}</view>
                    </view>
                </view>

                <!-- 昨日来访 -->
                <view v-if="yesterdayVisitors.length > 0" class="visitor-list-section">
                    <text class="visitor-list-section__title">昨日</text>
                    <view v-for="(visitor, idx) in yesterdayVisitors" 
                          :key="'yesterday-' + idx"
                          class="visitor-list-item"
                          @click="goToUserProfile(visitor.id)">
                        <image class="visitor-list-item__avatar" :src="visitor.avatar" mode="aspectFill" />
                        <view class="visitor-list-item__info">
                            <view class="visitor-list-item__name-row">
                                <text class="visitor-list-item__name">{{ visitor.name }}</text>
                                <text class="visitor-list-item__gender" :class="visitor.gender === 'female' ? 'is-female' : 'is-male'">
                                    {{ visitor.gender === 'female' ? '♀' : '♂' }}
                                </text>
                                <view class="visitor-list-item__auth-badges">
                                    <text v-if="visitor.auth.realName" class="auth-badge auth-badge--real">实名</text>
                                    <text v-if="visitor.auth.education" class="auth-badge auth-badge--edu">学历</text>
                                    <text v-if="visitor.auth.work" class="auth-badge auth-badge--work">工作</text>
                                </view>
                            </view>
                            <text class="visitor-list-item__meta">{{ visitor.age }}岁 · {{ visitor.occupation }} · {{ visitor.district }}</text>
                        </view>
                        <view class="visitor-list-item__time">{{ visitor.visitTime }}</view>
                    </view>
                </view>

                <!-- 更早来访 -->
                <view v-if="earlierVisitors.length > 0" class="visitor-list-section">
                    <text class="visitor-list-section__title">更早</text>
                    <view v-for="(visitor, idx) in earlierVisitors" 
                          :key="'earlier-' + idx"
                          class="visitor-list-item"
                          @click="goToUserProfile(visitor.id)">
                        <image class="visitor-list-item__avatar" :src="visitor.avatar" mode="aspectFill" />
                        <view class="visitor-list-item__info">
                            <view class="visitor-list-item__name-row">
                                <text class="visitor-list-item__name">{{ visitor.name }}</text>
                                <text class="visitor-list-item__gender" :class="visitor.gender === 'female' ? 'is-female' : 'is-male'">
                                    {{ visitor.gender === 'female' ? '♀' : '♂' }}
                                </text>
                                <view class="visitor-list-item__auth-badges">
                                    <text v-if="visitor.auth.realName" class="auth-badge auth-badge--real">实名</text>
                                    <text v-if="visitor.auth.education" class="auth-badge auth-badge--edu">学历</text>
                                    <text v-if="visitor.auth.work" class="auth-badge auth-badge--work">工作</text>
                                </view>
                            </view>
                            <text class="visitor-list-item__meta">{{ visitor.age }}岁 · {{ visitor.occupation }} · {{ visitor.district }}</text>
                        </view>
                        <view class="visitor-list-item__time">{{ visitor.visitTime }}</view>
                    </view>
                </view>
            </view>

            <view class="visitor-list-bottom-placeholder"></view>
        </scroll-view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'

// ===== 数据 =====
const todayCount = ref(6)
const totalCount = ref(26)

const visitorList = ref([
    // 今日
    {
        id: 1,
        name: '张一晨',
        gender: 'male',
        age: 28,
        occupation: '程序员',
        district: '海淀区',
        avatar: 'https://picsum.photos/200/200?random=104',
        visitTime: '10分钟前',
        auth: { realName: true, education: true, work: true }
    },
    {
        id: 2,
        name: '王子轩',
        gender: 'male',
        age: 27,
        occupation: '建筑设计师',
        district: '天河区',
        avatar: 'https://picsum.photos/200/200?random=105',
        visitTime: '1小时前',
        auth: { realName: true, education: true, work: false }
    },
    {
        id: 3,
        name: '林小鹿',
        gender: 'female',
        age: 24,
        occupation: '产品经理',
        district: '朝阳区',
        avatar: 'https://picsum.photos/200/200?random=101',
        visitTime: '2小时前',
        auth: { realName: true, education: true, work: false }
    },
    // 昨日
    {
        id: 4,
        name: '刘一鸣',
        gender: 'male',
        age: 26,
        occupation: '医生',
        district: '锦江区',
        avatar: 'https://picsum.photos/200/200?random=106',
        visitTime: '昨天',
        auth: { realName: true, education: true, work: true }
    },
    {
        id: 5,
        name: '陈橘子',
        gender: 'female',
        age: 26,
        occupation: '金融分析师',
        district: '浦东新区',
        avatar: 'https://picsum.photos/200/200?random=102',
        visitTime: '昨天',
        auth: { realName: true, education: true, work: true }
    },
    // 更早
    {
        id: 6,
        name: '苏小小',
        gender: 'female',
        age: 25,
        occupation: '教师',
        district: '西湖区',
        avatar: 'https://picsum.photos/200/200?random=103',
        visitTime: '3天前',
        auth: { realName: true, education: false, work: false }
    }
])

// ===== 计算属性 =====
const todayVisitors = computed(() => {
    return visitorList.value.filter(v => v.visitTime.includes('分钟前') || v.visitTime.includes('小时前'))
})

const yesterdayVisitors = computed(() => {
    return visitorList.value.filter(v => v.visitTime === '昨天')
})

const earlierVisitors = computed(() => {
    return visitorList.value.filter(v => !v.visitTime.includes('分钟前') && !v.visitTime.includes('小时前') && v.visitTime !== '昨天')
})

// ===== 方法 =====
const goBack = () => {
    uni.navigateBack()
}

const goToUserProfile = (userId) => {
    uni.navigateTo({
        url: `/pages/user/profile?userId=${userId}`
    })
}

const goToPrivacy = () => {
    uni.navigateTo({
        url: '/pages/profile/privacy'
    })
}

const goToEditProfile = () => {
    uni.navigateTo({
        url: '/pages/profile/edit'
    })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.visitor-list-page {
    min-height: 100vh;
    background-color: $bg-page;
    display: flex;
    flex-direction: column;
}

// 顶部导航
.visitor-list-navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px $page-padding-x;
    padding-top: calc(14px + env(safe-area-inset-top));
    background-color: $bg-card;
    border-bottom: 1px solid $border-light;
    flex-shrink: 0;

    &__back {
        width: 32px;
        font-size: 20px;
        color: $text-primary;
        cursor: pointer;
    }

    &__title {
        font-size: 17px;
        font-weight: 500;
        color: $text-primary;
    }

    &__placeholder {
        width: 32px;
    }
}

// 统计
.visitor-list-stats {
    display: flex;
    align-items: center;
    background-color: $bg-card;
    margin: 12px $page-padding-x;
    border-radius: $radius-card;
    padding: 14px 0;
    box-shadow: $shadow-card;
    flex-shrink: 0;

    &__item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
    }

    &__num {
        font-size: 20px;
        font-weight: $font-weight-medium;
        color: $text-primary;
        line-height: 1.2;
    }

    &__label {
        font-size: 11px;
        color: $text-helper;
    }

    &__link {
        font-size: 12px;
        color: $primary-color;
        cursor: pointer;
        line-height: 1.2;

        &:active {
            opacity: 0.7;
        }
    }

    &__divider {
        width: 1px;
        height: 32px;
        background-color: $border-light;
    }
}

// 列表
.visitor-list-scroll {
    flex: 1;
    padding: 0 $page-padding-x;
}

.visitor-list-section {
    margin-bottom: 16px;

    &__title {
        font-size: 12px;
        font-weight: $font-weight-medium;
        color: $text-helper;
        display: block;
        margin-bottom: 8px;
        padding-left: 4px;
    }
}

.visitor-list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: $bg-card;
    border-radius: $radius-card;
    padding: 12px;
    margin-bottom: 8px;
    box-shadow: $shadow-card;
    cursor: pointer;

    &:active {
        opacity: 0.85;
    }

    &__avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        flex-shrink: 0;
        background-color: $bg-page;
    }

    &__info {
        flex: 1;
        min-width: 0;
    }

    &__name-row {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
        margin-bottom: 2px;
    }

    &__name {
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $text-primary;
    }

    &__gender {
        font-size: 13px;
        line-height: 1;

        &.is-female {
            color: #FF6B81;
        }
        &.is-male {
            color: #4FACFE;
        }
    }

    &__auth-badges {
        display: flex;
        align-items: center;
        gap: 3px;
        flex-wrap: wrap;
    }

    &__meta {
        font-size: 12px;
        color: $text-helper;
        display: block;
    }

    &__time {
        flex-shrink: 0;
        font-size: 10px;
        color: $text-helper;
        padding-top: 2px;
    }
}

// 认证徽章
.auth-badge {
    padding: 0 5px;
    font-size: 8px;
    color: #FFFFFF;
    border-radius: 3px;
    line-height: 1.6;

    &--real {
        background: linear-gradient(90deg, #2ED573, #1EBE60);
    }
    &--edu {
        background: linear-gradient(90deg, #4FACFE, #0099FF);
    }
    &--work {
        background: linear-gradient(90deg, #FFA726, #FB8C00);
    }
}

// 空状态
.visitor-list-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;

    &__icon {
        font-size: 48px;
        color: $text-helper;
        margin-bottom: 16px;
    }

    &__title {
        font-size: $font-size-md;
        color: $text-primary;
        margin-bottom: 4px;
    }

    &__desc {
        font-size: $font-size-sm;
        color: $text-helper;
        margin-bottom: $spacing-md;
    }

    &__btn {
        padding: 8px 32px;
        background-color: $primary-color;
        color: #FFFFFF;
        border-radius: 20px;
        font-size: $font-size-sm;
        border: none;
    }
}

.visitor-list-bottom-placeholder {
    height: 20px;
}
</style>