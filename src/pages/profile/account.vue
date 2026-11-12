<template>
    <view class="account-page">
        <CustomNavbar title="账号与安全" :show-back="true" @back="handleBack" />

        <scroll-view scroll-y class="account-scroll">
            <!-- 已注销：只展示销毁进度 -->
            <template v-if="risk.deactivated">
                <view class="gone-card">
                    <text class="gone-card__icon">🕊️</text>
                    <text class="gone-card__title">账号已注销</text>
                    <text class="gone-card__desc">
                        缘分虽短，感谢相遇。你的资料已完成脱敏处理。
                    </text>
                </view>

                <view class="account-group">
                    <text class="account-group__title">数据处理进度</text>

                    <view class="data-row">
                        <text class="data-row__label">手机号</text>
                        <text class="data-row__value data-row__value--done">已即时释放</text>
                    </view>

                    <view class="data-row">
                        <text class="data-row__label">实名信息</text>
                        <text class="data-row__value">留存至 {{ purgeDateText }}</text>
                    </view>

                    <view class="data-row">
                        <text class="data-row__label">身份证再次实名</text>
                        <text class="data-row__value data-row__value--warn">
                            {{ risk.idLockRemainDays }} 天后解锁
                        </text>
                    </view>

                    <view class="data-row data-row--last">
                        <text class="data-row__label">注销时间</text>
                        <text class="data-row__value">{{ deactivatedText }}</text>
                    </view>
                </view>

                <view class="account-tip">
                    <text class="account-tip__text">
                        实名信息仅用于风控与司法配合，180 天后自动销毁，期间不对外展示。
                    </text>
                </view>

                <view class="account-actions">
                    <button class="account-btn account-btn--primary" @click="handleReRegister">
                        用新手机号重新注册
                    </button>
                </view>
            </template>

            <!-- 正常态 -->
            <template v-else>
                <!-- 账号信息 -->
                <view class="account-group">
                    <text class="account-group__title">账号信息</text>

                    <view class="data-row">
                        <text class="data-row__label">手机号</text>
                        <text class="data-row__value">{{ phoneText }}</text>
                    </view>

                    <view class="data-row">
                        <text class="data-row__label">实名认证</text>
                        <text class="data-row__value"
                              :class="userStore.isRealNameAuth ? 'data-row__value--done' : 'data-row__value--warn'">
                            {{ userStore.isRealNameAuth ? '已认证' : '未认证' }}
                        </text>
                    </view>

                    <view class="data-row data-row--last">
                        <text class="data-row__label">注册时间</text>
                        <text class="data-row__value">{{ userStore.userInfo?.createTime || '—' }}</text>
                    </view>
                </view>

                <!-- 安全状态 -->
                <view class="account-group">
                    <text class="account-group__title">安全状态</text>

                    <view class="data-row">
                        <text class="data-row__label">账号状态</text>
                        <text class="data-row__value"
                              :class="statusClass">
                            {{ statusText }}
                        </text>
                    </view>

                    <view class="data-row">
                        <text class="data-row__label">风控分</text>
                        <text class="data-row__value" :class="{ 'data-row__value--warn': risk.deprioritized }">
                            {{ risk.riskScore }} / 100
                        </text>
                    </view>

                    <view class="data-row data-row--last">
                        <text class="data-row__label">推荐权重</text>
                        <text class="data-row__value" :class="{ 'data-row__value--warn': risk.deprioritized }">
                            {{ risk.deprioritized ? '已降权（不向女性用户推送）' : '正常' }}
                        </text>
                    </view>
                </view>

                <!-- 处罚提示 -->
                <view v-if="risk.penaltyActive" class="penalty-card">
                    <text class="penalty-card__title">账号存在处罚</text>
                    <text class="penalty-card__desc">处罚措施：{{ risk.penaltyLabel }}</text>
                    <text v-if="risk.penalties.reason" class="penalty-card__desc">
                        原因：{{ risk.penalties.reason }}
                    </text>
                    <text v-if="risk.penalties.code !== 'ban'" class="penalty-card__desc">
                        到期时间：{{ penaltyUntilText }}
                    </text>
                    <text v-else class="penalty-card__desc">
                        实名信息已永久拉黑，该身份不可再注册
                    </text>
                </view>

                <!-- 风控记录 -->
                <view v-if="risk.riskEvents.length" class="account-group">
                    <text class="account-group__title">近期风控记录</text>

                    <view v-for="(item, index) in risk.riskEvents.slice(0, 5)"
                          :key="index"
                          class="risk-row"
                          :class="{ 'risk-row--last': index === Math.min(risk.riskEvents.length, 5) - 1 }">
                        <view class="risk-row__main">
                            <text class="risk-row__label">{{ item.label }}</text>
                            <text class="risk-row__time">{{ timeText(item.at) }}</text>
                        </view>
                        <text class="risk-row__score">{{ item.score }}</text>
                    </view>
                </view>

                <view class="account-tip">
                    <text class="account-tip__text">
                        风控分低于 60 分将自动降权，不再向女性用户推荐。正常使用会逐步恢复。
                    </text>
                </view>

                <!-- 注销 -->
                <view class="account-group">
                    <text class="account-group__title">注销账号</text>

                    <view class="rule-list">
                        <view v-for="(rule, index) in DEACTIVATION_RULES"
                              :key="index"
                              class="rule-item">
                            <text class="rule-item__dot">·</text>
                            <text class="rule-item__text">{{ rule }}</text>
                        </view>
                    </view>
                </view>

                <view class="account-actions">
                    <button class="account-btn account-btn--danger" @click="handleDeactivate">
                        注销账号
                    </button>
                    <text class="account-actions__hint">
                        注销不可撤销，请确认已备份重要信息
                    </text>
                </view>
            </template>
        </scroll-view>
    </view>
</template>

<script setup>
    import { computed } from 'vue'
    import { onShow } from '@dcloudio/uni-app'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'
    import { useRiskStore, useUserStore } from '@/store/index'
    import { DEACTIVATION_RULES, deactivationCopy } from '@/mock/risk'

    const risk = useRiskStore()
    const userStore = useUserStore()

    const phoneText = computed(() => userStore.userInfo?.phone || '—')

    const statusText = computed(() => {
        if (risk.accountStatus === 'banned') return '已封禁'
        if (risk.accountStatus === 'restricted') return risk.penaltyLabel
        return '正常'
    })

    const statusClass = computed(() => {
        if (risk.accountStatus === 'banned') return 'data-row__value--danger'
        if (risk.accountStatus === 'restricted') return 'data-row__value--warn'
        return 'data-row__value--done'
    })

    const pad = (n) => String(n).padStart(2, '0')

    const dateText = (ts) => {
        const d = new Date(ts)
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    }

    const timeText = (ts) => {
        const d = new Date(ts)
        return `${d.getMonth() + 1}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    }

    const purgeDateText = computed(() => {
        const ts = risk.deactivation.realnamePurgeAt
        return ts ? dateText(ts) : '—'
    })

    const deactivatedText = computed(() => {
        const ts = risk.deactivation.requestedAt
        return ts ? `${dateText(ts)} ${timeText(ts).slice(6)}` : '—'
    })

    const penaltyUntilText = computed(() => {
        const ts = risk.penalties.until
        return ts ? dateText(ts) : '—'
    })

    onShow(() => {
        userStore.restore()
        risk.restore()
    })

    const handleBack = () => uni.navigateBack()

    const handleDeactivate = () => {
        // 二次确认：共情文案（第 8 章标准，禁止负面表达）
        uni.showModal({
            title: deactivationCopy.title,
            content: deactivationCopy.content,
            confirmText: deactivationCopy.confirmText,
            cancelText: deactivationCopy.cancelText,
            confirmColor: '#D9534F',
            success: (res) => {
                if (!res.confirm) return
                risk.applyDeactivation()
                uni.showToast({ title: '账号已注销', icon: 'none' })
            }
        })
    }

    const handleReRegister = () => {
        const check = risk.canRealnameWithId()
        if (!check.ok) {
            uni.showModal({
                title: '暂不可重新注册',
                content: check.message,
                showCancel: false
            })
            return
        }
        uni.reLaunch({ url: '/pages/common/landing' })
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .account-page {
        min-height: 100vh;
        background-color: $bg-page;
        display: flex;
        flex-direction: column;
    }

    .account-scroll {
        flex: 1;
    }

    .account-group {
        margin: 10px $page-padding-x 0;
        padding: 4px 14px;
        background-color: $bg-card;
        border-radius: $radius-card;
        box-shadow: $shadow-card;
    }

    .account-group__title {
        display: block;
        padding: 10px 0 6px;
        font-size: 10px;
        color: $text-helper;
    }

    .data-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 11px 0;
        border-bottom: 1px solid $border-light;

        &--last {
            border-bottom: none;
        }
    }

    .data-row__label {
        font-size: $font-size-sm;
        color: $text-primary;
    }

    .data-row__value {
        font-size: $font-size-xs;
        color: $text-secondary;

        &--done {
            color: $primary-dark;
        }

        &--warn {
            color: #B58A2B;
        }

        &--danger {
            color: #C0392B;
        }
    }

    .penalty-card {
        margin: 10px $page-padding-x 0;
        padding: 12px 14px;
        background-color: #FFF4F4;
        border-radius: $radius-card;
        border-left: 3px solid #D9534F;

        &__title {
            display: block;
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
            color: #C0392B;
            margin-bottom: 4px;
        }

        &__desc {
            display: block;
            font-size: 10px;
            line-height: 1.6;
            color: #A0463F;
        }
    }

    .risk-row {
        display: flex;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid $border-light;

        &--last {
            border-bottom: none;
        }

        &__main {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        &__label {
            font-size: $font-size-xs;
            color: $text-primary;
        }

        &__time {
            font-size: 10px;
            color: $text-helper;
        }

        &__score {
            font-size: $font-size-xs;
            font-weight: $font-weight-medium;
            color: #C0392B;
        }
    }

    .account-tip {
        margin: 8px $page-padding-x 0;
        padding: 10px 12px;
        background-color: $bg-card;
        border-radius: $radius-sm;

        &__text {
            font-size: 10px;
            line-height: 1.6;
            color: $text-helper;
        }
    }

    .rule-list {
        padding-bottom: 10px;
    }

    .rule-item {
        display: flex;
        align-items: flex-start;
        gap: 4px;
        padding: 3px 0;

        &__dot {
            font-size: $font-size-xs;
            color: $text-helper;
            line-height: 1.6;
        }

        &__text {
            flex: 1;
            font-size: $font-size-xs;
            line-height: 1.6;
            color: $text-secondary;
        }
    }

    .account-actions {
        padding: 16px $page-padding-x 28px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        &__hint {
            font-size: 10px;
            color: $text-helper;
            text-align: center;
        }
    }

    .account-btn {
        width: 100%;
        height: 44px;
        line-height: 44px;
        font-size: $font-size-sm;
        border-radius: $radius-btn;
        border: none;

        &--danger {
            background-color: #FFF4F4;
            color: #C0392B;
            border: 1px solid #F3D2D0;
        }

        &--primary {
            background-color: $primary-color;
            color: #FFFFFF;
        }

        &:active {
            opacity: 0.85;
        }
    }

    .gone-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 12px $page-padding-x 0;
        padding: 26px 18px;
        background-color: $bg-card;
        border-radius: $radius-card;
        box-shadow: $shadow-card;

        &__icon {
            font-size: 38px;
            margin-bottom: 10px;
        }

        &__title {
            font-size: $font-size-md;
            font-weight: $font-weight-bold;
            color: $text-primary;
            margin-bottom: 6px;
        }

        &__desc {
            font-size: $font-size-xs;
            color: $text-helper;
            text-align: center;
            line-height: 1.6;
        }
    }
</style>
