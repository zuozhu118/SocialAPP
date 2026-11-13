<template>
 <view class="landing-page">
 <!-- 顶部品牌区 -->
 <view class="landing-hero">
 <view class="landing-hero__glow landing-hero__glow--1"></view>
 <view class="landing-hero__glow landing-hero__glow--2"></view>

 <view class="landing-hero__brand">
 <text class="landing-hero__logo">缘</text>
 <text class="landing-hero__brand-name">同城真实交友</text>
 </view>

 <text class="landing-hero__title">{{ heroTitle }}</text>
 <text class="landing-hero__subtitle">{{ heroSubtitle }}</text>

 <view class="landing-hero__invite">
 <text class="landing-hero__invite-label">邀请码</text>
 <text class="landing-hero__invite-code">{{ inviteCode || '——' }}</text>
 </view>
 </view>

 <!-- 邀请福利 -->
 <view class="landing-reward">
 <view class="landing-reward__head">
 <text class="landing-reward__icon"></text>
 <view class="landing-reward__titles">
 <text class="landing-reward__title">好友完成实名，双方各得 {{ rewardLikes }} 次永久心动</text>
 <text class="landing-reward__desc">永久心动次数不受每日额度限制，平台不做任何现金奖励</text>
 </view>
 </view>
 </view>

 <!-- 卖点 -->
 <view class="landing-points">
 <view v-for="(point, index) in points" :key="index" class="landing-points__item">
 <text class="landing-points__icon">{{ point.icon }}</text>
 <view class="landing-points__body">
 <text class="landing-points__title">{{ point.title }}</text>
 <text class="landing-points__desc">{{ point.desc }}</text>
 </view>
 </view>
 </view>

 <!-- 分享目标预览 -->
 <view v-if="target" class="landing-target">
 <text class="landing-target__label">好友分享给你的内容</text>
 <text class="landing-target__value">{{ targetTitle || '一条同城动态' }}</text>
 <text class="landing-target__hint">完成注册与实名后即可查看完整内容</text>
 </view>

 <!-- 底部操作 -->
 <view class="landing-actions">
 <button class="landing-actions__primary" @click="handlePrimary">
 {{ primaryText }}
 </button>
 <text v-if="level === 'guest'" class="landing-actions__skip" @click="skip">先随便逛逛</text>
 <text v-else class="landing-actions__skip" @click="skip">返回首页</text>
 </view>

 <text class="landing-footer">
 本平台为真实同城交友，所有用户需实名认证；请勿向任何人转账汇款
 </text>
 </view>
</template>

<script setup>
 import { ref, computed } from 'vue'
 import { onLoad, onShow } from '@dcloudio/uni-app'
 import useInviteStore from '@/store/invite'
 import useUserStore from '@/store/user'
 import { INVITE_REWARD_LIKES } from '@/mock/invite'

 const inviteStore = useInviteStore()
 const userStore = useUserStore()

 const inviteCode = ref('')
 const target = ref('')
 const targetTitle = ref('')

 const rewardLikes = INVITE_REWARD_LIKES
 const level = computed(() => userStore.level)

 const points = [
 { icon: '', title: '同城优先', desc: '只看同城异性，线下见面不用跨城奔波' },
 { icon: '', title: '实名认证', desc: '身份证 + 学历 + 工作三重认证，资料真实可信' },
 { icon: '', title: '双向心动才可交换微信', desc: '不提供站内聊天，拒绝骚扰与无效寒暄' }
 ]

 const heroTitle = computed(() => {
 if (level.value === 'guest') return '有人邀请你加入同城真实交友'
 if (level.value === 'registered') return '完成实名认证，解锁完整缘分'
 return '欢迎回来，今天的缘分已刷新'
 })

 const heroSubtitle = computed(() => {
 if (level.value === 'guest') return '注册后即可查看同城真实资料，0.5 秒完成'
 if (level.value === 'registered') return '实名后才能查看对方身份、发起心动与交换微信'
 return '继续发现同城同频的 TA'
 })

 const primaryText = computed(() => {
 if (level.value === 'guest') return '一键授权手机号注册'
 if (level.value === 'registered') return '完成实名认证'
 return target.value ? '查看好友分享的内容' : '进入首页'
 })

 onLoad((options = {}) => {
 inviteCode.value = options.invite || ''
 target.value = options.target ? decodeURIComponent(options.target) : ''
 targetTitle.value = options.title ? decodeURIComponent(options.title) : ''

 // 3.8 落地即绑定邀请关系；自己的码 / 重复绑定会被忽略
 if (inviteCode.value) {
 inviteStore.bindInviter(inviteCode.value)
 }
 })

 onShow(() => {
 // 我从分享链接进入且已完成实名 → 双方奖励结算（幂等）
 inviteStore.settleInviteeReward()
 })

 const handlePrimary = () => {
 if (level.value === 'guest') {
 uni.navigateTo({ url: '/pages/auth/login?from=invite' })
 return
 }
 if (level.value === 'registered') {
 uni.navigateTo({ url: '/pages/auth/realname' })
 return
 }
 if (target.value) {
 uni.navigateTo({ url: target.value })
 return
 }
 uni.switchTab({ url: '/pages/match/index' })
 }

 const skip = () => {
 uni.switchTab({ url: '/pages/match/index' })
 }
</script>

<style lang="scss" scoped>
 @import '@/styles/variables.scss';
 @import '@/styles/mixins.scss';

 .landing-page {
 min-height: 100vh;
 background-color: $bg-page;
 padding-bottom: calc(24px + env(safe-area-inset-bottom));
 }

 // ===== 顶部品牌区 =====
 .landing-hero {
 position: relative;
 padding: 40px $page-padding-x 24px;
 background: linear-gradient(160deg, #A8B89A 0%, #8AA07B 100%);
 border-radius: 0 0 $radius-card $radius-card;
 overflow: hidden;

 &__glow {
 position: absolute;
 border-radius: 50%;
 background-color: rgba(255, 255, 255, 0.14);

 &--1 {
 width: 180px;
 height: 180px;
 top: -70px;
 right: -50px;
 }

 &--2 {
 width: 110px;
 height: 110px;
 bottom: -40px;
 left: -30px;
 }
 }

 &__brand {
 position: relative;
 display: flex;
 align-items: center;
 gap: 8px;
 margin-bottom: 18px;
 }

 &__logo {
 width: 28px;
 height: 28px;
 border-radius: 9px;
 background-color: rgba(255, 255, 255, 0.9);
 color: $primary-dark;
 font-size: 15px;
 font-weight: $font-weight-bold;
 line-height: 28px;
 text-align: center;
 }

 &__brand-name {
 font-size: $font-size-xs;
 color: rgba(255, 255, 255, 0.9);
 letter-spacing: 1px;
 }

 &__title {
 position: relative;
 display: block;
 font-size: 22px;
 font-weight: $font-weight-bold;
 color: #FFFFFF;
 line-height: 1.4;
 margin-bottom: 8px;
 }

 &__subtitle {
 position: relative;
 display: block;
 font-size: $font-size-xs;
 line-height: 1.6;
 color: rgba(255, 255, 255, 0.86);
 margin-bottom: 16px;
 }

 &__invite {
 position: relative;
 display: flex;
 align-items: center;
 gap: 8px;
 align-self: flex-start;
 padding: 6px 12px;
 background-color: rgba(255, 255, 255, 0.2);
 border-radius: 14px;
 width: fit-content;
 }

 &__invite-label {
 font-size: 10px;
 color: rgba(255, 255, 255, 0.8);
 }

 &__invite-code {
 font-size: $font-size-xs;
 font-weight: $font-weight-bold;
 color: #FFFFFF;
 letter-spacing: 1px;
 }
 }

 // ===== 邀请福利 =====
 .landing-reward {
 margin: 12px $page-padding-x 0;
 padding: 14px;
 background-color: $bg-card;
 border-radius: $radius-card;
 box-shadow: $shadow-card;
 border-left: 3px solid $primary-color;

 &__head {
 display: flex;
 align-items: flex-start;
 gap: 10px;
 }

 &__icon {
 font-size: 22px;
 }

 &__titles {
 flex: 1;
 min-width: 0;
 }

 &__title {
 display: block;
 font-size: $font-size-sm;
 font-weight: $font-weight-medium;
 color: $text-primary;
 margin-bottom: 4px;
 }

 &__desc {
 display: block;
 font-size: 10px;
 line-height: 1.6;
 color: $text-helper;
 }
 }

 // ===== 卖点 =====
 .landing-points {
 margin: 12px $page-padding-x 0;
 padding: 4px 14px;
 background-color: $bg-card;
 border-radius: $radius-card;
 box-shadow: $shadow-card;

 &__item {
 display: flex;
 align-items: flex-start;
 gap: 10px;
 padding: 12px 0;
 border-bottom: 1px solid $border-light;

 &:last-child {
 border-bottom: none;
 }
 }

 &__icon {
 font-size: 18px;
 margin-top: 1px;
 }

 &__body {
 flex: 1;
 min-width: 0;
 }

 &__title {
 display: block;
 font-size: $font-size-xs;
 font-weight: $font-weight-medium;
 color: $text-primary;
 margin-bottom: 2px;
 }

 &__desc {
 display: block;
 font-size: 10px;
 line-height: 1.6;
 color: $text-helper;
 }
 }

 // ===== 目标预览 =====
 .landing-target {
 margin: 12px $page-padding-x 0;
 padding: 14px;
 background-color: $primary-light-bg;
 border-radius: $radius-card;

 &__label {
 display: block;
 font-size: 10px;
 color: $text-helper;
 margin-bottom: 4px;
 }

 &__value {
 display: block;
 font-size: $font-size-sm;
 font-weight: $font-weight-medium;
 color: $text-primary;
 margin-bottom: 4px;
 }

 &__hint {
 display: block;
 font-size: 10px;
 color: $text-helper;
 }
 }

 // ===== 底部操作 =====
 .landing-actions {
 margin: 20px $page-padding-x 0;
 display: flex;
 flex-direction: column;
 align-items: center;
 gap: 12px;

 &__primary {
 width: 100%;
 height: 46px;
 line-height: 46px;
 border-radius: $radius-btn;
 background: $primary-gradient;
 color: #FFFFFF;
 font-size: $font-size-btn;
 font-weight: $font-weight-medium;
 border: none;
 box-shadow: $shadow-btn;

 &::after {
 border: none;
 }
 }

 &__skip {
 font-size: $font-size-xs;
 color: $text-helper;
 }
 }

 .landing-footer {
 display: block;
 margin: 20px $page-padding-x 0;
 text-align: center;
 font-size: 10px;
 line-height: 1.6;
 color: $text-helper;
 }
</style>
