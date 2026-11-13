<template>
 <view v-if="visible" class="share-mask" @click="handleClose">
 <view class="share-sheet" @click.stop>
 <view class="share-sheet__bar"></view>

 <view class="share-sheet__head">
 <text class="share-sheet__title">{{ title }}</text>
 <text class="share-sheet__desc">{{ desc }}</text>
 </view>

 <!-- 邀请码 -->
 <view class="share-sheet__code" @click="copyCode">
 <text class="share-sheet__code-label">我的邀请码</text>
 <text class="share-sheet__code-value">{{ code }}</text>
 <text class="share-sheet__code-copy">复制</text>
 </view>

 <!-- 渠道 -->
 <view class="share-sheet__grid">
 <view class="share-sheet__item" @click="sendTo('friend')">
 <view class="share-sheet__icon share-sheet__icon--wechat">
 <text class="share-sheet__icon-text"></text>
 </view>
 <text class="share-sheet__item-text">微信好友</text>
 </view>
 <view class="share-sheet__item" @click="sendTo('timeline')">
 <view class="share-sheet__icon share-sheet__icon--timeline">
 <text class="share-sheet__icon-text"></text>
 </view>
 <text class="share-sheet__item-text">朋友圈</text>
 </view>
 <view class="share-sheet__item" @click="sendTo('link')">
 <view class="share-sheet__icon share-sheet__icon--link">
 <text class="share-sheet__icon-text"></text>
 </view>
 <text class="share-sheet__item-text">复制链接</text>
 </view>
 </view>

 <!-- 规则 -->
 <view class="share-sheet__rule">
 <text class="share-sheet__rule-text">
 好友通过你的链接注册并完成实名认证后，你们双方各得 {{ rewardLikes }} 次永久心动次数
 </text>
 </view>

 <view class="share-sheet__cancel" @click="handleClose">
 <text class="share-sheet__cancel-text">取消</text>
 </view>
 </view>
 </view>
</template>

<script setup>
 import { computed } from 'vue'
 import useInviteStore from '@/store/invite'
 import { INVITE_REWARD_LIKES } from '@/mock/invite'
 import { buildShareUrl } from '@/utils/share'

 const props = defineProps({
 visible: { type: Boolean, default: false },
 title: { type: String, default: '邀请好友一起遇见缘分' },
 desc: { type: String, default: '分享给微信好友或朋友圈' },
 // 分享落地后的目标页（可选，如 /pages/dynamic/detail?id=xx）
 target: { type: String, default: '' },
 targetTitle: { type: String, default: '' }
 })

 const emit = defineEmits(['close', 'share'])

 const inviteStore = useInviteStore()
 const code = computed(() => inviteStore.ensureCode())
 const rewardLikes = INVITE_REWARD_LIKES

 const handleClose = () => emit('close')

 const copyCode = () => {
 uni.setClipboardData({
 data: code.value,
 success: () => uni.showToast({ title: '邀请码已复制', icon: 'none' })
 })
 }

 const sendTo = (channel) => {
 inviteStore.logShare()
 const options = { target: props.target, title: props.targetTitle || props.title }
 const link = buildShareUrl(options)

 // #ifdef MP-WEIXIN
 if (channel === 'timeline') {
 uni.showToast({ title: '请点击右上角「···」→ 分享到朋友圈', icon: 'none' })
 } else {
 uni.showToast({ title: '请点击右上角「···」→ 转发给朋友', icon: 'none' })
 }
 // #endif

 // #ifndef MP-WEIXIN
 uni.setClipboardData({
 data: link,
 success: () => {
 uni.showToast({
 title: channel === 'timeline' ? '链接已复制，去朋友圈粘贴' : '链接已复制，去微信粘贴给好友',
 icon: 'none'
 })
 }
 })
 // #endif

 emit('share', { channel, link })
 emit('close')
 }
</script>

<style lang="scss" scoped>
 @import '@/styles/variables.scss';
 @import '@/styles/mixins.scss';

 .share-mask {
 position: fixed;
 top: 0;
 right: 0;
 bottom: 0;
 left: 0;
 background-color: rgba(0, 0, 0, 0.45);
 z-index: $z-index-modal;
 display: flex;
 align-items: flex-end;
 }

 .share-sheet {
 width: 100%;
 background-color: $bg-card;
 border-radius: $radius-card $radius-card 0 0;
 padding: 8px $page-padding-x calc(12px + env(safe-area-inset-bottom));
 box-shadow: $shadow-popup;
 animation: sheetUp $duration-base ease-out both;

 &__bar {
 width: 36px;
 height: 4px;
 border-radius: 2px;
 background-color: $border-light;
 margin: 4px auto 12px;
 }

 &__head {
 padding: 0 4px 12px;
 }

 &__title {
 display: block;
 font-size: $font-size-md;
 font-weight: $font-weight-medium;
 color: $text-primary;
 margin-bottom: 4px;
 }

 &__desc {
 display: block;
 font-size: $font-size-xs;
 color: $text-helper;
 }

 &__code {
 display: flex;
 align-items: center;
 gap: 8px;
 padding: 10px 12px;
 background-color: $primary-light-bg;
 border-radius: $radius-sm;
 margin-bottom: 14px;
 }

 &__code-label {
 font-size: $font-size-xs;
 color: $text-helper;
 }

 &__code-value {
 flex: 1;
 font-size: $font-size-sm;
 font-weight: $font-weight-bold;
 color: $primary-dark;
 letter-spacing: 1px;
 }

 &__code-copy {
 font-size: $font-size-xs;
 color: $primary-color;
 padding: 2px 8px;
 border: 1px solid $primary-color;
 border-radius: 10px;
 }

 &__grid {
 display: flex;
 align-items: center;
 padding: 4px 0 14px;
 }

 &__item {
 flex: 1;
 display: flex;
 flex-direction: column;
 align-items: center;
 gap: 6px;

 &:active {
 opacity: 0.7;
 }
 }

 &__icon {
 width: 48px;
 height: 48px;
 border-radius: 50%;
 display: flex;
 align-items: center;
 justify-content: center;

 &--wechat {
 background-color: #E8F7EC;
 }

 &--timeline {
 background-color: #FFF3E0;
 }

 &--link {
 background-color: #EEF2FB;
 }
 }

 &__icon-text {
 font-size: 22px;
 }

 &__item-text {
 font-size: $font-size-xs;
 color: $text-secondary;
 }

 &__rule {
 padding: 10px 12px;
 background-color: $bg-page;
 border-radius: $radius-sm;
 margin-bottom: 10px;
 }

 &__rule-text {
 font-size: 11px;
 line-height: 1.6;
 color: $text-helper;
 }

 &__cancel {
 height: 44px;
 display: flex;
 align-items: center;
 justify-content: center;
 border-top: 1px solid $border-light;

 &:active {
 opacity: 0.6;
 }
 }

 &__cancel-text {
 font-size: $font-size-sm;
 color: $text-secondary;
 }
 }

 @keyframes sheetUp {
 from {
 transform: translateY(100%);
 }

 to {
 transform: translateY(0);
 }
 }
</style>
