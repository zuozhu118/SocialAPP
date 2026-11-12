<template>
    <view class="privacy-page">
        <CustomNavbar title="隐私设置" :show-back="true" @back="handleBack" />

        <scroll-view scroll-y class="privacy-scroll">
            <view class="privacy-list">
                <!-- 动态隐私 -->
                <view class="privacy-group">
                    <text class="privacy-group__title">动态隐私</text>
                    <view v-for="item in scopes"
                          :key="item.value"
                          class="privacy-item"
                          @click="selectScope(item.value)">
                        <view class="privacy-item__left">
                            <text class="privacy-item__icon">{{ item.icon }}</text>
                            <view class="privacy-item__body">
                                <text class="privacy-item__label">{{ item.label }}</text>
                                <text class="privacy-item__desc">{{ item.desc }}</text>
                            </view>
                        </view>
                        <view class="privacy-check" :class="{ 'privacy-check--on': privacy.dynamicScope === item.value }">
                            <text v-if="privacy.dynamicScope === item.value" class="privacy-check__mark">✓</text>
                        </view>
                    </view>
                </view>

                <!-- 微信申请 -->
                <view class="privacy-group">
                    <text class="privacy-group__title">微信申请</text>

                    <view class="privacy-switch">
                        <view class="privacy-switch__left">
                            <text class="privacy-switch__label">允许他人申请微信</text>
                            <text class="privacy-switch__desc">关闭后他人无法向你发起微信申请</text>
                        </view>
                        <view class="privacy-switch__toggle"
                              :class="{ 'privacy-switch__toggle--on': privacy.allowWechatApply }"
                              @click="toggle('allowWechatApply')">
                            <view class="privacy-switch__thumb"></view>
                        </view>
                    </view>

                    <view class="privacy-switch">
                        <view class="privacy-switch__left">
                            <text class="privacy-switch__label">
                                24 小时未处理自动拒绝
                                <text v-if="isFemale" class="privacy-tag">女性默认开启</text>
                            </text>
                            <text class="privacy-switch__desc">超时未处理的申请自动关闭，避免持续打扰</text>
                        </view>
                        <view class="privacy-switch__toggle"
                              :class="{ 'privacy-switch__toggle--on': privacy.autoRejectEnabled }"
                              @click="toggle('autoRejectEnabled')">
                            <view class="privacy-switch__thumb"></view>
                        </view>
                    </view>

                    <view class="privacy-switch">
                        <view class="privacy-switch__left">
                            <text class="privacy-switch__label">仅双认证用户可申请</text>
                            <text class="privacy-switch__desc">需同时完成学历与工作认证</text>
                        </view>
                        <view class="privacy-switch__toggle"
                              :class="{ 'privacy-switch__toggle--on': privacy.onlyDoubleVerified }"
                              @click="toggle('onlyDoubleVerified')">
                            <view class="privacy-switch__thumb"></view>
                        </view>
                    </view>

                    <view class="privacy-item" @click="chooseAgeGap">
                        <view class="privacy-item__left">
                            <text class="privacy-item__icon">📏</text>
                            <view class="privacy-item__body">
                                <text class="privacy-item__label">年龄差拦截</text>
                                <text class="privacy-item__desc">超出范围的申请自动拦截</text>
                            </view>
                        </view>
                        <view class="privacy-item__value">
                            <text class="privacy-item__value-text">{{ privacy.ageGapLabel }}</text>
                            <text class="privacy-item__arrow">›</text>
                        </view>
                    </view>
                </view>

                <!-- 其它隐私 -->
                <view class="privacy-group">
                    <text class="privacy-group__title">其它隐私</text>

                    <view class="privacy-switch">
                        <view class="privacy-switch__left">
                            <text class="privacy-switch__label">同城推荐</text>
                            <text class="privacy-switch__desc">关闭后不会出现在同城推荐中</text>
                        </view>
                        <view class="privacy-switch__toggle"
                              :class="{ 'privacy-switch__toggle--on': privacy.showInRecommend }"
                              @click="toggle('showInRecommend')">
                            <view class="privacy-switch__thumb"></view>
                        </view>
                    </view>

                    <view class="privacy-hide">
                        <view class="privacy-hide__head">
                            <text class="privacy-hide__label">隐藏资料</text>
                            <text class="privacy-hide__value">{{ privacy.hiddenFieldText }}</text>
                        </view>
                        <view class="privacy-hide__chips">
                            <view v-for="field in hideFields"
                                  :key="field.value"
                                  class="privacy-chip"
                                  :class="{ 'privacy-chip--on': privacy.hideFields.includes(field.value) }"
                                  @click="toggleHideField(field.value)">
                                <text class="privacy-chip__text">{{ field.label }}</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 安全与合规（3.6 / 3.7） -->
                <view class="privacy-group">
                    <text class="privacy-group__title">安全与合规</text>

                    <view class="privacy-item" @click="goBlacklist">
                        <view class="privacy-item__left">
                            <text class="privacy-item__icon">🚫</text>
                            <view class="privacy-item__body">
                                <text class="privacy-item__label">黑名单管理</text>
                                <text class="privacy-item__desc">双向屏蔽，对方不会收到任何通知</text>
                            </view>
                        </view>
                        <view class="privacy-item__value">
                            <text class="privacy-item__value-text">{{ privacy.blacklistCount }} 人</text>
                            <text class="privacy-item__arrow">›</text>
                        </view>
                    </view>

                    <view class="privacy-item" @click="goReports">
                        <view class="privacy-item__left">
                            <text class="privacy-item__icon">🛡️</text>
                            <view class="privacy-item__body">
                                <text class="privacy-item__label">我的举报</text>
                                <text class="privacy-item__desc">举报进度、审核时效与处理结果</text>
                            </view>
                        </view>
                        <view class="privacy-item__value">
                            <text v-if="risk.pendingReports" class="privacy-item__badge">{{ risk.pendingReports }}</text>
                            <text class="privacy-item__arrow">›</text>
                        </view>
                    </view>

                    <view class="privacy-item" @click="goAccount">
                        <view class="privacy-item__left">
                            <text class="privacy-item__icon">⚙️</text>
                            <view class="privacy-item__body">
                                <text class="privacy-item__label">账号与安全</text>
                                <text class="privacy-item__desc">注销账号、实名信息留存规则</text>
                            </view>
                        </view>
                        <text class="privacy-item__arrow">›</text>
                    </view>
                </view>

                <text class="privacy-footer">隐私设置即刻生效，我们会用最少的必要信息为你匹配缘分</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
    import { computed } from 'vue'
    import { onShow } from '@dcloudio/uni-app'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'
    import { usePrivacyStore, useRiskStore, useUserStore } from '@/store/index'
    import { DYNAMIC_SCOPES, AGE_GAP_OPTIONS, HIDE_FIELDS } from '@/mock/privacy'

    const privacy = usePrivacyStore()
    const risk = useRiskStore()
    const userStore = useUserStore()

    const scopes = DYNAMIC_SCOPES
    const hideFields = HIDE_FIELDS
    const isFemale = computed(() => userStore.gender === 'female')

    onShow(() => {
        privacy.restore()
        risk.restore()
    })

    const handleBack = () => uni.navigateBack()

    const selectScope = (value) => {
        privacy.setScope(value)
        uni.showToast({ title: '已更新动态可见范围', icon: 'none' })
    }

    const toggle = (key) => {
        const value = privacy.toggle(key)
        uni.showToast({ title: value ? '已开启' : '已关闭', icon: 'none' })
    }

    const chooseAgeGap = () => {
        uni.showActionSheet({
            itemList: AGE_GAP_OPTIONS.map(item => item.label),
            fail: () => {},
            success: (res) => {
                const hit = AGE_GAP_OPTIONS[res.tapIndex]
                privacy.setAgeGap(hit.value)
                uni.showToast({ title: `已设置为${hit.label}`, icon: 'none' })
            }
        })
    }

    const toggleHideField = (field) => {
        privacy.toggleHideField(field)
    }

    const goBlacklist = () => uni.navigateTo({ url: '/pages/profile/blacklist' })
    const goReports = () => uni.navigateTo({ url: '/pages/common/myReports' })
    const goAccount = () => uni.navigateTo({ url: '/pages/profile/account' })
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .privacy-page {
        min-height: 100vh;
        background-color: $bg-page;
        display: flex;
        flex-direction: column;
    }

    .privacy-scroll {
        flex: 1;
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
        padding: 12px $spacing-md;
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
        min-width: 0;
    }

    .privacy-item__icon {
        font-size: 18px;
    }

    .privacy-item__body {
        flex: 1;
        min-width: 0;
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
        margin-top: 2px;
    }

    .privacy-item__value {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .privacy-item__value-text {
        font-size: $font-size-xs;
        color: $text-secondary;
    }

    .privacy-item__badge {
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        font-size: 10px;
        line-height: 18px;
        text-align: center;
        color: #FFFFFF;
        background-color: #FF4757;
        border-radius: 9px;
    }

    .privacy-item__arrow {
        font-size: 16px;
        color: $text-helper;
    }

    .privacy-check {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 1px solid $border-light;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        &--on {
            background-color: $primary-color;
            border-color: $primary-color;
        }
    }

    .privacy-check__mark {
        font-size: 12px;
        color: #FFFFFF;
    }

    .privacy-switch {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px $spacing-md;
        border-bottom: 1px solid $border-light;

        &:last-child {
            border-bottom: none;
        }
    }

    .privacy-switch__left {
        flex: 1;
        min-width: 0;
        padding-right: 12px;
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
        margin-top: 2px;
    }

    .privacy-tag {
        font-size: 9px;
        color: $primary-dark;
        background-color: $primary-light-bg;
        padding: 1px 5px;
        border-radius: 6px;
        margin-left: 4px;
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

    .privacy-hide {
        padding: 12px $spacing-md 14px;
    }

    .privacy-hide__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    .privacy-hide__label {
        font-size: $font-size-sm;
        color: $text-primary;
    }

    .privacy-hide__value {
        font-size: 10px;
        color: $text-helper;
    }

    .privacy-hide__chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .privacy-chip {
        padding: 5px 12px;
        border-radius: 14px;
        background-color: $bg-page;
        border: 1px solid $border-light;

        &--on {
            background-color: $primary-light-bg;
            border-color: $primary-color;
        }
    }

    .privacy-chip__text {
        font-size: $font-size-xs;
        color: $text-secondary;
    }

    .privacy-chip--on .privacy-chip__text {
        color: $primary-dark;
    }

    .privacy-footer {
        display: block;
        text-align: center;
        font-size: 10px;
        color: $text-helper;
        line-height: 1.6;
        padding: 8px 20px 24px;
    }
</style>
