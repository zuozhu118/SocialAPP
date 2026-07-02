<template>
    <view class="login-page">
        <!-- 顶部品牌区 -->
        <view class="login-header">
            <view class="login-header__logo">
                <text class="login-header__logo-icon">✦</text>
            </view>
            <text class="login-header__title">真实交友</text>
            <text class="login-header__subtitle">真实 · 纯净 · 安心</text>
        </view>

        <!-- 登录表单 -->
        <view class="login-form">
            <!-- 微信一键授权 -->
            <button class="login-form__wechat-btn" @click="handleWechatLogin">
                <text class="login-form__wechat-icon">💬</text>
                微信一键登录
            </button>

            <!-- 分割线 -->
            <view class="login-form__divider">
                <view class="login-form__divider-line"></view>
                <text class="login-form__divider-text">其他方式</text>
                <view class="login-form__divider-line"></view>
            </view>

            <!-- 手机号 -->
            <view class="login-form__item">
                <text class="login-form__label">手机号</text>
                <input class="login-form__input"
                       type="text"
                       placeholder="请输入手机号"
                       v-model="phone"
                       maxlength="11" />
            </view>

            <!-- 验证码 -->
            <view class="login-form__item login-form__item--code">
                <text class="login-form__label">验证码</text>
                <input class="login-form__input"
                       type="text"
                       placeholder="请输入验证码"
                       v-model="code"
                       maxlength="6" />
                <button class="login-form__code-btn"
                        @click="handleSendCode"
                        :disabled="codeTimer > 0">
                    {{ codeTimer > 0 ? codeTimer + 's' : '获取验证码' }}
                </button>
            </view>

            <!-- 协议 -->
            <view class="login-form__agreement">
                <view class="login-form__checkbox" @click="agreed = !agreed">
                    <text class="login-form__checkbox-icon">{{ agreed ? '✓' : '' }}</text>
                </view>
                <text class="login-form__agreement-text">
                    我已阅读并同意
                    <text class="login-form__agreement-link">《用户协议》</text>
                    和
                    <text class="login-form__agreement-link">《隐私政策》</text>
                </text>
            </view>

            <!-- 登录按钮 -->
            <button class="login-form__btn"
                    @click="handleLogin"
                    :disabled="!agreed || !phone || !code">
                登录 / 注册
            </button>

            <!-- 游客入口 -->
            <view class="login-form__guest" @click="handleGuest">
                <text class="login-form__guest-text">先逛逛 👀</text>
            </view>
        </view>

        <!-- 底部提示 -->
        <view class="login-footer">
            <text class="login-footer__text">登录即代表您同意平台</text>
            <text class="login-footer__highlight">「反诈知情协议」</text>
        </view>
    </view>
</template>

<script setup>
    import { ref } from 'vue'

    const phone = ref('')
    const code = ref('')
    const agreed = ref(false)
    const codeTimer = ref(0)

    const handleWechatLogin = () => {
        uni.showLoading({ title: '授权中...' })
        setTimeout(() => {
            uni.hideLoading()
            uni.showToast({ title: '登录成功', icon: 'success' })
            setTimeout(() => {
                uni.navigateTo({ url: '/pages/auth/realname' })
            }, 500)
        }, 1000)
    }

    const handleSendCode = () => {
        if (!phone.value || phone.value.length !== 11) {
            uni.showToast({ title: '请输入正确手机号', icon: 'none' })
            return
        }
        uni.showToast({ title: '验证码已发送', icon: 'success' })
        codeTimer.value = 60
        const timer = setInterval(() => {
            codeTimer.value--
            if (codeTimer.value <= 0) clearInterval(timer)
        }, 1000)
    }

    const handleLogin = () => {
        if (!agreed.value) {
            uni.showToast({ title: '请先同意用户协议', icon: 'none' })
            return
        }
        uni.showLoading({ title: '登录中...' })
        setTimeout(() => {
            uni.hideLoading()
            uni.showToast({ title: '登录成功', icon: 'success' })
            setTimeout(() => {
                uni.navigateTo({ url: '/pages/auth/realname' })
            }, 500)
        }, 1000)
    }

    const handleGuest = () => {
        uni.switchTab({ url: '/pages/square/index' })
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .login-page {
        min-height: 100vh;
        background: linear-gradient(180deg, #F2F5EF 0%, #FAFAFA 40%);
        padding: 0 $page-padding-x;
    }

    .login-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 60px;
        padding-bottom: 40px;
    }

    .login-header__logo {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, $primary-color, $primary-dark);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: $spacing-md;
        box-shadow: 0 4px 20px rgba($primary-color, 0.3);
    }

    .login-header__logo-icon {
        font-size: 36px;
        color: #FFFFFF;
    }

    .login-header__title {
        font-size: $font-size-xl;
        font-weight: $font-weight-medium;
        color: $text-primary;
    }

    .login-header__subtitle {
        font-size: $font-size-sm;
        color: $text-helper;
        margin-top: $spacing-xs;
    }

    .login-form {
        background-color: $bg-card;
        border-radius: $radius-card;
        padding: $spacing-xl $spacing-lg;
        box-shadow: $shadow-card;
    }

    .login-form__wechat-btn {
        width: 100%;
        height: 48px;
        background-color: #07C160;
        color: #FFFFFF;
        border-radius: $radius-btn;
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $spacing-sm;

        &:active {
            opacity: 0.8;
        }
    }

    .login-form__wechat-icon {
        font-size: 20px;
    }

    .login-form__divider {
        display: flex;
        align-items: center;
        gap: $spacing-md;
        margin: $spacing-md 0;
    }

    .login-form__divider-line {
        flex: 1;
        height: 1px;
        background-color: $border-light;
    }

    .login-form__divider-text {
        font-size: $font-size-xs;
        color: $text-helper;
    }

    .login-form__item {
        display: flex;
        flex-direction: column;
        margin-bottom: $spacing-md;
    }

    .login-form__item--code {
        position: relative;
    }

    .login-form__label {
        font-size: $font-size-sm;
        color: $text-secondary;
        margin-bottom: $spacing-xs;
    }

    .login-form__input {
        height: 44px;
        padding: 0 12px;
        background-color: $bg-page;
        border-radius: $radius-sm;
        font-size: $font-size-md;
        color: $text-primary;
        border: none;
        border-bottom: 1px solid $border-light;
        transition: border-color $duration-fast ease;

        &:focus {
            border-bottom-color: $primary-color;
        }
    }

    .login-form__code-btn {
        position: absolute;
        bottom: 6px;
        right: 4px;
        height: 32px;
        padding: 0 $spacing-md;
        font-size: $font-size-xs;
        color: $primary-color;
        background-color: $primary-light-bg;
        border-radius: $radius-sm;
        border: none;

        &:disabled {
            color: $text-helper;
            background-color: $disabled-bg;
        }
    }

    .login-form__agreement {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        margin: $spacing-md 0;
    }

    .login-form__checkbox {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 1px solid $border-light;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all $duration-fast ease;
        flex-shrink: 0;

        & text {
            font-size: 14px;
            color: $primary-color;
        }
    }

    .login-form__checkbox--checked {
        background-color: $primary-color;
        border-color: $primary-color;
    }

    .login-form__agreement-text {
        font-size: $font-size-xs;
        color: $text-secondary;
    }

    .login-form__agreement-link {
        color: $primary-color;
    }

    .login-form__btn {
        width: 100%;
        height: 48px;
        background-color: $primary-color;
        color: #FFFFFF;
        border-radius: $radius-btn;
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        border: none;

        &:disabled {
            background-color: $disabled-bg;
            color: $text-helper;
        }

        &:active:not(:disabled) {
            opacity: 0.8;
        }
    }

    .login-form__guest {
        text-align: center;
        margin-top: $spacing-md;
        cursor: pointer;

        &:active {
            opacity: 0.6;
        }
    }

    .login-form__guest-text {
        font-size: $font-size-sm;
        color: $text-helper;
    }

    .login-footer {
        text-align: center;
        padding: $spacing-lg 0;
        font-size: $font-size-xs;
        color: $text-helper;
    }

    .login-footer__highlight {
        color: $color-warning;
    }
</style>