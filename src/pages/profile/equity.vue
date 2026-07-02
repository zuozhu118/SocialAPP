<template>
    <view class="equity-page">
        <CustomNavbar title="权益中心" :show-back="true" @back="handleBack" />

        <!-- 权益概览 -->
        <view class="equity-overview">
            <text class="equity-overview__title">我的权益</text>
            <view class="equity-overview__grid">
                <view class="equity-overview__item">
                    <text class="equity-overview__number">{{ applyCount }}</text>
                    <text class="equity-overview__label">微信申请次数</text>
                    <text class="equity-overview__sub">今日可用</text>
                </view>
                <view class="equity-overview__item">
                    <text class="equity-overview__number">{{ exposureCards }}</text>
                    <text class="equity-overview__label">同城曝光卡</text>
                    <text class="equity-overview__sub">可用</text>
                </view>
                <view class="equity-overview__item">
                    <text class="equity-overview__number">{{ authCount }}</text>
                    <text class="equity-overview__label">认证数量</text>
                    <text class="equity-overview__sub">认证越多权重越高</text>
                </view>
            </view>
        </view>

        <!-- 权益列表 -->
        <view class="equity-list">
            <view class="equity-group">
                <text class="equity-group__title">🎁 可用权益</text>

                <view class="equity-item">
                    <view class="equity-item__icon">💳</view>
                    <view class="equity-item__body">
                        <text class="equity-item__label">微信申请次数</text>
                        <text class="equity-item__desc">每日10次，认证额外奖励</text>
                    </view>
                    <view class="equity-item__right">
                        <text class="equity-item__count">{{ applyCount }}</text>
                        <text class="equity-item__unit">次</text>
                    </view>
                </view>

                <view class="equity-item" @click="useExposureCard">
                    <view class="equity-item__icon">📢</view>
                    <view class="equity-item__body">
                        <text class="equity-item__label">同城曝光卡</text>
                        <text class="equity-item__desc">24小时加权曝光</text>
                    </view>
                    <view class="equity-item__right">
                        <text class="equity-item__count">{{ exposureCards }}</text>
                        <text class="equity-item__unit">张</text>
                        <text v-if="exposureCards > 0" class="equity-item__action">使用</text>
                    </view>
                </view>
            </view>

            <view class="equity-group">
                <text class="equity-group__title">📋 获取方式</text>

                <view v-for="(item, index) in earnWays"
                      :key="index"
                      class="equity-item"
                      @click="item.action">
                    <view class="equity-item__icon">{{ item.icon }}</view>
                    <view class="equity-item__body">
                        <text class="equity-item__label">{{ item.label }}</text>
                        <text class="equity-item__desc">{{ item.desc }}</text>
                    </view>
                    <view class="equity-item__right">
                        <text class="equity-item__reward">+{{ item.reward }}</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
    import { ref } from 'vue'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'

    const applyCount = ref(10)
    const exposureCards = ref(3)
    const authCount = ref(2)

    const earnWays = [
        {
            icon: '🎓',
            label: '学历认证',
            desc: '完成学历认证',
            reward: '5次',
            action: () => uni.navigateTo({ url: '/pages/auth/education' })
        },
        {
            icon: '💼',
            label: '工作认证',
            desc: '完成工作认证',
            reward: '5次',
            action: () => uni.navigateTo({ url: '/pages/auth/work' })
        },
        {
            icon: '⭐',
            label: '优质动态',
            desc: '动态被标记为优质',
            reward: '3次',
            action: () => uni.switchTab({ url: '/pages/square/index' })
        },
        {
            icon: '📅',
            label: '连续签到',
            desc: '连续签到7天',
            reward: '1曝光卡',
            action: () => uni.showToast({ title: '签到成功！', icon: 'success' })
        }
    ]

    const handleBack = () => {
        uni.navigateBack()
    }

    const useExposureCard = () => {
        if (exposureCards.value <= 0) {
            uni.showToast({ title: '暂无曝光卡可用', icon: 'none' })
            return
        }
        uni.showModal({
            title: '使用曝光卡',
            content: '确认使用1张同城曝光卡？24小时内增加曝光',
            success: (res) => {
                if (res.confirm) {
                    exposureCards.value--
                    uni.showToast({ title: '已使用，曝光提升中', icon: 'success' })
                }
            }
        })
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .equity-page {
        min-height: 100vh;
        background-color: $bg-page;
        padding-bottom: $spacing-lg;
    }

    .equity-overview {
        background: linear-gradient(135deg, $primary-color, $primary-dark);
        margin: $spacing-sm $page-padding-x;
        border-radius: $radius-card;
        padding: $spacing-xl $spacing-lg;
    }

    .equity-overview__title {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: rgba(255, 255, 255, 0.9);
        display: block;
        margin-bottom: $spacing-md;
    }

    .equity-overview__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: $spacing-xs;
    }

    .equity-overview__item {
        text-align: center;
    }

    .equity-overview__number {
        font-size: 28px;
        font-weight: $font-weight-bold;
        color: #FFFFFF;
        display: block;
    }

    .equity-overview__label {
        font-size: $font-size-xs;
        color: rgba(255, 255, 255, 0.9);
        display: block;
        margin-top: 2px;
    }

    .equity-overview__sub {
        font-size: $font-size-xs;
        color: rgba(255, 255, 255, 0.7);
        display: block;
    }

    .equity-list {
        padding: 0 $page-padding-x;
    }

    .equity-group {
        background-color: $bg-card;
        border-radius: $radius-card;
        margin-bottom: $spacing-sm;
        overflow: hidden;
        box-shadow: $shadow-card;
    }

    .equity-group__title {
        display: block;
        padding: $spacing-sm $spacing-md 0;
        font-size: $font-size-xs;
        color: $text-helper;
    }

    .equity-item {
        display: flex;
        align-items: center;
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

    .equity-item__icon {
        font-size: 20px;
        margin-right: $spacing-sm;
    }

    .equity-item__body {
        flex: 1;
    }

    .equity-item__label {
        font-size: $font-size-sm;
        color: $text-primary;
        display: block;
    }

    .equity-item__desc {
        font-size: $font-size-xs;
        color: $text-helper;
        display: block;
    }

    .equity-item__right {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .equity-item__count {
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
        color: $text-primary;
    }

    .equity-item__unit {
        font-size: $font-size-xs;
        color: $text-secondary;
    }

    .equity-item__action {
        padding: 2px 12px;
        font-size: $font-size-xs;
        color: $primary-color;
        background-color: $primary-light-bg;
        border-radius: 12px;
        cursor: pointer;

        &:active {
            opacity: 0.6;
        }
    }

    .equity-item__reward {
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $primary-color;
    }
</style>