<template>
    <view class="settings-page">
        <CustomNavbar title="设置" :show-back="true" @back="handleBack" />

        <view class="settings-list">
            <!-- 账号设置 -->
            <view class="settings-group">
                <text class="settings-group__title">账号设置</text>

                <view class="settings-item" @click="handleEditProfile">
                    <text class="settings-item__icon icon icon-edit" />
                    <text class="settings-item__label">编辑资料</text>
                    <text class="settings-item__arrow">›</text>
                </view>

                <view class="settings-item" @click="handleChangePhone">
                    <text class="settings-item__icon icon icon-phone" />
                    <text class="settings-item__label">更换手机号</text>
                    <text class="settings-item__arrow">›</text>
                </view>

                <view class="settings-item" @click="handlePassword">
                    <text class="settings-item__icon icon icon-lock" />
                    <text class="settings-item__label">修改密码</text>
                    <text class="settings-item__arrow">›</text>
                </view>
            </view>

            <!-- 隐私设置 -->
            <view class="settings-group">
                <text class="settings-group__title">隐私设置</text>

                <view class="settings-item" @click="handlePrivacy">
                    <text class="settings-item__icon icon icon-unlock" />
                    <text class="settings-item__label">隐私设置</text>
                    <text class="settings-item__desc">动态、联系方式</text>
                    <text class="settings-item__arrow">›</text>
                </view>

                <view class="settings-item" @click="handleBlacklist">
                    <text class="settings-item__icon icon icon-close" />
                    <text class="settings-item__label">黑名单</text>
                    <text class="settings-item__desc">0人</text>
                    <text class="settings-item__arrow">›</text>
                </view>
            </view>

            <!-- 其他 -->
            <view class="settings-group">
                <text class="settings-group__title">其他</text>

                <view class="settings-item" @click="handleAntiFraud">
                    <text class="settings-item__icon icon icon-shield" />
                    <text class="settings-item__label">反诈专区</text>
                    <text class="settings-item__arrow">›</text>
                </view>

                <view class="settings-item" @click="handleFeedback">
                    <text class="settings-item__icon icon icon-comment" />
                    <text class="settings-item__label">意见反馈</text>
                    <text class="settings-item__arrow">›</text>
                </view>

                <view class="settings-item" @click="handleAbout">
                    <text class="settings-item__icon icon icon-info" />
                    <text class="settings-item__label">关于我们</text>
                    <text class="settings-item__desc">v1.0.0</text>
                    <text class="settings-item__arrow">›</text>
                </view>
            </view>

            <!-- 退出登录 -->
            <view class="settings-group">
                <button class="settings-logout" @click="handleLogout">退出登录</button>
            </view>
        </view>
    </view>
</template>

<script setup>
    import CustomNavbar from '@/components/common/CustomNavbar.vue'

    const handleBack = () => {
        uni.navigateBack()
    }

    const handleEditProfile = () => {
        uni.showToast({ title: '编辑资料开发中', icon: 'none' })
    }

    const handleChangePhone = () => {
        uni.showToast({ title: '更换手机号开发中', icon: 'none' })
    }

    const handlePassword = () => {
        uni.showToast({ title: '修改密码开发中', icon: 'none' })
    }

    const handlePrivacy = () => {
        uni.navigateTo({ url: '/pages/profile/privacy' })
    }

    const handleBlacklist = () => {
        uni.showToast({ title: '黑名单开发中', icon: 'none' })
    }

    const handleAntiFraud = () => {
        uni.navigateTo({ url: '/pages/common/antiFraud' })
    }

    const handleFeedback = () => {
        uni.navigateTo({ url: '/pages/common/feedback' })
    }

    const handleAbout = () => {
        uni.showModal({
            title: '关于我们',
            content: '真实交友 v1.0.0\n一个真实、纯净、安心的交友平台',
            showCancel: false
        })
    }

    const handleLogout = () => {
        uni.showModal({
            title: '提示',
            content: '确定要退出登录吗？',
            success: (res) => {
                if (res.confirm) {
                    uni.showToast({ title: '已退出', icon: 'success' })
                    setTimeout(() => {
                        uni.switchTab({ url: '/pages/match/index' })
                    }, 500)
                }
            }
        })
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .settings-page {
        min-height: 100vh;
        background-color: $bg-page;
        padding-bottom: $spacing-lg;
    }

    .settings-list {
        padding: 0 $page-padding-x;
        margin-top: $spacing-sm;
    }

    .settings-group {
        background-color: $bg-card;
        border-radius: $radius-card;
        margin-bottom: $spacing-sm;
        overflow: hidden;
        box-shadow: $shadow-card;
    }

    .settings-group__title {
        display: block;
        padding: $spacing-sm $spacing-md 0;
        font-size: $font-size-xs;
        color: $text-helper;
    }

    .settings-item {
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

    .settings-item__icon {
        font-size: 18px;
        color: $text-secondary;
        margin-right: $spacing-sm;
    }

    .settings-item__label {
        flex: 1;
        font-size: $font-size-sm;
        color: $text-primary;
    }

    .settings-item__desc {
        font-size: $font-size-xs;
        color: $text-helper;
        margin-right: $spacing-xs;
    }

    .settings-item__arrow {
        font-size: 16px;
        color: $text-helper;
    }

    .settings-logout {
        width: 100%;
        height: 48px;
        background-color: transparent;
        color: $color-warning;
        font-size: $font-size-md;
        border: none;
        border-radius: 0;

        &:active {
            background-color: $bg-page;
        }
    }
</style>