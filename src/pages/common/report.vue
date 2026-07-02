<template>
    <view class="report-page">
        <CustomNavbar title="举报" :show-back="true" @back="handleBack" />

        <view class="report-content">
            <text class="report-content__title">请选择举报原因</text>
            <text class="report-content__desc">我们会优先处理您的举报</text>

            <view v-for="(item, index) in reportReasons"
                  :key="index"
                  class="report-option"
                  :class="{ 'report-option--active': selected === index }"
                  @click="selected = index">
                <text class="report-option__icon">{{ item.icon }}</text>
                <view class="report-option__body">
                    <text class="report-option__title">{{ item.title }}</text>
                    <text class="report-option__desc">{{ item.desc }}</text>
                </view>
                <view class="report-option__check">
                    <text v-if="selected === index">✓</text>
                </view>
            </view>

            <view class="report-extra">
                <textarea class="report-extra__input"
                          placeholder="请补充详细说明（选填）"
                          v-model="description"
                          maxlength="200" />
                <text class="report-extra__count">{{ description.length }}/200</text>
            </view>

            <button class="report-content__btn"
                    @click="submitReport"
                    :disabled="selected === null">
                提交举报
            </button>
        </view>
    </view>
</template>

<script setup>
    import { ref } from 'vue'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'

    const selected = ref(null)
    const description = ref('')

    const reportReasons = [
        { icon: '🎭', title: '虚假身份', desc: '伪造身份信息、学历、工作等' },
        { icon: '💬', title: '恶意骚扰', desc: '言语骚扰、人身攻击等' },
        { icon: '💰', title: '诱导转账', desc: '以各种理由要求转账、投资' },
        { icon: '🔞', title: '色情低俗', desc: '发布色情、低俗内容' },
        { icon: '📢', title: '广告导流', desc: '批量发布广告、导流信息' }
    ]

    const handleBack = () => {
        uni.navigateBack()
    }

    const submitReport = () => {
        if (selected.value === null) {
            uni.showToast({ title: '请选择举报原因', icon: 'none' })
            return
        }

        uni.showModal({
            title: '提交举报',
            content: '确认提交举报？平台会尽快处理',
            success: (res) => {
                if (res.confirm) {
                    uni.showToast({ title: '举报已提交', icon: 'success' })
                    setTimeout(() => uni.navigateBack(), 500)
                }
            }
        })
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .report-page {
        min-height: 100vh;
        background-color: $bg-page;
    }

    .report-content {
        padding: $spacing-lg $page-padding-x;
    }

    .report-content__title {
        font-size: $font-size-lg;
        font-weight: $font-weight-medium;
        color: $text-primary;
        display: block;
    }

    .report-content__desc {
        font-size: $font-size-sm;
        color: $text-secondary;
        display: block;
        margin-top: $spacing-xs;
    }

    .report-option {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        padding: $spacing-md;
        background-color: $bg-card;
        border-radius: $radius-sm;
        margin-top: $spacing-sm;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all $duration-fast ease;
        box-shadow: $shadow-card;

        &:active {
            transform: scale(0.98);
        }
    }

    .report-option--active {
        border-color: $primary-color;
        background-color: $primary-light-bg;
    }

    .report-option__icon {
        font-size: 24px;
    }

    .report-option__body {
        flex: 1;
    }

    .report-option__title {
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $text-primary;
        display: block;
    }

    .report-option__desc {
        font-size: $font-size-xs;
        color: $text-helper;
        display: block;
    }

    .report-option__check {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: $primary-color;
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
    }

    .report-extra {
        margin-top: $spacing-md;
        position: relative;
    }

    .report-extra__input {
        width: 100%;
        height: 120px;
        padding: $spacing-sm $spacing-md;
        background-color: $bg-card;
        border-radius: $radius-sm;
        font-size: $font-size-sm;
        color: $text-primary;
        border: 1px solid $border-light;
        resize: none;
        transition: border-color $duration-fast ease;

        &:focus {
            border-color: $primary-color;
        }
    }

    .report-extra__count {
        position: absolute;
        bottom: $spacing-sm;
        right: $spacing-md;
        font-size: $font-size-xs;
        color: $text-helper;
    }

    .report-content__btn {
        width: 100%;
        height: 48px;
        background-color: $primary-color;
        color: #FFFFFF;
        border-radius: $radius-btn;
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        border: none;
        margin-top: $spacing-lg;

        &:disabled {
            background-color: $disabled-bg;
            color: $text-helper;
        }

        &:active:not(:disabled) {
            transform: scale(0.98);
        }
    }
</style>