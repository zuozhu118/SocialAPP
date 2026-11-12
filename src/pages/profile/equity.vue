<template>
    <view class="equity-page">
        <CustomNavbar title="权益中心" :show-back="true" @back="handleBack" />

        <!-- ========================================== -->
        <!-- 1. 资产区：今日额度（X/10） -->
        <!-- ========================================== -->
        <view class="equity-hero">
            <view class="equity-hero__head">
                <text class="equity-hero__label">今日剩余浏览额度</text>
                <text class="equity-hero__reset">每日 0 点重置</text>
            </view>

            <view class="equity-hero__main">
                <text class="equity-hero__num">{{ assets.browse.remain }}</text>
                <text class="equity-hero__total">/ {{ assets.browse.total }}</text>
            </view>

            <view class="equity-hero__bar">
                <view class="equity-hero__bar-fill" :style="{ width: browsePercent + '%' }"></view>
            </view>

            <view class="equity-hero__foot">
                <text class="equity-hero__foot-item">今日剩余心动 <text class="is-strong">{{ assets.like.remain }}</text> / {{ assets.like.total }}</text>
                <text class="equity-hero__foot-divider">｜</text>
                <text class="equity-hero__foot-item">优质推荐本周剩余 <text class="is-strong">{{ equity.qualityRemaining }}</text> / {{ qualityLimit }} 次</text>
            </view>
        </view>

        <!-- ========================================== -->
        <!-- 2. 四格资产（永久心动 / 曝光卡仅预留） -->
        <!-- ========================================== -->
        <view class="equity-assets">
            <view class="equity-assets__cell">
                <text class="equity-assets__num">{{ assets.browse.remain }}</text>
                <text class="equity-assets__label">今日浏览</text>
                <text class="equity-assets__sub">共 {{ assets.browse.total }} 次</text>
            </view>
            <view class="equity-assets__cell">
                <text class="equity-assets__num">{{ assets.like.remain }}</text>
                <text class="equity-assets__label">今日心动</text>
                <text class="equity-assets__sub">共 {{ assets.like.total }} 次</text>
            </view>
            <view class="equity-assets__cell">
                <text class="equity-assets__num">{{ assets.permanentLikes }}</text>
                <text class="equity-assets__label">永久心动</text>
                <text class="equity-assets__sub">不随日期清零</text>
            </view>
            <view class="equity-assets__cell" @click="handleExposureCard">
                <text class="equity-assets__num">{{ assets.exposureCards }}</text>
                <text class="equity-assets__label">同城曝光卡</text>
                <text class="equity-assets__sub">{{ assets.exposureCards > 0 ? '点击使用' : '暂无可使用' }}</text>
                <text class="equity-assets__tag">仅预留</text>
            </view>
        </view>

        <!-- 额度耗尽提示 -->
        <view v-if="!equity.hasBrowseQuota" class="equity-warning">
            <text class="equity-warning__icon icon icon-info"></text>
            <text class="equity-warning__text">{{ browseEmptyText }}</text>
        </view>

        <!-- ========================================== -->
        <!-- 3. 如何获得权益 -->
        <!-- ========================================== -->
        <view class="equity-group">
            <view class="equity-group__head">
                <text class="equity-group__title">如何获得权益</text>
                <text class="equity-group__hint">认证越多，匹配权重越高</text>
            </view>

            <view v-for="(item, index) in earnWays"
                  :key="index"
                  class="equity-row"
                  @click="item.action">
                <text class="equity-row__icon icon" :class="item.icon"></text>
                <view class="equity-row__body">
                    <text class="equity-row__label">{{ item.label }}</text>
                    <text class="equity-row__desc">{{ item.desc }}</text>
                </view>
                <text class="equity-row__reward">{{ item.reward }}</text>
                <text class="equity-row__arrow icon icon-arrow-right"></text>
            </view>
        </view>

        <!-- ========================================== -->
        <!-- 4. 权益记录时间轴 -->
        <!-- ========================================== -->
        <view class="equity-group">
            <view class="equity-group__head">
                <text class="equity-group__title">权益记录</text>
                <text class="equity-group__hint">最近 {{ records.length }} 条</text>
            </view>

            <view v-if="records.length === 0" class="equity-empty">
                <text class="equity-empty__text">暂无权益变动，去匹配页看看吧</text>
            </view>

            <view v-else class="timeline">
                <view v-for="(record, index) in records"
                      :key="record.id"
                      class="timeline__item">
                    <view class="timeline__axis">
                        <view class="timeline__dot" :class="'timeline__dot--' + record.type"></view>
                        <view v-if="index !== records.length - 1" class="timeline__line"></view>
                    </view>
                    <view class="timeline__body">
                        <text class="timeline__title">{{ record.title }}</text>
                        <text class="timeline__time">{{ record.time }}</text>
                    </view>
                    <text class="timeline__amount" :class="'timeline__amount--' + record.type">
                        {{ record.type === 'gain' ? '+' : '-' }}{{ record.amount }}
                    </text>
                </view>
            </view>
        </view>

        <!-- ========================================== -->
        <!-- 5. 权益说明折叠面板 -->
        <!-- ========================================== -->
        <view class="equity-group">
            <view class="equity-group__head">
                <text class="equity-group__title">权益说明</text>
                <text class="equity-group__hint">点击展开</text>
            </view>

            <view v-for="(item, index) in faqList" :key="index" class="faq">
                <view class="faq__head" @click="toggleFaq(index)">
                    <text class="faq__q">{{ item.q }}</text>
                    <text class="faq__arrow icon icon-arrow-right" :class="{ 'is-open': openFaq === index }"></text>
                </view>
                <text v-if="openFaq === index" class="faq__a">{{ item.a }}</text>
            </view>
        </view>

        <!-- ========================================== -->
        <!-- 6. 会员入口（置灰 · 筹备中） -->
        <!-- ========================================== -->
        <view class="equity-vip">
            <view class="equity-vip__left">
                <text class="equity-vip__title">会员特权</text>
                <text class="equity-vip__sub">无限浏览 · 优先曝光 · 专属标识</text>
            </view>
            <text class="equity-vip__btn" @click="handleVipTip">筹备中</text>
        </view>

        <view class="page-bottom-placeholder"></view>
    </view>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { onShow } from '@dcloudio/uni-app'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'
    import { useEquityStore } from '@/store/index'
    import { QUALITY_WEEKLY_LIMIT } from '@/store/equity'

    const equity = useEquityStore()

    // ===== 资产区（全部来自 equity store） =====
    const assets = computed(() => equity.assets)
    const qualityLimit = QUALITY_WEEKLY_LIMIT
    // 权益记录时间轴
    const records = computed(() => equity.records || [])

    const browsePercent = computed(() => {
        const total = assets.value.browse.total || 1
        return Math.round((assets.value.browse.remain / total) * 100)
    })

    const browseEmptyText = computed(
        () => `今日浏览额度已用完，明日 0 点自动恢复 ${assets.value.browse.total} 次。完善资料至 80% 可获得次日额外额度。`
    )

    // ===== 如何获得权益 =====
    const earnWays = [
        {
            icon: 'icon-id-card',
            label: '完成实名认证',
            desc: '解锁全部匹配与微信交换能力',
            reward: '基础额度',
            action: () => uni.navigateTo({ url: '/pages/auth/realname' })
        },
        {
            icon: 'icon-graduation',
            label: '学历认证',
            desc: '学信网截图人工核对',
            reward: '+5 永久心动',
            action: () => uni.navigateTo({ url: '/pages/auth/education' })
        },
        {
            icon: 'icon-briefcase',
            label: '工作认证',
            desc: '工牌 / 在职证明 / 企业邮箱三选一',
            reward: '+5 永久心动',
            action: () => uni.navigateTo({ url: '/pages/auth/work' })
        },
        {
            icon: 'icon-star',
            label: '发布优质动态',
            desc: '被运营标记为优质动态',
            reward: '+3 永久心动',
            action: () => uni.switchTab({ url: '/pages/square/index' })
        }
    ]

    // ===== 权益说明 =====
    const faqList = [
        {
            q: '浏览额度怎么算？',
            a: '实名用户每日 10 次浏览额度，每天 0 点自动重置。资料完成度达到 80% 并领取后，次日额外 +3 次。'
        },
        {
            q: '心动额度男女一样吗？',
            a: '不一样。男性每日 3 次、女性每日 5 次，同样在 0 点重置。当日额度用尽后会自动扣减永久心动次数。'
        },
        {
            q: '永久心动次数怎么获得？',
            a: '完成学历认证、工作认证各 +5 次；动态被运营标记为优质动态再 +3 次。永久次数不随日期清零。'
        },
        {
            q: '优质惊喜推荐是什么意思？',
            a: '双认证且标签交集 ≥3 的用户会被选中为优质惊喜推荐，不计入浏览额度，每周最多触发 2 次，不固定推送。'
        },
        {
            q: '同城曝光卡怎么用？',
            a: '使用后 24 小时内在同城广场获得加权曝光。当前版本仅做数量预留，暂不开放购买与交易。'
        }
    ]

    const openFaq = ref(-1)
    const toggleFaq = (index) => {
        openFaq.value = openFaq.value === index ? -1 : index
    }

    // ===== 交互 =====
    const handleBack = () => {
        uni.navigateBack()
    }

    const handleExposureCard = () => {
        if (assets.value.exposureCards <= 0) {
            uni.showToast({ title: '暂无可使用的同城曝光卡', icon: 'none' })
            return
        }
        uni.showModal({
            title: '使用曝光卡',
            content: '确认使用 1 张同城曝光卡？24 小时内提升同城曝光。',
            confirmColor: '#8AA07B',
            success: (res) => {
                if (!res.confirm) return
                const result = equity.useExposureCard()
                uni.showToast({
                    title: result.ok ? '已使用，曝光提升中' : '使用失败',
                    icon: 'none'
                })
            }
        })
    }

    const handleVipTip = () => {
        uni.showToast({ title: '会员体系筹备中，敬请期待', icon: 'none' })
    }

    // ===== 页面展示同步 =====
    onShow(() => {
        equity.ensureToday()
    })
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .equity-page {
        min-height: 100vh;
        background-color: $bg-page;
        padding-bottom: $spacing-lg;
    }

    // ----- 1. 今日额度 -----
    .equity-hero {
        background: linear-gradient(135deg, $primary-color, $primary-dark);
        margin: $spacing-sm $page-padding-x;
        border-radius: $radius-card;
        padding: 16px;
        box-shadow: $shadow-btn;
    }

    .equity-hero__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .equity-hero__label {
        font-size: $font-size-xs;
        color: rgba(255, 255, 255, 0.9);
    }

    .equity-hero__reset {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.7);
    }

    .equity-hero__main {
        display: flex;
        align-items: baseline;
        gap: 4px;
        margin: 4px 0 10px;
    }

    .equity-hero__num {
        font-size: 34px;
        font-weight: $font-weight-bold;
        color: #FFFFFF;
        line-height: 1.1;
    }

    .equity-hero__total {
        font-size: $font-size-sm;
        color: rgba(255, 255, 255, 0.8);
    }

    .equity-hero__bar {
        height: 6px;
        border-radius: 3px;
        background-color: rgba(255, 255, 255, 0.25);
        overflow: hidden;
    }

    .equity-hero__bar-fill {
        height: 100%;
        border-radius: 3px;
        background-color: #FFFFFF;
        transition: width 0.4s ease;
    }

    .equity-hero__foot {
        display: flex;
        align-items: center;
        margin-top: 10px;
    }

    .equity-hero__foot-item {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.85);

        .is-strong {
            font-weight: $font-weight-bold;
            color: #FFFFFF;
        }
    }

    .equity-hero__foot-divider {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.4);
        margin: 0 4px;
    }

    // ----- 2. 四格资产 -----
    .equity-assets {
        display: flex;
        background-color: $bg-card;
        margin: 0 $page-padding-x $spacing-sm;
        border-radius: $radius-card;
        padding: 14px 0;
        box-shadow: $shadow-card;
    }

    .equity-assets__cell {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        position: relative;
        cursor: pointer;

        &:active {
            opacity: 0.75;
        }
    }

    .equity-assets__num {
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
        color: $primary-dark;
        line-height: 1.2;
    }

    .equity-assets__label {
        font-size: 11px;
        color: $text-primary;
    }

    .equity-assets__sub {
        font-size: 10px;
        color: $text-helper;
    }

    .equity-assets__tag {
        position: absolute;
        top: -6px;
        right: 2px;
        font-size: 9px;
        color: #B9A26A;
        background-color: #FBF6E9;
        border: 1px solid #EFE3C4;
        border-radius: 8px;
        padding: 0 4px;
        line-height: 1.5;
    }

    // ----- 额度耗尽提示 -----
    .equity-warning {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        margin: 0 $page-padding-x $spacing-sm;
        padding: 10px 12px;
        border-radius: $radius-sm;
        background-color: #FBF3EE;
        border: 1px solid #EEDFD3;
    }

    .equity-warning__icon {
        font-size: 12px;
        color: #C08552;
        line-height: 1.6;
    }

    .equity-warning__text {
        flex: 1;
        font-size: 11px;
        color: #A9703F;
        line-height: 1.6;
    }

    // ----- 通用分组 -----
    .equity-group {
        background-color: $bg-card;
        border-radius: $radius-card;
        margin: 0 $page-padding-x $spacing-sm;
        overflow: hidden;
        box-shadow: $shadow-card;
    }

    .equity-group__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px 8px;
    }

    .equity-group__title {
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $text-primary;
    }

    .equity-group__hint {
        font-size: 11px;
        color: $text-helper;
    }

    // ----- 3. 如何获得权益 -----
    .equity-row {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-top: 1px solid $border-light;
        cursor: pointer;

        &:active {
            background-color: $bg-page;
        }
    }

    .equity-row__icon {
        font-size: 18px;
        color: $primary-color;
        margin-right: 12px;
        width: 20px;
        text-align: center;
    }

    .equity-row__body {
        flex: 1;
        min-width: 0;
    }

    .equity-row__label {
        display: block;
        font-size: $font-size-sm;
        color: $text-primary;
        line-height: 1.4;
    }

    .equity-row__desc {
        display: block;
        font-size: 11px;
        color: $text-helper;
        line-height: 1.4;
    }

    .equity-row__reward {
        font-size: $font-size-xs;
        font-weight: $font-weight-medium;
        color: $primary-dark;
        flex-shrink: 0;
    }

    .equity-row__arrow {
        font-size: 10px;
        color: $text-helper;
        margin-left: 4px;
    }

    // ----- 4. 权益记录时间轴 -----
    .timeline {
        padding: 4px 16px 12px;
    }

    .timeline__item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        min-height: 44px;
    }

    .timeline__axis {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 10px;
        flex-shrink: 0;
        padding-top: 4px;
    }

    .timeline__dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: $primary-color;
        flex-shrink: 0;

        &--gain {
            background-color: #6FBF73;
        }

        &--consume {
            background-color: #D1D1D1;
        }
    }

    .timeline__line {
        flex: 1;
        width: 1px;
        background-color: $border-light;
        margin-top: 3px;
    }

    .timeline__body {
        flex: 1;
        min-width: 0;
        padding-bottom: 10px;
    }

    .timeline__title {
        display: block;
        font-size: $font-size-xs;
        color: $text-primary;
        line-height: 1.6;
    }

    .timeline__time {
        display: block;
        font-size: 10px;
        color: $text-helper;
        line-height: 1.6;
    }

    .timeline__amount {
        font-size: $font-size-xs;
        font-weight: $font-weight-medium;
        flex-shrink: 0;
        padding-top: 2px;

        &--gain {
            color: #4FA85A;
        }

        &--consume {
            color: $text-helper;
        }
    }

    .equity-empty {
        padding: 20px 16px 24px;
        text-align: center;
    }

    .equity-empty__text {
        font-size: $font-size-xs;
        color: $text-helper;
    }

    // ----- 5. 权益说明折叠 -----
    .faq {
        border-top: 1px solid $border-light;
        padding: 12px 16px;
    }

    .faq__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;

        &:active {
            opacity: 0.75;
        }
    }

    .faq__q {
        flex: 1;
        font-size: $font-size-xs;
        color: $text-primary;
        line-height: 1.6;
    }

    .faq__arrow {
        font-size: 10px;
        color: $text-helper;
        flex-shrink: 0;
        transition: transform 0.2s ease;

        &.is-open {
            transform: rotate(90deg);
        }
    }

    .faq__a {
        display: block;
        margin-top: 6px;
        font-size: 11px;
        color: $text-secondary;
        line-height: 1.7;
        background-color: $primary-light-bg;
        border-radius: $radius-xs;
        padding: 8px 10px;
    }

    // ----- 6. 会员入口（置灰） -----
    .equity-vip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0 $page-padding-x;
        padding: 14px 16px;
        border-radius: $radius-card;
        background-color: $disabled-bg;
        border: 1px dashed #DFDFDF;
    }

    .equity-vip__title {
        display: block;
        font-size: $font-size-sm;
        color: $text-helper;
        font-weight: $font-weight-medium;
    }

    .equity-vip__sub {
        display: block;
        font-size: 11px;
        color: #B5B5B5;
        margin-top: 2px;
    }

    .equity-vip__btn {
        font-size: $font-size-xs;
        color: #B5B5B5;
        background-color: #FFFFFF;
        border: 1px solid #E2E2E2;
        border-radius: $radius-btn;
        padding: 5px 16px;

        &:active {
            opacity: 0.8;
        }
    }

    .page-bottom-placeholder {
        height: 20px;
    }
</style>
