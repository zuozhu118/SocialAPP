<!-- pages/match/apply.vue -->
<template>
    <view class="apply-page">
        <!-- 导航栏 -->
        <view class="apply-navbar">
            <text class="apply-navbar__back icon icon-arrow-left" @click="goBack"></text>
            <text class="apply-navbar__title">{{ pageTitle }}</text>
            <view class="apply-navbar__placeholder"></view>
        </view>

        <!-- 用户信息卡片 - 已申请/已同意/已拒绝时隐藏 -->
        <view class="apply-user-card" v-if="userInfo && !isApplied && !isAgreed && !isRejected">
            <view class="apply-user-card__avatar-wrap">
                <image class="apply-user-card__avatar" :src="userInfo.avatar" mode="aspectFill" />
                <view class="apply-user-card__auth" v-if="userInfo.auth.realName">
                    <text class="icon icon-check"></text>
                </view>
            </view>
            <view class="apply-user-card__info">
                <view class="apply-user-card__name-row">
                    <text class="apply-user-card__name">{{ userInfo.name }}</text>
                    <text class="apply-user-card__gender" :class="userInfo.gender === 'female' ? 'is-female' : 'is-male'">
                        {{ userInfo.gender === 'female' ? '♀' : '♂' }}
                    </text>
                </view>
                <text class="apply-user-card__meta">
                    {{ userInfo.age }}岁 · {{ userInfo.occupation }} · {{ userInfo.district }}
                </text>
                <view class="apply-user-card__badges">
                    <text v-if="userInfo.auth.realName" class="badge badge--real">实名认证</text>
                    <text v-if="userInfo.auth.education" class="badge badge--edu">学历认证</text>
                    <text v-if="userInfo.auth.work" class="badge badge--work">工作认证</text>
                </view>
            </view>
        </view>

        <!-- 匹配状态提示 - 已申请/已同意/已拒绝时隐藏 -->
        <view class="apply-match-status" v-if="isMatched && !isApplied && !isAgreed && !isRejected">
            <text class="apply-match-status__icon">💕</text>
            <text class="apply-match-status__text">你们已双向匹配，可以申请交换微信了</text>
        </view>

        <!-- 招呼语区域 - 已申请/已同意/已拒绝时隐藏 -->
        <view class="apply-greeting" v-if="isMatched && !isApplied && !isAgreed && !isRejected">
            <view class="apply-greeting__header">
                <text class="apply-greeting__title">{{ isHandling ? '对方招呼语' : '发送招呼语' }}</text>
                <text class="apply-greeting__count" v-if="!isHandling">{{ greetingLength }}/20</text>
            </view>
            <textarea v-if="isHandling"
                      class="apply-greeting__input apply-greeting__input--readonly"
                      :value="otherGreeting"
                      readonly
                      disabled />
            <textarea v-else
                      class="apply-greeting__input"
                      v-model="greeting"
                      placeholder="说点什么吧，让对方更了解你（20字以内）"
                      maxlength="20"
                      @input="onGreetingInput"
                      :disabled="isApplied || isHandling" />
            <text v-if="!isHandling" class="apply-greeting__hint">💡 一句真诚的打招呼，申请通过率更高哦</text>
        </view>

        <!-- 状态展示区 -->
        <view class="apply-status" v-if="isApplied || isHandling || isAgreed || isRejected">
            <!-- 已申请待处理 -->
            <view v-if="isApplied" class="apply-status__full apply-status__pending">
                <text class="apply-status__icon">⏳</text>
                <text class="apply-status__title">申请已发送</text>
                <text class="apply-status__desc">等待对方确认，请耐心等待</text>
            </view>

            <!-- 处理别人的申请 -->
            <view v-if="isHandling" class="apply-status__handle">
                <text class="apply-status__title">对方申请交换微信</text>
                <text class="apply-status__desc">同意后将互相展示微信号</text>
                <view class="apply-status__actions">
                    <button class="apply-status__btn apply-status__btn--reject" @click="handleReject">拒绝</button>
                    <button class="apply-status__btn apply-status__btn--agree" @click="handleAgree">同意</button>
                </view>
            </view>

            <!-- 已同意 - 全屏留白 -->
            <view v-if="isAgreed" class="apply-status__full apply-status__agreed">
                <text class="apply-status__icon">✅</text>
                <text class="apply-status__title">已同意申请</text>
                <text class="apply-status__desc">微信号已互相展示，快去添加好友吧</text>
                <view class="apply-status__wechat" v-if="myWechat">
                    <text class="apply-status__wechat-label">我的微信号</text>
                    <text class="apply-status__wechat-value">{{ myWechat }}</text>
                    <button class="apply-status__wechat-copy" @click="copyWechat">复制</button>
                </view>
                <view class="apply-status__wechat" v-if="otherWechat">
                    <text class="apply-status__wechat-label">Ta的微信号</text>
                    <text class="apply-status__wechat-value">{{ otherWechat }}</text>
                    <button class="apply-status__wechat-copy" @click="copyWechat(otherWechat)">复制</button>
                </view>
            </view>

            <!-- 已拒绝 - 全屏留白 -->
            <view v-if="isRejected" class="apply-status__full apply-status__rejected">
                <text class="apply-status__icon">😔</text>
                <text class="apply-status__title">申请已拒绝</text>
                <text class="apply-status__desc">您已拒绝了对方的微信申请</text>
            </view>
        </view>

        <!-- 底部按钮 - 仅初始状态显示（未申请、未处理） -->
        <view class="apply-footer" v-if="isMatched && !isApplied && !isHandling && !isAgreed && !isRejected">
            <view class="apply-footer__risk">
                <text class="apply-footer__risk-icon">⚠️</text>
                <text class="apply-footer__risk-text">
                    平台仅提供联系方式交换渠道，请勿向对方转账、投资、刷单，谨防诈骗
                </text>
            </view>

            <button class="apply-footer__btn" @click="submitApply">
                <text class="icon icon-wechat"></text>
                申请交换微信
            </button>
        </view>

        <!-- 加载状态 -->
        <view v-if="loading" class="apply-loading">
            <text>加载中...</text>
        </view>

        <!-- 风险确认弹框 -->
        <RiskModal v-model:visible="showRiskModal" @confirm="doConfirmAction" />
    </view>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'
    import RiskModal from '@/components/common/RiskModal.vue'

    const userId = ref('')
    const applyType = ref('')

    onMounted(() => {
        const pages = getCurrentPages()
        const currentPage = pages[pages.length - 1]
        userId.value = currentPage.options.userId || ''
        applyType.value = currentPage.options.type || ''
        loadData()
    })

    const loading = ref(false)
    const greeting = ref('')
    const isApplied = ref(false)
    const isHandling = ref(false)
    const isAgreed = ref(false)
    const isRejected = ref(false)
    const showRiskModal = ref(false)
    const actionType = ref('')

    const remainQuota = ref(8)
    const equityQuota = ref(5)

    const myWechat = ref('xiaolu_2024')

    const userInfo = ref({
        id: 1,
        name: '林小鹿',
        gender: 'female',
        age: 24,
        occupation: '产品经理',
        district: '朝阳区',
        avatar: 'https://picsum.photos/200/200?random=101',
        auth: { realName: true, education: true, work: false }
    })

    const otherWechat = ref('')
    const otherGreeting = ref('你好呀，觉得我们很合适，想进一步了解你')

    const pageTitle = computed(() => {
        return applyType.value === 'handle' ? '处理申请' : '申请微信'
    })

    const isMatched = computed(() => {
        return true
    })

    const greetingLength = computed(() => {
        return greeting.value.length
    })

    const loadData = () => {
        loading.value = true
        setTimeout(() => {
            if (applyType.value === 'handle') {
                isHandling.value = true
                otherGreeting.value = '你好呀，觉得我们很合适，想进一步了解你'
            }
            loading.value = false
        }, 500)
    }

    const goBack = () => {
        uni.navigateBack()
    }

    const onGreetingInput = (e) => {
        greeting.value = e.detail.value
    }

    const submitApply = () => {
        if (remainQuota.value <= 0 && equityQuota.value <= 0) {
            uni.showToast({
                title: '今日申请次数已用完',
                icon: 'none'
            })
            return
        }

        if (!greeting.value.trim()) {
            uni.showToast({
                title: '请先发送一句招呼语',
                icon: 'none'
            })
            return
        }

        actionType.value = 'apply'
        showRiskModal.value = true
    }

    const doConfirmAction = () => {
        if (actionType.value === 'apply') {
            doSubmitApply()
        } else if (actionType.value === 'agree') {
            doAgree()
        }
        actionType.value = ''
    }

    const doSubmitApply = () => {
        loading.value = true
        setTimeout(() => {
            loading.value = false
            isApplied.value = true

            if (remainQuota.value > 0) {
                remainQuota.value--
            } else if (equityQuota.value > 0) {
                equityQuota.value--
            }

            uni.showToast({
                title: '申请已发送',
                icon: 'success'
            })
        }, 1000)
    }

    const handleAgree = () => {
        actionType.value = 'agree'
        showRiskModal.value = true
    }

    const doAgree = () => {
        loading.value = true
        setTimeout(() => {
            loading.value = false
            isHandling.value = false
            isAgreed.value = true
            otherWechat.value = 'linxiaolu_2024'

            uni.showToast({
                title: '已同意，双方微信号已展示',
                icon: 'success'
            })
        }, 1000)
    }

    const handleReject = () => {
        uni.showModal({
            title: '拒绝申请',
            content: `确认拒绝「${userInfo.value.name}」的微信申请吗？`,
            confirmText: '拒绝',
            confirmColor: '#FF4757',
            success: (res) => {
                if (res.confirm) {
                    doReject()
                }
            }
        })
    }

    const doReject = () => {
        loading.value = true
        setTimeout(() => {
            loading.value = false
            isHandling.value = false
            isRejected.value = true
            uni.showToast({
                title: '已拒绝',
                icon: 'none'
            })
        }, 500)
    }

    const copyWechat = (wechat) => {
        const text = wechat || myWechat.value
        uni.setClipboardData({
            data: text,
            success: () => {
                uni.showToast({
                    title: '已复制微信号',
                    icon: 'success'
                })
            }
        })
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';
    @import '@/styles/mixins.scss';

    .apply-page {
        min-height: 100vh;
        background-color: $bg-page;
        display: flex;
        flex-direction: column;
    }

    // ===== 导航栏 =====
    .apply-navbar {
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
            width: 32px;
            font-size: 20px;
            color: $text-primary;
            cursor: pointer;
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

    // ===== 用户信息卡片 =====
    .apply-user-card {
        display: flex;
        gap: 14px;
        background-color: $bg-card;
        margin: 12px $page-padding-x;
        padding: $spacing-md;
        border-radius: $radius-card;
        box-shadow: $shadow-card;
        flex-shrink: 0;

        &__avatar-wrap {
            position: relative;
            flex-shrink: 0;
        }

        &__avatar {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background-color: $bg-page;
        }

        &__auth {
            position: absolute;
            right: -2px;
            bottom: -2px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FFD700, #FFB74D);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid $bg-card;

            .icon {
                font-size: 10px;
                color: #FFFFFF;
            }
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
            font-size: 18px;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__gender {
            font-size: 16px;
            line-height: 1;

            &.is-female {
                color: #FF6B81;
            }

            &.is-male {
                color: #4FACFE;
            }
        }

        &__meta {
            font-size: 12px;
            color: $text-helper;
            display: block;
            margin-bottom: 6px;
        }

        &__badges {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
        }
    }

    .badge {
        padding: 0 8px;
        font-size: 9px;
        color: #FFFFFF;
        border-radius: 3px;
        line-height: 1.8;

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

    // ===== 匹配状态 =====
    .apply-match-status {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 $page-padding-x 12px;
        padding: 10px 14px;
        background: linear-gradient(135deg, rgba(255, 107, 129, 0.08), rgba(255, 107, 129, 0.02));
        border-radius: 10px;
        border: 1px solid rgba(255, 107, 129, 0.2);
        flex-shrink: 0;

        &__icon {
            font-size: 20px;
        }

        &__text {
            font-size: $font-size-sm;
            color: $text-secondary;
            flex: 1;
        }
    }

    // ===== 招呼语 - 紧凑 =====
    .apply-greeting {
        background-color: $bg-card;
        margin: 0 $page-padding-x 12px;
        padding: $spacing-sm $spacing-md;
        border-radius: $radius-card;
        box-shadow: $shadow-card;
        flex-shrink: 0;

        &__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 4px;
        }

        &__title {
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__count {
            font-size: 12px;
            color: $text-helper;
        }

        &__input {
            width: 100%;
            min-height: 42px;
            max-height: 65px;
            padding: 6px 12px;
            font-size: $font-size-sm;
            color: $text-primary;
            background-color: $bg-page;
            border-radius: $radius-sm;
            border: 1px solid $border-light;
            box-sizing: border-box;
            resize: none;

            &:focus {
                border-color: $primary-color;
                outline: none;
            }

            &:disabled {
                background-color: $bg-page;
                color: $text-helper;
            }

            &--readonly {
                background-color: $bg-page;
                color: $text-secondary;
                cursor: default;
            }
        }

        &__hint {
            display: block;
            margin-top: 4px;
            font-size: 11px;
            color: $text-helper;
        }
    }

    // ===== 状态展示 =====
    .apply-status {
        flex: 1;
        padding: 0 $page-padding-x;
        display: flex;
        flex-direction: column;
    }

    .apply-status__pending,
    .apply-status__handle {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        background-color: $bg-card;
        border-radius: $radius-card;
        box-shadow: $shadow-card;
        text-align: center;
    }

    // ===== 已同意 / 已拒绝 - 全屏留白，白色背景 =====
    .apply-status__full {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        padding: 40px 20px;
        background-color: #FFFFFF;
        border-radius: 0;
        box-shadow: none;
        text-align: center;
        margin-top: 12px;
        min-height: calc(100vh - 200px);
    }

    .apply-status__icon {
        font-size: 48px;
        margin-bottom: 12px;
    }

    .apply-status__title {
        font-size: $font-size-lg;
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-bottom: 4px;
    }

    .apply-status__desc {
        font-size: $font-size-sm;
        color: $text-helper;
        margin-bottom: 16px;
    }

    .apply-status__actions {
        display: flex;
        gap: 12px;
        width: 100%;
        margin-top: 8px;
    }

    .apply-status__btn {
        flex: 1;
        padding: 10px 0;
        border-radius: 24px;
        font-size: $font-size-sm;
        border: none;

        &--agree {
            background: linear-gradient(90deg, $primary-color, #9DB48E);
            color: #FFFFFF;
        }

        &--reject {
            background-color: $bg-page;
            color: $text-secondary;
            border: 1px solid $border-light;
        }
    }

    .apply-status__wechat {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background-color: $bg-page;
        border-radius: 8px;
        width: 100%;
        margin-bottom: 8px;

        &:last-child {
            margin-bottom: 0;
        }

        &-label {
            font-size: 12px;
            color: $text-helper;
        }

        &-value {
            flex: 1;
            font-size: $font-size-sm;
            color: $text-primary;
            font-weight: $font-weight-medium;
            text-align: center;
        }

        &-copy {
            padding: 2px 12px;
            font-size: 11px;
            color: $primary-color;
            background-color: $primary-light-bg;
            border: none;
            border-radius: 12px;
            line-height: 1.6;
        }
    }

    // ===== 底部 =====
    .apply-footer {
        padding: 12px $page-padding-x calc(12px + env(safe-area-inset-bottom));
        background-color: $bg-card;
        border-top: 1px solid $border-light;
        flex-shrink: 0;

        &__risk {
            display: flex;
            align-items: flex-start;
            gap: 6px;
            padding: 8px 12px;
            background-color: rgba(255, 71, 87, 0.06);
            border-radius: 8px;
            margin-bottom: 12px;

            &-icon {
                font-size: 14px;
                flex-shrink: 0;
                margin-top: 1px;
            }

            &-text {
                font-size: 11px;
                color: $text-helper;
                line-height: 1.5;
            }
        }

        &__btn {
            width: 100%;
            padding: 12px 0;
            border-radius: 24px;
            background: linear-gradient(90deg, $primary-color, #9DB48E);
            color: #FFFFFF;
            font-size: $font-size-md;
            font-weight: $font-weight-medium;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            box-shadow: 0 4px 12px rgba(168, 184, 154, 0.35);

            &:active {
                opacity: 0.85;
            }

            .icon {
                font-size: 18px;
            }
        }

        &__quota {
            text-align: center;
            margin-top: 8px;
            font-size: 12px;
            color: $text-helper;

            &-num {
                color: $primary-color;
                font-weight: $font-weight-medium;
            }

            &-equity {
                color: #FFB74D;
            }
        }
    }

    // ===== 加载 =====
    .apply-loading {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(255, 255, 255, 0.8);
        z-index: 999;
        font-size: $font-size-sm;
        color: $text-helper;
    }
</style>