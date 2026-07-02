<template>
    <view class="realname-page">
        <!-- 导航栏 -->
        <CustomNavbar title="实名认证" :show-back="true" @back="handleBack" />

        <!-- 步骤指示器 -->
        <view class="realname-steps">
            <view v-for="(step, index) in steps"
                  :key="index"
                  class="realname-steps__item"
                  :class="{
                  'realname-steps__item--active' : index + 1 <= currentStep,
          'realname-steps__item--done': index + 1 < currentStep
        }"
      >
        <view class="realname-steps__number">
          <text v-if="index + 1 < currentStep">✓</text>
          <text v-else>{{ index + 1 }}</text>
        </view>
        <text class="realname-steps__label">{{ step }}</text>
        <view v-if="index < steps.length - 1" class="realname-steps__line"></view>
      </view>
        </view>

        <!-- 步骤1：上传身份证 -->
        <view v-if="currentStep === 1" class="realname-content">
            <text class="realname-content__title">上传身份证照片</text>
            <text class="realname-content__desc">请拍摄或上传清晰的身份证正反面</text>

            <view class="realname-upload">
                <view class="realname-upload__item" @click="uploadFront">
                    <image v-if="frontImage"
                           class="realname-upload__image"
                           :src="frontImage"
                           mode="aspectFill" />
                    <view v-else class="realname-upload__placeholder">
                        <text class="realname-upload__icon">📷</text>
                        <text class="realname-upload__text">身份证正面</text>
                        <view class="realname-upload__guide"></view>
                    </view>
                </view>

                <view class="realname-upload__item" @click="uploadBack">
                    <image v-if="backImage"
                           class="realname-upload__image"
                           :src="backImage"
                           mode="aspectFill" />
                    <view v-else class="realname-upload__placeholder">
                        <text class="realname-upload__icon">📷</text>
                        <text class="realname-upload__text">身份证反面</text>
                        <view class="realname-upload__guide"></view>
                    </view>
                </view>
            </view>

            <button class="realname-content__btn"
                    @click="nextStep"
                    :disabled="!frontImage || !backImage">
                下一步
            </button>
        </view>

        <!-- 步骤1.5：信息确认 -->
        <view v-if="currentStep === 1.5" class="realname-content">
            <text class="realname-content__title">确认信息</text>
            <text class="realname-content__desc">请确认以下信息是否正确</text>

            <view class="realname-confirm">
                <view class="realname-confirm__item">
                    <text class="realname-confirm__label">姓名</text>
                    <text class="realname-confirm__value">{{ confirmInfo.name }}</text>
                </view>
                <view class="realname-confirm__item">
                    <text class="realname-confirm__label">性别</text>
                    <text class="realname-confirm__value">{{ confirmInfo.gender }}</text>
                </view>
                <view class="realname-confirm__item">
                    <text class="realname-confirm__label">身份证号</text>
                    <text class="realname-confirm__value">{{ confirmInfo.idNumber }}</text>
                </view>
            </view>

            <view class="realname-privacy">
                <text class="realname-privacy__icon">🔒</text>
                <text class="realname-privacy__text">信息严格加密，仅用于身份核验，绝不对外泄露</text>
            </view>

            <view class="realname-content__actions">
                <button class="realname-content__btn realname-content__btn--secondary" @click="currentStep = 1">
                    上一步
                </button>
                <button class="realname-content__btn" @click="startFaceAuth">
                    确认无误
                </button>
            </view>
        </view>

        <!-- 步骤2：人脸识别 -->
        <view v-if="currentStep === 2" class="realname-content">
            <text class="realname-content__title">人脸识别</text>
            <text class="realname-content__desc">请进行活体检测，确保本人操作</text>

            <view class="realname-face">
                <view class="realname-face__box">
                    <view class="realname-face__icon-wrapper">
                        <text class="realname-face__icon">👤</text>
                    </view>
                    <text class="realname-face__text">请将面部放入框内</text>
                    <view class="realname-face__frame"></view>
                    <view class="realname-face__scanning"></view>
                </view>
            </view>

            <button class="realname-content__btn" @click="startFaceAuth">
                开始识别
            </button>
        </view>

        <!-- 步骤3：完成 -->
        <view v-if="currentStep === 3" class="realname-content realname-content--success">
            <text class="realname-content__success-icon">✅</text>
            <text class="realname-content__success-title">认证成功！</text>
            <text class="realname-content__success-desc">您已完成实名认证，</text>
            <text class="realname-content__success-desc">现在可以开始匹配了</text>

            <button class="realname-content__btn" @click="goToMatch">
                开始匹配
            </button>
        </view>

        <!-- 认证失败 -->
        <view v-if="currentStep === -1" class="realname-content realname-content--fail">
            <text class="realname-content__fail-icon">😅</text>
            <text class="realname-content__fail-title">认证失败</text>
            <text class="realname-content__fail-desc">{{ failReason }}</text>
            <view class="realname-content__fail-actions">
                <button class="realname-content__btn realname-content__btn--secondary" @click="currentStep = 1">
                    重新上传
                </button>
                <button class="realname-content__btn" @click="handleAppeal">
                    人工申诉
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
    import { ref } from 'vue'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'

    const currentStep = ref(1)
    const steps = ['上传身份证', '人脸识别', '完成']
    const frontImage = ref('')
    const backImage = ref('')
    const failReason = ref('')

    const confirmInfo = ref({
        name: '张小明',
        gender: '男',
        idNumber: '110101199001011234'
    })

    const handleBack = () => {
        if (currentStep.value > 1 && currentStep.value < 3) {
            uni.showModal({
                title: '提示',
                content: '确定要退出吗？认证进度将丢失',
                success: (res) => {
                    if (res.confirm) uni.navigateBack()
                }
            })
        } else {
            uni.navigateBack()
        }
    }

    const uploadFront = () => {
        uni.chooseImage({
            count: 1,
            success: (res) => {
                frontImage.value = res.tempFilePaths[0]
                // 模拟OCR识别
                setTimeout(() => {
                    currentStep.value = 1.5
                }, 500)
            }
        })
    }

    const uploadBack = () => {
        uni.chooseImage({
            count: 1,
            success: (res) => {
                backImage.value = res.tempFilePaths[0]
            }
        })
    }

    const nextStep = () => {
        if (!frontImage.value || !backImage.value) {
            uni.showToast({ title: '请上传身份证正反面', icon: 'none' })
            return
        }
        currentStep.value = 1.5
    }

    const startFaceAuth = () => {
        uni.showLoading({ title: '识别中...' })
        setTimeout(() => {
            uni.hideLoading()
            // 模拟识别结果
            if (Math.random() > 0.2) {
                currentStep.value = 3
                uni.showToast({ title: '认证通过！', icon: 'success' })
            } else {
                currentStep.value = -1
                failReason.value = '人脸与身份证照片不匹配，请确认是本人操作'
            }
        }, 1500)
    }

    const handleAppeal = () => {
        uni.showToast({ title: '申诉通道已开启', icon: 'success' })
    }

    const goToMatch = () => {
        uni.switchTab({ url: '/pages/match/index' })
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .realname-page {
        min-height: 100vh;
        background-color: $bg-page;
    }

    .realname-steps {
        display: flex;
        justify-content: space-between;
        padding: $spacing-lg $page-padding-x $spacing-md;
        background-color: $bg-card;
        margin: 0 0 $spacing-md;
    }

    .realname-steps__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        position: relative;
    }

    .realname-steps__line {
        position: absolute;
        top: 14px;
        left: 60%;
        width: 80%;
        height: 2px;
        background-color: $border-light;
        transition: background-color $duration-fast ease;
    }

    .realname-steps__item--active .realname-steps__line,
    .realname-steps__item--done .realname-steps__line {
        background-color: $primary-color;
    }

    .realname-steps__item:last-child .realname-steps__line {
        display: none;
    }

    .realname-steps__number {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $text-helper;
        background-color: $bg-page;
        z-index: 1;
        transition: all $duration-fast ease;
    }

    .realname-steps__item--active .realname-steps__number {
        color: #FFFFFF;
        background-color: $primary-color;
    }

    .realname-steps__item--done .realname-steps__number {
        color: #FFFFFF;
        background-color: $primary-dark;
    }

    .realname-steps__label {
        font-size: $font-size-xs;
        color: $text-helper;
        margin-top: $spacing-xs;
    }

    .realname-steps__item--active .realname-steps__label {
        color: $primary-color;
    }

    .realname-content {
        padding: 0 $page-padding-x;
    }

    .realname-content--success {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 60px;
    }

    .realname-content--fail {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 40px;
    }

    .realname-content__title {
        font-size: $font-size-lg;
        font-weight: $font-weight-medium;
        color: $text-primary;
        display: block;
    }

    .realname-content__desc {
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-top: $spacing-xs;
        display: block;
    }

    .realname-upload {
        display: flex;
        gap: $spacing-md;
        margin-top: $spacing-lg;
    }

    .realname-upload__item {
        flex: 1;
        height: 180px;
        border-radius: $radius-sm;
        border: 2px dashed $border-light;
        overflow: hidden;
        cursor: pointer;
        transition: border-color $duration-fast ease;
        position: relative;

        &:active {
            opacity: 0.8;
        }
    }

    .realname-upload__item:has(.realname-upload__image) {
        border-color: $primary-color;
    }

    .realname-upload__image {
        width: 100%;
        height: 100%;
    }

    .realname-upload__placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .realname-upload__icon {
        font-size: 32px;
    }

    .realname-upload__text {
        font-size: $font-size-sm;
        color: $text-helper;
        margin-top: $spacing-sm;
    }

    .realname-upload__guide {
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
        border: 1px dashed rgba($primary-color, 0.3);
        border-radius: $radius-xs;
    }

    .realname-confirm {
        background-color: $bg-page;
        border-radius: $radius-sm;
        padding: $spacing-md;
        margin-top: $spacing-md;
    }

    .realname-confirm__item {
        display: flex;
        justify-content: space-between;
        padding: $spacing-sm 0;
        border-bottom: 1px solid $border-light;

        &:last-child {
            border-bottom: none;
        }
    }

    .realname-confirm__label {
        font-size: $font-size-sm;
        color: $text-helper;
    }

    .realname-confirm__value {
        font-size: $font-size-sm;
        color: $text-primary;
    }

    .realname-privacy {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        margin-top: $spacing-md;
        padding: $spacing-sm $spacing-md;
        background-color: $primary-light-bg;
        border-radius: $radius-sm;
    }

    .realname-privacy__icon {
        font-size: 16px;
    }

    .realname-privacy__text {
        font-size: $font-size-xs;
        color: $text-secondary;
    }

    .realname-content__actions {
        display: flex;
        gap: $spacing-sm;
        margin-top: $spacing-lg;
    }

    .realname-content__btn {
        flex: 1;
        height: 44px;
        background-color: $primary-color;
        color: #FFFFFF;
        border-radius: $radius-btn;
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        border: none;

        &:disabled {
            background-color: $disabled-bg;
            color: $text-helper;
        }

        &:active:not(:disabled) {
            opacity: 0.8;
        }

        &--secondary {
            background-color: $bg-card;
            color: $text-secondary;
            border: 1px solid $border-light;

            &:active {
                background-color: $bg-page;
            }
        }
    }

    .realname-face {
        margin-top: $spacing-lg;
        display: flex;
        justify-content: center;
    }

    .realname-face__box {
        position: relative;
        width: 280px;
        height: 280px;
        border-radius: $radius-card;
        background-color: #1a1a2e;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    .realname-face__icon-wrapper {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .realname-face__icon {
        font-size: 40px;
        color: rgba(255, 255, 255, 0.6);
    }

    .realname-face__text {
        font-size: $font-size-sm;
        color: rgba(255, 255, 255, 0.6);
        margin-top: $spacing-md;
        z-index: 1;
    }

    .realname-face__frame {
        position: absolute;
        top: 20px;
        left: 20px;
        right: 20px;
        bottom: 20px;
        border: 2px solid rgba($primary-color, 0.6);
        border-radius: $radius-sm;
    }

    .realname-face__scanning {
        position: absolute;
        top: 20px;
        left: 20px;
        right: 20px;
        height: 2px;
        background: linear-gradient(90deg, transparent, $primary-color, transparent);
        animation: scan 2s ease-in-out infinite;
    }

    @keyframes scan {
        0% {
            top: 20px;
        }

        50% {
            top: calc(100% - 22px);
        }

        100% {
            top: 20px;
        }
    }

    .realname-content__success-icon {
        font-size: 64px;
    }

    .realname-content__success-title {
        font-size: $font-size-xl;
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-top: $spacing-md;
    }

    .realname-content__success-desc {
        font-size: $font-size-sm;
        color: $text-secondary;
    }

    .realname-content__fail-icon {
        font-size: 56px;
    }

    .realname-content__fail-title {
        font-size: $font-size-xl;
        font-weight: $font-weight-medium;
        color: $color-warning;
        margin-top: $spacing-md;
    }

    .realname-content__fail-desc {
        font-size: $font-size-sm;
        color: $text-secondary;
        text-align: center;
        margin-top: $spacing-sm;
    }

    .realname-content__fail-actions {
        display: flex;
        gap: $spacing-sm;
        width: 100%;
        margin-top: $spacing-lg;
    }
</style>