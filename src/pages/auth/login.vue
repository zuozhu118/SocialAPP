<template>
    <view class="login-page">
        <!-- 顶部品牌区 -->
        <view class="login-header">
            <view class="login-header__logo">
                <image class="login-header__logo-img" src="/static/logo.png" mode="aspectFit" />
            </view>
            <text class="login-header__title">真实交友</text>
            <text class="login-header__slogan">寻找同频的另一半</text>
        </view>

        <!-- 登录核心区 -->
        <view class="login-card">
            <!-- 场景 A：未勾选协议 -> 普通按钮拦截点击 -->
            <button v-if="!agreed"
                    class="login-card__wechat-btn"
                    @click="handleDisabledBtnClick">
                <text class="login-card__wechat-text">手机号快捷登录</text>
            </button>

            <!-- 场景 B：已勾选协议 -> 触发微信原生手机号授权 -->
            <button v-else
                    class="login-card__wechat-btn"
                    open-type="getPhoneNumber"
                    @getphonenumber="handleGetPhoneNumber"
                    :loading="wechatLoading"
                    :disabled="wechatLoading">
                <text class="login-card__wechat-text">手机号快捷登录</text>
            </button>

            <!-- 底部协议区 -->
            <view class="login-card__agreement" :class="{ 'is-shake': isAgreementShaking }">
                <view class="login-card__checkbox" :class="{ 'is-checked': agreed }" @click="agreed = !agreed">
                    <text class="icon icon-check" v-if="agreed"></text>
                </view>
                <view class="login-card__agreement-text" @click="agreed = !agreed">
                    <text>登录即代表您同意 </text>
                    <text class="login-card__agreement-link" @click.stop="goToAgreement('user')">《用户协议》</text>
                    <text> 和 </text>
                    <text class="login-card__agreement-link" @click.stop="goToAgreement('privacy')">《隐私政策》</text>
                </view>
            </view>
        </view>

        <!-- 底部品牌落款 -->
        <view class="login-footer">
            <view class="login-footer__divider">
                <text class="dot"></text>
                <text class="login-footer__text">真实 · 纯净 · 安心</text>
                <text class="dot"></text>
            </view>
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
    const agreed = ref(false)  // 默认未选中
    const wechatLoading = ref(false)
    const isAgreementShaking = ref(false)

    // 协议抖动效果触发
    const triggerAgreementShake = () => {
        isAgreementShaking.value = true
        uni.showToast({ title: '请先阅读并勾选同意协议', icon: 'none' })
        setTimeout(() => {
            isAgreementShaking.value = false
        }, 600)
    }

    // ===== 未同意协议时点击按钮拦截 =====
    const handleDisabledBtnClick = () => {
        triggerAgreementShake()
    }

    // ===== 微信手机号一键登录 =====
    const handleGetPhoneNumber = async (e) => {
        console.log('[Login Debug] getPhoneNumber 回调触发:', e.detail)
        const { errMsg, encryptedData, iv } = e.detail

        if (errMsg === 'getPhoneNumber:ok') {
            wechatLoading.value = true

            try {
                // 1. 调用 wx.login 获取 code
                console.log('[Login Debug] 开始调用 wx.login 获取 code...')
                const loginRes = await new Promise((resolve, reject) => {
                    wx.login({
                        success: resolve,
                        fail: reject
                    })
                })

                const wxCode = loginRes.code
                console.log('[Login Debug] wx.login 成功，code:', wxCode)

                if (!wxCode) {
                    uni.showToast({ title: '获取登录凭证失败', icon: 'none' })
                    wechatLoading.value = false
                    return
                }

                // 2. 调用后端登录接口
                console.log('[Login Debug] 开始请求后端 wechatLogin 接口...')
                const result = await wechatLogin({
                    code: wxCode,
                    encryptedData: encryptedData,
                    iv: iv
                })
                console.log('[Login Debug] 后端登录返回结果:', result)

                // 3. 保存登录信息
                uni.setStorageSync('token', result.token)
                uni.setStorageSync('userInfo', result.user)

                userStore.setUserInfo(result.user)
                userStore.setAuthStatus('realName', result.authStatus?.realName || false)
                userStore.setAuthStatus('education', result.authStatus?.education || false)
                userStore.setAuthStatus('work', result.authStatus?.work || false)

                if (result.equity) {
                    appStore.updateEquity(result.equity)
                }

                uni.showToast({ title: '登录成功', icon: 'success' })

                // 4. 界面跳转
                setTimeout(() => {
                    if (!result.authStatus?.realName) {
                        uni.navigateTo({ url: '/pages/auth/realname' })
                    } else {
                        uni.switchTab({ url: '/pages/match/index' })
                    }
                }, 500)

            } catch (error) {
                console.error('[Login Debug] 微信登录过程异常:', error)
                uni.showToast({ title: error.msg || '登录失败，请重试', icon: 'none' })
            } finally {
                wechatLoading.value = false
            }
        } else if (errMsg === 'getPhoneNumber:fail user deny') {
            console.warn('[Login Debug] 用户拒绝手机号授权')
            uni.showToast({ title: '已取消微信授权', icon: 'none' })
        } else {
            console.error('[Login Debug] 手机号授权未知失败:', errMsg)
            uni.showToast({ title: '授权失败，请重试', icon: 'none' })
        }
    }

    // 查看协议
    const goToAgreement = (type) => {
        const url = type === 'user' ? '/pages/common/userAgreement' : '/pages/common/privacyPolicy'
        uni.navigateTo({ url })
    }
</script>

<style lang="scss" scoped>
    $bg-page: #FAFAFA;
    $bg-card: #FFFFFF;
    $text-primary: #2C3E50;
    $text-secondary: #606266;
    $text-helper: #909399;
    $border-light: #E4E7ED;
    $primary-color: #A8B89A;
    $primary-dark: #8AA07B;
    $primary-light-bg: #F2F5EF;
    $color-wechat: #07C160;
    $radius-card: 24px;
    $shadow-card: 0 8px 32px rgba(168, 184, 154, 0.12);

    .login-page {
        min-height: 100vh;
        background: radial-gradient(circle at 50% 0%, #F0F4EC 0%, #FAFAFA 70%);
        padding: 0 24px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-sizing: border-box;
    }

    // ===== 1. Header 区域 =====
    .login-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 100px;
    }

    .login-header__logo {
        width: 80px;
        height: 80px;
        border-radius: 24px;
        background: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        box-shadow: 0 10px 25px rgba(168, 184, 154, 0.2);
        position: relative;

        &::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 24px;
            border: 1px solid rgba(168, 184, 154, 0.3);
        }
    }

    .login-header__logo-img {
        width: 52px;
        height: 52px;
    }

    .login-header__title {
        font-size: 24px;
        font-weight: 600;
        color: $text-primary;
        letter-spacing: 2px;
        margin-bottom: 6px;
    }

    .login-header__slogan {
        font-size: 13px;
        color: $text-helper;
        letter-spacing: 1px;
    }

    // ===== 2. 卡片区域 =====
    .login-card {
        padding: 32px 24px 28px;
    }

    .login-card__welcome {
        text-align: center;
        margin-bottom: 28px;
    }

    .login-card__welcome-title {
        font-size: 18px;
        font-weight: 600;
        color: $text-primary;
        display: block;
        margin-bottom: 6px;
    }

    .login-card__welcome-sub {
        font-size: 12px;
        color: $text-helper;
        display: block;
    }

    // 微信授权按钮
    .login-card__wechat-btn {
        width: 100%;
        height: 50px;
        background-color: $color-wechat;
        color: #FFFFFF;
        border-radius: 25px;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        box-shadow: 0 6px 18px rgba(7, 193, 96, 0.25);
        transition: all 0.2s ease;
        padding: 0;

        &::after {
            border: none;
        }

        &:active:not(:disabled) {
            transform: scale(0.98);
            box-shadow: 0 2px 8px rgba(7, 193, 96, 0.2);
        }

        &:disabled {
            opacity: 0.6;
        }
    }

    .login-card__wechat-icon {
        display: flex;
        align-items: center;
        justify-content: center;

        .icon {
            font-size: 22px;
            color: #FFFFFF;
        }
    }

    .login-card__wechat-text {
        font-size: 15px;
        font-weight: 500;
        letter-spacing: 0.5px;
    }

    // 协议复选框区域
    .login-card__agreement {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        gap: 8px;
        margin-top: 24px;
        padding: 0 4px;
        transition: transform 0.1s ease;

        &.is-shake {
            animation: shake 0.4s ease-in-out;

            .login-card__checkbox {
                border-color: #FF4D4F;
            }
        }
    }

    .login-card__checkbox {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        border: 1.5px solid #C0C4CC;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
        margin-top: 2px;
        background-color: #FFFFFF;

        &.is-checked {
            background-color: $primary-color;
            border-color: $primary-color;
        }

        .icon {
            font-size: 10px;
            color: #FFFFFF;
            font-weight: bold;
        }
    }

    .login-card__agreement-text {
        font-size: 12px;
        color: $text-helper;
        line-height: 1.5;
    }

    .login-card__agreement-link {
        color: $primary-dark;
        font-weight: 500;
        display: inline;
    }

    // ===== 3. Footer 区域 =====
    .login-footer {
        padding-bottom: 40px;
        display: flex;
        justify-content: center;
    }

    .login-footer__divider {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .login-footer__text {
        font-size: 12px;
        color: $text-helper;
        letter-spacing: 3px;
    }

    .dot {
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background-color: #DCDFE6;
    }

    // 抖动提醒动画
    @keyframes shake {
        0%, 100% {
            transform: translateX(0);
        }

        20%, 60% {
            transform: translateX(-6px);
        }

        40%, 80% {
            transform: translateX(6px);
        }
    }
</style>