<template>
 <view class="anti-fraud-page">
 <CustomNavbar title="反诈专区" :show-back="true" @back="handleBack" />

 <!-- 顶部盾牌 -->
 <view class="anti-fraud-header">
 <view class="anti-fraud-header__icon"></view>
 <text class="anti-fraud-header__title">安全守护</text>
 <text class="anti-fraud-header__desc">平台提醒您：交友需谨慎，守好钱袋子</text>
 </view>

 <!-- 常见骗局 -->
 <view class="anti-fraud-section">
 <text class="anti-fraud-section__title"> 常见骗局</text>

 <view v-for="(fraud, index) in frauds"
 :key="index"
 class="anti-fraud-card">
 <view class="anti-fraud-card__icon">{{ fraud.icon }}</view>
 <view class="anti-fraud-card__body">
 <text class="anti-fraud-card__title">{{ fraud.title }}</text>
 <text class="anti-fraud-card__desc">{{ fraud.desc }}</text>
 <text class="anti-fraud-card__tag" :class="`anti-fraud-card__tag--${fraud.risk}`">
 {{ fraud.risk === 'high' ? '⚠ 高风险' : '⚠ 中风险' }}
 </text>
 </view>
 </view>
 </view>

 <!-- 防骗指南 -->
 <view class="anti-fraud-section">
 <text class="anti-fraud-section__title"> 防骗指南</text>

 <view v-for="(tip, index) in tips"
 :key="index"
 class="anti-fraud-tip">
 <view class="anti-fraud-tip__number">{{ index + 1 }}</view>
 <view class="anti-fraud-tip__body">
 <text class="anti-fraud-tip__title">{{ tip.title }}</text>
 <text class="anti-fraud-tip__desc">{{ tip.desc }}</text>
 </view>
 </view>
 </view>

 <!-- 维权通道 -->
 <view class="anti-fraud-section">
 <text class="anti-fraud-section__title"> 维权通道</text>

 <view class="anti-fraud-actions">
 <button class="anti-fraud-actions__btn" @click="handleReport">
 <text class="icon icon-flag" /> 立即举报
 </button>
 <button class="anti-fraud-actions__btn anti-fraud-actions__btn--primary" @click="handlePolice">
 <text class="icon icon-shield" /> 报警指引
 </button>
 </view>
 </view>
 </view>
</template>

<script setup>
 import CustomNavbar from '@/components/common/CustomNavbar.vue'

 const frauds = [
 {
 icon: '',
 title: '杀猪盘诈骗',
 desc: '伪装高富帅/白富美，建立感情后诱导投资、赌博',
 risk: 'high'
 },
 {
 icon: '',
 title: '诱导转账',
 desc: '以生病、急事、投资等理由要求转账汇款',
 risk: 'high'
 },
 {
 icon: '',
 title: '虚假身份',
 desc: '伪造身份信息、学历、工作，骗取信任',
 risk: 'medium'
 }
 ]

 const tips = [
 {
 title: '核实身份',
 desc: '优先选择已完成实名、学历、工作三重认证的用户'
 },
 {
 title: '拒绝转账',
 desc: '任何理由的转账要求都是诈骗，请立即举报'
 },
 {
 title: '线下见面',
 desc: '选择公共场所，告知亲友，保持警惕'
 },
 {
 title: '及时举报',
 desc: '发现可疑行为立即举报，平台会优先处理'
 }
 ]

 const handleBack = () => {
 uni.navigateBack()
 }

 const handleReport = () => {
 uni.navigateTo({ url: '/pages/common/report' })
 }

 const handlePolice = () => {
 uni.showModal({
 title: '报警指引',
 content: '如遇诈骗，请立即拨打 110 报警，并保留所有聊天记录、转账凭证等证据。',
 showCancel: false
 })
 }
</script>

<style lang="scss" scoped>
 @import '@/styles/variables.scss';

 .anti-fraud-page {
 min-height: 100vh;
 background-color: $bg-page;
 padding-bottom: $spacing-lg;
 }

 .anti-fraud-header {
 background: linear-gradient(135deg, $primary-color, $primary-dark);
 padding: $spacing-xl $page-padding-x;
 display: flex;
 flex-direction: column;
 align-items: center;
 margin: $spacing-sm $page-padding-x;
 border-radius: $radius-card;
 }

 .anti-fraud-header__icon {
 font-size: 48px;
 }

 .anti-fraud-header__title {
 font-size: $font-size-xl;
 font-weight: $font-weight-medium;
 color: #FFFFFF;
 margin-top: $spacing-sm;
 }

 .anti-fraud-header__desc {
 font-size: $font-size-sm;
 color: rgba(255, 255, 255, 0.9);
 margin-top: $spacing-xs;
 }

 .anti-fraud-section {
 background-color: $bg-card;
 margin: $spacing-sm $page-padding-x;
 border-radius: $radius-card;
 padding: $spacing-md;
 box-shadow: $shadow-card;
 }

 .anti-fraud-section__title {
 font-size: $font-size-md;
 font-weight: $font-weight-medium;
 color: $text-primary;
 display: block;
 margin-bottom: $spacing-sm;
 }

 .anti-fraud-card {
 display: flex;
 gap: $spacing-sm;
 padding: $spacing-sm 0;
 border-bottom: 1px solid $border-light;

 &:last-child {
 border-bottom: none;
 }
 }

 .anti-fraud-card__icon {
 font-size: 28px;
 flex-shrink: 0;
 }

 .anti-fraud-card__body {
 flex: 1;
 }

 .anti-fraud-card__title {
 font-size: $font-size-sm;
 font-weight: $font-weight-medium;
 color: $text-primary;
 display: block;
 }

 .anti-fraud-card__desc {
 font-size: $font-size-sm;
 color: $text-secondary;
 margin: 2px 0;
 display: block;
 }

 .anti-fraud-card__tag {
 font-size: $font-size-xs;
 display: inline-block;
 margin-top: $spacing-xs;

 &--high {
 color: $color-warning;
 }

 &--medium {
 color: $text-helper;
 }
 }

 .anti-fraud-tip {
 display: flex;
 gap: $spacing-sm;
 padding: $spacing-sm 0;
 border-bottom: 1px solid $border-light;

 &:last-child {
 border-bottom: none;
 }
 }

 .anti-fraud-tip__number {
 width: 28px;
 height: 28px;
 border-radius: 50%;
 background-color: $primary-light-bg;
 color: $primary-color;
 display: flex;
 align-items: center;
 justify-content: center;
 font-weight: $font-weight-medium;
 flex-shrink: 0;
 }

 .anti-fraud-tip__body {
 flex: 1;
 }

 .anti-fraud-tip__title {
 font-size: $font-size-sm;
 font-weight: $font-weight-medium;
 color: $text-primary;
 display: block;
 }

 .anti-fraud-tip__desc {
 font-size: $font-size-sm;
 color: $text-secondary;
 display: block;
 }

 .anti-fraud-actions {
 display: flex;
 gap: $spacing-sm;
 }

 .anti-fraud-actions__btn {
 flex: 1;
 height: 44px;
 border-radius: $radius-btn;
 font-size: $font-size-sm;
 font-weight: $font-weight-medium;
 border: none;
 background-color: $bg-page;
 color: $text-secondary;
 display: flex;
 align-items: center;
 justify-content: center;
 gap: $spacing-xs;

 &:active {
 transform: scale(0.98);
 }

 &--primary {
 background-color: $primary-color;
 color: #FFFFFF;
 }

 .icon {
 font-size: 16px;
 }
 }
</style>