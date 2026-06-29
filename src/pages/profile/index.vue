<template>
    <view class="profile-page">
        <!-- 导航栏 -->
        <view class="profile-navbar">
            <text class="profile-navbar__title">我的</text>
            <view class="profile-navbar__right">
                <text class="profile-navbar__icon" @click="goToSettings">⚙️</text>
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
                <view class="profile-header__badge" @click="goToRealNameAuth">
                    <text class="profile-header__badge-icon">🛡️</text>
                    已实名
                </view>
                <view class="profile-header__badge profile-header__badge--dark"
                      @click="goToEducationAuth">
                    <text class="profile-header__badge-icon">🎓</text>
                    学历认证
                </view>
                <view class="profile-header__badge profile-header__badge--dark"
                      @click="goToWorkAuth">
                    <text class="profile-header__badge-icon">💼</text>
                    在职认证
                </view>
            </view>

            <!-- 快捷认证入口 -->
            <view class="profile-header__auth-hint">
                <text class="profile-header__auth-hint-text">
                    💡 完成更多认证，提升匹配权重
                </text>
                <view class="profile-header__auth-hint-actions">
                    <text class="profile-header__auth-hint-btn" @click="goToEducationAuth">
                        🎓 学历认证
                    </text>
                    <text class="profile-header__auth-hint-btn" @click="goToWorkAuth">
                        💼 工作认证
                    </text>
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
                      class="profile-dynamics__item"
                      @click="goToDynamicDetail(item.id)">
                    <image class="profile-dynamics__image" :src="item.image" mode="aspectFill" />
                    <view class="profile-dynamics__overlay">
                        <text class="profile-dynamics__count">❤️ {{ item.likes }}</text>
                    </view>
                </view>
                <!-- 发布动态占位 -->
                <view class="profile-dynamics__item profile-dynamics__add" @click="goToPublish">
                    <text class="profile-dynamics__add-icon">+</text>
                    <text class="profile-dynamics__add-text">发布动态</text>
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
            <view class="profile-menu__item" @click="goToSettings">
                <text class="profile-menu__icon">⚙️</text>
                <text class="profile-menu__label">设置</text>
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

    // ===== 跳转方法 =====
    const goToEquity = () => {
        uni.navigateTo({
            url: '/pages/profile/equity'
        })
    }

    const goToPrivacy = () => {
        uni.navigateTo({
            url: '/pages/profile/privacy'
        })
    }

    const goToAntiFraud = () => {
        uni.navigateTo({
            url: '/pages/common/antiFraud'
        })
    }

    const handleFeedback = () => {
        uni.navigateTo({
            url: '/pages/common/feedback'
        })
    }

    const goToSettings = () => {
        uni.navigateTo({
            url: '/pages/profile/settings'
        })
    }

    // ===== 认证跳转 =====
    const goToRealNameAuth = () => {
        uni.navigateTo({
            url: '/pages/auth/realname'
        })
    }

    const goToEducationAuth = () => {
        uni.navigateTo({
            url: '/pages/auth/education'
        })
    }

    const goToWorkAuth = () => {
        uni.navigateTo({
            url: '/pages/auth/work'
        })
    }

    // ===== 动态跳转 =====
    const goToDynamicDetail = (id) => {
        uni.navigateTo({
            url: `/pages/dynamic/detail?id=${id}`
        })
    }

    const goToPublish = () => {
        uni.navigateTo({
            url: '/pages/dynamic/publish'
        })
    }
</script>

<style lang="scss" scoped>
    .profile-page {
        min-height: 100vh;
        background-color: #FAFAFA;
        padding-bottom: 20px;
    }

    // ----- 导航栏 -----
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
        cursor: pointer;
    }

    .profile-navbar__icon:active {
        opacity: 0.6;
    }

    // ----- 个人信息 -----
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
        cursor: pointer;
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
        cursor: pointer;
    }

    .profile-header__badge:active {
        opacity: 0.7;
    }

    .profile-header__badge--dark {
        color: #FFFFFF;
        background-color: #8AA07B;
    }

    .profile-header__badge-icon {
        font-size: 12px;
    }

    .profile-header__auth-hint {
        margin-top: 14px;
        padding: 12px 16px;
        background-color: #F2F5EF;
        border-radius: 12px;
        width: 100%;
    }

    .profile-header__auth-hint-text {
        font-size: 13px;
        color: #666666;
        display: block;
        text-align: center;
    }

    .profile-header__auth-hint-actions {
        display: flex;
        gap: 12px;
        margin-top: 8px;
        justify-content: center;
    }

    .profile-header__auth-hint-btn {
        padding: 4px 16px;
        font-size: 13px;
        color: #A8B89A;
        background-color: #FFFFFF;
        border-radius: 16px;
        cursor: pointer;
    }

    .profile-header__auth-hint-btn:active {
        opacity: 0.7;
    }

    // ----- 卡片 -----
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

    // ----- 我的动态 -----
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
        cursor: pointer;
    }

    .profile-dynamics__item:active {
        opacity: 0.8;
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

    .profile-dynamics__add {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #FAFAFA;
        border: 2px dashed #E5E5E5;
        border-radius: 8px;
        cursor: pointer;
    }

    .profile-dynamics__add:active {
        background-color: #F0F0F0;
    }

    .profile-dynamics__add-icon {
        font-size: 28px;
        color: #999999;
    }

    .profile-dynamics__add-text {
        font-size: 12px;
        color: #999999;
        margin-top: 2px;
    }

    // ----- 底部菜单 -----
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