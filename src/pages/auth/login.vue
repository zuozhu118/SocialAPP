<template>
  <view class="login-page">
    <!-- 顶部装饰 -->
      <view class="login-header">
          <view class="login-header__icon">✦</view>
          <text class="login-header__title">真实交友</text>
          <text class="login-header__subtitle">真实 · 纯净 · 安心</text>
      </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <!-- 手机号 -->
      <view class="login-form__item">
        <text class="login-form__label">手机号</text>
        <input 
          class="login-form__input" 
          type="text"
          placeholder="请输入手机号"
          v-model="phone"
          maxlength="11"
        />
      </view>

      <!-- 验证码 -->
      <view class="login-form__item login-form__item--code">
        <text class="login-form__label">验证码</text>
        <input 
          class="login-form__input" 
          type="text"
          placeholder="请输入验证码"
          v-model="code"
          maxlength="6"
        />
        <button 
          class="login-form__code-btn" 
          @click="handleSendCode"
          :disabled="codeTimer > 0"
        >
          {{ codeTimer > 0 ? codeTimer + 's' : '获取验证码' }}
        </button>
      </view>

      <!-- 协议 -->
      <view class="login-form__agreement">
        <view class="login-form__checkbox" @click="agreed = !agreed">
          <text class="login-form__checkbox-icon">{{ agreed ? '✅' : '☐' }}</text>
        </view>
        <text class="login-form__agreement-text">
          我已阅读并同意
          <text class="login-form__agreement-link">《用户协议》</text>
          和
          <text class="login-form__agreement-link">《隐私政策》</text>
        </text>
      </view>

      <!-- 登录按钮 -->
      <button 
        class="login-form__btn" 
        @click="handleLogin"
        :disabled="!agreed || !phone || !code"
      >
        登录 / 注册
      </button>
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

const handleSendCode = () => {
  if (!phone.value || phone.value.length !== 11) {
    uni.showToast({
      title: '请输入正确手机号',
      icon: 'none'
    })
    return
  }
  
  uni.showToast({
    title: '验证码已发送',
    icon: 'success'
  })
  
  codeTimer.value = 60
  const timer = setInterval(() => {
    codeTimer.value--
    if (codeTimer.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleLogin = () => {
  if (!agreed.value) {
    uni.showToast({
      title: '请先同意用户协议',
      icon: 'none'
    })
    return
  }
  
  uni.showLoading({
    title: '登录中...'
  })
  
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })
    // 跳转到实名认证
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/auth/realname'
      })
    }, 500)
  }, 1000)
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background-color: #FAFAFA;
  padding: 0 24px;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 60px;
  padding-bottom: 40px;
}

.login-header__icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.login-header__title {
  font-size: 24px;
  font-weight: 500;
  color: #333333;
}

.login-header__subtitle {
  font-size: 14px;
  color: #999999;
  margin-top: 4px;
}

.login-form {
  background-color: #FFFFFF;
  border-radius: 20px;
  padding: 24px 20px;
}

.login-form__item {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.login-form__item--code {
  position: relative;
}

.login-form__label {
  font-size: 14px;
  color: #666666;
  margin-bottom: 6px;
}

.login-form__input {
  height: 44px;
  padding: 0 12px;
  background-color: #FAFAFA;
  border-radius: 12px;
  font-size: 16px;
  color: #333333;
  border: 1px solid #E5E5E5;
}

.login-form__input:focus {
  border-color: #A8B89A;
}

.login-form__code-btn {
  position: absolute;
  bottom: 4px;
  right: 4px;
  height: 36px;
  padding: 0 16px;
  font-size: 13px;
  color: #A8B89A;
  background-color: #F2F5EF;
  border-radius: 10px;
  border: none;
}

.login-form__code-btn:disabled {
  color: #999999;
  background-color: #F0F0F0;
}

.login-form__agreement {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.login-form__checkbox {
  cursor: pointer;
}

.login-form__checkbox-icon {
  font-size: 18px;
}

.login-form__agreement-text {
  font-size: 13px;
  color: #666666;
}

.login-form__agreement-link {
  color: #A8B89A;
}

.login-form__btn {
  width: 100%;
  height: 48px;
  background-color: #A8B89A;
  color: #FFFFFF;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  border: none;
}

.login-form__btn:disabled {
  background-color: #E5E5E5;
  color: #999999;
}

.login-footer {
  text-align: center;
  padding: 20px 0;
  font-size: 13px;
  color: #999999;
}

.login-footer__highlight {
  color: #BF8B8B;
}
</style>