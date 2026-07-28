
<template>
    <view class="login-page">
        <!-- 顶部品牌区 -->
        <view class="login-header">
            <view class="login-header__logo">
                <image class="login-header__logo-img" src="/static/logo.png" mode="aspectFit" />
            </view>
            <text class="login-header__title">真实交友</text>
        </view>

        <!-- 登录卡片 -->
        <view class="login-card">
            <view class="login-card__title">手机号快捷登录</view>

            <!-- 微信手机号授权按钮 -->
            <button class="login-card__wechat-btn"
                    open-type="getPhoneNumber"
                    @getphonenumber="handleGetPhoneNumber"
                    :loading="wechatLoading"
                    :disabled="wechatLoading">
                <view class="login-card__wechat-icon">
                    <text>💬</text>
                </view>
                <text class="login-card__wechat-text">微信一键登录</text>
            </button>

            <!-- 底部协议 -->
            <view class="login-card__agreement">
                <view class="login-card__checkbox" @click="agreed = !agreed">
                    <text class="login-card__checkbox-icon">{{ agreed ? '✓' : '' }}</text>
                </view>
                <text class="login-card__agreement-text">
                    登录即代表您同意
                    <text class="login-card__agreement-link">《用户协议》</text>
                    和
                    <text class="login-card__agreement-link">《隐私政策》</text>
                </text>
            </view>
        </view>

        <!-- 底部提示 -->
        <view class="login-footer">
            <text class="login-footer__text">真实 · 纯净 · 安心</text>
        </view>
    </view>
</template>

<script setup>
    import { ref } from 'vue'
    import { useUserStore, useAppStore } from '@/store/index'
    import { wechatLogin } from '@/api/auth'

    // ===== Store =====
    const userStore = useUserStore()
    const appStore = useAppStore()

    // ===== 状态 =====
    const agreed = ref(true)  // 默认同意
    const wechatLoading = ref(false)

    // ===== 微信手机号一键登录 =====
    const handleGetPhoneNumber = async (e) => {
        const { errMsg, encryptedData, iv } = e.detail

        if (errMsg === 'getPhoneNumber:ok') {
            wechatLoading.value = true

            try {
                // 1. 检查是否同意协议
                if (!agreed.value) {
                    uni.showToast({ title: '请先同意用户协议', icon: 'none' })
                    wechatLoading.value = false
                    return
                }

                // 2. 调用 wx.login 获取 code
                const loginRes = await new Promise((resolve, reject) => {
                    wx.login({
                        success: resolve,
                        fail: reject
                    })
                })

                const wxCode = loginRes.code

                if (!wxCode) {
                    uni.showToast({ title: '获取登录凭证失败', icon: 'none' })
                    wechatLoading.value = false
                    return
                }

                // 3. 调用后端登录接口
                const result = await wechatLogin({
                    code: wxCode,
                    encryptedData: encryptedData,
                    iv: iv
                })

                // 4. 保存登录信息
                uni.setStorageSync('token', result.token)
                uni.setStorageSync('userInfo', result.user)

                userStore.setUserInfo(result.user)
                userStore.setAuthStatus('realName', result.authStatus?.realName || false)
                userStore.setAuthStatus('education', result.authStatus?.education || false)
                userStore.setAuthStatus('work', result.authStatus?.work || false)

                // 5. 更新权益信息
                if (result.equity) {
                    appStore.updateEquity(result.equity)
                }

                uni.showToast({ title: '登录成功', icon: 'success' })

                // 6. 跳转
                setTimeout(() => {
                    if (!result.authStatus?.realName) {
                        uni.navigateTo({ url: '/pages/auth/realname' })
                    } else {
                        uni.switchTab({ url: '/pages/match/index' })
                    }
                }, 500)

            } catch (error) {
                console.error('微信登录失败:', error)
                uni.showToast({ title: error.msg || '登录失败，请重试', icon: 'none' })
            } finally {
                wechatLoading.value = false
            }
        } else if (errMsg === 'getPhoneNumber:fail user deny') {
            uni.showToast({ title: '已拒绝授权', icon: 'none' })
        } else {
            uni.showToast({ title: '授权失败，请重试', icon: 'none' })
        }
    }
</script>

<style lang="scss" scoped>
    $bg-page: #F5F6FA;
    $bg-card: #FFFFFF;
    $text-primary: #1A1A2E;
    $text-secondary: #4A4A5A;
    $text-helper: #9999A8;
    $border-light: #EEEEF2;
    $primary-color: #A8B89A;
    $primary-dark: #8A9B7A;
    $primary-light-bg: rgba(168, 184, 154, 0.12);
    $radius-card: 16px;
    $radius-btn: 24px;
    $shadow-card: 0 2px 12px rgba(0, 0, 0, 0.05);
    $font-size-xs: 11px;
    $font-size-sm: 13px;
    $font-size-md: 15px;
    $font-size-lg: 18px;
    $font-size-xl: 22px;
    $font-weight-regular: 400;
    $font-weight-medium: 500;
    $spacing-xs: 4px;
    $spacing-sm: 8px;
    $spacing-md: 12px;
    $spacing-lg: 20px;
    $spacing-xl: 28px;
    $page-padding-x: 20px;
    $duration-fast: 0.2s;
    $color-warning: #FF4757;
    $color-wechat: #07C160;

    .login-page {
        min-height: 100vh;
        background: linear-gradient(180deg, #F2F5EF 0%, #FAFAFA 40%);
        padding: 0 $page-padding-x;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    // ===== 头部 =====
    .login-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 80px;
        padding-bottom: 40px;
    }

    .login-header__logo {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: linear-gradient(135deg, $primary-color, $primary-dark);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: $spacing-md;
        box-shadow: 0 4px 20px rgba($primary-color, 0.3);
        overflow: hidden;
    }

    .login-header__logo-img {
        width: 44px;
        height: 44px;
    }

    .login-header__title {
        font-size: $font-size-xl;
        font-weight: $font-weight-medium;
        color: $text-primary;
        letter-spacing: 2px;
    }

    // ===== 登录卡片 =====
    .login-card {
        width: 100%;
        max-width: 400px;
        background-color: $bg-card;
        border-radius: $radius-card;
        padding: $spacing-xl $spacing-lg $spacing-lg;
        box-shadow: $shadow-card;
    }

    .login-card__title {
        text-align: center;
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-bottom: $spacing-lg;
    }

    // 微信登录按钮
    .login-card__wechat-btn {
        width: 100%;
        height: 52px;
        background-color: $color-wechat;
        color: #FFFFFF;
        border-radius: $radius-btn;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $spacing-sm;
        transition: all $duration-fast ease;
        padding: 0;

        &:active:not(:disabled) {
            opacity: 0.85;
            transform: scale(0.98);
        }

        &:disabled {
            opacity: 0.6;
        }
    }

    .login-card__wechat-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;

        text {
            font-size: 16px;
        }
    }

    .login-card__wechat-text {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        letter-spacing: 1px;
    }

    // 协议
    .login-card__agreement {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $spacing-sm;
        margin-top: $spacing-lg;
        flex-wrap: wrap;
    }

    .login-card__checkbox {
        width: 18px;
        height: 18px;
        border-radius: 4px;
        border: 1.5px solid $border-light;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all $duration-fast ease;
        flex-shrink: 0;
        background-color: $bg-card;
    }

    .login-card__checkbox-icon {
        font-size: 12px;
        color: $primary-color;
    }

    .login-card__agreement-text {
        font-size: $font-size-xs;
        color: $text-helper;
    }

    .login-card__agreement-link {
        color: $primary-color;
    }

    // ===== 底部 =====
    .login-footer {
        margin-top: $spacing-lg;
        padding-bottom: $spacing-lg;
    }

    .login-footer__text {
        font-size: $font-size-xs;
        color: $text-helper;
        letter-spacing: 4px;
    }
</style>