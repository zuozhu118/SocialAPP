<template>
    <view class="blacklist-page">
        <CustomNavbar title="黑名单管理" :show-back="true" @back="handleBack" />

        <view class="blacklist-tip">
            <text class="blacklist-tip__icon">🚫</text>
            <text class="blacklist-tip__text">
                拉黑后双方互相屏蔽，不会看到彼此的动态与评论，对方也不会收到任何通知
            </text>
        </view>

        <view v-if="list.length === 0" class="blacklist-empty">
            <text class="blacklist-empty__icon">🌿</text>
            <text class="blacklist-empty__title">黑名单是空的</text>
            <text class="blacklist-empty__desc">暂时没有屏蔽任何人</text>
        </view>

        <view v-else class="blacklist-list">
            <view v-for="item in list" :key="item.id" class="blacklist-item">
                <image class="blacklist-item__avatar" :src="item.avatar" mode="aspectFill" />
                <view class="blacklist-item__body">
                    <text class="blacklist-item__name">{{ item.name }}</text>
                    <text class="blacklist-item__meta">
                        {{ item.district || '未知城市' }} · {{ item.reason }} · {{ timeLabel(item.blockedAt) }}
                    </text>
                </view>
                <view class="blacklist-item__btn" @click="handleUnblock(item)">
                    <text class="blacklist-item__btn-text">解除</text>
                </view>
            </view>
        </view>

        <view class="blacklist-footer">
            <text class="blacklist-footer__text">{{ unblockHint }}</text>
        </view>
    </view>
</template>

<script setup>
    import { computed } from 'vue'
    import { onShow } from '@dcloudio/uni-app'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'
    import { usePrivacyStore } from '@/store/index'
    import { unblockCopy } from '@/mock/privacy'
    import { formatRelativeTime } from '@/mock/dynamics'

    const privacy = usePrivacyStore()
    const unblockHint = unblockCopy

    const list = computed(() => privacy.blacklistList)
    const timeLabel = (ts) => formatRelativeTime(ts)

    onShow(() => {
        privacy.restore()
    })

    const handleBack = () => uni.navigateBack()

    const handleUnblock = (item) => {
        uni.showModal({
            title: '解除拉黑',
            content: unblockCopy,
            confirmText: '确认解除',
            confirmColor: '#A8B89A',
            success: (res) => {
                if (!res.confirm) return
                privacy.unblockUser(item.id)
                uni.showToast({ title: '已解除拉黑', icon: 'none' })
            }
        })
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .blacklist-page {
        min-height: 100vh;
        background-color: $bg-page;
        padding-bottom: 24px;
    }

    .blacklist-tip {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin: 12px $page-padding-x 0;
        padding: 10px 12px;
        background-color: $primary-light-bg;
        border-radius: $radius-sm;

        &__icon {
            font-size: 14px;
        }

        &__text {
            flex: 1;
            font-size: 11px;
            line-height: 1.6;
            color: $text-secondary;
        }
    }

    .blacklist-list {
        margin: 12px $page-padding-x 0;
        background-color: $bg-card;
        border-radius: $radius-card;
        box-shadow: $shadow-card;
        padding: 0 14px;
    }

    .blacklist-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 0;
        border-bottom: 1px solid $border-light;

        &:last-child {
            border-bottom: none;
        }

        &__avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background-color: $bg-page;
            flex-shrink: 0;
        }

        &__body {
            flex: 1;
            min-width: 0;
        }

        &__name {
            display: block;
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__meta {
            display: block;
            font-size: 10px;
            color: $text-helper;
            margin-top: 3px;
        }

        &__btn {
            padding: 5px 14px;
            border-radius: 14px;
            border: 1px solid $border-light;

            &:active {
                opacity: 0.7;
            }
        }

        &__btn-text {
            font-size: $font-size-xs;
            color: $text-secondary;
        }
    }

    .blacklist-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 80px;

        &__icon {
            font-size: 40px;
            margin-bottom: 12px;
        }

        &__title {
            font-size: $font-size-sm;
            color: $text-primary;
            margin-bottom: 4px;
        }

        &__desc {
            font-size: $font-size-xs;
            color: $text-helper;
        }
    }

    .blacklist-footer {
        padding: 16px 24px 0;
        text-align: center;

        &__text {
            font-size: 10px;
            line-height: 1.6;
            color: $text-helper;
        }
    }
</style>
