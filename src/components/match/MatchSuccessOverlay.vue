<template>
 <view v-if="visible" class="match-success" :class="{ 'match-success--done': settled }">
 <!-- 暖粉渐变背景光斑 -->
 <view class="match-success__glow match-success__glow--a"></view>
 <view class="match-success__glow match-success__glow--b"></view>

 <!-- 跳过动效 / 关闭 -->
 <view class="match-success__skip" @click="handleSkip">
 <text class="match-success__skip-text">{{ settled ? '关闭' : '跳过' }}</text>
 </view>

 <!-- 头像碰撞 -->
 <view class="match-success__stage">
 <view class="match-success__avatar match-success__avatar--left">
 <image class="match-success__avatar-img" :src="meAvatar" mode="aspectFill" />
 </view>
 <view class="match-success__avatar match-success__avatar--right">
 <image class="match-success__avatar-img" :src="targetAvatar" mode="aspectFill" />
 </view>

 <!-- 碰撞闪光 + 粒子 -->
 <view class="match-success__burst">
 <view class="match-success__flash"></view>
 <view v-for="dot in particles"
 :key="dot.key"
 class="match-success__particle-wrap"
 :style="{ transform: `rotate(${dot.angle}deg)` }">
 <text class="match-success__particle"
 :style="{ fontSize: dot.size + 'px', animationDelay: dot.delay + 'ms' }">{{ dot.icon }}</text>
 </view>
 </view>
 </view>

 <!-- 文案区 -->
 <view class="match-success__body">
 <text class="match-success__title">恭喜，你们互相心动了</text>
 <text class="match-success__subtitle">{{ displayText }}</text>
 <text class="match-success__notice">平台不提供站内聊天，同意后互相展示微信号</text>

 <view v-if="tags.length" class="match-success__tags">
 <text class="match-success__tags-label">共同标签</text>
 <view class="match-success__tags-list">
 <text v-for="(tag, idx) in tags" :key="idx" class="match-success__tag">{{ tag }}</text>
 </view>
 </view>
 </view>

 <!-- 底部按钮：不提供站内聊天，匹配后直接申请交换微信 -->
 <view class="match-success__footer">
 <button class="match-success__btn match-success__btn--primary" @click="handleApply">
 申请交换微信
 </button>
 <view class="match-success__safe">
 <text class="match-success__safe-icon icon icon-shield"></text>
 <text class="match-success__safe-text">实名核验・反诈保障</text>
 </view>
 </view>
 </view>
</template>

<script setup>
 import { ref, computed, watch, onUnmounted } from 'vue'
 import { matchSuccessTexts } from '@/mock/copy'

 const props = defineProps({
 visible: { type: Boolean, default: false },
 meAvatar: { type: String, default: '' },
 targetAvatar: { type: String, default: '' },
 targetName: { type: String, default: '' },
 tags: { type: Array, default: () => [] }
 })

 const emit = defineEmits(['apply', 'close'])

 // 文档 3.4.1：动效时长 1.5s，页面提供【跳过】按钮
 const ANIMATION_DURATION = 1500

 const settled = ref(false)
 const text = ref(matchSuccessTexts[0])
 let timer = null

 // 随机三句正向文案之一
 const displayText = computed(() => text.value)

 // 金色星星粒子：角度 / 大小 / 延迟按下标确定，保证首帧稳定
 // 外层负责旋转方向，内层负责沿该方向迸发位移
 const particles = computed(() => {
 const icons = ['', '·', '', '•']
 return Array.from({ length: 14 }).map((_, i) => ({
 key: `p-${i}`,
 icon: icons[i % icons.length],
 angle: Math.round((360 / 14) * i),
 size: 10 + (i % 4) * 4,
 delay: (i % 6) * 40
 }))
 })

 const startTimer = () => {
 settled.value = false
 text.value = matchSuccessTexts[Math.floor(Math.random() * matchSuccessTexts.length)]
 clearTimeout(timer)
 timer = setTimeout(() => {
 settled.value = true
 }, ANIMATION_DURATION)
 }

 watch(
 () => props.visible,
 (visible) => {
 if (visible) {
 startTimer()
 // 动效期间轻微短震（无震动权限设备自动忽略）
 try {
 uni.vibrateShort({ type: 'medium' })
 } catch (e) {}
 } else {
 clearTimeout(timer)
 settled.value = false
 }
 }
 )

 onUnmounted(() => clearTimeout(timer))

 // 首次点击跳过动效，动效结束后作为关闭按钮
 const handleSkip = () => {
 clearTimeout(timer)
 if (settled.value) {
 emit('close')
 return
 }
 settled.value = true
 }

 const handleApply = () => {
 clearTimeout(timer)
 settled.value = true
 emit('apply')
 }
</script>

<style lang="scss" scoped>
 @import '@/styles/variables.scss';

 .match-success {
 position: fixed;
 top: 0;
 right: 0;
 bottom: 0;
 left: 0;
 z-index: 9998;
 display: flex;
 flex-direction: column;
 align-items: center;
 background: linear-gradient(160deg, #FFE8EE 0%, #FFF3F0 45%, #FFFFFF 100%);
 overflow: hidden;
 animation: msFadeIn 260ms ease;

 &__glow {
 position: absolute;
 border-radius: 50%;
 opacity: 0.55;

 &--a {
 top: -120px;
 left: -80px;
 width: 320px;
 height: 320px;
 background: radial-gradient(circle, rgba(255, 154, 178, 0.55), rgba(255, 154, 178, 0));
 animation: msFloat 6s ease-in-out infinite;
 }

 &--b {
 right: -100px;
 bottom: 120px;
 width: 280px;
 height: 280px;
 background: radial-gradient(circle, rgba(255, 196, 160, 0.5), rgba(255, 196, 160, 0));
 animation: msFloat 7s ease-in-out infinite reverse;
 }
 }

 &__skip {
 position: absolute;
 top: calc(16px + env(safe-area-inset-top));
 right: 16px;
 z-index: 20;
 padding: 6px 14px;
 border-radius: 14px;
 background-color: rgba(255, 255, 255, 0.7);

 &-text {
 font-size: 12px;
 color: $text-secondary;
 }
 }

 // ===== 头像碰撞舞台 =====
 &__stage {
 position: relative;
 width: 100%;
 height: 300px;
 margin-top: 96px;
 display: flex;
 align-items: center;
 justify-content: center;
 }

 &__avatar {
 position: absolute;
 width: 116px;
 height: 116px;
 border-radius: 50%;
 padding: 3px;
 background: linear-gradient(135deg, #FFFFFF, #FFD9E2);
 box-shadow: 0 12px 30px rgba(255, 107, 129, 0.28);

 &-img {
 width: 100%;
 height: 100%;
 border-radius: 50%;
 background-color: #F7F7F7;
 }

 &--left {
 left: calc(50% - 122px);
 animation: msSlideLeft 1500ms cubic-bezier(0.22, 1.2, 0.36, 1) forwards;
 }

 &--right {
 right: calc(50% - 122px);
 animation: msSlideRight 1500ms cubic-bezier(0.22, 1.2, 0.36, 1) forwards;
 }
 }

 &__burst {
 position: absolute;
 top: 50%;
 left: 50%;
 width: 0;
 height: 0;
 display: flex;
 align-items: center;
 justify-content: center;
 }

 &__flash {
 position: absolute;
 width: 160px;
 height: 160px;
 margin: -80px 0 0 -80px;
 border-radius: 50%;
 opacity: 0;
 background: radial-gradient(circle, rgba(255, 255, 255, 0.95), rgba(255, 214, 224, 0.6) 40%, rgba(255, 214, 224, 0));
 animation: msFlash 1500ms ease-out forwards;
 }

 &__particle-wrap {
 position: absolute;
 top: 0;
 left: 0;
 width: 0;
 height: 0;
 display: flex;
 align-items: center;
 justify-content: center;
 }

 &__particle {
 position: absolute;
 color: #FFC46B;
 line-height: 1;
 opacity: 0;
 animation: msBurst 1500ms ease-out forwards;
 }

 // ===== 文案 =====
 &__body {
 flex: 1;
 display: flex;
 flex-direction: column;
 align-items: center;
 padding: 0 32px;
 opacity: 0;
 transform: translateY(12px);
 }

 &--done &__body {
 animation: msRise 420ms ease forwards;
 }

 &__title {
 font-size: 22px;
 font-weight: 600;
 color: #E8446C;
 letter-spacing: 0.5px;
 margin-bottom: 10px;
 }

 &__subtitle {
 font-size: 14px;
 color: #8A6572;
 text-align: center;
 line-height: 1.6;
 }

 &__notice {
 margin-top: 8px;
 font-size: 11px;
 color: #B99AA6;
 text-align: center;
 }

 &__tags {
 margin-top: 22px;
 display: flex;
 flex-direction: column;
 align-items: center;

 &-label {
 font-size: 11px;
 color: #B99AA6;
 margin-bottom: 10px;
 letter-spacing: 1px;
 }

 &-list {
 display: flex;
 flex-wrap: wrap;
 justify-content: center;
 gap: 8px;
 }
 }

 &__tag {
 padding: 5px 14px;
 font-size: 12px;
 color: #E8446C;
 background-color: rgba(255, 255, 255, 0.85);
 border: 1px solid rgba(255, 154, 178, 0.5);
 border-radius: 14px;
 }

 // ===== 底部按钮 =====
 &__footer {
 width: 100%;
 padding: 0 32px calc(28px + env(safe-area-inset-bottom));
 display: flex;
 flex-direction: column;
 gap: 12px;
 opacity: 0;
 }

 &--done &__footer {
 animation: msRise 420ms 120ms ease forwards;
 }

 &__btn {
 width: 100%;
 height: 48px;
 border-radius: 24px;
 font-size: 15px;
 font-weight: 500;
 border: none;

 &--primary {
 color: #FFFFFF;
 background: linear-gradient(90deg, #FF8FA8, #FF6B81);
 box-shadow: 0 8px 20px rgba(255, 107, 129, 0.35);
 }

 &--ghost {
 color: #E8446C;
 background-color: rgba(255, 255, 255, 0.9);
 border: 1px solid rgba(255, 107, 129, 0.45);
 }

 &:active {
 transform: scale(0.98);
 }
 }

 &__safe {
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 4px;
 margin-top: 2px;

 &-icon {
 font-size: 12px;
 color: #B99AA6;
 }

 &-text {
 font-size: 11px;
 color: #B99AA6;
 }
 }
 }

 @keyframes msFadeIn {
 from { opacity: 0; }
 to { opacity: 1; }
 }

 @keyframes msFloat {
 0%, 100% { transform: translateY(0); }
 50% { transform: translateY(18px); }
 }

 // 从两侧滑入并在中间轻微碰撞回弹
 @keyframes msSlideLeft {
 0% { opacity: 0; transform: translateX(-300px) scale(0.85) rotate(-8deg); }
 60% { opacity: 1; transform: translateX(10px) scale(1.05) rotate(2deg); }
 76% { opacity: 1; transform: translateX(-4px) scale(0.98) rotate(0deg); }
 100% { opacity: 1; transform: translateX(0) scale(1) rotate(0deg); }
 }

 @keyframes msSlideRight {
 0% { opacity: 0; transform: translateX(300px) scale(0.85) rotate(8deg); }
 60% { opacity: 1; transform: translateX(-10px) scale(1.05) rotate(-2deg); }
 76% { opacity: 1; transform: translateX(4px) scale(0.98) rotate(0deg); }
 100% { opacity: 1; transform: translateX(0) scale(1) rotate(0deg); }
 }

 @keyframes msFlash {
 0%, 52% { opacity: 0; transform: scale(0.15); }
 64% { opacity: 0.95; transform: scale(1); }
 100% { opacity: 0; transform: scale(1.7); }
 }

 @keyframes msBurst {
 0%, 45% { opacity: 0; transform: translateY(0) scale(0.4); }
 60% { opacity: 1; transform: translateY(-46px) scale(1); }
 100% { opacity: 0; transform: translateY(-140px) scale(1); }
 }

 @keyframes msRise {
 from { opacity: 0; transform: translateY(12px); }
 to { opacity: 1; transform: translateY(0); }
 }
</style>
