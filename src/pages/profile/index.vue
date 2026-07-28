<template>
    <view class="profile-page">
        <!-- ========================================== -->
        <!-- 1. 顶部 Header (未登录/已登录) -->
        <!-- ========================================== -->
        <view class="profile-header">
            <!-- 已登录状态 Header -->
            <view v-if="isLoggedIn" class="profile-header__main">
                <view class="profile-header__avatar-wrap" @click="goToMyProfile">
                    <image class="profile-header__avatar" :src="userInfo.avatar" mode="aspectFill" />
                    <view class="avatar-auth-icon" :class="'auth-level-' + getAuthLevel()" v-if="authStatus.realName">
                        <text class="icon icon-check"></text>
                    </view>
                </view>

                <view class="profile-header__info" @click="goToMyProfile">
                    <view class="profile-header__name-row">
                        <text class="profile-header__name">{{ userInfo.nickname }}</text>
                        <text class="profile-header__hint">主页 ></text>
                    </view>
                    <text class="profile-header__id">ID：{{ userId }}</text>
                </view>
            </view>

            <!-- 未登录状态 Header -->
            <view v-else class="profile-header__unlogin" @click="handleLoginGuide">
                <view class="unlogin-avatar-wrap">
                    <view class="unlogin-avatar-placeholder">
                        <text class="icon icon-user"></text>
                    </view>
                </view>

                <view class="unlogin-info">
                    <view class="unlogin-title-row">
                        <text class="unlogin-title">登录</text>
                    </view>
                    <text class="unlogin-subtitle">遇见真诚同频的另一半</text>
                </view>

                <view class="unlogin-arrow">
                    <text class="icon icon-arrow-right"></text>
                </view>
            </view>

            <!-- 认证状态区 -->
            <view class="auth-status-card">
                <!-- 身份认证 -->
                <view class="auth-status__item"
                      :class="{ 'is-active': isLoggedIn && authStatus.realName }"
                      @click="checkAuthAndExecute(goToRealNameAuth)">
                    <text class="auth-status__icon icon icon-id-card" :class="{ 'is-active': isLoggedIn && authStatus.realName }"></text>
                    <view class="auth-status__info">
                        <text class="auth-status__label">身份</text>
                        <text class="auth-status__status" :class="(isLoggedIn && authStatus.realName) ? 'is-done' : 'is-pending'">
                            {{ (isLoggedIn && authStatus.realName) ? '已认证' : '去认证' }}
                        </text>
                    </view>
                    <text class="auth-status__arrow icon icon-arrow-right" v-if="!isLoggedIn || !authStatus.realName"></text>
                </view>

                <!-- 学历认证 -->
                <view class="auth-status__item"
                      :class="{ 'is-active': isLoggedIn && authStatus.education }"
                      @click="checkAuthAndExecute(goToEducationAuth)">
                    <text class="auth-status__icon icon icon-graduation" :class="{ 'is-active': isLoggedIn && authStatus.education }"></text>
                    <view class="auth-status__info">
                        <text class="auth-status__label">学历</text>
                        <text class="auth-status__status" :class="(isLoggedIn && authStatus.education) ? 'is-done' : 'is-pending'">
                            {{ (isLoggedIn && authStatus.education) ? '已认证' : '去认证' }}
                        </text>
                    </view>
                    <text class="auth-status__arrow icon icon-arrow-right" v-if="!isLoggedIn || !authStatus.education"></text>
                </view>

                <!-- 单位认证 -->
                <view class="auth-status__item"
                      :class="{ 'is-active': isLoggedIn && authStatus.work }"
                      @click="checkAuthAndExecute(goToWorkAuth)">
                    <text class="auth-status__icon icon icon-briefcase" :class="{ 'is-active': isLoggedIn && authStatus.work }"></text>
                    <view class="auth-status__info">
                        <text class="auth-status__label">单位</text>
                        <text class="auth-status__status" :class="(isLoggedIn && authStatus.work) ? 'is-done' : 'is-pending'">
                            {{ (isLoggedIn && authStatus.work) ? '已认证' : '去认证' }}
                        </text>
                    </view>
                    <text class="auth-status__arrow icon icon-arrow-right" v-if="!isLoggedIn || !authStatus.work"></text>
                </view>
            </view>
        </view>

        <!-- ========================================== -->
        <!-- 2. 核心数据统计卡 (未登录展示占位符) -->
        <!-- ========================================== -->
        <view class="stats-card">
            <view class="stats-card__item" @click="checkAuthAndExecute(() => goToLikeList('send'))">
                <text class="stats-card__num">{{ isLoggedIn ? likeSendCount : '-' }}</text>
                <text class="stats-card__label">我喜欢的</text>
            </view>
            <view class="stats-card__divider"></view>
            <view class="stats-card__item" @click="checkAuthAndExecute(() => goToLikeList('receive'))">
                <text class="stats-card__num">{{ isLoggedIn ? likeReceiveCount : '-' }}</text>
                <text class="stats-card__label">喜欢我的</text>
            </view>
            <view class="stats-card__divider"></view>
            <view class="stats-card__item" @click="checkAuthAndExecute(goToVisitorList)">
                <text class="stats-card__num">{{ isLoggedIn ? visitorCount : '-' }}</text>
                <text class="stats-card__label">最近来访</text>
            </view>
        </view>

        <!-- ========================================== -->
        <!-- 3. 功能入口 -->
        <!-- ========================================== -->
        <view class="entry-card">
            <view class="entry-card__item" @click="checkAuthAndExecute(goToMyApply)">
                <view class="entry-card__icon entry-card__icon--blue">
                    <text class="icon icon-message"></text>
                </view>
                <view class="entry-card__info">
                    <text class="entry-card__title">我的申请</text>
                    <text class="entry-card__sub">查看交换微信申请进度</text>
                </view>
                <text class="entry-card__arrow icon icon-arrow-right"></text>
            </view>

            <view class="entry-card__item" @click="checkAuthAndExecute(goToMedalWall)">
                <view class="entry-card__icon entry-card__icon--purple">
                    <text class="icon icon-medal"></text>
                </view>
                <view class="entry-card__info">
                    <text class="entry-card__title">我的勋章</text>
                    <text class="entry-card__sub">
                        {{ isLoggedIn ? `已获得 ${medalCount} 枚荣誉勋章` : '登录查看已获得的勋章' }}
                    </text>
                </view>
                <text class="entry-card__arrow icon icon-arrow-right"></text>
            </view>
        </view>

        <!-- ========================================== -->
        <!-- 4. 工具菜单 -->
        <!-- ========================================== -->
        <view class="menu-card">
            <view class="menu-card__item" @click="checkAuthAndExecute(goToEquity)">
                <text class="menu-card__icon icon icon-gift" />
                <text class="menu-card__label">权益中心</text>
                <text class="menu-card__arrow icon icon-arrow-right"></text>
            </view>
            <view class="menu-card__item" @click="checkAuthAndExecute(goToPrivacy)">
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

        <view class="page-bottom-placeholder"></view>
    </view>
</template>

<script setup>
import { ref } from 'vue'

// ===== 1. 登录状态管理 =====
const isLoggedIn = ref(false)

// 用户信息与数据
const userId = ref('10086520')
const userInfo = ref({
    avatar: 'https://picsum.photos/200/200?random=30',
    nickname: '小鹿同学'
})

const authStatus = ref({
    realName: true,
    education: false,
    work: false
})

const likeSendCount = ref(12)
const likeReceiveCount = ref(8)
const visitorCount = ref(26)
const medalCount = ref(4)

// ===== 2. 鉴权统一拦截器 (直跳登录页) =====
const checkAuthAndExecute = (actionCallback) => {
    if (!isLoggedIn.value) {
        handleLoginGuide()
        return
    }
    if (typeof actionCallback === 'function') {
        actionCallback()
    }
}

// 直接跳转登录页，去除弹框
const handleLoginGuide = () => {
    uni.navigateTo({
        url: '/pages/auth/login'
    })
}

// ===== 3. 业务跳转逻辑 =====
const getAuthLevel = () => {
    const auth = authStatus.value
    let level = 0
    if (auth.realName) level = 1
    if (auth.realName && auth.education) level = 2
    if (auth.realName && auth.education && auth.work) level = 3
    return level
}

// 跳转个人主页
const goToMyProfile = () => {
    uni.navigateTo({ url: '/pages/profile/myProfile' })
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

const goToLikeList = (type) => {
    uni.navigateTo({ url: `/pages/user/likeList?type=${type}` })
}
const goToVisitorList = () => {
    uni.navigateTo({ url: '/pages/user/visitorList' })
}
const goToMyApply = () => {
    uni.navigateTo({ url: '/pages/match/myApply' })
}
const goToMedalWall = () => {
    uni.navigateTo({ url: '/pages/user/medalWall' })
}

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
    // 变量统一定义
    $bg-page: #FAFAFA;
    $bg-card: #FFFFFF;
    $text-primary: #333333;
    $text-secondary: #666666;
    $text-helper: #999999;
    $border-light: #E5E5E5;
    $primary-color: #A8B89A;
    $primary-dark: #8AA07B;
    $primary-light-bg: #F2F5EF;
    $radius-card: 20px;
    $shadow-card: 0 2px 12px rgba(0, 0, 0, 0.04);

    .profile-page {
        min-height: 100vh;
        background-color: $bg-page;
    }

    // ----- 1. 个人信息头部 -----
    .profile-header {
        background-color: $bg-card;
        padding: 24px 16px 16px;
        margin-bottom: 12px;
    }

    // 已登录样式
    .profile-header__main {
        display: flex;
        gap: 14px;
        align-items: center;
        margin-bottom: 16px;
    }

    .profile-header__avatar-wrap {
        position: relative;
        flex-shrink: 0;
        cursor: pointer;
    }

    .profile-header__avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background-color: $bg-page;
        border: 2px solid $bg-card;
        box-shadow: $shadow-card;
        display: block;
    }

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
            font-size: 10px;
            color: #FFFFFF;
            line-height: 1;
        }

        &.auth-level-1 {
            background-color: transparent;
            border: 1.5px solid #81D4A0;

            .icon {
                color: #81D4A0;
                font-size: 9px;
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
        cursor: pointer;
    }

    .profile-header__name-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2px;
    }

    .profile-header__name {
        font-size: 19px;
        font-weight: 600;
        color: $text-primary;
        line-height: 1.2;
    }

    .profile-header__hint {
        font-size: 12px;
        color: $primary-color;
        font-weight: 500;
        flex-shrink: 0;

        &:active {
            opacity: 0.7;
        }
    }

    .profile-header__id {
        font-size: 12px;
        color: $text-helper;
        display: block;
        line-height: 2;
    }

    // 未登录 Header 样式
    .profile-header__unlogin {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
        cursor: pointer;
        padding: 4px 0;

        &:active {
            opacity: 0.85;
        }
    }

    .unlogin-avatar-wrap {
        position: relative;
        flex-shrink: 0;
    }

    .unlogin-avatar-placeholder {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background-color: $primary-light-bg;
        display: flex;
        align-items: center;
        justify-content: center;

        .icon {
            font-size: 28px;
            color: $primary-color;
        }
    }

    .unlogin-info {
        flex: 1;
        min-width: 0;
    }

    .unlogin-title-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
    }

    .unlogin-title {
        font-size: 18px;
        font-weight: 600;
        color: $text-primary;
    }

    .unlogin-tag {
        font-size: 10px;
        color: $primary-dark;
        background-color: $primary-light-bg;
        padding: 2px 8px;
        border-radius: 10px;
        font-weight: 500;
    }

    .unlogin-subtitle {
        font-size: 12px;
        color: $text-helper;
    }

    .unlogin-arrow {
        color: $text-helper;
        font-size: 14px;
    }

    // 认证状态卡
    .auth-status-card {
        display: flex;
        gap: 8px;
    }

    .auth-status__item {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border-radius: 12px;
        background-color: $bg-page;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 0;
        position: relative;

        &:active {
            transform: scale(0.97);
        }

        &.is-active {
            background: rgba(168, 184, 154, 0.12);
            border: 1px solid rgba(168, 184, 154, 0.25);
            box-shadow: 0 1px 4px rgba(168, 184, 154, 0.08);

            .auth-status__icon {
                color: $primary-dark;
            }

            .auth-status__label {
                color: $text-primary;
            }

            .auth-status__status.is-done {
                color: $primary-dark;
            }
        }

        &:not(.is-active) {
            .auth-status__icon {
                color: $text-helper;
            }

            .auth-status__status.is-pending {
                color: $primary-color;
                font-weight: 500;
            }

            .auth-status__arrow {
                animation: arrowPulse 2s ease-in-out infinite;
            }
        }
    }

    .auth-status__icon {
        font-size: 18px;
        flex-shrink: 0;
        transition: all 0.3s ease;
        width: 16px;
        text-align: center;
    }

    .auth-status__info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .auth-status__label {
        font-size: 12px;
        color: $text-helper;
        line-height: 1.3;
        letter-spacing: 0.3px;
    }

    .auth-status__status {
        font-size: 12px;
        line-height: 1.3;

        &.is-done {
            color: $text-helper;
        }

        &.is-pending {
            color: $primary-color;
        }
    }

    .auth-status__arrow {
        font-size: 12px;
        color: $primary-color;
        flex-shrink: 0;
        margin-left: 2px;
    }

    @keyframes arrowPulse {
        0%, 100% {
            transform: translateX(0);
            opacity: 0.7;
        }

        50% {
            transform: translateX(3px);
            opacity: 1;
        }
    }

    // ----- 2. 核心统计卡 -----
    .stats-card {
        display: flex;
        align-items: center;
        background-color: $bg-card;
        margin: 0 16px 12px;
        border-radius: $radius-card;
        padding: 16px 0;
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
        font-weight: 600;
        color: $text-primary;
        line-height: 1.2;
    }

    .stats-card__label {
        font-size: 12px;
        color: $text-helper;
    }

    .stats-card__divider {
        width: 1px;
        height: 28px;
        background-color: $border-light;
    }

    // ----- 3. 功能入口 -----
    .entry-card {
        background-color: $bg-card;
        margin: 0 16px 12px;
        border-radius: $radius-card;
        overflow: hidden;
        box-shadow: $shadow-card;

        &__item {
            display: flex;
            align-items: center;
            padding: 14px 16px;
            cursor: pointer;

            &:not(:last-child) {
                border-bottom: 1px solid $border-light;
            }

            &:active {
                background-color: $bg-page;
            }
        }

        &__icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;

            .icon {
                font-size: 18px;
                color: #FFFFFF;
            }

            &--purple {
                background: linear-gradient(135deg, #9C27B0, #7B1FA2);
            }

            &--blue {
                background: linear-gradient(135deg, #4FACFE, #0099FF);
            }
        }

        &__info {
            flex: 1;
            min-width: 0;
        }

        &__title {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: $text-primary;
        }

        &__sub {
            display: block;
            font-size: 11px;
            color: $text-helper;
        }

        &__arrow {
            font-size: 12px;
            color: $text-helper;
        }
    }

    // ----- 4. 工具菜单 -----
    .menu-card {
        background-color: $bg-card;
        margin: 0 16px 12px;
        border-radius: $radius-card;
        overflow: hidden;
        box-shadow: $shadow-card;
    }

    .menu-card__item {
        display: flex;
        align-items: center;
        padding: 14px 16px;
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
        margin-right: 12px;
    }

    .menu-card__label {
        flex: 1;
        font-size: 14px;
        color: $text-primary;
    }

    .menu-card__arrow {
        font-size: 12px;
        color: $text-helper;
    }

    .page-bottom-placeholder {
        height: 24px;
    }
</style>