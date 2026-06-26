<template>
    <view class="profile-page">
        <!-- 导航栏 -->
        <view class="profile-navbar">
            <text class="profile-navbar__title">我的</text>
            <view class="profile-navbar__right">
                <text class="profile-navbar__icon">⚙️</text>
            </view>
        </view>

        <!-- 个人信息 -->
        <view class="profile-header">
            <view class="profile-header__avatar-wrapper">
                <image class="profile-header__avatar"
                       src="https://picsum.photos/200/200?random=30"
                       mode="aspectFill" />
                <view class="profile-header__edit">
                    <text>📷</text>
                </view>
            </view>

            <text class="profile-header__name">小鹿同学</text>

            <!-- 认证徽章 -->
            <view class="profile-header__badges">
                <view class="profile-header__badge">
                    <text class="profile-header__badge-icon">🛡️</text>
                    已实名
                </view>
                <view class="profile-header__badge profile-header__badge--dark">
                    <text class="profile-header__badge-icon">🎓</text>
                    学历认证
                </view>
                <view class="profile-header__badge profile-header__badge--dark">
                    <text class="profile-header__badge-icon">💼</text>
                    在职认证
                </view>
            </view>
        </view>

        <!-- 资料卡片 -->
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
            <view class="profile-card__title">我的动态</view>
            <view class="profile-dynamics">
                <view v-for="(item, index) in myDynamics"
                      :key="item.id"
                      class="profile-dynamics__item">
                    <image class="profile-dynamics__image" :src="item.image" mode="aspectFill" />
                    <view class="profile-dynamics__overlay">
                        <text class="profile-dynamics__count">❤️ {{ item.likes }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 底部菜单 -->
        <view class="profile-menu">
            <view class="profile-menu__item" @click="goToEquity">
                <text class="profile-menu__icon">🎁</text>
                <text class="profile-menu__label">权益中心</text>
                <text class="profile-menu__arrow">›</text>
            </view>
            <view class="profile-menu__item" @click="goToPrivacy">
                <text class="profile-menu__icon">🔒</text>
                <text class="profile-menu__label">隐私设置</text>
                <text class="profile-menu__arrow">›</text>
            </view>
            <view class="profile-menu__item" @click="goToAntiFraud">
                <text class="profile-menu__icon">🛡️</text>
                <text class="profile-menu__label">反诈专区</text>
                <text class="profile-menu__arrow">›</text>
            </view>
            <view class="profile-menu__item" @click="handleFeedback">
                <text class="profile-menu__icon">💬</text>
                <text class="profile-menu__label">意见反馈</text>
                <text class="profile-menu__arrow">›</text>
            </view>
        </view>
    </view>
</template>

<script setup>
    import { ref } from 'vue'

    // ===== 假数据 =====
    const myDynamics = ref([
        { id: 1, image: 'https://picsum.photos/200/200?random=40', likes: 23 },
        { id: 2, image: 'https://picsum.photos/200/200?random=41', likes: 45 },
        { id: 3, image: 'https://picsum.photos/200/200?random=42', likes: 12 },
        { id: 4, image: 'https://picsum.photos/200/200?random=43', likes: 67 }
    ])

    // ===== 操作方法 =====
    const goToEquity = () => {
        uni.showToast({
            title: '权益中心开发中',
            icon: 'none'
        })
    }

    const goToPrivacy = () => {
        uni.showToast({
            title: '隐私设置开发中',
            icon: 'none'
        })
    }

    const goToAntiFraud = () => {
        uni.showToast({
            title: '反诈专区开发中',
            icon: 'none'
        })
    }

    const handleFeedback = () => {
        uni.showToast({
            title: '意见反馈开发中',
            icon: 'none'
        })
    }
</script>

<style lang="scss" scoped>
    .profile-page {
        min-height: 100vh;
        background-color: #FAFAFA;
        padding-bottom: 20px;
    }

    .profile-navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 24px;
        background-color: #FFFFFF;
        border-bottom: 1px solid #E5E5E5;
    }

    .profile-navbar__title {
        font-size: 20px;
        font-weight: 500;
        color: #333333;
    }

    .profile-navbar__right {
        display: flex;
        gap: 16px;
    }

    .profile-navbar__icon {
        font-size: 20px;
    }

    .profile-header {
        background-color: #FFFFFF;
        padding: 24px 24px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-bottom: 1px solid #E5E5E5;
    }

    .profile-header__avatar-wrapper {
        position: relative;
        margin-bottom: 12px;
    }

    .profile-header__avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: #FAFAFA;
    }

    .profile-header__edit {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 28px;
        height: 28px;
        background-color: #A8B89A;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        border: 2px solid #FFFFFF;
    }

    .profile-header__name {
        font-size: 20px;
        font-weight: 500;
        color: #333333;
    }

    .profile-header__badges {
        display: flex;
        gap: 8px;
        margin-top: 10px;
        flex-wrap: wrap;
        justify-content: center;
    }

    .profile-header__badge {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 12px;
        font-size: 12px;
        font-weight: 500;
        color: #A8B89A;
        background-color: #F2F5EF;
        border-radius: 12px;
    }

    .profile-header__badge--dark {
        color: #FFFFFF;
        background-color: #8AA07B;
    }

    .profile-header__badge-icon {
        font-size: 12px;
    }

    .profile-card {
        background-color: #FFFFFF;
        margin: 12px 24px;
        border-radius: 20px;
        padding: 16px;
    }

    .profile-card__title {
        font-size: 16px;
        font-weight: 500;
        color: #333333;
        margin-bottom: 12px;
    }

    .profile-card__grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 16px;
    }

    .profile-card__item {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
    }

    .profile-card__label {
        font-size: 14px;
        color: #999999;
    }

    .profile-card__value {
        font-size: 14px;
        color: #333333;
    }

    .profile-card__tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .profile-card__tag {
        padding: 4px 14px;
        font-size: 14px;
        color: #666666;
        background-color: #FAFAFA;
        border-radius: 14px;
    }

    .profile-dynamics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
    }

    .profile-dynamics__item {
        position: relative;
        padding-bottom: 100%;
        border-radius: 8px;
        overflow: hidden;
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
        padding: 4px 8px;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
    }

    .profile-dynamics__count {
        font-size: 11px;
        color: #FFFFFF;
    }

    .profile-menu {
        background-color: #FFFFFF;
        margin: 12px 24px;
        border-radius: 20px;
        overflow: hidden;
    }

    .profile-menu__item {
        display: flex;
        align-items: center;
        padding: 14px 16px;
        border-bottom: 1px solid #E5E5E5;
        cursor: pointer;
    }

    .profile-menu__item:last-child {
        border-bottom: none;
    }

    .profile-menu__item:active {
        background-color: #FAFAFA;
    }

    .profile-menu__icon {
        font-size: 18px;
        margin-right: 12px;
    }

    .profile-menu__label {
        flex: 1;
        font-size: 14px;
        color: #333333;
    }

    .profile-menu__arrow {
        font-size: 18px;
        color: #999999;
    }
</style>