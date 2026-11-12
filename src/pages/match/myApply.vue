<template>
    <view class="my-apply-page">
        <!-- 导航栏 -->
        <view class="my-apply-navbar">
            <text class="my-apply-navbar__back icon icon-arrow-left" @click="goBack"></text>
            <text class="my-apply-navbar__title">微信申请</text>
            <view class="my-apply-navbar__placeholder"></view>
        </view>

        <!-- Tab 切换 -->
        <view class="my-apply-tabs">
            <view class="my-apply-tabs__item"
                  :class="{ 'my-apply-tabs__item--active': currentTab === 'received' }"
                  @click="currentTab = 'received'">
                收到的
                <text v-if="matchStore.receivedPendingCount > 0" class="my-apply-tabs__badge">
                    {{ matchStore.receivedPendingCount }}
                </text>
            </view>
            <view class="my-apply-tabs__item"
                  :class="{ 'my-apply-tabs__item--active': currentTab === 'sent' }"
                  @click="currentTab = 'sent'">
                我发出的
                <text v-if="matchStore.sentPendingCount > 0" class="my-apply-tabs__badge my-apply-tabs__badge--ghost">
                    {{ matchStore.sentPendingCount }}
                </text>
            </view>
        </view>

        <scroll-view class="my-apply-scroll" scroll-y show-scrollbar="false">
            <!-- 空状态 -->
            <view v-if="!list.length" class="my-apply-empty">
                <text class="my-apply-empty__icon">{{ currentTab === 'received' ? '📥' : '📤' }}</text>
                <text class="my-apply-empty__title">
                    {{ currentTab === 'received' ? '还没有收到微信申请' : '还没有发出微信申请' }}
                </text>
                <text class="my-apply-empty__desc">{{ emptyCopy.matchEmpty }}</text>
                <button class="my-apply-empty__btn" @click="goToMatch">去匹配</button>
            </view>

            <view v-else class="my-apply-list">
                <!-- 规则说明 -->
                <view class="my-apply-tip">
                    <text class="my-apply-tip__icon">⏳</text>
                    <text class="my-apply-tip__text">申请有效期 3 天，超时自动过期；同意后双方互相展示微信号</text>
                </view>

                <view v-for="item in list" :key="item.id" class="apply-item">
                    <!-- 头部 -->
                    <view class="apply-item__header" @click="goToProfile(item.user?.id)">
                        <image class="apply-item__avatar" :src="item.user?.avatar" mode="aspectFill" />
                        <view class="apply-item__info">
                            <view class="apply-item__name-row">
                                <text class="apply-item__name">{{ item.user?.name || '用户已注销' }}</text>
                                <text class="apply-item__gender is-female" v-if="item.user">♀</text>
                                <view class="apply-item__auth">
                                    <text v-if="item.user?.auth?.realName" class="auth-badge auth-badge--real">实名</text>
                                    <text v-if="item.user?.auth?.education" class="auth-badge auth-badge--edu">学历</text>
                                    <text v-if="item.user?.auth?.work" class="auth-badge auth-badge--work">工作</text>
                                </view>
                            </view>
                            <text class="apply-item__meta">
                                {{ item.user?.age }}岁 · {{ item.user?.occupation }} · {{ item.user?.district }}
                            </text>
                        </view>
                        <text class="apply-item__arrow icon icon-arrow-right"></text>
                    </view>

                    <!-- 缘分契合点 -->
                    <view v-if="item.fatePoint" class="apply-item__fate">
                        <text class="apply-item__fate-text">{{ item.fatePoint }}</text>
                    </view>

                    <!-- 申请留言 -->
                    <view class="apply-item__message">
                        <text class="apply-item__message-text">{{ item.message || '（没有留言）' }}</text>
                    </view>

                    <!-- 状态行 -->
                    <view class="apply-item__footer">
                        <view class="apply-item__status" :class="'apply-item__status--' + item.status">
                            <text class="apply-item__status-text">{{ statusText(item) }}</text>
                        </view>
                        <text v-if="item.status === 'pending'" class="apply-item__countdown">
                            {{ formatRemain(item.expiresAt - now) }}后过期
                        </text>
                        <text v-else class="apply-item__time">{{ formatTime(item.handledAt || item.createdAt) }}</text>
                    </view>

                    <!-- 收到待处理：操作按钮 -->
                    <view v-if="item.status === 'pending' && item.direction === 'in'" class="apply-item__actions">
                        <button class="apply-item__btn apply-item__btn--ghost" @click="handleReject(item)">拒绝</button>
                        <button class="apply-item__btn apply-item__btn--primary" @click="handleAgree(item)">同意交换</button>
                    </view>

                    <!-- 已同意：展示微信号 -->
                    <view v-if="item.status === 'agreed'" class="apply-item__wechat">
                        <text class="apply-item__wechat-label">Ta 的微信号</text>
                        <text class="apply-item__wechat-value">{{ item.wechat || '—' }}</text>
                        <button v-if="item.wechat" class="apply-item__wechat-copy" @click="copyWechat(item.wechat)">复制</button>
                    </view>
                </view>
            </view>

            <view class="my-apply-bottom"></view>
        </scroll-view>
    </view>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { onShow } from '@dcloudio/uni-app'
    import { useMatchStore } from '@/store/index'
    import { findUserById } from '@/mock/users'
    import { emptyCopy } from '@/mock/copy'
    import { formatRemain } from '@/store/match'

    const matchStore = useMatchStore()

    const currentTab = ref('received')
    const now = ref(Date.now())

    onShow(() => {
        matchStore.restore()
        matchStore.expireCheck()
        now.value = Date.now()
    })

    // 统一列表：按 Tab 取对应方向的申请，并挂上对手方资料
    const list = computed(() => {
        const source = currentTab.value === 'received'
            ? matchStore.receivedApplications
            : matchStore.sentApplications
        return source.map(item => {
            const otherId = item.direction === 'in' ? item.fromUserId : item.toUserId
            const user = findUserById(otherId)
            return {
                ...item,
                user,
                wechat: item.status === 'agreed' ? matchStore.getWechatOf(otherId) : '',
                fatePoint: user ? matchStore.getFatePoint(otherId) : ''
            }
        })
    })

    const statusText = (item) => {
        const map = {
            pending: item.direction === 'in' ? '待我处理' : '等待对方处理',
            agreed: '已同意 · 微信号已互换',
            rejected: item.direction === 'in' ? '已拒绝' : '对方未通过',
            expired: '已过期'
        }
        return map[item.status] || ''
    }

    const formatTime = (ts) => {
        if (!ts) return ''
        const diff = Date.now() - ts
        const hour = 60 * 60 * 1000
        if (diff < hour) return `${Math.max(1, Math.floor(diff / 60000))} 分钟前`
        if (diff < 24 * hour) return `${Math.floor(diff / hour)} 小时前`
        return `${Math.floor(diff / (24 * hour))} 天前`
    }

    const handleAgree = (item) => {
        uni.showModal({
            title: '同意交换微信',
            content: `同意后将与「${item.user?.name}」互相展示微信号`,
            confirmText: '同意',
            success: (res) => {
                if (!res.confirm) return
                const result = matchStore.agreeApplication(item.id)
                now.value = Date.now()
                uni.showToast({
                    title: result.ok ? '已同意，微信号已展示' : '操作失败，请重试',
                    icon: result.ok ? 'success' : 'none'
                })
            }
        })
    }

    const handleReject = (item) => {
        uni.showModal({
            title: '拒绝申请',
            content: `确认拒绝「${item.user?.name}」的微信申请吗？`,
            confirmText: '拒绝',
            confirmColor: '#FF4757',
            success: (res) => {
                if (!res.confirm) return
                matchStore.rejectApplication(item.id)
                now.value = Date.now()
                uni.showToast({ title: '已拒绝', icon: 'none' })
            }
        })
    }

    const copyWechat = (value) => {
        uni.setClipboardData({
            data: value,
            success: () => uni.showToast({ title: '微信号已复制', icon: 'success' })
        })
    }

    const goBack = () => uni.navigateBack()
    const goToMatch = () => uni.switchTab({ url: '/pages/match/index' })
    const goToProfile = (id) => {
        if (!id) return
        uni.navigateTo({ url: `/pages/user/profile?userId=${id}` })
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';
    @import '@/styles/mixins.scss';

    .my-apply-page {
        height: 100vh;
        display: flex;
        flex-direction: column;
        background-color: $bg-page;
    }

    .my-apply-navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px $page-padding-x;
        padding-top: calc(14px + env(safe-area-inset-top));
        background-color: rgba(255, 255, 255, 0.94);
        border-bottom: 1px solid $border-light;
        flex-shrink: 0;

        &__back {
            width: 32px;
            font-size: 20px;
            color: $text-primary;
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

    .my-apply-tabs {
        display: flex;
        flex-shrink: 0;
        padding: 0 $page-padding-x;
        background-color: $bg-card;
        border-bottom: 1px solid $border-light;

        &__item {
            flex: 1;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            height: 44px;
            font-size: 14px;
            color: $text-secondary;

            &--active {
                color: $text-primary;
                font-weight: $font-weight-medium;

                &::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    width: 24px;
                    height: 2px;
                    margin-left: -12px;
                    border-radius: 1px;
                    background: $primary-gradient;
                }
            }
        }

        &__badge {
            min-width: 16px;
            height: 16px;
            padding: 0 4px;
            border-radius: 8px;
            background-color: #FF4757;
            color: #FFFFFF;
            font-size: 10px;
            line-height: 16px;
            text-align: center;

            &--ghost {
                background-color: rgba(168, 184, 154, 0.25);
                color: $primary-color;
            }
        }
    }

    .my-apply-scroll {
        flex: 1;
        min-height: 0;
    }

    .my-apply-list {
        padding: 12px $page-padding-x 0;
    }

    .my-apply-tip {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        padding: 9px 12px;
        margin-bottom: 12px;
        border-radius: 8px;
        background-color: rgba(255, 167, 38, 0.08);

        &__icon {
            font-size: 11px;
            flex-shrink: 0;
            margin-top: 1px;
        }

        &__text {
            flex: 1;
            font-size: 11px;
            color: $text-helper;
            line-height: 1.5;
        }
    }

    .apply-item {
        background-color: $bg-card;
        border-radius: $radius-card;
        box-shadow: $shadow-card;
        padding: $spacing-md;
        margin-bottom: 12px;

        &__header {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        &__avatar {
            width: 50px;
            height: 50px;
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
            gap: 6px;
            margin-bottom: 2px;
        }

        &__name {
            font-size: 15px;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__gender {
            font-size: 13px;
            color: #FF6B81;
            line-height: 1;
        }

        &__auth {
            display: flex;
            gap: 3px;
        }

        &__meta {
            font-size: 11px;
            color: $text-helper;
        }

        &__arrow {
            font-size: 13px;
            color: $text-helper;
            flex-shrink: 0;
        }

        &__fate {
            margin-top: 10px;
            padding: 8px 12px;
            border-radius: 8px;
            background: linear-gradient(135deg, rgba(255, 196, 160, 0.2), rgba(255, 154, 178, 0.1));
            border: 1px solid rgba(255, 160, 122, 0.3);

            &-text {
                font-size: 11px;
                color: #C2703F;
                line-height: 1.5;
            }
        }

        &__message {
            margin-top: 10px;
            padding: 10px 12px;
            border-radius: 8px;
            background-color: $bg-page;

            &-text {
                font-size: 12px;
                color: $text-secondary;
                line-height: 1.6;
            }
        }

        &__footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 10px;
        }

        &__status {
            padding: 3px 10px;
            border-radius: 10px;
            font-size: 10px;

            &--pending {
                color: #E08A00;
                background-color: rgba(255, 167, 38, 0.12);
            }

            &--agreed {
                color: #1EBE60;
                background-color: rgba(46, 213, 115, 0.12);
            }

            &--rejected,
            &--expired {
                color: $text-helper;
                background-color: $bg-page;
            }
        }

        &__countdown,
        &__time {
            font-size: 10px;
            color: $text-helper;
        }

        &__actions {
            display: flex;
            gap: 10px;
            margin-top: 12px;
        }

        &__btn {
            flex: 1;
            height: 38px;
            border-radius: 19px;
            font-size: 13px;
            border: none;

            &--primary {
                color: #FFFFFF;
                background: linear-gradient(90deg, $primary-color, #9DB48E);
                box-shadow: $shadow-btn;
            }

            &--ghost {
                color: $text-secondary;
                background-color: $bg-page;
                border: 1px solid $border-light;
            }

            &:active {
                opacity: 0.85;
            }
        }

        &__wechat {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 10px;
            padding: 9px 12px;
            border-radius: 8px;
            background-color: $bg-page;

            &-label {
                font-size: 10px;
                color: $text-helper;
                flex-shrink: 0;
            }

            &-value {
                flex: 1;
                font-size: 13px;
                font-weight: $font-weight-medium;
                color: $text-primary;
                text-align: center;
                letter-spacing: 0.4px;
            }

            &-copy {
                padding: 2px 10px;
                font-size: 10px;
                color: $primary-color;
                background-color: $primary-light-bg;
                border: none;
                border-radius: 10px;
                line-height: 1.6;
            }
        }
    }

    .auth-badge {
        padding: 0 6px;
        font-size: 9px;
        color: #FFFFFF;
        border-radius: 3px;
        line-height: 1.7;

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

    .my-apply-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 70px 32px 0;
        text-align: center;

        &__icon {
            font-size: 40px;
            margin-bottom: 14px;
        }

        &__title {
            font-size: 15px;
            font-weight: $font-weight-medium;
            color: $text-primary;
            margin-bottom: 8px;
        }

        &__desc {
            font-size: 12px;
            color: $text-helper;
            line-height: 1.6;
            margin-bottom: 20px;
        }

        &__btn {
            min-width: 160px;
            height: 42px;
            padding: 0 24px;
            border-radius: 21px;
            font-size: 13px;
            color: #FFFFFF;
            background: linear-gradient(90deg, $primary-color, #9DB48E);
            border: none;
            box-shadow: $shadow-btn;
        }
    }

    .my-apply-bottom {
        height: 24px;
    }
</style>
