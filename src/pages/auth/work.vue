<template>
    <view class="work-page">
        <CustomNavbar title="工作认证" :show-back="true" @back="handleBack" />

        <!-- 认证说明 -->
        <view class="work-header">
            <view class="work-header__icon">💼</view>
            <text class="work-header__title">工作认证</text>
            <text class="work-header__desc">上传工牌、在职证明或企业邮箱截图，运营人工核对后点亮专属标识</text>
            <view class="work-header__badge">
                <text class="work-header__badge-icon">🎁</text>
                认证后 +5 次永久心动
            </view>
        </view>

        <!-- 认证步骤 -->
        <view class="work-steps" v-if="currentStep <= 3">
            <view v-for="(step, index) in steps"
                  :key="index"
                  class="work-steps__item"
                  :class="{
                  'work-steps__item--active' : index + 1 <= currentStep,
          'work-steps__item--done': index + 1 < currentStep
        }"
      >
        <view class="work-steps__number">
          <text v-if="index + 1 < currentStep">✓</text>
          <text v-else>{{ index + 1 }}</text>
        </view>
        <text class="work-steps__label">{{ step }}</text>
        <view v-if="index < steps.length - 1" class="work-steps__line"></view>
      </view>
        </view>

        <!-- 步骤1：选择认证方式 -->
        <view v-if="currentStep === 1" class="work-content">
            <text class="work-content__title">选择认证方式</text>

            <view v-for="(item, index) in authMethods"
                  :key="index"
                  class="work-method"
                  :class="{ 'work-method--active': selectedMethod === index }"
                  @click="selectedMethod = index">
                <text class="work-method__icon">{{ item.icon }}</text>
                <view class="work-method__body">
                    <text class="work-method__title">{{ item.title }}</text>
                    <text class="work-method__desc">{{ item.desc }}</text>
                </view>
                <view class="work-method__check">
                    <text v-if="selectedMethod === index">✓</text>
                </view>
            </view>

            <button class="work-content__btn"
                    @click="nextStep"
                    :disabled="selectedMethod === null">
                下一步
            </button>
        </view>

        <!-- 步骤2：上传凭证 + 填写信息 -->
        <view v-if="currentStep === 2" class="work-content">
            <text class="work-content__title">上传凭证</text>
            <text class="work-content__desc">
                {{
 selectedMethod === 0 ? '请上传工牌或工作证照片' :
           selectedMethod === 1 ? '请上传在职证明或收入证明' :
           '请上传企业邮箱登录页面或邮件截图'
                }}
            </text>

            <view class="work-upload">
                <view class="work-upload__area"
                      :class="{ 'work-upload__area--filled': credentialImage }"
                      @click="uploadCredential">
                    <image v-if="credentialImage"
                           class="work-upload__image"
                           :src="credentialImage"
                           mode="aspectFill" />
                    <view v-else class="work-upload__placeholder">
                        <text class="work-upload__icon">📷</text>
                        <text class="work-upload__text">点击上传凭证</text>
                        <text class="work-upload__hint">支持 jpg、png 格式</text>
                    </view>
                </view>
            </view>

            <!-- 企业信息 -->
            <view class="work-form">
                <view class="work-form__item">
                    <text class="work-form__label">企业名称</text>
                    <input class="work-form__input"
                           type="text"
                           placeholder="选填，填写后可提高可信度"
                           v-model="companyName" />
                </view>
                <view class="work-form__item">
                    <text class="work-form__label">职位</text>
                    <input class="work-form__input"
                           type="text"
                           placeholder="选填，如：产品经理"
                           v-model="position" />
                </view>
            </view>

            <!-- 隐私说明 -->
            <view class="work-privacy">
                <text class="work-privacy__icon">🔒</text>
                <text class="work-privacy__text">企业信息仅用于认证审核，不会对外公开</text>
            </view>

            <view class="work-content__actions">
                <button class="work-content__btn work-content__btn--secondary" @click="prevStep">
                    上一步
                </button>
                <button class="work-content__btn"
                        @click="submitAuth"
                        :disabled="!credentialImage">
                    提交认证
                </button>
            </view>
        </view>

        <!-- 步骤3：审核中（人工核对，状态可跨会话恢复） -->
        <view v-if="currentStep === 3" class="work-content work-content--center">
            <view class="work-status">
                <text class="work-status__icon">⏳</text>
                <text class="work-status__title">审核中</text>
                <text class="work-status__desc">运营正在人工核对，通常 24 小时内完成</text>
                <text class="work-status__desc">审核通过后将点亮工作标识并发放奖励</text>
            </view>
            <button class="work-content__btn" @click="goToProfile">
                返回个人主页
            </button>
        </view>

        <!-- 步骤4：认证成功 -->
        <view v-if="currentStep === 4" class="work-content work-content--center">
            <view class="work-status work-status--success">
                <text class="work-status__icon">✅</text>
                <text class="work-status__title">认证成功！</text>
                <text class="work-status__desc">您已点亮工作认证标识</text>
                <view class="work-status__reward">
                    🎁 获得 {{ rewardAmount }} 次永久心动
                </view>
            </view>
            <button class="work-content__btn" @click="goToProfile">
                返回个人主页
            </button>
        </view>

        <!-- 步骤5：已认证（再次进入） -->
        <view v-if="currentStep === 5" class="work-content work-content--center">
            <view class="work-status work-status--success">
                <text class="work-status__icon">💼</text>
                <text class="work-status__title">工作已认证</text>
                <text class="work-status__desc">认证标识已展示在个人主页，双认证可提升匹配权重</text>
            </view>
            <button class="work-content__btn" @click="goToProfile">
                返回个人主页
            </button>
        </view>

        <!-- 步骤6：已驳回（可重新提交 / 申诉） -->
        <view v-if="currentStep === 6" class="work-content">
            <view class="work-reject">
                <text class="work-reject__icon">⚠️</text>
                <text class="work-reject__title">认证未通过</text>
                <text class="work-reject__reason">{{ rejectReason }}</text>
                <text class="work-reject__tip">如有疑问可发起人工申诉，或调整凭证后重新提交</text>
            </view>
            <view class="work-content__actions">
                <button class="work-content__btn work-content__btn--secondary" @click="handleAppeal">
                    人工申诉
                </button>
                <button class="work-content__btn" @click="resubmit">
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
    const companyName = ref('')
    const position = ref('')
    const steps = ['选择方式', '上传凭证', '审核']
    const rewardAmount = CERT_REWARD_LIKES

    const authMethods = [
        { icon: '🪪', title: '工牌/工作证', desc: '上传工牌或工作证照片' },
        { icon: '📄', title: '在职证明', desc: '上传在职证明或收入证明' },
        { icon: '✉️', title: '企业邮箱', desc: '上传企业邮箱页面截图' }
    ]

    const rejectReason = computed(() => userStore.verifications.work?.reason || '凭证不清晰或信息不一致')

    // ===== 状态恢复（审核中 / 已认证 / 已驳回跨会话保持） =====
    const syncStatus = () => {
        const status = userStore.certificationOf('work')
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
                title: '完成实名认证后再认证工作',
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
        const method = authMethods[selectedMethod.value]?.title || '工牌/工作证'
        const result = userStore.submitCertification('work', {
            method,
            credential: credentialImage.value,
            company: companyName.value.trim(),
            position: position.value.trim()
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
                const approved = userStore.approveCertification('work')
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
        const result = userStore.appealCertification('work')
        if (result.ok) {
            currentStep.value = 3
            setTimeout(() => {
                userStore.approveCertification('work')
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

    .work-page {
        min-height: 100vh;
        background-color: $bg-page;
        padding-bottom: $spacing-lg;
    }

    .work-header {
        background: linear-gradient(135deg, $primary-color, $primary-dark);
        margin: $spacing-sm $page-padding-x;
        border-radius: $radius-card;
        padding: $spacing-xl $spacing-lg;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .work-header__icon {
        font-size: 40px;
    }

    .work-header__title {
        font-size: $font-size-lg;
        font-weight: $font-weight-medium;
        color: #FFFFFF;
        margin-top: $spacing-xs;
    }

    .work-header__desc {
        font-size: $font-size-sm;
        color: rgba(255, 255, 255, 0.9);
        text-align: center;
        margin-top: $spacing-xs;
    }

    .work-header__badge {
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

    .work-steps {
        display: flex;
        justify-content: space-between;
        padding: $spacing-md $page-padding-x;
        background-color: $bg-card;
        margin: 0 $page-padding-x $spacing-md;
        border-radius: $radius-card;
        position: relative;
    }

    .work-steps__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        position: relative;
    }

    .work-steps__number {
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

    .work-steps__item--active .work-steps__number {
        color: #FFFFFF;
        background-color: $primary-color;
    }

    .work-steps__item--done .work-steps__number {
        color: #FFFFFF;
        background-color: $primary-dark;
    }

    .work-steps__label {
        font-size: $font-size-xs;
        color: $text-helper;
        margin-top: $spacing-xs;
    }

    .work-steps__item--active .work-steps__label {
        color: $primary-color;
    }

    .work-steps__line {
        position: absolute;
        top: 14px;
        left: 60%;
        width: 80%;
        height: 2px;
        background-color: $border-light;
    }

    .work-steps__item--active .work-steps__line,
    .work-steps__item--done .work-steps__line {
        background-color: $primary-color;
    }

    .work-steps__item:last-child .work-steps__line {
        display: none;
    }

    .work-content {
        padding: 0 $page-padding-x;
    }

    .work-content--center {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 40px;
    }

    .work-content__title {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $text-primary;
        display: block;
    }

    .work-content__desc {
        font-size: $font-size-sm;
        color: $text-secondary;
        display: block;
        margin-top: $spacing-xs;
    }

    .work-method {
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

    .work-method--active {
        border-color: $primary-color;
        background-color: $primary-light-bg;
    }

    .work-method__icon {
        font-size: 24px;
    }

    .work-method__body {
        flex: 1;
    }

    .work-method__title {
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $text-primary;
        display: block;
    }

    .work-method__desc {
        font-size: $font-size-xs;
        color: $text-helper;
        display: block;
    }

    .work-method__check {
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

    .work-upload {
        margin-top: $spacing-md;
    }

    .work-upload__area {
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

    .work-upload__area--filled {
        border-color: $primary-color;
    }

    .work-upload__image {
        width: 100%;
        height: 100%;
    }

    .work-upload__placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .work-upload__icon {
        font-size: 40px;
    }

    .work-upload__text {
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-top: $spacing-sm;
    }

    .work-upload__hint {
        font-size: $font-size-xs;
        color: $text-helper;
        margin-top: $spacing-xs;
    }

    .work-form {
        margin-top: $spacing-md;
    }

    .work-form__item {
        margin-bottom: $spacing-sm;
    }

    .work-form__label {
        font-size: $font-size-sm;
        color: $text-secondary;
        display: block;
        margin-bottom: $spacing-xs;
    }

    .work-form__input {
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

    .work-privacy {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        margin-top: $spacing-md;
        padding: $spacing-sm $spacing-md;
        background-color: $primary-light-bg;
        border-radius: $radius-sm;
    }

    .work-privacy__icon {
        font-size: 16px;
    }

    .work-privacy__text {
        font-size: $font-size-xs;
        color: $text-secondary;
    }

    .work-content__actions {
        display: flex;
        gap: $spacing-sm;
        margin-top: $spacing-lg;
    }

    .work-content__btn {
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

    .work-status {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: $spacing-lg;
    }

    .work-status__icon {
        font-size: 56px;
    }

    .work-status__title {
        font-size: $font-size-xl;
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-top: $spacing-md;
    }

    .work-status__desc {
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-top: $spacing-xs;
    }

    .work-status__reward {
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
    .work-reject {
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

    .work-reject__icon {
        font-size: 40px;
    }

    .work-reject__title {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-top: $spacing-sm;
    }

    .work-reject__reason {
        margin-top: $spacing-xs;
        font-size: $font-size-sm;
        color: $color-danger;
        line-height: 1.6;
        text-align: center;
    }

    .work-reject__tip {
        margin-top: $spacing-xs;
        font-size: $font-size-xs;
        color: $text-helper;
        line-height: 1.6;
        text-align: center;
    }
</style>