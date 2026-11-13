<template>
 <view class="apply-page">
 <!-- 导航栏 -->
 <view class="apply-navbar">
 <text class="apply-navbar__back icon icon-arrow-left" @click="goBack"></text>
 <text class="apply-navbar__title">交换微信</text>
 <view class="apply-navbar__placeholder"></view>
 </view>

 <scroll-view v-if="userInfo" class="apply-scroll" scroll-y show-scrollbar="false">
 <!-- 用户信息卡片 -->
 <view class="apply-user-card" @click="goToProfile">
 <view class="apply-user-card__avatar-wrap">
 <image class="apply-user-card__avatar" :src="userInfo.avatar" mode="aspectFill" />
 <view class="apply-user-card__auth" v-if="userInfo.auth?.realName">
 <text class="icon icon-check"></text>
 </view>
 </view>
 <view class="apply-user-card__info">
 <view class="apply-user-card__name-row">
 <text class="apply-user-card__name">{{ userInfo.name }}</text>
 <text class="apply-user-card__gender is-female">♀</text>
 </view>
 <text class="apply-user-card__meta">
 {{ userInfo.age }}岁 · {{ userInfo.occupation }} · {{ userInfo.district }}
 </text>
 <view class="apply-user-card__badges">
 <text v-if="userInfo.auth?.realName" class="badge badge--real">实名认证</text>
 <text v-if="userInfo.auth?.education" class="badge badge--edu">学历认证</text>
 <text v-if="userInfo.auth?.work" class="badge badge--work">工作认证</text>
 </view>
 </view>
 <text class="apply-user-card__arrow icon icon-arrow-right"></text>
 </view>

 <!-- 3.4.3 接收方卡片顶部：缘分契合点高亮 -->
 <view v-if="fatePoint" class="apply-fate">
 <text class="apply-fate__icon"></text>
 <text class="apply-fate__text">{{ fatePoint }}</text>
 </view>

 <!-- 未双向匹配 -->
 <view v-if="!isMatched" class="apply-block">
 <text class="apply-block__icon"></text>
 <text class="apply-block__title">还没互相心动</text>
 <text class="apply-block__desc">{{ businessCopy.blocked }}</text>
 <button class="apply-block__btn" @click="goToMatch">去匹配</button>
 </view>

 <!-- ===== 状态 A：我收到对方的申请，待处理 ===== -->
 <view v-else-if="incoming" class="apply-card">
 <view class="apply-card__head">
 <text class="apply-card__title">对方申请交换微信</text>
 <view class="apply-countdown">
 <text class="apply-countdown__icon"></text>
 <text class="apply-countdown__text">{{ formatRemain(remainIncoming) }}自动过期</text>
 </view>
 </view>

 <view class="apply-message-view">
 <text class="apply-message-view__label">Ta 的留言</text>
 <text class="apply-message-view__text">{{ incoming.message || '（没有留言）' }}</text>
 </view>

 <view class="apply-card__actions">
 <button class="apply-card__btn apply-card__btn--ghost" @click="handleReject">拒绝</button>
 <button class="apply-card__btn apply-card__btn--primary" @click="handleAgree">同意交换</button>
 </view>
 <text class="apply-card__tip">同意后双方将互相展示微信号</text>
 </view>

 <!-- ===== 状态 B：我已发出申请，等待处理 ===== -->
 <view v-else-if="outgoing && outgoing.status === 'pending'" class="apply-card">
 <view class="apply-card__head">
 <text class="apply-card__title">申请已发送</text>
 <view class="apply-countdown">
 <text class="apply-countdown__icon"></text>
 <text class="apply-countdown__text">{{ formatRemain(remainOutgoing) }}自动过期</text>
 </view>
 </view>
 <text class="apply-card__desc">申请已送达，等待对方确认</text>
 <view class="apply-message-view">
 <text class="apply-message-view__label">我的留言</text>
 <text class="apply-message-view__text">{{ outgoing.message || '（没有留言）' }}</text>
 </view>
 <text class="apply-card__tip">3 天内未处理将自动过期，7 天内仅可对同一人发起 1 次申请</text>
 </view>

 <!-- ===== 状态 C：已同意，展示双方微信号 ===== -->
 <view v-else-if="wechatAgreed" class="apply-card apply-card--success">
 <text class="apply-card__icon"></text>
 <text class="apply-card__title apply-card__title--center">微信已交换成功</text>
 <text class="apply-card__desc apply-card__desc--center">加个好友，从一句你好开始</text>

 <view class="apply-wechat">
 <text class="apply-wechat__label">Ta 的微信号</text>
 <text class="apply-wechat__value">{{ otherWechat }}</text>
 <button class="apply-wechat__copy" @click="copyWechat(otherWechat)">一键复制</button>
 </view>
 <view class="apply-wechat">
 <text class="apply-wechat__label">我的微信号</text>
 <text class="apply-wechat__value">{{ matchStore.myWechat }}</text>
 <button class="apply-wechat__copy" @click="copyWechat(matchStore.myWechat)">复制</button>
 </view>

 <view class="apply-safe">
 <text class="apply-safe__icon"></text>
 <text class="apply-safe__text">{{ wechatSafetyCopy }}</text>
 </view>
 </view>

 <!-- ===== 状态 D：已过期 / 已拒绝 ===== -->
 <view v-else-if="terminalState" class="apply-block">
 <text class="apply-block__icon">{{ terminalState.icon }}</text>
 <text class="apply-block__title">{{ terminalState.title }}</text>
 <text class="apply-block__desc">{{ terminalState.desc }}</text>
 <button class="apply-block__btn apply-block__btn--ghost" @click="goBack">返回</button>
 </view>

 <!-- ===== 状态 E：可发起申请 ===== -->
 <template v-else>
 <view class="apply-message">
 <view class="apply-message__header">
 <text class="apply-message__title">申请留言（选填）</text>
 <text class="apply-message__count">{{ message.length }}/20</text>
 </view>
 <textarea class="apply-message__input"
 v-model="message"
 placeholder="可留一句话让对方更了解你（选填，20 字内）"
 maxlength="20"
 @input="onMessageInput" />
 <text v-if="messageError" class="apply-message__error">{{ messageError }}</text>
 <text v-else class="apply-message__hint"> 一句真诚的留言，申请通过率更高哦</text>
 </view>

 <view class="apply-rules">
 <view class="apply-rules__item">
 <text class="apply-rules__dot">•</text>
 <text class="apply-rules__text">申请有效期 3 天，超时自动过期</text>
 </view>
 <view class="apply-rules__item">
 <text class="apply-rules__dot">•</text>
 <text class="apply-rules__text">7 天内对同一人仅可发起 1 次申请</text>
 </view>
 <view class="apply-rules__item">
 <text class="apply-rules__dot">•</text>
 <text class="apply-rules__text">同意后双方互相展示微信号</text>
 </view>
 </view>
 </template>
 </scroll-view>

 <!-- 底部按钮：仅可发起时显示 -->
 <view v-if="canSubmit" class="apply-footer">
 <view class="apply-footer__risk">
 <text class="apply-footer__risk-icon">⚠</text>
 <text class="apply-footer__risk-text">{{ antiFraudTips.apply }}</text>
 </view>
 <button class="apply-footer__btn" @click="submitApply">
 <text class="icon icon-wechat"></text>
 申请交换微信
 </button>
 </view>

 <!-- 强制反诈风险弹窗：点击【已知晓】才可提交（文档 3.4.3） -->
 <RiskModal v-model:visible="showRiskModal" @confirm="doSubmitApply" />
 </view>
</template>

<script setup>
 import { ref, computed } from 'vue'
 import { onLoad, onShow } from '@dcloudio/uni-app'
 import RiskModal from '@/components/common/RiskModal.vue'
 import { useMatchStore, useSocialStore } from '@/store/index'
 import { businessCopy, wechatSafetyCopy, antiFraudTips } from '@/mock/copy'
 import { findUserById } from '@/mock/users'
 import { detectContact, formatRemain, APPLY_COOLDOWN } from '@/store/match'

 const matchStore = useMatchStore()
 const socialStore = useSocialStore()

 const userId = ref(0)
 const userInfo = ref(null)
 const message = ref('')
 const messageError = ref('')
 const showRiskModal = ref(false)

 onLoad((options) => {
 userId.value = Number(options?.userId || 0)
 userInfo.value = findUserById(userId.value)
 })

 onShow(() => {
 matchStore.restore()
 socialStore.restore()
 // 进入页面即校验 3 天过期
 matchStore.expireCheck()
 })

 // 双保险：匹配记录 + 双向心动都成立才算可交换（v8 硬性前提）
 const isMatched = computed(() =>
     matchStore.isMatched(userId.value) && socialStore.isMutual(userId.value)
 )
 const relation = computed(() => matchStore.getMatch(userId.value))
 const fatePoint = computed(() => matchStore.getFatePoint(userId.value))
 const wechatAgreed = computed(() => relation.value?.wechatStatus === 'agreed')
 const otherWechat = computed(() => matchStore.getWechatOf(userId.value))

 // 我收到的待处理申请
 const incoming = computed(() => matchStore.getIncomingApplication(userId.value))
 // 我发出的最近一条申请
 const outgoing = computed(() => {
 const list = matchStore.sentApplications.filter(item => Number(item.toUserId) === userId.value)
 return list[0] || null
 })

 const remainIncoming = computed(() => {
 const item = incoming.value
 return item ? Math.max(0, item.expiresAt - Date.now()) : 0
 })
 const remainOutgoing = computed(() => {
 const item = outgoing.value
 return item ? Math.max(0, item.expiresAt - Date.now()) : 0
 })

 // 终态：过期 / 被拒绝（7 天冷却已过的过期申请直接回到可申请状态）
 const terminalState = computed(() => {
 const item = outgoing.value
 if (!item || item.status === 'pending') return null
 if (item.status === 'expired') {
 if (matchStore.canApplyWechat(userId.value).ok) return null
 return { icon: '', title: '申请已过期', desc: businessCopy.applyExpired }
 }
 if (item.status === 'rejected') {
 return { icon: '', title: '对方暂未回应', desc: businessCopy.applyNoResponse }
 }
 return null
 })

 // 是否可提交申请
 const canSubmit = computed(() => {
 if (!isMatched.value || wechatAgreed.value) return false
 if (incoming.value) return false
 if (terminalState.value) return false
 return true
 })

 const onMessageInput = (e) => {
 message.value = e.detail.value
 messageError.value = ''
 }

 const submitApply = () => {
 const text = message.value.trim()
 // 留言选填，但最多 20 字且不得包含联系方式
 if (text.length > 20) {
 messageError.value = '留言最多 20 字'
 return
 }
 // 3.4.4 全域导流拦截
 if (text && detectContact(text)) {
 messageError.value = businessCopy.contactInGreeting
 return
 }
 const check = matchStore.canApplyWechat(userId.value)
 if (!check.ok) {
 uni.showModal({
 title: '暂时无法申请',
 content: check.reason === 'cooldown'
 ? `同一用户 7 天内仅可发起 1 次申请，${formatRemain(check.remain)}后可再次申请`
 : check.reason === 'pending'
 ? '申请已送达，等待对方确认'
 : businessCopy.blocked,
 showCancel: false
 })
 return
 }
 // 强制反诈风险弹窗
 showRiskModal.value = true
 }

 const doSubmitApply = () => {
 const result = matchStore.applyWechat(userId.value, message.value.trim())
 if (!result.ok) {
 uni.showToast({ title: '申请提交失败，请稍后再试', icon: 'none' })
 return
 }
 uni.showToast({ title: '申请已发送', icon: 'success' })
 }

 const handleAgree = () => {
 const item = incoming.value
 if (!item) return
 uni.showModal({
 title: '同意交换微信',
 content: `同意后你和「${userInfo.value?.name}」将互相展示微信号`,
 confirmText: '同意',
 success: (res) => {
 if (!res.confirm) return
 const result = matchStore.agreeApplication(item.id)
 if (result.ok) {
 uni.showToast({ title: '已同意，微信号已展示', icon: 'success' })
 }
 }
 })
 }

 const handleReject = () => {
 const item = incoming.value
 if (!item) return
 uni.showModal({
 title: '拒绝申请',
 content: `确认拒绝「${userInfo.value?.name}」的微信申请吗？`,
 confirmText: '拒绝',
 confirmColor: '#FF4757',
 success: (res) => {
 if (!res.confirm) return
 matchStore.rejectApplication(item.id)
 uni.showToast({ title: '已拒绝', icon: 'none' })
 }
 })
 }

 const copyWechat = (value) => {
 if (!value) return
 uni.setClipboardData({
 data: value,
 success: () => uni.showToast({ title: '微信号已复制', icon: 'success' })
 })
 }

 const goBack = () => uni.navigateBack()
 const goToProfile = () => uni.navigateTo({ url: `/pages/user/profile?userId=${userId.value}` })
 const goToMatch = () => uni.switchTab({ url: '/pages/match/index' })

</script>

<style lang="scss" scoped>
 @import '@/styles/variables.scss';
 @import '@/styles/mixins.scss';

 .apply-page {
 height: 100vh;
 display: flex;
 flex-direction: column;
 background-color: $bg-page;
 }

 .apply-navbar {
 display: flex;
 align-items: center;
 justify-content: space-between;
 padding: 14px $page-padding-x;
 padding-top: calc(14px + env(safe-area-inset-top));
 background-color: rgba(255, 255, 255, 0.94);
 border-bottom: 1px solid $border-light;
 flex-shrink: 0;

 &__back {
 width: 32px;
 font-size: 20px;
 color: $text-primary;
 }

 &__title {
 font-size: 17px;
 font-weight: 500;
 color: $text-primary;
 }

 &__placeholder {
 width: 32px;
 }
 }

 .apply-scroll {
 flex: 1;
 min-height: 0;
 }

 // ===== 用户卡片 =====
 .apply-user-card {
 display: flex;
 align-items: center;
 gap: 14px;
 background-color: $bg-card;
 margin: 12px $page-padding-x;
 padding: $spacing-md;
 border-radius: $radius-card;
 box-shadow: $shadow-card;

 &__avatar-wrap {
 position: relative;
 flex-shrink: 0;
 }

 &__avatar {
 width: 60px;
 height: 60px;
 border-radius: 50%;
 background-color: $bg-page;
 }

 &__auth {
 position: absolute;
 right: -2px;
 bottom: -2px;
 width: 18px;
 height: 18px;
 border-radius: 50%;
 background: linear-gradient(135deg, #FFD700, #FFB74D);
 display: flex;
 align-items: center;
 justify-content: center;
 border: 2px solid $bg-card;

 .icon {
 font-size: 10px;
 color: #FFFFFF;
 }
 }

 &__info {
 flex: 1;
 min-width: 0;
 }

 &__name-row {
 display: flex;
 align-items: center;
 gap: 6px;
 margin-bottom: 2px;
 }

 &__name {
 font-size: 17px;
 font-weight: $font-weight-medium;
 color: $text-primary;
 }

 &__gender {
 font-size: 15px;
 line-height: 1;

 &.is-female {
 color: #FF6B81;
 }
 }

 &__meta {
 font-size: 12px;
 color: $text-helper;
 display: block;
 margin-bottom: 6px;
 }

 &__badges {
 display: flex;
 gap: 4px;
 flex-wrap: wrap;
 }

 &__arrow {
 font-size: 14px;
 color: $text-helper;
 flex-shrink: 0;
 }
 }

 .badge {
 padding: 0 8px;
 font-size: 9px;
 color: #FFFFFF;
 border-radius: 3px;
 line-height: 1.8;

 &--real {
 background: linear-gradient(90deg, #2ED573, #1EBE60);
 }

 &--edu {
 background: linear-gradient(90deg, #4FACFE, #0099FF);
 }

 &--work {
 background: linear-gradient(90deg, #FFA726, #FB8C00);
 }
 }

 // ===== 缘分契合点 =====
 .apply-fate {
 display: flex;
 align-items: flex-start;
 gap: 6px;
 margin: 0 $page-padding-x 12px;
 padding: 10px 14px;
 border-radius: 10px;
 background: linear-gradient(135deg, rgba(255, 196, 160, 0.22), rgba(255, 154, 178, 0.12));
 border: 1px solid rgba(255, 160, 122, 0.35);

 &__icon {
 font-size: 13px;
 flex-shrink: 0;
 margin-top: 1px;
 }

 &__text {
 flex: 1;
 font-size: 12px;
 line-height: 1.5;
 color: #C2703F;
 }
 }

 // ===== 通用卡片 =====
 .apply-card {
 background-color: $bg-card;
 margin: 0 $page-padding-x 12px;
 padding: $spacing-lg;
 border-radius: $radius-card;
 box-shadow: $shadow-card;
 display: flex;
 flex-direction: column;

 &--success {
 align-items: center;
 }

 &__head {
 display: flex;
 align-items: center;
 justify-content: space-between;
 margin-bottom: 12px;
 }

 &__icon {
 font-size: 40px;
 margin-bottom: 8px;
 }

 &__title {
 font-size: $font-size-md;
 font-weight: $font-weight-medium;
 color: $text-primary;

 &--center {
 text-align: center;
 margin-bottom: 6px;
 }
 }

 &__desc {
 font-size: $font-size-sm;
 color: $text-helper;
 line-height: 1.6;

 &--center {
 text-align: center;
 margin-bottom: 18px;
 }
 }

 &__actions {
 display: flex;
 gap: 12px;
 margin-top: 18px;
 }

 &__btn {
 flex: 1;
 height: 44px;
 border-radius: 22px;
 font-size: $font-size-sm;
 font-weight: $font-weight-medium;
 border: none;

 &--primary {
 color: #FFFFFF;
 background: linear-gradient(90deg, $primary-color, #9DB48E);
 box-shadow: $shadow-btn;
 }

 &--ghost {
 color: $text-secondary;
 background-color: $bg-page;
 border: 1px solid $border-light;
 }

 &:active {
 opacity: 0.85;
 }
 }

 &__tip {
 margin-top: 12px;
 font-size: 11px;
 color: $text-helper;
 text-align: center;
 line-height: 1.5;
 }
 }

 // ===== 倒计时 =====
 .apply-countdown {
 display: flex;
 align-items: center;
 gap: 3px;
 padding: 3px 9px;
 border-radius: 10px;
 background-color: rgba(255, 167, 38, 0.12);

 &__icon {
 font-size: 10px;
 }

 &__text {
 font-size: 10px;
 color: #E08A00;
 }
 }

 // ===== 申请留言展示 =====
 .apply-message-view {
 margin-top: 12px;
 padding: 10px 12px;
 border-radius: 8px;
 background-color: $bg-page;

 &__label {
 display: block;
 font-size: 10px;
 color: $text-helper;
 margin-bottom: 4px;
 }

 &__text {
 font-size: 13px;
 color: $text-primary;
 line-height: 1.6;
 }
 }

 // ===== 微信号展示 =====
 .apply-wechat {
 display: flex;
 align-items: center;
 gap: 8px;
 width: 100%;
 padding: 12px 14px;
 margin-bottom: 10px;
 border-radius: 10px;
 background-color: $bg-page;

 &__label {
 font-size: 11px;
 color: $text-helper;
 flex-shrink: 0;
 }

 &__value {
 flex: 1;
 font-size: $font-size-sm;
 font-weight: $font-weight-medium;
 color: $text-primary;
 text-align: center;
 letter-spacing: 0.5px;
 }

 &__copy {
 padding: 3px 12px;
 font-size: 11px;
 color: $primary-color;
 background-color: $primary-light-bg;
 border: none;
 border-radius: 12px;
 line-height: 1.6;
 }
 }

 // ===== 安全兜底 =====
 .apply-safe {
 display: flex;
 align-items: flex-start;
 gap: 6px;
 width: 100%;
 margin-top: 6px;
 padding: 10px 12px;
 border-radius: 8px;
 background-color: rgba(46, 213, 115, 0.06);

 &__icon {
 font-size: 12px;
 flex-shrink: 0;
 }

 &__text {
 flex: 1;
 font-size: 11px;
 color: $text-helper;
 line-height: 1.5;
 }
 }

 // ===== 申请留言输入 =====
 .apply-message {
 background-color: $bg-card;
 margin: 0 $page-padding-x 12px;
 padding: $spacing-md;
 border-radius: $radius-card;
 box-shadow: $shadow-card;

 &__header {
 display: flex;
 align-items: center;
 justify-content: space-between;
 margin-bottom: 6px;
 }

 &__title {
 font-size: $font-size-sm;
 font-weight: $font-weight-medium;
 color: $text-primary;
 }

 &__count {
 font-size: 11px;
 color: $text-helper;
 }

 &__input {
 width: 100%;
 min-height: 48px;
 padding: 8px 12px;
 font-size: $font-size-sm;
 color: $text-primary;
 background-color: $bg-page;
 border-radius: $radius-sm;
 border: 1px solid $border-light;
 box-sizing: border-box;
 }

 &__hint {
 display: block;
 margin-top: 6px;
 font-size: 11px;
 color: $text-helper;
 }

 &__error {
 display: block;
 margin-top: 6px;
 font-size: 11px;
 color: #FF4757;
 line-height: 1.5;
 }
 }

 // ===== 规则说明 =====
 .apply-rules {
 margin: 0 $page-padding-x 16px;
 padding: 12px 14px;
 border-radius: 10px;
 background-color: rgba(255, 255, 255, 0.7);

 &__item {
 display: flex;
 align-items: flex-start;
 gap: 6px;
 margin-bottom: 6px;

 &:last-child {
 margin-bottom: 0;
 }
 }

 &__dot {
 font-size: 11px;
 color: $text-helper;
 line-height: 1.6;
 }

 &__text {
 flex: 1;
 font-size: 11px;
 color: $text-helper;
 line-height: 1.6;
 }
 }

 // ===== 未匹配 / 终态块 =====
 .apply-block {
 display: flex;
 flex-direction: column;
 align-items: center;
 margin: 0 $page-padding-x;
 padding: 36px 24px;
 background-color: $bg-card;
 border-radius: $radius-card;
 box-shadow: $shadow-card;
 text-align: center;

 &__icon {
 font-size: 40px;
 margin-bottom: 12px;
 }

 &__title {
 font-size: $font-size-md;
 font-weight: $font-weight-medium;
 color: $text-primary;
 margin-bottom: 6px;
 }

 &__desc {
 font-size: $font-size-sm;
 color: $text-helper;
 line-height: 1.6;
 margin-bottom: 18px;
 }

 &__btn {
 min-width: 160px;
 height: 42px;
 padding: 0 24px;
 border-radius: 21px;
 font-size: $font-size-sm;
 color: #FFFFFF;
 background: linear-gradient(90deg, $primary-color, #9DB48E);
 border: none;

 &--ghost {
 color: $text-secondary;
 background-color: $bg-page;
 border: 1px solid $border-light;
 }
 }
 }

 // ===== 底部 =====
 .apply-footer {
 flex-shrink: 0;
 padding: 10px $page-padding-x calc(10px + env(safe-area-inset-bottom));
 background-color: $bg-card;
 border-top: 1px solid $border-light;

 &__risk {
 display: flex;
 align-items: flex-start;
 gap: 6px;
 padding: 7px 12px;
 background-color: rgba(255, 71, 87, 0.06);
 border-radius: 8px;
 margin-bottom: 10px;

 &-icon {
 font-size: 12px;
 flex-shrink: 0;
 margin-top: 1px;
 }

 &-text {
 font-size: 11px;
 color: $text-helper;
 line-height: 1.5;
 }
 }

 &__btn {
 width: 100%;
 height: 46px;
 border-radius: 23px;
 background: linear-gradient(90deg, $primary-color, #9DB48E);
 color: #FFFFFF;
 font-size: $font-size-md;
 font-weight: $font-weight-medium;
 border: none;
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 6px;
 box-shadow: 0 4px 12px rgba(168, 184, 154, 0.35);

 &:active {
 opacity: 0.85;
 }

 .icon {
 font-size: 17px;
 }
 }
 }
</style>
