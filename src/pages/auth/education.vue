<template>
    <view class="education-page">
        <CustomNavbar title="学历认证" :show-back="true" @back="handleBack" />

        <!-- 认证说明 -->
        <view class="education-header">
            <view class="education-header__icon">🎓</view>
            <text class="education-header__title">学历认证</text>
            <text class="education-header__desc">上传学信网截图或毕业证书，运营人工核对后点亮专属标识</text>
            <view class="education-header__badge">
                <text class="education-header__badge-icon">🎁</text>
                认证后 +5 次永久心动
            </view>
        </view>

        <!-- 认证步骤 -->
        <view class="education-steps" v-if="currentStep <= 3">
            <view v-for="(step, index) in steps"
                  :key="index"
                  class="education-steps__item"
                  :class="{
                  'education-steps__item--active' : index + 1 <= currentStep,
          'education-steps__item--done': index + 1 < currentStep
        }"
      >
        <view class="education-steps__number">
          <text v-if="index + 1 < currentStep">✓</text>
          <text v-else>{{ index + 1 }}</text>
        </view>
        <text class="education-steps__label">{{ step }}</text>
        <view v-if="index < steps.length - 1" class="education-steps__line"></view>
      </view>
        </view>

        <!-- 步骤1：选择认证方式 -->
        <view v-if="currentStep === 1" class="education-content">
            <text class="education-content__title">选择认证方式</text>

            <view v-for="(item, index) in authMethods"
                  :key="index"
                  class="education-method"
                  :class="{ 'education-method--active': selectedMethod === index }"
                  @click="selectedMethod = index">
                <text class="education-method__icon">{{ item.icon }}</text>
                <view class="education-method__body">
                    <text class="education-method__title">{{ item.title }}</text>
                    <text class="education-method__desc">{{ item.desc }}</text>
                </view>
                <view class="education-method__check">
                    <text v-if="selectedMethod === index">✓</text>
                </view>
            </view>

            <button class="education-content__btn"
                    @click="nextStep"
                    :disabled="selectedMethod === null">
                下一步
            </button>
        </view>

        <!-- 步骤2：上传凭证 -->
        <view v-if="currentStep === 2" class="education-content">
            <text class="education-content__title">上传凭证</text>
            <text class="education-content__desc">
                {{ selectedMethod === 0 ? '请上传学信网在线验证报告截图' : '请上传毕业证书或学位证书照片' }}
            </text>

            <view class="education-upload">
                <view class="education-upload__area"
                      :class="{ 'education-upload__area--filled': credentialImage }"
                      @click="uploadCredential">
                    <image v-if="credentialImage"
                           class="education-upload__image"
                           :src="credentialImage"
                           mode="aspectFill" />
                    <view v-else class="education-upload__placeholder">
                        <text class="education-upload__icon">📷</text>
                        <text class="education-upload__text">点击上传凭证</text>
                        <text class="education-upload__hint">支持 jpg、png 格式</text>
                    </view>
                </view>
            </view>

            <!-- 示例图 -->
            <view class="education-example">
                <text class="education-example__title">📖 示例图</text>
                <view class="education-example__images">
                    <view class="education-example__item">
                        <view class="education-example__placeholder">
                            <text class="education-example__placeholder-text">示例图</text>
                        </view>
                        <text class="education-example__label">{{ selectedMethod === 0 ? '学信网在线验证报告' : '毕业证书示例' }}</text>
                    </view>
                </view>
            </view>

            <!-- 隐私提示 -->
            <view class="education-privacy">
                <text class="education-privacy__icon">🔒</text>
                <text class="education-privacy__text">信息严格加密，仅用于身份核验，绝不对外泄露</text>
            </view>

            <view class="education-content__actions">
                <button class="education-content__btn education-content__btn--secondary" @click="prevStep">
                    上一步
                </button>
                <button class="education-content__btn"
                        @click="submitAuth"
                        :disabled="!credentialImage">
                    提交认证
                </button>
            </view>
        </view>

        <!-- 步骤3：审核中（人工核对，状态可跨会话恢复） -->
        <view v-if="currentStep === 3" class="education-content education-content--center">
            <view class="education-status">
                <text class="education-status__icon">⏳</text>
                <text class="education-status__title">审核中</text>
                <text class="education-status__desc">运营正在人工核对，通常 24 小时内完成</text>
                <text class="education-status__desc">审核通过后将点亮学历标识并发放奖励</text>
            </view>
            <button class="education-content__btn" @click="goToProfile">
                返回个人主页
            </button>
        </view>

        <!-- 步骤4：认证成功 -->
        <view v-if="currentStep === 4" class="education-content education-content--center">
            <view class="education-status education-status--success">
                <text class="education-status__icon">✅</text>
                <text class="education-status__title">认证成功！</text>
                <text class="education-status__desc">您已点亮学历认证标识</text>
                <view class="education-status__reward">
                    🎁 获得 {{ rewardAmount }} 次永久心动
                </view>
            </view>
            <button class="education-content__btn" @click="goToProfile">
                返回个人主页
            </button>
        </view>

        <!-- 步骤5：已认证（再次进入） -->
        <view v-if="currentStep === 5" class="education-content education-content--center">
            <view class="education-status education-status--success">
                <text class="education-status__icon">🎓</text>
                <text class="education-status__title">学历已认证</text>
                <text class="education-status__desc">认证标识已展示在个人主页，双认证可提升匹配权重</text>
            </view>
            <button class="education-content__btn" @click="goToProfile">
                返回个人主页
            </button>
        </view>

        <!-- 步骤6：已驳回（可重新提交 / 申诉） -->
        <view v-if="currentStep === 6" class="education-content">
            <view class="education-reject">
                <text class="education-reject__icon">⚠️</text>
                <text class="education-reject__title">认证未通过</text>
                <text class="education-reject__reason">{{ rejectReason }}</text>
                <text class="education-reject__tip">如有疑问可发起人工申诉，或调整凭证后重新提交</text>
            </view>
            <view class="education-content__actions">
                <button class="education-content__btn education-content__btn--secondary" @click="handleAppeal">
                    人工申诉
                </button>
                <button class="education-content__btn" @click="resubmit">
                    重新提交
                </button>
            </view>
        </view>

        <!-- 权限拦截弹窗（注册 / 实名） -->
        <PermissionModal :visible="modal.visible"
                         :mode="modal.mode"
                         :title="modal.title"
                         :content="modal.content"
                         :confirm-text="modal.confirmText"
                         @confirm="handleModalConfirm"
                         @cancel="handleModalCancel"
                         @close="handleModalCancel" />
    </view>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { onShow } from '@dcloudio/uni-app'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'
    import PermissionModal from '@/components/common/PermissionModal.vue'
    import { useUserStore } from '@/store/index'
    import { CERT_REWARD_LIKES } from '@/store/user'
    import { businessCopy } from '@/mock/copy'

    const userStore = useUserStore()

    const currentStep = ref(1)
    const selectedMethod = ref(null)
    const credentialImage = ref('')
    const steps = ['选择方式', '上传凭证', '审核']
    const rewardAmount = CERT_REWARD_LIKES

    const authMethods = [
        { icon: '📄', title: '学信网截图', desc: '上传学信网在线验证报告截图' },
        { icon: '📜', title: '毕业证书', desc: '上传毕业证书或学位证书照片' }
    ]

    const rejectReason = computed(() => userStore.verifications.education?.reason || '凭证不清晰或信息不一致')

    // ===== 状态恢复（审核中 / 已认证 / 已驳回跨会话保持） =====
    const syncStatus = () => {
        const status = userStore.certificationOf('education')
        if (status === 'success') currentStep.value = 5
        else if (status === 'pending') currentStep.value = 3
        else if (status === 'failed') currentStep.value = 6
        else if (currentStep.value >= 3) currentStep.value = 1
    }

    onShow(() => {
        syncStatus()
        // 权限门禁：未登录 / 未实名直接弹引导
        if (!userStore.isLogin) {
            modal.value = {
                visible: true,
                mode: 'register',
                title: '注册后即可认证',
                content: businessCopy.registerGuide,
                confirmText: '一键授权手机号注册'
            }
            return
        }
        if (!userStore.authStatus.realName) {
            modal.value = {
                visible: true,
                mode: 'realname',
                title: '完成实名认证后再认证学历',
                content: businessCopy.realNameGuide,
                confirmText: '去实名认证'
            }
        }
    })

    // ===== 弹窗 =====
    const modal = ref({ visible: false, mode: 'register', title: '', content: '', confirmText: '' })
    const handleModalConfirm = () => {
        modal.value.visible = false
        if (!userStore.isLogin) {
            uni.navigateTo({ url: '/pages/auth/login' })
            return
        }
        uni.navigateTo({ url: '/pages/auth/realname' })
    }
    const handleModalCancel = () => {
        modal.value.visible = false
        uni.navigateBack()
    }

    const handleBack = () => {
        if (currentStep.value === 1 || currentStep.value === 2) {
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

    const uploadCredential = () => {
        uni.chooseImage({
            count: 1,
            success: (res) => {
                credentialImage.value = res.tempFilePaths[0]
            }
        })
    }

    const nextStep = () => {
        if (selectedMethod.value === null) {
            uni.showToast({ title: '请选择认证方式', icon: 'none' })
            return
        }
        currentStep.value = 2
    }

    const prevStep = () => {
        currentStep.value = 1
    }

    // 提交认证 → 进入人工审核（mock 审核通过后发放奖励）
    const submitAuth = () => {
        if (!credentialImage.value) {
            uni.showToast({ title: '请上传凭证', icon: 'none' })
            return
        }
        const method = authMethods[selectedMethod.value]?.title || '学信网截图'
        const result = userStore.submitCertification('education', {
            method,
            credential: credentialImage.value
        })
        if (!result.ok) {
            const map = {
                login: '请先登录',
                realname: '请先完成实名认证',
                credential: '请上传凭证'
            }
            uni.showToast({ title: map[result.reason] || '提交失败，请稍后再试', icon: 'none' })
            return
        }
        uni.showLoading({ title: '提交中...' })
        setTimeout(() => {
            uni.hideLoading()
            currentStep.value = 3
            // mock：运营人工核对通过
            setTimeout(() => {
                const approved = userStore.approveCertification('education')
                currentStep.value = 4
                uni.showToast({
                    title: approved.rewarded ? `认证通过，+${approved.rewarded} 次永久心动` : '认证通过！',
                    icon: 'none'
                })
            }, 2000)
        }, 800)
    }

    // 驳回后：申诉回到审核中 / 重新提交
    const handleAppeal = () => {
        const result = userStore.appealCertification('education')
        if (result.ok) {
            currentStep.value = 3
            setTimeout(() => {
                userStore.approveCertification('education')
                currentStep.value = 4
            }, 2000)
        }
    }

    const resubmit = () => {
        currentStep.value = 1
        credentialImage.value = ''
        selectedMethod.value = null
    }

    const goToProfile = () => {
        uni.switchTab({ url: '/pages/profile/index' })
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .education-page {
        min-height: 100vh;
        background-color: $bg-page;
        padding-bottom: $spacing-lg;
    }

    .education-header {
        background: linear-gradient(135deg, $primary-color, $primary-dark);
        margin: $spacing-sm $page-padding-x;
        border-radius: $radius-card;
        padding: $spacing-xl $spacing-lg;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .education-header__icon {
        font-size: 40px;
    }

    .education-header__title {
        font-size: $font-size-lg;
        font-weight: $font-weight-medium;
        color: #FFFFFF;
        margin-top: $spacing-xs;
    }

    .education-header__desc {
        font-size: $font-size-sm;
        color: rgba(255, 255, 255, 0.9);
        text-align: center;
        margin-top: $spacing-xs;
    }

    .education-header__badge {
        margin-top: $spacing-md;
        padding: $spacing-xs $spacing-lg;
        font-size: $font-size-xs;
        color: $primary-color;
        background-color: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        display: flex;
        align-items: center;
        gap: $spacing-xs;
    }

    .education-steps {
        display: flex;
        justify-content: space-between;
        padding: $spacing-md $page-padding-x;
        background-color: $bg-card;
        margin: 0 $page-padding-x $spacing-md;
        border-radius: $radius-card;
        position: relative;
    }

    .education-steps__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        position: relative;
    }

    .education-steps__number {
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
    }

    .education-steps__item--active .education-steps__number {
        color: #FFFFFF;
        background-color: $primary-color;
    }

    .education-steps__item--done .education-steps__number {
        color: #FFFFFF;
        background-color: $primary-dark;
    }

    .education-steps__label {
        font-size: $font-size-xs;
        color: $text-helper;
        margin-top: $spacing-xs;
    }

    .education-steps__item--active .education-steps__label {
        color: $primary-color;
    }

    .education-steps__line {
        position: absolute;
        top: 14px;
        left: 60%;
        width: 80%;
        height: 2px;
        background-color: $border-light;
    }

    .education-steps__item--active .education-steps__line,
    .education-steps__item--done .education-steps__line {
        background-color: $primary-color;
    }

    .education-steps__item:last-child .education-steps__line {
        display: none;
    }

    .education-content {
        padding: 0 $page-padding-x;
    }

    .education-content--center {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 40px;
    }

    .education-content__title {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $text-primary;
        display: block;
    }

    .education-content__desc {
        font-size: $font-size-sm;
        color: $text-secondary;
        display: block;
        margin-top: $spacing-xs;
    }

    .education-method {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        padding: $spacing-md $spacing-md;
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

    .education-method--active {
        border-color: $primary-color;
        background-color: $primary-light-bg;
    }

    .education-method__icon {
        font-size: 24px;
    }

    .education-method__body {
        flex: 1;
    }

    .education-method__title {
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $text-primary;
        display: block;
    }

    .education-method__desc {
        font-size: $font-size-xs;
        color: $text-helper;
        display: block;
    }

    .education-method__check {
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

    .education-upload {
        margin-top: $spacing-md;
    }

    .education-upload__area {
        width: 100%;
        height: 200px;
        border: 2px dashed $border-light;
        border-radius: $radius-sm;
        overflow: hidden;
        cursor: pointer;
        transition: border-color $duration-fast ease;

        &:active {
            opacity: 0.8;
        }
    }

    .education-upload__area--filled {
        border-color: $primary-color;
    }

    .education-upload__image {
        width: 100%;
        height: 100%;
    }

    .education-upload__placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .education-upload__icon {
        font-size: 40px;
    }

    .education-upload__text {
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-top: $spacing-sm;
    }

    .education-upload__hint {
        font-size: $font-size-xs;
        color: $text-helper;
        margin-top: $spacing-xs;
    }

    .education-example {
        margin-top: $spacing-md;
    }

    .education-example__title {
        font-size: $font-size-sm;
        color: $text-secondary;
        display: block;
        margin-bottom: $spacing-sm;
    }

    .education-example__images {
        display: flex;
        gap: $spacing-sm;
    }

    .education-example__item {
        flex: 1;
    }

    .education-example__placeholder {
        width: 100%;
        height: 100px;
        background-color: $bg-page;
        border-radius: $radius-sm;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid $border-light;
    }

    .education-example__placeholder-text {
        font-size: $font-size-xs;
        color: $text-helper;
    }

    .education-example__label {
        font-size: $font-size-xs;
        color: $text-helper;
        text-align: center;
        display: block;
        margin-top: $spacing-xs;
    }

    .education-privacy {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        margin-top: $spacing-md;
        padding: $spacing-sm $spacing-md;
        background-color: $primary-light-bg;
        border-radius: $radius-sm;
    }

    .education-privacy__icon {
        font-size: 16px;
    }

    .education-privacy__text {
        font-size: $font-size-xs;
        color: $text-secondary;
    }

    .education-content__actions {
        display: flex;
        gap: $spacing-sm;
        margin-top: $spacing-lg;
        width: 100%;
    }

    .education-content__btn {
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

    .education-status {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: $spacing-lg;
    }

    .education-status__icon {
        font-size: 56px;
    }

    .education-status__title {
        font-size: $font-size-xl;
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-top: $spacing-md;
    }

    .education-status__desc {
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-top: $spacing-xs;
        text-align: center;
    }

    .education-status__reward {
        margin-top: $spacing-md;
        padding: $spacing-sm $spacing-lg;
        font-size: $font-size-sm;
        color: $primary-color;
        background-color: $primary-light-bg;
        border-radius: 20px;
        animation: rewardPulse 2s ease-in-out infinite;
    }

    @keyframes rewardPulse {
        0%, 100% {
            transform: scale(1);
        }

        50% {
            transform: scale(1.05);
        }
    }

    // 驳回态
    .education-reject {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: $spacing-lg;
        padding: $spacing-lg;
        background-color: $bg-card;
        border-radius: $radius-card;
        box-shadow: $shadow-card;
        width: 100%;
    }

    .education-reject__icon {
        font-size: 40px;
    }

    .education-reject__title {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-top: $spacing-sm;
    }

    .education-reject__reason {
        margin-top: $spacing-xs;
        font-size: $font-size-sm;
        color: $color-danger;
        line-height: 1.6;
        text-align: center;
    }

    .education-reject__tip {
        margin-top: $spacing-xs;
        font-size: $font-size-xs;
        color: $text-helper;
        line-height: 1.6;
        text-align: center;
    }
</style>
