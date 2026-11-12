<template>
    <view class="reports-page">
        <CustomNavbar title="我的举报" :show-back="true" @back="handleBack" />

        <scroll-view scroll-y class="reports-scroll">
            <!-- 概览 -->
            <view class="reports-hero">
                <view class="reports-hero__item">
                    <text class="reports-hero__num">{{ risk.pendingReports }}</text>
                    <text class="reports-hero__label">处理中</text>
                </view>
                <view class="reports-hero__divider"></view>
                <view class="reports-hero__item">
                    <text class="reports-hero__num">{{ risk.doneReports }}</text>
                    <text class="reports-hero__label">已处理</text>
                </view>
                <view class="reports-hero__divider"></view>
                <view class="reports-hero__item">
                    <text class="reports-hero__num">{{ risk.reportCount }}</text>
                    <text class="reports-hero__label">累计举报</text>
                </view>
            </view>

            <view v-if="isFemale" class="reports-channel">
                <text class="reports-channel__icon">🛡️</text>
                <text class="reports-channel__text">
                    你已开启女性专属通道：骚扰、诈骗、色情类举报将置顶处理，12 小时内出结果
                </text>
            </view>

            <!-- 空状态 -->
            <view v-if="list.length === 0" class="reports-empty">
                <text class="reports-empty__icon">🕊️</text>
                <text class="reports-empty__title">还没有举报记录</text>
                <text class="reports-empty__desc">遇到违规行为，可在对方主页或动态详情页举报</text>
            </view>

            <!-- 列表 -->
            <view v-else class="reports-list">
                <view v-for="item in list" :key="item.id" class="report-card">
                    <view class="report-card__head">
                        <text class="report-card__reason">{{ item.reasonLabel }}</text>
                        <text v-if="item.priority === 'female'" class="report-card__tag">女性专属 · 12h</text>
                        <text class="report-card__status"
                              :class="'report-card__status--' + item.status">
                            {{ statusText(item.status) }}
                        </text>
                    </view>

                    <text class="report-card__target">举报对象：{{ item.targetName }}</text>
                    <text v-if="item.desc" class="report-card__desc">{{ item.desc }}</text>

                    <view class="report-card__meta">
                        <text class="report-card__time">{{ timeLabel(item.createdAt) }}提交</text>
                        <text v-if="item.status !== 'done'" class="report-card__remain">
                            {{ remainText(item) }}
                        </text>
                    </view>

                    <!-- 处理结果 -->
                    <view v-if="item.status === 'done'" class="report-card__result">
                        <text class="report-card__result-title">
                            {{ item.result === 'punished' ? '已核实并处罚' : '经复核未发现违规' }}
                        </text>
                        <text v-if="item.penalty" class="report-card__result-desc">
                            处罚措施：{{ penaltyLabel(item.penalty) }}
                        </text>
                        <text v-if="item.appeal" class="report-card__appeal-state">
                            申诉中：{{ item.appeal.text }}
                        </text>
                        <view v-else class="report-card__appeal" @click="handleAppeal(item)">
                            <text class="report-card__appeal-text">对结果有异议，发起申诉</text>
                        </view>
                    </view>
                </view>
            </view>

            <view class="reports-footer">
                <text class="reports-footer__text">
                    恶意举报会影响你的账号信用，请如实反馈
                </text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
    import { computed } from 'vue'
    import { onShow } from '@dcloudio/uni-app'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'
    import { useRiskStore, useUserStore, useNotifyStore } from '@/store/index'
    import { REPORT_STATUS, APPEAL_REASONS, penaltyOf } from '@/mock/risk'
    import { formatRelativeTime } from '@/mock/dynamics'

    const risk = useRiskStore()
    const userStore = useUserStore()
    const notifyStore = useNotifyStore()

    const isFemale = computed(() => userStore.gender === 'female')
    const list = computed(() => risk.sortedReports)

    const statusText = (status) => REPORT_STATUS[status] || '处理中'
    const timeLabel = (ts) => formatRelativeTime(ts)
    const penaltyLabel = (code) => penaltyOf(code)?.label || ''

    const remainText = (item) => {
        const remain = item.deadlineAt - Date.now()
        if (remain <= 0) return '即将出结果'
        const hours = Math.ceil(remain / (60 * 60 * 1000))
        return `预计 ${hours} 小时内出结果`
    }

    onShow(() => {
        risk.restore()
        // 时效推进：AI 初审 5 分钟 → 人工审核 → 到期出结果
        risk.advanceReports()
        notifyStore.syncBadge()
    })

    const handleBack = () => uni.navigateBack()

    const handleAppeal = (item) => {
        uni.showActionSheet({
            itemList: APPEAL_REASONS,
            // 取消时 uni 会返回失败 Promise，必须显式兜住，否则产生未处理拒绝
            fail: () => {},
            success: (res) => {
                const text = APPEAL_REASONS[res.tapIndex]
                const result = risk.appealReport(item.id, text)
                if (!result.ok) {
                    uni.showToast({ title: '该举报已申诉', icon: 'none' })
                    return
                }
                uni.showToast({ title: '申诉已提交，24 小时内复核', icon: 'none' })
            }
        })
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .reports-page {
        min-height: 100vh;
        background-color: $bg-page;
        display: flex;
        flex-direction: column;
    }

    .reports-scroll {
        flex: 1;
    }

    .reports-hero {
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
        }

        &__label {
            font-size: 10px;
            color: $text-helper;
        }
    }

    .reports-channel {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin: 10px $page-padding-x 0;
        padding: 10px 12px;
        background-color: $primary-light-bg;
        border-radius: $radius-sm;

        &__icon {
            font-size: 14px;
        }

        &__text {
            flex: 1;
            font-size: 10px;
            line-height: 1.6;
            color: $text-secondary;
        }
    }

    .reports-list {
        margin: 10px $page-padding-x 0;
    }

    .report-card {
        padding: 14px;
        background-color: $bg-card;
        border-radius: $radius-card;
        box-shadow: $shadow-card;
        margin-bottom: 10px;

        &__head {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
        }

        &__reason {
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__tag {
            font-size: 9px;
            color: #C0392B;
            background-color: #FFEBEE;
            padding: 1px 5px;
            border-radius: 6px;
        }

        &__status {
            margin-left: auto;
            font-size: 10px;
            padding: 2px 8px;
            border-radius: 8px;
            background-color: $bg-page;
            color: $text-helper;

            &--ai {
                background-color: #EEF2FB;
                color: #5B7BB5;
            }

            &--pending {
                background-color: #FFF8E1;
                color: #B58A2B;
            }

            &--done {
                background-color: $primary-light-bg;
                color: $primary-dark;
            }
        }

        &__target {
            display: block;
            font-size: $font-size-xs;
            color: $text-secondary;
        }

        &__desc {
            display: block;
            font-size: $font-size-xs;
            color: $text-helper;
            margin-top: 4px;
            line-height: 1.5;
        }

        &__meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 8px;
        }

        &__time {
            font-size: 10px;
            color: $text-helper;
        }

        &__remain {
            font-size: 10px;
            color: $primary-dark;
        }

        &__result {
            margin-top: 10px;
            padding: 10px 12px;
            background-color: $bg-page;
            border-radius: $radius-sm;
        }

        &__result-title {
            display: block;
            font-size: $font-size-xs;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__result-desc {
            display: block;
            font-size: 10px;
            color: $text-helper;
            margin-top: 3px;
        }

        &__appeal {
            margin-top: 8px;

            &:active {
                opacity: 0.7;
            }
        }

        &__appeal-text {
            font-size: 10px;
            color: $primary-dark;
        }

        &__appeal-state {
            display: block;
            margin-top: 6px;
            font-size: 10px;
            color: #B58A2B;
        }
    }

    .reports-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 70px;

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
            text-align: center;
            padding: 0 40px;
            line-height: 1.6;
        }
    }

    .reports-footer {
        padding: 12px 24px 24px;
        text-align: center;

        &__text {
            font-size: 10px;
            color: $text-helper;
        }
    }
</style>
