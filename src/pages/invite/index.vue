<template>
    <view class="invite-page">
        <!-- 导航 -->
        <view class="invite-navbar">
            <text class="invite-navbar__back icon icon-arrow-left" @click="goBack"></text>
            <text class="invite-navbar__title">邀请好友</text>
            <view class="invite-navbar__placeholder"></view>
        </view>

        <scroll-view scroll-y class="invite-scroll">
            <!-- 邀请主卡 -->
            <view class="invite-hero">
                <view class="invite-hero__glow"></view>
                <text class="invite-hero__title">邀请同城好友，一起遇见对的人</text>
                <text class="invite-hero__desc">
                    好友通过你的链接注册并完成实名认证后，你们双方各得 {{ rewardLikes }} 次永久心动次数
                </text>

                <view class="invite-hero__code">
                    <view class="invite-hero__code-body">
                        <text class="invite-hero__code-label">我的邀请码</text>
                        <text class="invite-hero__code-value">{{ code }}</text>
                    </view>
                    <view class="invite-hero__code-copy" @click="copyCode">
                        <text class="invite-hero__code-copy-text">复制</text>
                    </view>
                </view>

                <button class="invite-hero__btn" @click="openShare">立即邀请好友</button>
            </view>

            <!-- 数据概览 -->
            <view class="invite-stats">
                <view class="invite-stats__item">
                    <text class="invite-stats__num">{{ inviteStore.inviteCount }}</text>
                    <text class="invite-stats__label">已邀请</text>
                </view>
                <view class="invite-stats__divider"></view>
                <view class="invite-stats__item">
                    <text class="invite-stats__num">{{ inviteStore.successCount }}</text>
                    <text class="invite-stats__label">已实名</text>
                </view>
                <view class="invite-stats__divider"></view>
                <view class="invite-stats__item">
                    <text class="invite-stats__num invite-stats__num--accent">{{ inviteStore.rewardLikes }}</text>
                    <text class="invite-stats__label">已得永久心动</text>
                </view>
            </view>

            <!-- 待发放提醒 -->
            <view v-if="inviteStore.pendingLikes > 0" class="invite-pending">
                <text class="invite-pending__icon">⏳</text>
                <text class="invite-pending__text">
                    还有 {{ inviteStore.pendingLikes }} 次永久心动待发放，等好友完成实名认证即可到账
                </text>
            </view>

            <!-- 我被邀请 -->
            <view v-if="inviteStore.hasInviter" class="invite-inviter">
                <text class="invite-inviter__label">你的邀请人</text>
                <text class="invite-inviter__code">{{ inviteStore.invitedBy }}</text>
                <text class="invite-inviter__state">
                    {{ inviteStore.inviteeRewarded ? '双方奖励已发放' : '完成实名后双方各得奖励' }}
                </text>
            </view>

            <!-- 邀请规则 -->
            <view class="invite-rule">
                <text class="invite-rule__title">邀请规则</text>
                <view v-for="(rule, index) in inviteRules" :key="index" class="invite-rule__item">
                    <text class="invite-rule__index">{{ index + 1 }}</text>
                    <text class="invite-rule__text">{{ rule }}</text>
                </view>
            </view>

            <!-- 邀请记录 -->
            <view class="invite-records">
                <view class="invite-records__head">
                    <text class="invite-records__title">邀请记录</text>
                    <text class="invite-records__count">{{ inviteStore.rewardText }}</text>
                </view>

                <view v-if="records.length === 0" class="invite-empty">
                    <text class="invite-empty__icon">🤝</text>
                    <text class="invite-empty__title">还没有好友通过你的邀请加入</text>
                    <text class="invite-empty__desc">把链接分享到朋友圈，让同城的朋友先认识你</text>
                </view>

                <view v-for="item in records" :key="item.id" class="invite-record">
                    <view class="invite-record__avatar">
                        <text class="invite-record__avatar-text">{{ item.name.slice(0, 1) }}</text>
                    </view>
                    <view class="invite-record__body">
                        <text class="invite-record__name">{{ item.name }}</text>
                        <text class="invite-record__time">{{ timeLabel(item.joinedAt) }}加入</text>
                    </view>
                    <view class="invite-record__state"
                          :class="item.realnameAt ? 'invite-record__state--done' : 'invite-record__state--pending'">
                        <text class="invite-record__state-text">
                            {{ item.realnameAt ? `已实名 +${rewardLikes}` : '待实名' }}
                        </text>
                    </view>
                </view>
            </view>

            <view class="invite-bottom-placeholder"></view>
        </scroll-view>

        <!-- 分享面板 -->
        <ShareSheet :visible="shareVisible"
                    title="邀请好友一起遇见缘分"
                    desc="分享给微信好友或朋友圈"
                    @close="shareVisible = false" />
    </view>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { onShow } from '@dcloudio/uni-app'
    import useInviteStore from '@/store/invite'
    import ShareSheet from '@/components/common/ShareSheet.vue'
    import { INVITE_REWARD_LIKES, inviteRules } from '@/mock/invite'
    import { formatRelativeTime } from '@/mock/dynamics'

    const inviteStore = useInviteStore()

    const rewardLikes = INVITE_REWARD_LIKES
    const sharing = ref(false)
    const shareVisible = ref(false)

    const code = computed(() => inviteStore.ensureCode())
    const records = computed(() => inviteStore.recordList)

    const timeLabel = (ts) => formatRelativeTime(ts)

    onShow(() => {
        inviteStore.ensureCode()
    })

    const goBack = () => {
        uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/profile/index' }) })
    }

    const copyCode = () => {
        uni.setClipboardData({
            data: code.value,
            success: () => uni.showToast({ title: '邀请码已复制', icon: 'none' })
        })
    }

    const openShare = () => {
        sharing.value = true
        shareVisible.value = true
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';
    @import '@/styles/mixins.scss';

    .invite-page {
        min-height: 100vh;
        background-color: $bg-page;
        display: flex;
        flex-direction: column;
    }

    // ===== 导航 =====
    .invite-navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px $page-padding-x;
        padding-top: calc(14px + env(safe-area-inset-top));
        background-color: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid $border-light;
        flex-shrink: 0;

        &__back {
            font-size: 18px;
            color: $text-primary;
            width: 24px;
        }

        &__title {
            font-size: 16px;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__placeholder {
            width: 24px;
        }
    }

    .invite-scroll {
        flex: 1;
    }

    // ===== 邀请主卡 =====
    .invite-hero {
        position: relative;
        margin: 12px $page-padding-x 0;
        padding: 20px 16px;
        border-radius: $radius-card;
        background: linear-gradient(135deg, #A8B89A, #8AA07B);
        overflow: hidden;
        box-shadow: $shadow-btn;

        &__glow {
            position: absolute;
            top: -40px;
            right: -30px;
            width: 130px;
            height: 130px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.18);
        }

        &__title {
            position: relative;
            display: block;
            font-size: $font-size-md;
            font-weight: $font-weight-bold;
            color: #FFFFFF;
            margin-bottom: 6px;
        }

        &__desc {
            position: relative;
            display: block;
            font-size: $font-size-xs;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.88);
            margin-bottom: 14px;
        }

        &__code {
            position: relative;
            display: flex;
            align-items: center;
            padding: 10px 12px;
            background-color: rgba(255, 255, 255, 0.92);
            border-radius: $radius-sm;
            margin-bottom: 14px;
        }

        &__code-body {
            flex: 1;
        }

        &__code-label {
            display: block;
            font-size: 10px;
            color: $text-helper;
        }

        &__code-value {
            display: block;
            font-size: $font-size-md;
            font-weight: $font-weight-bold;
            color: $primary-dark;
            letter-spacing: 2px;
            margin-top: 2px;
        }

        &__code-copy {
            padding: 5px 14px;
            background-color: $primary-color;
            border-radius: 14px;

            &:active {
                opacity: 0.8;
            }
        }

        &__code-copy-text {
            font-size: $font-size-xs;
            color: #FFFFFF;
        }

        &__btn {
            position: relative;
            width: 100%;
            height: 42px;
            line-height: 42px;
            border-radius: $radius-btn;
            background-color: #FFFFFF;
            color: $primary-dark;
            font-size: $font-size-btn;
            font-weight: $font-weight-medium;
            border: none;

            &::after {
                border: none;
            }
        }
    }

    // ===== 数据概览 =====
    .invite-stats {
        display: flex;
        align-items: center;
        margin: 12px $page-padding-x 0;
        padding: 14px 0;
        background-color: $bg-card;
        border-radius: $radius-card;
        box-shadow: $shadow-card;

        &__item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
        }

        &__divider {
            width: 1px;
            height: 24px;
            background-color: $border-light;
        }

        &__num {
            font-size: $font-size-lg;
            font-weight: $font-weight-bold;
            color: $text-primary;

            &--accent {
                color: $primary-dark;
            }
        }

        &__label {
            font-size: 10px;
            color: $text-helper;
        }
    }

    // ===== 待发放 =====
    .invite-pending {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 10px $page-padding-x 0;
        padding: 10px 12px;
        background-color: #FFF8E1;
        border-radius: $radius-sm;

        &__icon {
            font-size: 14px;
        }

        &__text {
            flex: 1;
            font-size: 11px;
            line-height: 1.5;
            color: #B58A2B;
        }
    }

    // ===== 我的邀请人 =====
    .invite-inviter {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 10px $page-padding-x 0;
        padding: 10px 12px;
        background-color: $primary-light-bg;
        border-radius: $radius-sm;

        &__label {
            font-size: 11px;
            color: $text-helper;
        }

        &__code {
            font-size: $font-size-xs;
            font-weight: $font-weight-bold;
            color: $primary-dark;
            letter-spacing: 1px;
        }

        &__state {
            flex: 1;
            text-align: right;
            font-size: 10px;
            color: $text-helper;
        }
    }

    // ===== 规则 =====
    .invite-rule {
        margin: 12px $page-padding-x 0;
        padding: 14px;
        background-color: $bg-card;
        border-radius: $radius-card;
        box-shadow: $shadow-card;

        &__title {
            display: block;
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
            color: $text-primary;
            margin-bottom: 10px;
        }

        &__item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 8px;

            &:last-child {
                margin-bottom: 0;
            }
        }

        &__index {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
            border-radius: 50%;
            background-color: $primary-light;
            color: $primary-dark;
            font-size: 10px;
            line-height: 16px;
            text-align: center;
            margin-top: 1px;
        }

        &__text {
            flex: 1;
            font-size: $font-size-xs;
            line-height: 1.6;
            color: $text-secondary;
        }
    }

    // ===== 邀请记录 =====
    .invite-records {
        margin: 12px $page-padding-x 0;
        padding: 14px;
        background-color: $bg-card;
        border-radius: $radius-card;
        box-shadow: $shadow-card;

        &__head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
        }

        &__title {
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__count {
            font-size: 10px;
            color: $text-helper;
        }
    }

    .invite-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px 0 16px;

        &__icon {
            font-size: 32px;
            margin-bottom: 8px;
        }

        &__title {
            font-size: $font-size-xs;
            color: $text-secondary;
            margin-bottom: 4px;
        }

        &__desc {
            font-size: 10px;
            color: $text-helper;
        }
    }

    .invite-record {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid $border-light;

        &:last-child {
            border-bottom: none;
        }

        &__avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: $primary-light-bg;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        &__avatar-text {
            font-size: $font-size-sm;
            color: $primary-dark;
            font-weight: $font-weight-medium;
        }

        &__body {
            flex: 1;
            min-width: 0;
        }

        &__name {
            display: block;
            font-size: $font-size-xs;
            color: $text-primary;
            font-weight: $font-weight-medium;
        }

        &__time {
            display: block;
            font-size: 10px;
            color: $text-helper;
            margin-top: 2px;
        }

        &__state {
            padding: 3px 8px;
            border-radius: 10px;

            &--done {
                background-color: $primary-light-bg;

                .invite-record__state-text {
                    color: $primary-dark;
                }
            }

            &--pending {
                background-color: $disabled-bg;

                .invite-record__state-text {
                    color: $text-helper;
                }
            }

            &-text {
                font-size: 10px;
            }
        }
    }

    .invite-bottom-placeholder {
        height: 24px;
    }
</style>
