<template>
 <view v-if="visible" class="permission-overlay" @click="handleOverlay">
 <view class="permission-card" @click.stop>
 <!-- 左上角取消（实名引导弹窗规范：左上角取消）-->
 <view class="permission-card__close" @click="handleCancel">
 <text class="permission-card__close-icon icon icon-close"></text>
 </view>

 <view class="permission-card__icon">{{ iconText }}</view>

 <text class="permission-card__title">{{ title }}</text>
 <text class="permission-card__content">{{ content }}</text>

 <view class="permission-card__badge">
 <text class="icon icon-shield"></text>
 <text>实名核验・反诈保障</text>
 </view>

 <!-- 双选项：先关注 TA / 去实名认证（favorite 为兼容旧调用名，语义 = follow） -->
 <view v-if="isFollowMode" class="permission-card__actions">
 <button class="permission-card__btn permission-card__btn--ghost" @click="handleFollow">
 <text class="permission-card__btn-icon">{{ heartChar }}</text>
 {{ followText }}
 </button>
 <button class="permission-card__btn permission-card__btn--primary" @click="handleConfirm">
 {{ confirmText || '去实名认证' }}
 </button>
 </view>

 <!-- 单选项 -->
 <view v-else class="permission-card__actions">
 <button class="permission-card__btn permission-card__btn--primary" @click="handleConfirm">
 {{ confirmText || defaultConfirmText }}
 </button>
 </view>

 <text v-if="hint" class="permission-card__hint">{{ hint }}</text>
 </view>
 </view>
</template>

<script setup>
 import { computed } from 'vue'

 const props = defineProps({
 visible: { type: Boolean, default: false },
 // register | realname | favorite | follow（favorite 为旧名，行为同 follow）
 mode: { type: String, default: 'register' },
 title: { type: String, default: '' },
 content: { type: String, default: '' },
 confirmText: { type: String, default: '' },
 followText: { type: String, default: '先关注 TA' },
 hint: { type: String, default: '' },
 closeOnOverlay: { type: Boolean, default: false }
 })

 const emit = defineEmits(['confirm', 'favorite', 'follow', 'cancel', 'close'])

 const isFollowMode = computed(() => props.mode === 'favorite' || props.mode === 'follow')

 // 纯文本符号图标（强制文本渲染，不用彩色 emoji）
 const heartChar = '\u2665\uFE0E'
 const starChar = '\u2605\uFE0E'

 const iconText = computed(() => {
 if (props.mode === 'register') return starChar
 if (props.mode === 'realname') return heartChar
 if (isFollowMode.value) return heartChar
 return starChar
 })

 const defaultConfirmText = computed(() => {
 if (props.mode === 'realname') return '去实名认证'
 if (isFollowMode.value) return '去实名认证'
 return '一键授权手机号注册'
 })

 const handleOverlay = () => {
 if (props.closeOnOverlay) handleCancel()
 }

 const handleConfirm = () => emit('confirm')
 // 兼容旧事件名 favorite（现有页面均监听 @favorite），语义 = 关注；
 // 只发一个事件，避免页面同时监听两个事件名导致重复触发
 const handleFollow = () => emit('favorite')
 const handleCancel = () => {
 emit('cancel')
 emit('close')
 }
</script>

<style lang="scss" scoped>
 .permission-overlay {
 position: fixed;
 top: 0;
 right: 0;
 bottom: 0;
 left: 0;
 background-color: rgba(0, 0, 0, 0.42);
 display: flex;
 align-items: center;
 justify-content: center;
 padding: $spacing-lg;
 z-index: $z-index-modal;
 animation: permissionFade $duration-fast ease;
 }

 .permission-card {
 position: relative;
 width: 100%;
 max-width: 320px;
 padding: 32px $spacing-lg $spacing-lg;
 background-color: $bg-card;
 border-radius: $radius-card;
 box-shadow: $shadow-modal;
 text-align: center;
 animation: permissionPop $duration-base ease;

 &__close {
 position: absolute;
 top: 10px;
 left: 10px;
 width: 30px;
 height: 30px;
 display: flex;
 align-items: center;
 justify-content: center;
 color: $text-helper;
 }

 &__close-icon {
 font-size: 14px;
 }

 &__icon {
 font-size: 40px;
 line-height: 1;
 margin-bottom: $spacing-md;
 }

 &__title {
 display: block;
 font-size: $font-size-lg;
 font-weight: $font-weight-medium;
 color: $text-primary;
 margin-bottom: $spacing-sm;
 }

 &__content {
 display: block;
 font-size: $font-size-sm;
 line-height: 1.7;
 color: $text-secondary;
 padding: 0 $spacing-xs;
 }

 &__badge {
 display: inline-flex;
 align-items: center;
 gap: 4px;
 margin-top: $spacing-md;
 padding: 3px 12px;
 font-size: 11px;
 color: $color-success;
 background-color: $primary-light-bg;
 border-radius: 12px;
 }

 &__actions {
 margin-top: $spacing-lg;
 display: flex;
 flex-direction: column;
 gap: $spacing-sm;
 }

 &__btn {
 width: 100%;
 height: 46px;
 border: none;
 border-radius: $radius-btn;
 font-size: $font-size-btn;
 font-weight: $font-weight-medium;
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 6px;
 transition: transform $duration-fast ease;

 &:active {
 transform: scale(0.98);
 }

 &--primary {
 color: #FFFFFF;
 background: $primary-gradient;
 box-shadow: $shadow-btn;
 }

 &--ghost {
 color: $primary-color;
 background-color: $primary-light-bg;
 }
 }

 &__btn-icon {
 font-size: 14px;
 }

 &__hint {
 display: block;
 margin-top: $spacing-sm;
 font-size: $font-size-xs;
 color: $text-helper;
 }
 }

 @keyframes permissionFade {
 from { opacity: 0; }
 to { opacity: 1; }
 }

 @keyframes permissionPop {
 from {
 opacity: 0;
 transform: translateY(12px) scale(0.96);
 }
 to {
 opacity: 1;
 transform: translateY(0) scale(1);
 }
 }
</style>
