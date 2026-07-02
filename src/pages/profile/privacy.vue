<template>
    <view class="privacy-page">
        <CustomNavbar title="隐私设置" :show-back="true" @back="handleBack" />

        <view class="privacy-list">
            <!-- 动态隐私 -->
            <view class="privacy-group">
                <text class="privacy-group__title">动态隐私</text>

                <view v-for="(item, index) in dynamicPrivacyOptions"
                      :key="index"
                      class="privacy-item"
                      @click="selectDynamicPrivacy(index)">
                    <view class="privacy-item__left">
                        <text class="privacy-item__icon">{{ item.icon }}</text>
                        <view class="privacy-item__body">
                            <text class="privacy-item__label">{{ item.label }}</text>
                            <text class="privacy-item__desc">{{ item.desc }}</text>
                        </view>
                    </view>
                    <view class="privacy-item__check">
                        <text v-if="dynamicPrivacy === index">✓</text>
                    </view>
                </view>
            </view>

            <!-- 联系方式 -->
            <view class="privacy-group">
                <text class="privacy-group__title">联系方式</text>

                <view class="privacy-switch">
                    <view class="privacy-switch__left">
                        <text class="privacy-switch__label">允许他人申请微信</text>
                        <text class="privacy-switch__desc">关闭后他人无法向你发起微信申请</text>
                    </view>
                    <view class="privacy-switch__toggle"
                          :class="{ 'privacy-switch__toggle--on': allowWechat }"
                          @click="allowWechat = !allowWechat">
                        <view class="privacy-switch__thumb"></view>
                    </view>
                </view>

                <view class="privacy-item" @click="showWechatCondition">
                    <view class="privacy-item__left">
                        <text class="privacy-item__icon">🔑</text>
                        <view class="privacy-item__body">
                            <text class="privacy-item__label">申请条件</text>
                            <text class="privacy-item__desc">{{ wechatConditionText }}</text>
                        </view>
                    </view>
                    <text class="privacy-item__arrow">›</text>
                </view>
            </view>

            <!-- 其他 -->
            <view class="privacy-group">
                <text class="privacy-group__title">其他</text>

                <view class="privacy-switch">
                    <view class="privacy-switch__left">
                        <text class="privacy-switch__label">同城推荐</text>
                        <text class="privacy-switch__desc">关闭后不会在同城推荐中显示</text>
                    </view>
                    <view class="privacy-switch__toggle"
                          :class="{ 'privacy-switch__toggle--on': showLocal }"
                          @click="showLocal = !showLocal">
                        <view class="privacy-switch__thumb"></view>
                    </view>
                </view>

                <view class="privacy-item" @click="handleHideInfo">
                    <view class="privacy-item__left">
                        <text class="privacy-item__icon">👁️</text>
                        <view class="privacy-item__body">
                            <text class="privacy-item__label">隐藏资料</text>
                            <text class="privacy-item__desc">选择哪些资料对外隐藏</text>
                        </view>
                    </view>
                    <text class="privacy-item__arrow">›</text>
                </view>
            </view>

            <!-- 注销账号 -->
            <view class="privacy-group">
                <button class="privacy-delete" @click="handleDeleteAccount">注销账号</button>
            </view>
        </view>
    </view>
</template>

<script setup>
    import { ref } from 'vue'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'

    const dynamicPrivacy = ref(0)
    const allowWechat = ref(true)
    const showLocal = ref(true)
    const wechatConditionText = ref('无门槛，所有人可申请')

    const dynamicPrivacyOptions = [
        { icon: '🌍', label: '全部可见', desc: '所有人可以查看你的动态' },
        { icon: '👥', label: '仅匹配好友', desc: '只有匹配好友可以查看' },
        { icon: '🔒', label: '仅自己可见', desc: '只有你自己可以查看' }
    ]

    const wechatConditions = [
        '无门槛，所有人可申请',
        '仅双认证用户可申请',
        '年龄差超限自动拦截'
    ]

    const handleBack = () => {
        uni.navigateBack()
    }

    const selectDynamicPrivacy = (index) => {
        dynamicPrivacy.value = index
        uni.showToast({ title: '已更新', icon: 'success' })
    }

    const showWechatCondition = () => {
        uni.showActionSheet({
            itemList: wechatConditions,
            success: (res) => {
                wechatConditionText.value = wechatConditions[res.tapIndex]
            }
        })
    }

    const handleHideInfo = () => {
        uni.showToast({ title: '隐藏资料开发中', icon: 'none' })
    }

    const handleDeleteAccount = () => {
        uni.showModal({
            title: '⚠️ 警告',
            content: '注销后账号将无法恢复，所有数据将被清除，确定要注销吗？',
            success: (res) => {
                if (res.confirm) {
                    uni.showModal({
                        title: '再次确认',
                        content: '注销后实名信息将保留用于风控，确定继续？',
                        success: (res2) => {
                            if (res2.confirm) {
                                uni.showToast({ title: '账号已注销', icon: 'success' })
                                setTimeout(() => {
                                    uni.switchTab({ url: '/pages/match/index' })
                                }, 500)
                            }
                        }
                    })
                }
            }
        })
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .privacy-page {
        min-height: 100vh;
        background-color: $bg-page;
        padding-bottom: $spacing-lg;
    }

    .privacy-list {
        padding: 0 $page-padding-x;
        margin-top: $spacing-sm;
    }

    .privacy-group {
        background-color: $bg-card;
        border-radius: $radius-card;
        margin-bottom: $spacing-sm;
        overflow: hidden;
        box-shadow: $shadow-card;
    }

    .privacy-group__title {
        display: block;
        padding: $spacing-sm $spacing-md 0;
        font-size: $font-size-xs;
        color: $text-helper;
    }

    .privacy-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: $spacing-sm $spacing-md;
        border-bottom: 1px solid $border-light;
        cursor: pointer;

        &:last-child {
            border-bottom: none;
        }

        &:active {
            background-color: $bg-page;
        }
    }

    .privacy-item__left {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        flex: 1;
    }

    .privacy-item__icon {
        font-size: 18px;
    }

    .privacy-item__body {
        flex: 1;
    }

    .privacy-item__label {
        font-size: $font-size-sm;
        color: $text-primary;
        display: block;
    }

    .privacy-item__desc {
        font-size: $font-size-xs;
        color: $text-helper;
        display: block;
    }

    .privacy-item__check {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: $primary-color;
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
    }

    .privacy-item__arrow {
        font-size: 16px;
        color: $text-helper;
    }

    .privacy-switch {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: $spacing-sm $spacing-md;
        border-bottom: 1px solid $border-light;

        &:last-child {
            border-bottom: none;
        }
    }

    .privacy-switch__left {
        flex: 1;
    }

    .privacy-switch__label {
        font-size: $font-size-sm;
        color: $text-primary;
        display: block;
    }

    .privacy-switch__desc {
        font-size: $font-size-xs;
        color: $text-helper;
        display: block;
    }

    .privacy-switch__toggle {
        width: 50px;
        height: 30px;
        border-radius: 15px;
        background-color: $border-light;
        position: relative;
        cursor: pointer;
        transition: all $duration-fast ease;
        flex-shrink: 0;

        &--on {
            background-color: $primary-color;
        }
    }

    .privacy-switch__thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background-color: #FFFFFF;
        transition: all $duration-fast ease;
        box-shadow: $shadow-card;
    }

    .privacy-switch__toggle--on .privacy-switch__thumb {
        left: 22px;
    }

    .privacy-delete {
        width: 100%;
        height: 48px;
        background-color: transparent;
        color: $color-warning;
        font-size: $font-size-sm;
        border: none;
        border-radius: 0;

        &:active {
            background-color: $bg-page;
        }
    }
</style>