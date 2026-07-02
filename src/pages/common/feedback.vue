<template>
    <view class="feedback-page">
        <CustomNavbar title="意见反馈" :show-back="true" @back="handleBack">
            <template #right>
                <text class="feedback-navbar__submit" @click="handleSubmit">提交</text>
            </template>
        </CustomNavbar>

        <view class="feedback-content">
            <!-- 反馈类型 -->
            <view class="feedback-section">
                <text class="feedback-section__title">反馈类型</text>
                <view class="feedback-types">
                    <view v-for="(item, index) in feedbackTypes"
                          :key="index"
                          class="feedback-types__item"
                          :class="{ 'feedback-types__item--active': selectedType === index }"
                          @click="selectedType = index">
                        <text class="feedback-types__icon">{{ item.icon }}</text>
                        <text class="feedback-types__label">{{ item.label }}</text>
                    </view>
                </view>
            </view>

            <!-- 反馈内容 -->
            <view class="feedback-section">
                <text class="feedback-section__title">详细描述</text>
                <view class="feedback-textarea-wrapper">
                    <textarea class="feedback-textarea"
                              placeholder="请详细描述您的问题或建议，我们会认真对待每一条反馈"
                              v-model="content"
                              maxlength="500" />
                    <text class="feedback-textarea__count">{{ content.length }}/500</text>
                </view>
            </view>

            <!-- 截图上传 -->
            <view class="feedback-section">
                <text class="feedback-section__title">截图（选填）</text>
                <text class="feedback-section__desc">上传相关截图有助于我们更快解决问题</text>
                <view class="feedback-images">
                    <view v-for="(img, index) in images"
                          :key="index"
                          class="feedback-images__item">
                        <image class="feedback-images__img" :src="img" mode="aspectFill" />
                        <view class="feedback-images__delete" @click="removeImage(index)">✕</view>
                    </view>
                    <view v-if="images.length < 6"
                          class="feedback-images__add"
                          @click="chooseImage">
                        <text class="feedback-images__add-icon">+</text>
                        <text class="feedback-images__add-text">添加截图</text>
                    </view>
                </view>
            </view>

            <!-- 联系方式 -->
            <view class="feedback-section">
                <text class="feedback-section__title">联系方式（选填）</text>
                <text class="feedback-section__desc">方便我们联系您了解详细情况</text>
                <input class="feedback-input"
                       type="text"
                       placeholder="请输入手机号或微信号"
                       v-model="contact" />
            </view>
        </view>

        <view class="feedback-footer">
            <text class="feedback-footer__text">感谢您的反馈，我们会认真对待每一条建议 ❤️</text>
        </view>
    </view>
</template>

<script setup>
    import { ref } from 'vue'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'

    const selectedType = ref(0)
    const content = ref('')
    const images = ref([])
    const contact = ref('')

    const feedbackTypes = [
        { icon: '🐛', label: 'Bug反馈' },
        { icon: '💡', label: '功能建议' },
        { icon: '😊', label: '用户体验' },
        { icon: '🔒', label: '隐私安全' },
        { icon: '📢', label: '举报投诉' },
        { icon: '❓', label: '其他问题' }
    ]

    const handleBack = () => {
        if (content.value || images.value.length > 0) {
            uni.showModal({
                title: '提示',
                content: '确定要退出吗？反馈内容将不会被保存',
                success: (res) => {
                    if (res.confirm) uni.navigateBack()
                }
            })
        } else {
            uni.navigateBack()
        }
    }

    const chooseImage = () => {
        const remain = 6 - images.value.length
        uni.chooseImage({
            count: remain,
            success: (res) => {
                images.value.push(...res.tempFilePaths)
            }
        })
    }

    const removeImage = (index) => {
        images.value.splice(index, 1)
    }

    const handleSubmit = () => {
        if (!content.value.trim()) {
            uni.showToast({ title: '请填写详细描述', icon: 'none' })
            return
        }
        if (content.value.length < 10) {
            uni.showToast({ title: '描述至少10个字', icon: 'none' })
            return
        }

        uni.showLoading({ title: '提交中...' })
        setTimeout(() => {
            uni.hideLoading()
            uni.showToast({ title: '反馈已提交！感谢您', icon: 'success' })
            setTimeout(() => uni.navigateBack(), 500)
        }, 1000)
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .feedback-page {
        min-height: 100vh;
        background-color: $bg-page;
        padding-bottom: $spacing-lg;
    }

    .feedback-navbar__submit {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $primary-color;
        cursor: pointer;

        &:active {
            opacity: 0.6;
        }
    }

    .feedback-content {
        padding: $spacing-sm $page-padding-x;
    }

    .feedback-section {
        background-color: $bg-card;
        border-radius: $radius-card;
        padding: $spacing-md;
        margin-bottom: $spacing-sm;
        box-shadow: $shadow-card;
    }

    .feedback-section__title {
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $text-primary;
        display: block;
        margin-bottom: $spacing-xs;
    }

    .feedback-section__desc {
        font-size: $font-size-xs;
        color: $text-helper;
        display: block;
        margin-bottom: $spacing-sm;
    }

    .feedback-types {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: $spacing-xs;
    }

    .feedback-types__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: $spacing-sm $spacing-xs;
        background-color: $bg-page;
        border-radius: $radius-sm;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all $duration-fast ease;

        &:active {
            transform: scale(0.95);
        }
    }

    .feedback-types__item--active {
        border-color: $primary-color;
        background-color: $primary-light-bg;
    }

    .feedback-types__icon {
        font-size: 24px;
    }

    .feedback-types__label {
        font-size: $font-size-xs;
        color: $text-secondary;
        margin-top: $spacing-xs;
    }

    .feedback-textarea-wrapper {
        position: relative;
    }

    .feedback-textarea {
        width: 100%;
        min-height: 120px;
        padding: $spacing-sm $spacing-md;
        background-color: $bg-page;
        border-radius: $radius-sm;
        font-size: $font-size-sm;
        color: $text-primary;
        line-height: 1.8;
        resize: none;
        border: 1px solid $border-light;
        transition: border-color $duration-fast ease;

        &:focus {
            border-color: $primary-color;
        }
    }

    .feedback-textarea__count {
        position: absolute;
        bottom: $spacing-sm;
        right: $spacing-md;
        font-size: $font-size-xs;
        color: $text-helper;
    }

    .feedback-images {
        display: flex;
        flex-wrap: wrap;
        gap: $spacing-xs;
    }

    .feedback-images__item {
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: $radius-xs;
        overflow: hidden;
    }

    .feedback-images__img {
        width: 100%;
        height: 100%;
    }

    .feedback-images__delete {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 20px;
        height: 20px;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        cursor: pointer;
    }

    .feedback-images__add {
        width: 80px;
        height: 80px;
        border: 2px dashed $border-light;
        border-radius: $radius-xs;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: border-color $duration-fast ease;

        &:active {
            opacity: 0.7;
        }
    }

    .feedback-images__add-icon {
        font-size: 28px;
        color: $text-helper;
    }

    .feedback-images__add-text {
        font-size: $font-size-xs;
        color: $text-helper;
        margin-top: 2px;
    }

    .feedback-input {
        width: 100%;
        height: 40px;
        padding: 0 $spacing-sm;
        background-color: $bg-page;
        border-radius: $radius-sm;
        font-size: $font-size-sm;
        color: $text-primary;
        border: 1px solid $border-light;
        transition: border-color $duration-fast ease;

        &:focus {
            border-color: $primary-color;
        }
    }

    .feedback-footer {
        text-align: center;
        padding: $spacing-md 0;
    }

    .feedback-footer__text {
        font-size: $font-size-xs;
        color: $text-helper;
    }
</style>