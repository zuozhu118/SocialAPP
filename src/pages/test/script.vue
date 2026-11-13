<template>
 <view class="test-page">
 <!-- 导航栏 -->
 <view class="test-navbar">
 <text class="test-navbar__back icon icon-arrow-left" @click="goBack"></text>
 <text class="test-navbar__title">人生剧本测试</text>
 <text class="test-navbar__step">{{ currentQuestion + 1 }} / {{ questions.length }}</text>
 </view>

 <!-- 进度条 -->
 <view class="test-progress">
 <view class="test-progress__bar" :style="{ width: progressPercent + '%' }"></view>
 </view>

 <!-- 题目区（可滚动） -->
 <scroll-view class="test-content" scroll-y v-if="!isCompleted">
 <view class="test-question">
 <text class="test-question__number">Q{{ currentQuestion + 1 }}</text>
 <text class="test-question__text">{{ questions[currentQuestion].text }}</text>
 </view>

 <view class="test-options">
 <view v-for="(option, idx) in questions[currentQuestion].options"
 :key="idx"
 class="test-option"
 :class="{ 'test-option--selected': selectedOption === idx }"
 @click="selectOption(idx)">
 <view class="test-option__radio">
 <view v-if="selectedOption === idx" class="test-option__radio-inner"></view>
 </view>
 <text class="test-option__text">{{ option }}</text>
 </view>
 </view>
 </scroll-view>

 <!-- 结果页 -->
 <scroll-view class="test-result-scroll" scroll-y v-else>
 <view class="test-result">
 <view class="test-result__icon"></view>
 <text class="test-result__title">测试完成！</text>
 <text class="test-result__subtitle">你的专属人生剧本已生成</text>

 <view class="test-result__card">
 <view class="test-result__badge" :class="'badge--' + result.type">
 <text class="icon" :class="result.icon"></text>
 <text>{{ result.name }}</text>
 </view>
 <text class="test-result__desc">{{ result.desc }}</text>
 <view class="test-result__tags">
 <text v-for="tag in result.tags" :key="tag" class="test-result__tag">{{ tag }}</text>
 </view>
 </view>

 <view class="test-result__actions">
 <button class="test-result__btn test-result__btn--primary" @click="handleConfirm">确认并保存</button>
 <button class="test-result__btn test-result__btn--secondary" @click="handleRetest">重新测试</button>
 </view>

 <view class="test-result__tip">
 <text class="icon icon-lock"></text>
 <text>测试结果仅用于匹配推荐，不会对外公开</text>
 </view>
 </view>
 </scroll-view>

 <!-- 底部固定按钮 -->
 <view class="test-footer" v-if="!isCompleted">
 <view class="test-actions">
 <button class="test-actions__btn test-actions__btn--prev"
 v-if="currentQuestion > 0"
 @click="prevQuestion">
 上一题
 </button>
 <button class="test-actions__btn test-actions__btn--next"
 :disabled="selectedOption === null"
 @click="nextQuestion">
 {{ currentQuestion === questions.length - 1 ? '查看结果' : '下一题' }}
 </button>
 </view>
 </view>
 </view>
</template>

<script setup>
 import { ref, computed } from 'vue'

 const currentQuestion = ref(0)
 const selectedOption = ref(null)
 const answers = ref([])
 const isCompleted = ref(false)

 const questions = ref([
 {
 text: '周末你最享受的时光是？',
 options: [
 '在家看书、做饭，享受独处',
 '约朋友探店、逛街，感受热闹',
 '去户外爬山、徒步，亲近自然',
 '加班学习，提升自己'
 ]
 },
 {
 text: '你对未来的规划更偏向？',
 options: [
 '在熟悉的城市稳定发展，过安稳的小日子',
 '趁年轻多闯闯，去更大的平台发展',
 '随遇而安，享受当下的每一刻',
 '和伴侣一起规划，共同经营未来'
 ]
 },
 {
 text: '你如何看待婚姻和家庭？',
 options: [
 '家庭是生活的重心，愿意为家庭付出',
 '婚姻是人生的一部分，但不是全部',
 '希望找到灵魂伴侣，一起成长',
 '随缘，不强求'
 ]
 },
 {
 text: '你理想中的生活状态是？',
 options: [
 '朝九晚五，下班后有属于自己的时间',
 '有挑战性的工作，收入可观',
 '自由职业，时间和空间都自主',
 '和爱的人一起，去哪里都行'
 ]
 },
 {
 text: '面对压力时，你通常会？',
 options: [
 '一个人消化，用运动和阅读缓解',
 '找朋友倾诉，寻求安慰和建议',
 '化压力为动力，埋头工作',
 '出去走走，换个环境散心'
 ]
 },
 {
 text: '你对物质生活的态度是？',
 options: [
 '够用就好，不追求奢侈',
 '愿意为品质和体验买单',
 '努力赚钱，给自己和家人更好的生活',
 '随性，有钱多花没钱少花'
 ]
 },
 {
 text: '你更看重伴侣的什么特质？',
 options: [
 '情绪稳定，温柔体贴',
 '有上进心，事业有成',
 '有趣有聊，三观一致',
 '家庭观念强，孝顺父母'
 ]
 },
 {
 text: '你希望自己的老年生活是怎样的？',
 options: [
 '和老伴一起种种花、养养狗',
 '到处旅行，看世界各地的风景',
 '和儿孙住在一起，享受天伦之乐',
 '住在养老社区，有自己的社交圈'
 ]
 },
 {
 text: '你如何看待个人成长？',
 options: [
 '终身学习，不断精进自己',
 '在舒适区里持续深耕就好',
 '成长是自然而然的事，不用刻意',
 '需要有人一起，互相激励'
 ]
 },
 {
 text: '你最喜欢的情感状态是？',
 options: [
 '细水长流，平淡中见真情',
 '势均力敌，互相欣赏共同进步',
 '浪漫热烈，充满仪式感',
 '各自独立又彼此牵挂'
 ]
 }
 ])

 const progressPercent = computed(() => {
 return ((currentQuestion.value + 1) / questions.value.length) * 100
 })

 const result = ref({
 type: 'career',
 icon: 'icon-rocket',
 name: '事业进阶型',
 desc: '处于事业上升期，看重个人成长与职业发展，希望另一半能并肩同行，彼此支持共同变好。',
 tags: ['事业上升', '共同成长', '独立自律', '眼界开阔']
 })

 const selectOption = (index) => {
 selectedOption.value = index
 }

 const nextQuestion = () => {
 if (selectedOption.value === null) return

 answers.value.push(selectedOption.value)
 selectedOption.value = null

 if (currentQuestion.value === questions.value.length - 1) {
 calculateResult()
 isCompleted.value = true
 } else {
 currentQuestion.value++
 }
 }

 const prevQuestion = () => {
 if (currentQuestion.value > 0) {
 currentQuestion.value--
 const prevAnswer = answers.value.pop()
 selectedOption.value = prevAnswer !== undefined ? prevAnswer : null
 }
 }

 const calculateResult = () => {
 const types = [
 { type: 'career', icon: 'icon-rocket', name: '事业进阶型', desc: '处于事业上升期，看重个人成长与职业发展，希望另一半能并肩同行，彼此支持共同变好。', tags: ['事业上升', '共同成长', '独立自律', '眼界开阔'] },
 { type: 'stable', icon: 'icon-home', name: '安稳居家型', desc: '追求安稳踏实的生活，看重家庭与日常的幸福感，倾向于在熟悉的城市定居发展，经营自己的小日子。', tags: ['安稳踏实', '家庭优先', '细水长流', '重视陪伴'] },
 { type: 'romantic', icon: 'icon-heart', name: '浪漫体验型', desc: '热爱生活，喜欢探索世界，享受新鲜事物带来的快乐，希望和伴侣一起体验丰富多彩的人生。', tags: ['热爱生活', '探索精神', '仪式感强', '情感丰富'] },
 { type: 'free', icon: 'icon-wind', name: '自由独立型', desc: '崇尚自由与独立，有自己的节奏和追求，希望关系是锦上添花而非相互束缚，彼此尊重各自的空间。', tags: ['独立自由', '彼此尊重', '精神契合', '不将就'] }
 ]
 const idx = Math.floor(Math.random() * types.length)
 result.value = types[idx]
 }

 const goBack = () => {
 if (!isCompleted.value && answers.value.length > 0) {
 uni.showModal({
 title: '提示',
 content: '确定要退出吗？测试进度将丢失',
 success: (res) => {
 if (res.confirm) uni.navigateBack()
 }
 })
 } else {
 uni.navigateBack()
 }
 }

 const handleConfirm = () => {
 uni.showLoading({ title: '保存中...' })
 setTimeout(() => {
 uni.hideLoading()
 uni.showToast({ title: '保存成功', icon: 'success' })
 setTimeout(() => {
 uni.navigateBack()
 }, 500)
 }, 800)
 }

 const handleRetest = () => {
 uni.showModal({
 title: '重新测试',
 content: '重新测试将覆盖当前结果，确定要继续吗？',
 success: (res) => {
 if (res.confirm) {
 currentQuestion.value = 0
 selectedOption.value = null
 answers.value = []
 isCompleted.value = false
 }
 }
 })
 }
</script>

<style lang="scss" scoped>
 @import '@/styles/variables.scss';

 .test-page {
 min-height: 100vh;
 background: linear-gradient(180deg, #F6F7F5 0%, #FFFFFF 100%);
 display: flex;
 flex-direction: column;
 }

 .test-navbar {
 display: flex;
 align-items: center;
 justify-content: space-between;
 padding: 14px $page-padding-x;
 padding-top: calc(14px + env(safe-area-inset-top));
 background: rgba(255, 255, 255, 0.92);
 backdrop-filter: blur(10px);
 position: sticky;
 top: 0;
 z-index: 10;
 flex-shrink: 0;

 &__back {
 font-size: 20px;
 color: $text-primary;
 cursor: pointer;
 padding: 4px 8px;
 border-radius: 50%;

 &:active {
 background: rgba(0, 0, 0, 0.05);
 }
 }

 &__title {
 font-size: 17px;
 font-weight: 600;
 color: $text-primary;
 }

 &__step {
 font-size: 13px;
 color: $text-helper;
 font-weight: 500;
 }
 }

 .test-progress {
 padding: 0 $page-padding-x;
 margin: 4px 0 16px;
 flex-shrink: 0;

 &__bar {
 height: 3px;
 border-radius: 2px;
 background: linear-gradient(90deg, $primary-color, #9DB48E);
 transition: width 0.5s ease;
 }
 }

 .test-content {
 padding: 0 $page-padding-x;
 flex: 1;
 padding-bottom: 80px;
 }

 .test-question {

 &__number {
 display: inline-block;
 font-size: 12px;
 font-weight: 600;
 color: $primary-color;
 background: $primary-light-bg;
 padding: 2px 12px;
 border-radius: 12px;
 margin-bottom: 12px;
 }

 &__text {
 font-size: 18px;
 font-weight: 500;
 color: $text-primary;
 line-height: 1.6;
 }

 &__meta {
 display: block;
 text-align: right;
 font-size: 12px;
 color: $text-helper;
 margin-top: 6px;
 font-weight: 400;
 }
 }

 .test-options {
 display: flex;
 flex-direction: column;
 gap: 12px;
 margin-bottom: 20px;
 }

 .test-option {
 display: flex;
 align-items: center;
 gap: 14px;
 padding: 16px 18px;
 background: #FFFFFF;
 border: 1.5px solid $border-light;
 border-radius: 12px;
 cursor: pointer;
 transition: all 0.25s ease;

 &:active {
 transform: scale(0.98);
 }

 &--selected {
 border-color: $primary-color;
 background: $primary-light-bg;
 box-shadow: 0 2px 12px rgba(168, 184, 154, 0.15);
 }

 &__radio {
 width: 20px;
 height: 20px;
 border-radius: 50%;
 border: 2px solid $border-light;
 display: flex;
 align-items: center;
 justify-content: center;
 flex-shrink: 0;
 transition: all 0.25s ease;
 }

 &--selected &__radio {
 border-color: $primary-color;
 background: $primary-color;
 }

 &__radio-inner {
 width: 8px;
 height: 8px;
 border-radius: 50%;
 background: #FFFFFF;
 }

 &__text {
 font-size: 15px;
 color: $text-secondary;
 line-height: 1.5;
 }

 &--selected &__text {
 color: $text-primary;
 font-weight: 500;
 }
 }

 .test-footer {
 position: fixed;
 bottom: 0;
 left: 0;
 right: 0;
 padding: 12px $page-padding-x calc(12px + env(safe-area-inset-bottom));
 background: rgba(255, 255, 255, 0.95);
 backdrop-filter: blur(10px);
 border-top: 0.5px solid rgba(0, 0, 0, 0.04);
 z-index: 10;
 flex-shrink: 0;
 }

 .test-actions {
 display: flex;
 gap: 12px;

 &__btn {
 flex: 1;
 height: 48px;
 border-radius: 12px;
 font-size: 15px;
 font-weight: 500;
 border: none;

 &--prev {
 background: $bg-page;
 color: $text-secondary;
 flex: 0.5;

 &:active {
 background: $border-light;
 }
 }

 &--next {
 background: $primary-color;
 color: #FFFFFF;
 box-shadow: 0 2px 12px rgba(168, 184, 154, 0.3);

 &:active {
 transform: scale(0.97);
 }

 &:disabled {
 background: $disabled-bg;
 color: $text-helper;
 box-shadow: none;
 }
 }
 }
 }

 .test-result-scroll {
 flex: 1;
 padding: 0 $page-padding-x 30px;
 }

 .test-result {
 display: flex;
 flex-direction: column;
 align-items: center;
 padding: 20px 0 10px;

 &__icon {
 font-size: 56px;
 margin-bottom: 12px;
 }

 &__title {
 font-size: 24px;
 font-weight: 600;
 color: $text-primary;
 margin-bottom: 4px;
 }

 &__subtitle {
 font-size: 14px;
 color: $text-helper;
 margin-bottom: 28px;
 }

 &__card {
 width: 100%;
 background: #FFFFFF;
 border-radius: 16px;
 padding: 24px;
 box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
 margin-bottom: 28px;
 }

 &__badge {
 display: inline-flex;
 align-items: center;
 gap: 8px;
 padding: 6px 18px 6px 14px;
 border-radius: 20px;
 font-size: 15px;
 font-weight: 600;
 margin-bottom: 12px;

 .icon {
 font-size: 18px;
 }

 &.badge--career {
 color: #1976D2;
 background: rgba(25, 118, 210, 0.1);
 }

 &.badge--stable {
 color: #2E7D32;
 background: rgba(46, 125, 50, 0.1);
 }

 &.badge--romantic {
 color: #C62828;
 background: rgba(198, 40, 40, 0.08);
 }

 &.badge--free {
 color: #6A1B9A;
 background: rgba(106, 27, 154, 0.08);
 }
 }

 &__desc {
 font-size: 14px;
 color: $text-secondary;
 line-height: 1.7;
 display: block;
 margin-bottom: 14px;
 }

 &__tags {
 display: flex;
 gap: 8px;
 flex-wrap: wrap;
 }

 &__tag {
 padding: 4px 14px;
 font-size: 12px;
 color: $text-secondary;
 background: $bg-page;
 border-radius: 12px;
 }

 &__actions {
 width: 100%;
 display: flex;
 gap: 12px;
 margin-bottom: 20px;
 }

 &__btn {
 flex: 1;
 height: 48px;
 border-radius: 12px;
 font-size: 15px;
 font-weight: 500;
 border: none;

 &--primary {
 background: $primary-color;
 color: #FFFFFF;
 box-shadow: 0 2px 12px rgba(168, 184, 154, 0.3);

 &:active {
 transform: scale(0.97);
 }
 }

 &--secondary {
 background: $bg-page;
 color: $text-secondary;

 &:active {
 background: $border-light;
 }
 }
 }

 &__tip {
 display: flex;
 align-items: center;
 gap: 6px;
 font-size: 12px;
 color: $text-helper;

 .icon {
 font-size: 14px;
 }
 }
 }
</style>
