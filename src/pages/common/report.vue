<template>
    <view class="report-page">
        <CustomNavbar title="举报" :show-back="true" @back="handleBack" />

        <scroll-view scroll-y class="report-scroll">
            <view class="report-content">
                <!-- 举报对象 -->
                <view class="report-target">
                    <text class="report-target__label">举报对象</text>
                    <text class="report-target__name">{{ targetName }}</text>
                    <text v-if="isFemaleChannel" class="report-target__tag">女性专属通道 · {{ femaleSla }}内处理</text>
                    <text v-else class="report-target__tag">预计 {{ normalSla }}内处理</text>
                </view>

                <text class="report-content__title">请选择举报原因</text>
                <text class="report-content__desc">
                    我们会在 AI 初审 5 分钟内完成识别，再进入人工复核
                </text>

                <view v-for="item in reasons"
                      :key="item.value"
                      class="report-option"
                      :class="{ 'report-option--active': selected === item.value }"
                      @click="selectReason(item)">
                    <text class="report-option__icon">{{ item.icon }}</text>
                    <view class="report-option__body">
                        <view class="report-option__title-row">
                            <text class="report-option__title">{{ item.title }}</text>
                            <text v-if="item.priority === 'female' && isFemale" class="report-option__badge">12h</text>
                        </view>
                        <text class="report-option__desc">{{ item.desc }}</text>
                    </view>
                    <view class="report-check" :class="{ 'report-check--on': selected === item.value }">
                        <text v-if="selected === item.value" class="report-check__mark">✓</text>
                    </view>
                </view>

                <!-- 补充说明 -->
                <view class="report-extra">
                    <textarea class="report-extra__input"
                              placeholder="请补充详细说明（选填，越具体处理越快）"
                              v-model="description"
                              maxlength="200" />
                    <text class="report-extra__count">{{ description.length }}/200</text>
                </view>

                <!-- 证据截图 -->
                <view class="report-evidence">
                    <view class="report-evidence__head">
                        <text class="report-evidence__label">证据截图</text>
                        <text class="report-evidence__count">{{ images.length }}/3</text>
                    </view>
                    <view class="report-evidence__grid">
                        <view v-for="(img, index) in images" :key="index" class="report-evidence__item">
                            <image class="report-evidence__img" :src="img" mode="aspectFill" @click="preview(index)" />
                            <text class="report-evidence__remove" @click.stop="removeImage(index)">×</text>
                        </view>
                        <view v-if="images.length < 3" class="report-evidence__add" @click="chooseImage">
                            <text class="report-evidence__plus">+</text>
                            <text class="report-evidence__add-text">上传截图</text>
                        </view>
                    </view>
                </view>

                <!-- 处理承诺 -->
                <view class="report-promise">
                    <view v-for="(line, index) in promises" :key="index" class="report-promise__item">
                        <text class="report-promise__dot">•</text>
                        <text class="report-promise__text">{{ line }}</text>
                    </view>
                </view>

                <button class="report-content__btn"
                        :disabled="!selected || submitting"
                        @click="submitReport">
                    提交举报
                </button>

                <text class="report-content__link" @click="goMyReports">查看我的举报进度 ›</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { onLoad } from '@dcloudio/uni-app'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'
    import { useRiskStore, usePrivacyStore, useUserStore, useSquareStore } from '@/store/index'
    import { REPORT_REASONS, AUDIT_SLA } from '@/mock/risk'
    import { findUserById } from '@/mock/users'

    const risk = useRiskStore()
    const privacy = usePrivacyStore()
    const userStore = useUserStore()
    const square = useSquareStore()

    const reasons = REPORT_REASONS
    const selected = ref('')
    const description = ref('')
    const images = ref([])
    const submitting = ref(false)
    const targetId = ref(0)
    const targetName = ref('该用户')

    const isFemale = computed(() => userStore.gender === 'female')
    const femaleSla = '12 小时'
    const normalSla = '24 小时'
    // 女性举报骚扰 / 诈骗 / 色情类才走专属通道
    const isFemaleChannel = computed(() => {
        if (!isFemale.value) return false
        const hit = reasons.find(item => item.value === selected.value)
        return !!hit && hit.priority === 'female'
    })

    const promises = [
        'AI 初审 5 分钟内完成，人工复核普通举报 24 小时、女性骚扰类 12 小时出结果',
        '举报信息全程保密，被举报方不会知道是谁举报的',
        '核实后将按梯度处罚：下架内容 → 禁发 7 天 → 限制匹配 → 永久封禁',
        '对结果有异议可在「我的举报」中发起人工申诉'
    ]

    onLoad((options = {}) => {
        risk.restore()
        privacy.restore()
        const id = Number(options.userId || options.id || 0)
        targetId.value = id
        const user = findUserById(id)
        if (user) {
            targetName.value = user.name
        } else {
            const dyn = square.detailOf(id)
            targetName.value = dyn ? dyn.userName : '该用户'
        }
        if (options.name) targetName.value = decodeURIComponent(options.name)
    })

    const handleBack = () => uni.navigateBack()

    const selectReason = (item) => {
        selected.value = item.value
    }

    const chooseImage = () => {
        uni.chooseImage({
            count: 3 - images.value.length,
            success: (res) => {
                images.value = [...images.value, ...res.tempFilePaths].slice(0, 3)
            }
        })
    }

    const preview = (index) => {
        uni.previewImage({ current: index, urls: images.value })
    }

    const removeImage = (index) => {
        images.value.splice(index, 1)
    }

    const goMyReports = () => uni.navigateTo({ url: '/pages/common/myReports' })

    const submitReport = () => {
        if (!selected.value || submitting.value) return
        if (risk.reports.some(item => item.targetId === targetId.value && item.status !== 'done')) {
            uni.showToast({ title: '该用户已有举报在处理中', icon: 'none' })
            return
        }
        submitting.value = true
        uni.showModal({
            title: '提交举报',
            content: '确认提交举报？恶意举报也会影响你的账号信用',
            confirmColor: '#A8B89A',
            success: (res) => {
                if (!res.confirm) {
                    submitting.value = false
                    return
                }
                const result = risk.submitReport({
                    targetId: targetId.value,
                    targetName: targetName.value,
                    reason: selected.value,
                    desc: description.value,
                    images: images.value
                })
                submitting.value = false
                if (!result.ok) {
                    uni.showToast({ title: '提交失败，请稍后再试', icon: 'none' })
                    return
                }
                uni.showToast({
                    title: result.report.priority === 'female' ? '已进入女性专属通道' : '举报已提交',
                    icon: 'none'
                })
                setTimeout(() => {
                    uni.redirectTo({ url: '/pages/common/myReports' })
                }, 600)
            }
        })
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .report-page {
        min-height: 100vh;
        background-color: $bg-page;
        display: flex;
        flex-direction: column;
    }

    .report-scroll {
        flex: 1;
    }

    .report-content {
        padding: 12px $page-padding-x 32px;
    }

    // ===== 举报对象 =====
    .report-target {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background-color: $bg-card;
        border-radius: $radius-sm;
        box-shadow: $shadow-card;
        margin-bottom: 14px;

        &__label {
            font-size: $font-size-xs;
            color: $text-helper;
        }

        &__name {
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
            color: $text-primary;
            flex: 1;
        }

        &__tag {
            font-size: 10px;
            color: $primary-dark;
            background-color: $primary-light-bg;
            padding: 2px 8px;
            border-radius: 8px;
        }
    }

    .report-content__title {
        font-size: $font-size-lg;
        font-weight: $font-weight-medium;
        color: $text-primary;
        display: block;
    }

    .report-content__desc {
        font-size: $font-size-xs;
        color: $text-helper;
        display: block;
        margin-top: 4px;
        margin-bottom: 4px;
    }

    .report-option {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        padding: 12px $spacing-md;
        background-color: $bg-card;
        border-radius: $radius-sm;
        margin-top: 8px;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all $duration-fast ease;
        box-shadow: $shadow-card;

        &:active {
            transform: scale(0.99);
        }
    }

    .report-option--active {
        border-color: $primary-color;
        background-color: $primary-light-bg;
    }

    .report-option__icon {
        font-size: 22px;
    }

    .report-option__body {
        flex: 1;
        min-width: 0;
    }

    .report-option__title-row {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .report-option__title {
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $text-primary;
    }

    .report-option__badge {
        font-size: 9px;
        color: #C0392B;
        background-color: #FFEBEE;
        padding: 1px 5px;
        border-radius: 6px;
    }

    .report-option__desc {
        font-size: $font-size-xs;
        color: $text-helper;
        display: block;
        margin-top: 2px;
    }

    .report-check {
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

    .report-check__mark {
        font-size: 12px;
        color: #FFFFFF;
    }

    .report-extra {
        margin-top: 14px;
        position: relative;
    }

    .report-extra__input {
        width: 100%;
        height: 110px;
        padding: 10px $spacing-md;
        background-color: $bg-card;
        border-radius: $radius-sm;
        font-size: $font-size-sm;
        color: $text-primary;
        border: 1px solid $border-light;
        transition: border-color $duration-fast ease;

        &:focus {
            border-color: $primary-color;
        }
    }

    .report-extra__count {
        position: absolute;
        bottom: 8px;
        right: 12px;
        font-size: 10px;
        color: $text-helper;
    }

    .report-evidence {
        margin-top: 14px;
        padding: 12px 14px;
        background-color: $bg-card;
        border-radius: $radius-sm;
        box-shadow: $shadow-card;

        &__head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
        }

        &__label {
            font-size: $font-size-xs;
            color: $text-primary;
        }

        &__count {
            font-size: 10px;
            color: $text-helper;
        }

        &__grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        &__item {
            position: relative;
            width: 72px;
            height: 72px;
            border-radius: 8px;
            overflow: hidden;
        }

        &__img {
            width: 100%;
            height: 100%;
        }

        &__remove {
            position: absolute;
            top: 2px;
            right: 2px;
            width: 16px;
            height: 16px;
            line-height: 15px;
            text-align: center;
            font-size: 12px;
            color: #FFFFFF;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
        }

        &__add {
            width: 72px;
            height: 72px;
            border-radius: 8px;
            border: 1px dashed $border-light;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;

            &:active {
                background-color: $bg-page;
            }
        }

        &__plus {
            font-size: 20px;
            color: $text-helper;
        }

        &__add-text {
            font-size: 9px;
            color: $text-helper;
        }
    }

    .report-promise {
        margin-top: 12px;
        padding: 10px 12px;
        background-color: $primary-light-bg;
        border-radius: $radius-sm;

        &__item {
            display: flex;
            align-items: flex-start;
            gap: 6px;
            margin-bottom: 6px;

            &:last-child {
                margin-bottom: 0;
            }
        }

        &__dot {
            font-size: 10px;
            color: $primary-dark;
            line-height: 1.6;
        }

        &__text {
            flex: 1;
            font-size: 10px;
            line-height: 1.6;
            color: $text-secondary;
        }
    }

    .report-content__btn {
        width: 100%;
        height: 46px;
        background-color: $primary-color;
        color: #FFFFFF;
        border-radius: $radius-btn;
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        border: none;
        margin-top: 18px;

        &::after {
            border: none;
        }

        &[disabled] {
            background-color: $disabled-bg;
            color: $text-helper;
        }
    }

    .report-content__link {
        display: block;
        text-align: center;
        margin-top: 14px;
        font-size: $font-size-xs;
        color: $primary-dark;
    }
</style>
