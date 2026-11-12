<template>
    <view class="quota-bar" @click="showRules = true">
        <view class="quota-bar__item">
            <view class="quota-bar__head">
                <text class="quota-bar__label">今日浏览</text>
                <text class="quota-bar__value">{{ equity.remainBrowse }}/{{ equity.browseTotal }}</text>
            </view>
            <view class="quota-bar__track">
                <view class="quota-bar__fill" :style="{ width: browsePercent + '%' }" />
            </view>
        </view>

        <view class="quota-bar__divider" />

        <view class="quota-bar__item">
            <view class="quota-bar__head">
                <text class="quota-bar__label">今日心动</text>
                <text class="quota-bar__value">{{ equity.remainLike }}/{{ equity.likeTotal }}</text>
            </view>
            <view class="quota-bar__track">
                <view class="quota-bar__fill quota-bar__fill--like" :style="{ width: likePercent + '%' }" />
            </view>
        </view>

        <text class="quota-bar__help">?</text>
    </view>

    <!-- 规则说明 -->
    <CustomModal :visible="showRules"
                 title="额度规则"
                 :show-cancel="false"
                 confirm-text="知道了"
                 size="small"
                 @confirm="showRules = false"
                 @close="showRules = false">
        <view class="quota-rules">
            <view class="quota-rules__row">
                <text class="quota-rules__dot" />
                <text>每日浏览额度 10 次，每天 0 点自动重置</text>
            </view>
            <view class="quota-rules__row">
                <text class="quota-rules__dot" />
                <text>每日心动额度：男性 3 次、女性 5 次，同样 0 点重置</text>
            </view>
            <view class="quota-rules__row">
                <text class="quota-rules__dot" />
                <text>当日心动额度用尽后，自动使用永久心动次数（永久有效）</text>
            </view>
            <view class="quota-rules__row">
                <text class="quota-rules__dot" />
                <text>资料完整度达 80%，次日额外获得 3 次浏览额度</text>
            </view>
        </view>
    </CustomModal>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import CustomModal from '@/components/common/CustomModal.vue'
    import { useEquityStore } from '@/store/index'

    const equity = useEquityStore()
    const showRules = ref(false)

    const browsePercent = computed(() => {
        if (!equity.browseTotal) return 0
        return Math.max(0, Math.min(100, (equity.remainBrowse / equity.browseTotal) * 100))
    })

    const likePercent = computed(() => {
        if (!equity.likeTotal) return 0
        return Math.max(0, Math.min(100, (equity.remainLike / equity.likeTotal) * 100))
    })
</script>

<style lang="scss" scoped>
    .quota-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        background-color: $bg-card;
        border-radius: $radius-sm;
        box-shadow: $shadow-card;
        border: 1px solid rgba($border-light, 0.6);

        &__item {
            flex: 1;
            min-width: 0;
        }

        &__head {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            margin-bottom: 4px;
        }

        &__label {
            font-size: 10px;
            color: $text-helper;
        }

        &__value {
            font-size: 11px;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__track {
            height: 3px;
            border-radius: 2px;
            background-color: $disabled-bg;
            overflow: hidden;
        }

        &__fill {
            height: 100%;
            border-radius: 2px;
            background: $primary-gradient;
            transition: width $duration-base ease;

            &--like {
                background: linear-gradient(135deg, #F0A8B8, #E06060);
            }
        }

        &__divider {
            width: 1px;
            height: 24px;
            background-color: $border-light;
        }

        &__help {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
            border-radius: 50%;
            font-size: 10px;
            line-height: 16px;
            text-align: center;
            color: $text-helper;
            border: 1px solid $border-light;
        }
    }

    .quota-rules {
        text-align: left;

        &__row {
            display: flex;
            gap: 8px;
            margin-bottom: 10px;
            font-size: $font-size-sm;
            line-height: 1.6;
            color: $text-secondary;

            &:last-child {
                margin-bottom: 0;
            }
        }

        &__dot {
            flex-shrink: 0;
            width: 5px;
            height: 5px;
            margin-top: 8px;
            border-radius: 50%;
            background-color: $primary-color;
        }
    }
</style>
