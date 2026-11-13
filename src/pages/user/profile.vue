<template>
 <view class="profile-page" @scroll="onPageScroll">
 <!-- 顶部封面（完整显示，底部毛玻璃过渡） -->
 <view class="cover-section">
 <image class="cover-section__image" :src="userInfo.coverImage" mode="aspectFill" />
 <view class="cover-section__glass"></view>
 </view>

 <!-- ===== 用户信息（在图片下方） ===== -->
 <view class="user-info-section">
 <view class="user-info__avatar-wrap">
 <image class="user-info__avatar" :src="userInfo.userAvatar" mode="aspectFill" />
 <view class="avatar-auth-badge" v-if="userInfo.auth.realName">
 <text class="icon icon-check"></text>
 </view>
 </view>
 <view class="user-info__detail">
 <view class="user-info__name-row">
 <text class="user-info__name">{{ userInfo.userName }}</text>
 <text class="user-info__gender" :class="userInfo.gender === 'female' ? 'is-female' : 'is-male'">
 {{ userInfo.gender === 'female' ? '♀' : '♂' }}
 </text>
 <text v-if="isFollowingTarget" class="user-info__tag user-info__tag--followed">{{ actionLabels.followed }}</text>
 <text v-else-if="isMutualTarget" class="user-info__tag user-info__tag--mutual">双向心动</text>
 </view>
 <view class="user-info__meta">
 <text>{{ userInfo.age }}岁</text>
 <text class="dot">·</text>
 <text>{{ userInfo.city }}</text>
 <text class="dot">·</text>
 <text>{{ userInfo.career }}</text>
 </view>
 </view>
 </view>

 <!-- ===== 认证部分（轻量标签，仅展示） ===== -->
 <view class="auth-section">
 <view class="auth-item" :class="userInfo.auth.realName ? 'is-active' : 'is-inactive'">
 <text class="auth-item__icon">{{ userInfo.auth.realName ? '✓' : '○' }}</text>
 <text class="auth-item__label">身份认证</text>
 </view>
 <view class="auth-item" :class="userInfo.auth.education ? 'is-active' : 'is-inactive'">
 <text class="auth-item__icon">{{ userInfo.auth.education ? '✓' : '○' }}</text>
 <text class="auth-item__label">学历认证</text>
 </view>
 <view class="auth-item" :class="userInfo.auth.work ? 'is-active' : 'is-inactive'">
 <text class="auth-item__icon">{{ userInfo.auth.work ? '✓' : '○' }}</text>
 <text class="auth-item__label">单位认证</text>
 </view>
 </view>

 <!-- ===== 个人简介 ===== -->
 <view class="bio-section" v-if="userInfo.bio">
 <text class="bio-section__text">{{ userInfo.bio }}</text>
 </view>

 <!-- ===== 标签云 ===== -->
 <view class="tags-section">
 <view class="tags-group" v-if="userInfo.hobbyTags.length">
 <text class="tags-group__label"> 兴趣爱好</text>
 <view class="tags-group__list">
 <text v-for="tag in userInfo.hobbyTags" :key="tag" class="tag tag--hobby">{{ tag }}</text>
 </view>
 </view>
 <view class="tags-group" v-if="userInfo.personalityTags.length">
 <text class="tags-group__label"> 性格特质</text>
 <view class="tags-group__list">
 <text v-for="tag in userInfo.personalityTags" :key="tag" class="tag tag--personality">{{ tag }}</text>
 </view>
 </view>
 <view class="tags-group" v-if="userInfo.weekendTags && userInfo.weekendTags.length">
 <text class="tags-group__label"> 周末日常</text>
 <view class="tags-group__list">
 <text v-for="tag in userInfo.weekendTags" :key="tag" class="tag tag--weekend">{{ tag }}</text>
 </view>
 </view>
 </view>

 <!-- ===== 详细资料卡片 ===== -->
 <view class="detail-card">
 <view class="detail-card__title"> 详细资料</view>
 <view class="detail-card__grid">
 <view class="detail-item">
 <text class="detail-item__label">身高</text>
 <text class="detail-item__value">{{ userInfo.profile.height }} cm</text>
 </view>
 <view class="detail-item">
 <text class="detail-item__label">体重</text>
 <text class="detail-item__value">{{ userInfo.profile.weight }} kg</text>
 </view>
 <view class="detail-item">
 <text class="detail-item__label">学历</text>
 <text class="detail-item__value">{{ userInfo.profile.education }}</text>
 </view>
 <view class="detail-item">
 <text class="detail-item__label">职业</text>
 <text class="detail-item__value">{{ userInfo.profile.career }}</text>
 </view>
 <view class="detail-item">
 <text class="detail-item__label">籍贯</text>
 <text class="detail-item__value">{{ userInfo.profile.hometown }}</text>
 </view>
 <view class="detail-item">
 <text class="detail-item__label">婚姻状况</text>
 <text class="detail-item__value">{{ userInfo.profile.maritalStatus }}</text>
 </view>
 <view class="detail-item">
 <text class="detail-item__label">年收入</text>
 <text class="detail-item__value">{{ userInfo.profile.income }}</text>
 </view>
 <view class="detail-item">
 <text class="detail-item__label">房产</text>
 <text class="detail-item__value">{{ userInfo.profile.house || '无房' }}</text>
 </view>
 <view class="detail-item">
 <text class="detail-item__label">车辆</text>
 <text class="detail-item__value">{{ userInfo.profile.car || '无车' }}</text>
 </view>
 </view>
 </view>

 <!-- ===== 人生剧本 ===== -->
 <view class="script-card" v-if="userInfo.lifeScript">
 <view class="script-card__header">
 <view class="script-card__title-wrap">
 <text class="script-card__title"> 人生剧本</text>
 <text class="script-card__badge" :class="'badge--' + getScriptType(userInfo.lifeScript.name)">
 {{ userInfo.lifeScript.name }}
 </text>
 </view>
 <text class="script-card__entry" @click="goToScriptTest">
 测测我的 >
 </text>
 </view>
 <text class="script-card__desc">{{ userInfo.lifeScript.desc }}</text>
 <view class="script-card__tags">
 <text v-for="tag in userInfo.lifeScript.tags" :key="tag" class="script-tag">{{ tag }}</text>
 </view>
 </view>

 <!-- ===== 三观态度 ===== -->
 <view class="values-card" v-if="userInfo.values">
 <view class="values-card__header">
 <text class="values-card__title"> 三观态度</text>
 <text class="values-card__entry" @click="goToValuesTest">
 测契合度 >
 </text>
 </view>
 <view class="values-card__list">
 <view class="value-item">
 <text class="value-item__label">恋爱观</text>
 <text class="value-item__text">{{ userInfo.values.love }}</text>
 </view>
 <view class="value-item">
 <text class="value-item__label">消费观</text>
 <text class="value-item__text">{{ userInfo.values.consume }}</text>
 </view>
 <view class="value-item">
 <text class="value-item__label">生活观</text>
 <text class="value-item__text">{{ userInfo.values.life }}</text>
 </view>
 </view>
 </view>

 <!-- ===== 期待的另一半 ===== -->
 <view class="expect-card">
 <view class="expect-card__title"> 期待的另一半</view>
 <view class="expect-card__tags">
 <text v-for="tag in userInfo.expectTags" :key="tag" class="expect-tag">{{ tag }}</text>
 </view>
 </view>

 <!-- ===== Ta的相册 ===== -->
 <view class="album-card" v-if="userInfo.album.length">
 <view class="album-card__header">
 <text class="album-card__title"> Ta的相册</text>
 <text class="album-card__count">共 {{ userInfo.album.length }} 张</text>
 </view>
 <view class="album-card__grid">
 <image v-for="(img, idx) in userInfo.album.slice(0, 6)"
 :key="idx"
 class="album-card__item"
 :src="img"
 mode="aspectFill"
 @click="previewAlbum(idx)" />
 <view v-if="userInfo.album.length > 6" class="album-card__more" @click="viewAllAlbum">
 <text>+{{ userInfo.album.length - 6 }}</text>
 </view>
 </view>
 </view>

 <!-- ===== Ta的动态（精选） ===== -->
 <view class="post-card" v-if="userPosts.length">
 <view class="post-card__header">
 <text class="post-card__title"> Ta的动态</text>
 <text class="post-card__more" @click="viewAllPosts">查看全部 ></text>
 </view>
 <view class="post-card__grid">
 <view class="post-item" v-for="post in userPosts.slice(0, 4)" :key="post.id" @click="goToPostDetail(post.id)">
 <image class="post-item__image" :src="post.images[0]" mode="aspectFill" />
 <view class="post-item__overlay">
 <view class="post-item__stats">
 <text class="icon icon-heart"></text>
 <text>{{ post.likes }}</text>
 </view>
 <view v-if="post.isQuality" class="post-item__badge">优质</view>
 </view>
 </view>
 </view>
 </view>

 <!-- ===== 底部信息栏：IP + 举报拉黑 ===== -->
 <view class="profile-footer">
 <text class="profile-footer__ip">IP属地：{{ userInfo.ipLocation || '未知' }}</text>
 <view class="profile-footer__ops">
 <text class="profile-footer__link" @click="openShare">分享</text>
 <text class="profile-footer__split">·</text>
 <text class="profile-footer__link" @click="handleReport">举报</text>
 <text class="profile-footer__split">·</text>
 <text class="profile-footer__link" @click="handleBlock">拉黑</text>
 </view>
 </view>

 <!-- ===== 底部占位 ===== -->
 <view class="bottom-placeholder"></view>

 <!-- ===== 底部固定操作栏：双线分工（关注线常驻 + 心动线主按钮，不展示剩余次数） ===== -->
 <view v-if="targetId" class="profile-actionbar">
 <!-- 关注线：常驻次级小按钮，位置语义永远不变（☆ 关注 / ★ 已关注） -->
 <button class="profile-actionbar__btn profile-actionbar__btn--follow"
 :class="{ 'is-active': isFollowingTarget }"
 @click="handleFollowToggle">
 <text class="icon" :class="isFollowingTarget ? 'icon-follow-filled' : 'icon-follow'"></text>
 {{ isFollowingTarget ? actionLabels.followed : actionLabels.follow }}
 </button>
 <!-- 心动线主按钮：双向心动解锁交换微信 -->
 <button v-if="actionState === 'wechat'"
 class="profile-actionbar__btn profile-actionbar__btn--wechat"
 @click="handleWechat">
 <text class="icon icon-wechat"></text>
 交换微信
 </button>
 <!-- 有心动额度：发送心动 -->
 <button v-else-if="actionState === 'heart'"
 class="profile-actionbar__btn profile-actionbar__btn--heart"
 @click="handleHeart">
 <text class="icon icon-heart"></text>
 发送心动
 </button>
 <!-- 已发出心动，等对方回应（终态弱化） -->
 <button v-else-if="actionState === 'hearted'"
 class="profile-actionbar__btn profile-actionbar__btn--hearted" disabled>
 <text class="icon icon-heart-filled"></text>
 {{ actionLabels.hearted }}
 </button>
 <!-- 心动额度用完：变灰只说明天，关注线仍可用 -->
 <button v-else
 class="profile-actionbar__btn profile-actionbar__btn--quota-out" disabled>
 <text class="icon icon-heart"></text>
 {{ businessCopy.heartTomorrow }}
 </button>
 </view>

 <!-- 心动二次确认（不展示剩余次数） -->
 <CustomModal :visible="showLikeConfirm"
 title="确认发送心动"
 confirm-text="发送心动"
 cancel-text="再想想"
 size="small"
 @confirm="confirmLike"
 @cancel="showLikeConfirm = false"
 @close="showLikeConfirm = false">
 <view class="like-confirm">
 <text class="like-confirm__target">向 {{ userInfo.userName }} 发送心动</text>
 <text class="like-confirm__tip">双方互相心动后即可申请交换微信</text>
 </view>
 </CustomModal>

 <!-- 权限引导弹窗（注册 / 实名） -->
 <PermissionModal :visible="showPermission"
 :mode="permissionPayload.mode"
 :title="permissionPayload.title"
 :content="permissionPayload.content"
 :confirm-text="permissionPayload.confirmText"
 @confirm="handlePermissionConfirm"
 @close="showPermission = false" />

 <!-- ===== 3.8 裂变分享 ===== -->
 <ShareSheet :visible="shareVisible"
 title="分享 TA 的主页"
 desc="好友通过你的链接注册并实名后，双方各得永久心动"
 :target="shareTarget"
 :target-title="shareTitle"
 @close="shareVisible = false" />
 </view>
</template>

<script setup>
 import { ref, computed, onMounted } from 'vue'
 import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
 import CustomModal from '@/components/common/CustomModal.vue'
 import PermissionModal from '@/components/common/PermissionModal.vue'
 import ShareSheet from '@/components/common/ShareSheet.vue'
 import { buildSharePath, buildShareQuery } from '@/utils/share'
 import { useUserStore, useEquityStore, useMatchStore, useSocialStore } from '@/store/index'
 import { usePermission } from '@/composables/usePermission'
 import { findUserById } from '@/mock/users'
 import { businessCopy, actionLabels } from '@/mock/copy'

 // ===== Store / 权限 =====
 const userStore = useUserStore()
 const equity = useEquityStore()
 const matchStore = useMatchStore()
 const socialStore = useSocialStore()
 const { guard } = usePermission()

 // 剧本类型映射
 const getScriptType = (name) => {
 if (name.includes('事业')) return 'career'
 if (name.includes('稳定')) return 'stable'
 if (name.includes('浪漫')) return 'romantic'
 if (name.includes('自由')) return 'free'
 return 'career'
 }
 // 用户详情数据
 const userInfo = ref({
 userId: '10086520',
 userName: '陈橘子',
 gender: 'female',
 age: 26,
 city: '北京',
 district: '浦东新区',
 career: '财务',
 userAvatar: 'https://picsum.photos/200/200?random=11',
 coverImage: 'https://picsum.photos/800/450?random=102',
 ipLocation: '上海市',
 auth: { realName: true, education: true, work: true },
 bio: '理性与浪漫各一半，喜欢有质感的生活。周末喜欢瑜伽和探店，希望遇到同频的人。',

 // 个人资料
 profile: {
 birthYear: '98',
 constellation: '双子座',
 height: 168,
 weight: 50,
 education: '研究生',
 career: '金融分析师',
 hometown: '杭州',
 maritalStatus: '未婚',
 income: '20-30W',
 house: '无房',
 car: '无车',
 lifeTags: ['无车', '无房', '不吸烟', '偶尔喝酒']
 },

 hobbyTags: ['瑜伽', '阅读', '音乐', '理财', '咖啡探店'],
 personalityTags: ['独立', '理性', '自律', '目标感强'],
 weekendTags: ['探店美食', '宅家追剧', '看书学习', '运动健身'],

 lifeScript: {
 name: '事业进阶型',
 desc: '处于事业上升期，看重个人成长与职业发展，希望另一半能并肩同行，彼此支持共同变好。',
 tags: ['事业上升', '共同成长', '独立自律', '眼界开阔']
 },
 values: {
 love: '势均力敌的爱情，彼此欣赏互相扶持，不依附不将就',
 consume: '看重品质不看数量，愿意为体验和自我提升投资',
 life: '工作时全力以赴，生活时尽情享受，保持成长节奏'
 },
 expectTags: ['24-32岁', '未婚', '175cm+', '本科及以上', '上进自律', '情绪稳定'],

 // 相册
 album: [
 'https://picsum.photos/400/400?random=31',
 'https://picsum.photos/400/400?random=32',
 'https://picsum.photos/400/400?random=33',
 'https://picsum.photos/400/400?random=34',
 'https://picsum.photos/400/400?random=35',
 'https://picsum.photos/400/400?random=36',
 'https://picsum.photos/400/400?random=37',
 'https://picsum.photos/400/400?random=38'
 ]
 })

 // 用户动态列表
 const userPosts = ref([
 { id: 1, images: ['https://picsum.photos/300/300?random=21'], likes: 45, isQuality: true },
 { id: 2, images: ['https://picsum.photos/300/300?random=22'], likes: 32, isQuality: false },
 { id: 3, images: ['https://picsum.photos/300/300?random=23'], likes: 67, isQuality: true },
 { id: 4, images: ['https://picsum.photos/300/300?random=24'], likes: 28, isQuality: false },
 { id: 5, images: ['https://picsum.photos/300/300?random=25'], likes: 89, isQuality: true },
 { id: 6, images: ['https://picsum.photos/300/300?random=26'], likes: 19, isQuality: false }
 ])

 // 页面滚动监听
 const onPageScroll = (e) => {
 // 可用于吸顶等效果
 }

 // ===== 路由参数：按 userId / id 补全身份（分享链接、列表页跳转共用） =====
 const targetId = ref(null)

 onLoad((query = {}) => {
 const id = Number(query.userId || query.id || 0)
 if (!id) return
 const source = findUserById(id)
 if (!source) return
 targetId.value = id
 Object.assign(userInfo.value, {
 userId: String(source.id),
 userName: source.name,
 gender: source.gender,
 age: source.age,
 city: (source.ipLocation || '').replace('市', ''),
 district: source.district,
 career: source.occupation || source.career,
 userAvatar: source.avatar,
 ipLocation: source.ipLocation,
 auth: { ...source.auth },
 bio: source.bio,
 profile: {
 ...userInfo.value.profile,
 height: source.height,
 weight: source.weight,
 education: source.education,
 career: source.career,
 hometown: source.hometown,
 maritalStatus: source.maritalStatus,
 income: source.income
 },
 hobbyTags: source.hobbyTags || [],
 personalityTags: source.personalityTags || [],
 weekendTags: source.weekendTags || [],
 lifeScript: source.lifeScript,
 values: source.values,
 expectTags: source.expectTags || [],
 album: source.album || []
 })
 // 恢复社交关系并记录真实主页浏览（3.9 今日来访的唯一口径）
 socialStore.restore()
 socialStore.markViewed(id)
 })

 // ===== 关系状态（关注线 / 心动线，数据全部来自 store）=====
 const isFollowingTarget = computed(() => !!targetId.value && userStore.isFollowing(targetId.value))
 const isMutualTarget = computed(() => !!targetId.value && socialStore.isMutual(targetId.value))
 const isHeartedTarget = computed(() => !!targetId.value && socialStore.hasHeart(targetId.value))

 // 心动线主按钮状态：双向心动 > 已心动 > 有额度 > 额度用完
 const actionState = computed(() => {
 if (!targetId.value) return 'hidden'
 if (isMutualTarget.value) return 'wechat'
 if (isHeartedTarget.value) return 'hearted'
 if (equity.totalLikeAvailable > 0) return 'heart'
 return 'quota-out'
 })

 // ===== 权限弹窗控制 =====
 const showPermission = ref(false)
 const permissionPayload = ref({ mode: 'register', title: '', content: '', confirmText: '' })

 const openPermission = (payload) => {
 permissionPayload.value = { ...payload }
 showPermission.value = true
 }

 const handlePermissionConfirm = () => {
 const mode = permissionPayload.value.mode
 showPermission.value = false
 if (mode === 'register') {
 uni.navigateTo({ url: '/pages/auth/login' })
 return
 }
 uni.navigateTo({ url: '/pages/auth/realname' })
 }

 // ===== 关注线：来回切换（0 成本，不占心动额度）=====
 const handleFollowToggle = () => {
 if (!targetId.value) return
 const { allowed, modal } = guard('followUser')
 if (!allowed) {
 openPermission(modal)
 return
 }
 const result = userStore.toggleFollow({
 id: targetId.value,
 name: userInfo.value.userName,
 avatar: userInfo.value.userAvatar,
 age: userInfo.value.age,
 district: userInfo.value.district,
 occupation: userInfo.value.career
 })
 if (result.ok) {
 uni.showToast({
 title: result.following ? businessCopy.followSuccess : businessCopy.unfollowSuccess,
 icon: 'none'
 })
 }
 }

 // ===== 心动线：权限校验 -> 二次确认 -> 扣额度（不展示剩余次数）=====
 const showLikeConfirm = ref(false)

 const handleHeart = () => {
 if (!targetId.value) return
 const { allowed, modal } = guard('likeUser')
 if (!allowed) {
 openPermission(modal)
 return
 }
 // 额度兜底（正常情况下按钮已置灰，不会走到这里）
 if (equity.totalLikeAvailable <= 0) {
 uni.showToast({ title: businessCopy.heartExhaustedGuide, icon: 'none' })
 return
 }
 showLikeConfirm.value = true
 }

 const confirmLike = () => {
 showLikeConfirm.value = false
 if (!targetId.value) return
 const result = equity.consumeLike()
 if (!result.ok) {
 uni.showToast({ title: businessCopy.heartExhaustedGuide, icon: 'none' })
 return
 }
 socialStore.addHeart(targetId.value)
 // 对方也心动 -> 建立双向匹配并打通交换微信（mock 模拟）
 if (Math.random() < 0.3) {
 socialStore.setMutual(targetId.value)
 matchStore.createMatch(targetId.value)
 uni.showToast({ title: '你们互相心动了，可以交换微信了', icon: 'none' })
 } else {
 uni.showToast({ title: businessCopy.heartSent, icon: 'none' })
 }
 }

 // ===== 交换微信（双向心动后的唯一出口，不提供站内聊天）=====
 const handleWechat = () => {
 if (!targetId.value) return
 const { allowed, modal } = guard('applyWechat')
 if (!allowed) {
 openPermission(modal)
 return
 }
 uni.navigateTo({ url: `/pages/match/apply?userId=${targetId.value}&type=apply` })
 }

 // 跳转人生剧本测试
 const goToScriptTest = () => {
 uni.navigateTo({ url: '/pages/test/script' })
 }

 // 跳转三观态度测试
 const goToValuesTest = () => {
 uni.navigateTo({ url: '/pages/test/values' })
 }

 // 跳转动态详情
 const goToPostDetail = (id) => {
 uni.navigateTo({ url: `/pages/dynamic/detail?id=${id}` })
 }

 // 查看全部动态
 const viewAllPosts = () => {
 uni.showToast({ title: '查看全部动态', icon: 'none' })
 }

 // 相册预览
 const previewAlbum = (index) => {
 uni.previewImage({
 urls: userInfo.value.album,
 current: index
 })
 }

 const viewAllAlbum = () => {
 uni.showToast({ title: '查看完整相册', icon: 'none' })
 }

 // 举报
 const handleReport = () => {
 uni.navigateTo({ url: '/pages/common/report' })
 }

 // ===== 3.8 分享主页（微信好友 / 朋友圈）=====
 const shareVisible = ref(false)
 const shareTarget = ref('')
 const shareTitle = ref('')

 const openShare = () => {
 shareTarget.value = `/pages/user/profile?userId=${userInfo.value.userId}`
 shareTitle.value = `${userInfo.value.userName} 的同城主页`
 shareVisible.value = true
 }

 onShareAppMessage(() => ({
 title: shareTitle.value || `${userInfo.value.userName} 的同城主页`,
 path: buildSharePath({ target: shareTarget.value, title: shareTitle.value })
 }))

 onShareTimeline(() => ({
 title: shareTitle.value || `${userInfo.value.userName} 的同城主页`,
 query: buildShareQuery({ target: shareTarget.value, title: shareTitle.value })
 }))

 // 拉黑
 const handleBlock = () => {
 uni.showModal({
 title: '确认拉黑',
 content: '拉黑后将不再看到该用户的动态，且无法恢复',
 confirmColor: '#FF4757',
 success: (res) => {
 if (res.confirm) {
 uni.showToast({ title: '已拉黑', icon: 'success' })
 setTimeout(() => uni.navigateBack(), 1000)
 }
 }
 })
 }

 onMounted(() => {
 // 接收路由参数 userId 请求用户详情
 })
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
 $primary-light: rgba(168, 184, 154, 0.15);
 $radius-card: 16px;
 $shadow-card: 0 2px 12px rgba(0, 0, 0, 0.06);

 .profile-page {
 min-height: 100vh;
 background-color: $bg-page;
 }

 // ===== 顶部封面（完整显示 + 毛玻璃底部过渡） =====
 .cover-section {
 position: relative;
 width: 100%;
 aspect-ratio: 16 / 9;
 overflow: hidden;
 background: linear-gradient(135deg, #E8ECF1, #D5DCE6);

 &__image {
 width: 100%;
 height: 100%;
 display: block;
 object-fit: cover;
 }

 &__glass {
 position: absolute;
 bottom: 0;
 left: 0;
 right: 0;
 height: 16%;
 background: linear-gradient( to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.15) 25%, rgba(255, 255, 255, 0.40) 55%, rgba(245, 246, 250, 0.85) 100% );
 backdrop-filter: blur(3px);
 -webkit-backdrop-filter: blur(3px);
 pointer-events: none;
 }
 }

 // ===== 用户信息（在图片下方） =====
 .user-info-section {
 display: flex;
 align-items: center;
 gap: 14px;
 padding: 14px 16px 14px;
 background: $bg-card;
 margin: 0 12px;
 border-radius: $radius-card $radius-card;
 box-shadow: $shadow-card;
 position: relative;
 margin-top: -6px;
 z-index: 2;
 }

 .user-info__avatar-wrap {
 position: relative;
 flex-shrink: 0;
 }

 .user-info__avatar {
 width: 64px;
 height: 64px;
 border-radius: 50%;
 border: 2px solid $bg-card;
 box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
 display: block;
 background: #fff;
 }

 .avatar-auth-badge {
 position: absolute;
 right: -2px;
 bottom: 0px;
 width: 20px;
 height: 20px;
 border-radius: 50%;
 background: linear-gradient(135deg, #A8B89A, #8A9B7A);
 border: 2px solid $bg-card;
 display: flex;
 align-items: center;
 justify-content: center;

 .icon {
 font-size: 11px;
 color: #FFFFFF;
 }
 }

 .user-info__detail {
 flex: 1;
 min-width: 0;
 }

 .user-info__name-row {
 display: flex;
 align-items: center;
 gap: 6px;
 }

 .user-info__name {
 font-size: 20px;
 font-weight: 700;
 color: $text-primary;
 }

 .user-info__gender {
 font-size: 17px;
 line-height: 1;

 &.is-female {
 color: #FF6B81;
 }

 &.is-male {
 color: #4FACFE;
 }
 }

 .user-info__meta {
 font-size: 13px;
 color: $text-helper;
 display: flex;
 align-items: center;
 gap: 4px;

 .dot {
 color: $border-light;
 }
 }

 // ===== 认证部分（轻量标签，仅展示） =====
 .auth-section {
 display: flex;
 gap: 8px;
 padding: 10px 16px 12px;
 margin: 0 12px;
 background: $bg-card;
 border-radius: $radius-card $radius-card;
 box-shadow: $shadow-card;
 margin-top: 12px;
 z-index: 1;
 position: relative;
 border-top: 1px solid $border-light;
 }

 .auth-item {
 display: flex;
 align-items: center;
 gap: 4px;
 padding: 4px 12px 4px 8px;
 border-radius: 14px;
 font-size: 12px;
 font-weight: 500;
 transition: all 0.3s ease;

 &__icon {
 font-size: 12px;
 flex-shrink: 0;
 line-height: 1;
 }

 &__label {
 white-space: nowrap;
 font-size: 11px;
 }

 &.is-active {
 background: rgba(168, 184, 154, 0.15);
 color: #6B8A5E;

 .auth-item__icon {
 color: #6B8A5E;
 }
 }

 &.is-inactive {
 background: #F0F1F3;
 color: #B0B0B8;

 .auth-item__icon {
 color: #C8C8D0;
 }
 }
 }

 // ===== 个人简介 =====
 .bio-section {
 margin: 12px 12px 0;
 padding: 16px 18px;
 background: $bg-card;
 border-radius: $radius-card;
 box-shadow: $shadow-card;

 &__text {
 font-size: 14px;
 color: $text-secondary;
 line-height: 1.8;
 letter-spacing: 0.3px;
 }
 }

 // ===== 标签云 =====
 .tags-section {
 margin: 12px 12px 0;
 padding: 16px 18px;
 background: $bg-card;
 border-radius: $radius-card;
 box-shadow: $shadow-card;
 }

 .tags-group {
 &:not(:last-child) {
 margin-bottom: 14px;
 padding-bottom: 14px;
 border-bottom: 1px solid $border-light;
 }

 &__label {
 display: block;
 font-size: 13px;
 font-weight: 600;
 color: $text-primary;
 margin-bottom: 8px;
 }

 &__list {
 display: flex;
 flex-wrap: wrap;
 gap: 6px;
 }
 }

 .tag {
 padding: 4px 14px;
 font-size: 12px;
 border-radius: 14px;
 line-height: 1.4;

 &--hobby {
 color: #4A4A5A;
 background: $bg-page;
 border: 1px solid $border-light;
 }

 &--personality {
 color: #6C5B7B;
 background: rgba(108, 91, 123, 0.08);
 border: 1px solid rgba(108, 91, 123, 0.12);
 }

 &--weekend {
 color: #2D7D7D;
 background: rgba(45, 125, 125, 0.08);
 border: 1px solid rgba(45, 125, 125, 0.12);
 }
 }

 // ===== 详细资料 =====
 .detail-card {
 margin: 12px 12px 0;
 padding: 16px 18px;
 background: $bg-card;
 border-radius: $radius-card;
 box-shadow: $shadow-card;

 &__title {
 font-size: 15px;
 font-weight: 600;
 color: $text-primary;
 margin-bottom: 12px;
 }

 &__grid {
 display: grid;
 grid-template-columns: 1fr 1fr;
 gap: 8px 16px;
 }
 }

 .detail-item {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding: 6px 0;
 border-bottom: 1px solid rgba($border-light, 0.5);

 &:nth-last-child(1),
 &:nth-last-child(2) {
 border-bottom: none;
 }

 &__label {
 font-size: 13px;
 color: $text-helper;
 }

 &__value {
 font-size: 13px;
 color: $text-primary;
 font-weight: 500;
 }
 }

 // ===== 人生剧本 =====
 .script-card {
 margin: 12px 12px 0;
 padding: 16px 18px;
 background: linear-gradient(135deg, #F8F9FA, #F0F2F5);
 border-radius: $radius-card;
 border: 1px solid rgba($primary-color, 0.2);

 &__header {
 display: flex;
 align-items: center;
 justify-content: space-between;
 margin-bottom: 8px;
 }

 &__title-wrap {
 display: flex;
 align-items: center;
 gap: 8px;
 flex: 1;
 min-width: 0;
 }

 &__title {
 font-size: 15px;
 font-weight: 600;
 color: $text-primary;
 flex-shrink: 0;
 }

 &__badge {
 padding: 4px 14px;
 font-size: 12px;
 font-weight: 600;
 border-radius: 14px;
 flex-shrink: 0;

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

 &__entry {
 font-size: 12px;
 color: $primary-color;
 flex-shrink: 0;
 cursor: pointer;
 font-weight: 500;

 &:active {
 opacity: 0.7;
 }
 }

 &__desc {
 font-size: 13px;
 color: $text-secondary;
 line-height: 1.7;
 display: block;
 margin-bottom: 10px;
 }

 &__tags {
 display: flex;
 flex-wrap: wrap;
 gap: 6px;
 }
 }

 .script-tag {
 padding: 2px 12px;
 font-size: 11px;
 color: $primary-color;
 background: rgba(255, 255, 255, 0.7);
 border-radius: 10px;
 }

 // ===== 三观态度 =====
 .values-card {
 margin: 12px 12px 0;
 padding: 16px 18px;
 background: $bg-card;
 border-radius: $radius-card;
 box-shadow: $shadow-card;

 &__header {
 display: flex;
 align-items: center;
 justify-content: space-between;
 margin-bottom: 12px;
 }

 &__title {
 font-size: 15px;
 font-weight: 600;
 color: $text-primary;
 }

 &__entry {
 font-size: 12px;
 color: $primary-color;
 flex-shrink: 0;
 cursor: pointer;
 font-weight: 500;

 &:active {
 opacity: 0.7;
 }
 }

 &__list {
 display: flex;
 flex-direction: column;
 gap: 8px;
 }
 }

 .value-item {
 display: flex;
 gap: 12px;
 padding: 8px 0;
 border-bottom: 1px solid $border-light;

 &:last-child {
 border-bottom: none;
 }

 &__label {
 width: 48px;
 flex-shrink: 0;
 font-size: 13px;
 color: $text-helper;
 padding-top: 1px;
 }

 &__text {
 flex: 1;
 font-size: 13px;
 color: $text-secondary;
 line-height: 1.5;
 }
 }

 // ===== 期待的另一半 =====
 .expect-card {
 margin: 12px 12px 0;
 padding: 16px 18px;
 background: linear-gradient(135deg, #FFF8F0, #FFF0E8);
 border-radius: $radius-card;
 border: 1px solid rgba(255, 183, 77, 0.2);

 &__title {
 font-size: 15px;
 font-weight: 600;
 color: $text-primary;
 margin-bottom: 10px;
 }

 &__tags {
 display: flex;
 flex-wrap: wrap;
 gap: 8px;
 }
 }

 .expect-tag {
 padding: 5px 14px;
 font-size: 12px;
 color: #E65100;
 background: rgba(255, 255, 255, 0.7);
 border-radius: 14px;
 border: 1px solid rgba(255, 183, 77, 0.3);
 }

 // ===== 相册 =====
 .album-card {
 margin: 12px 12px 0;
 padding: 16px 18px;
 background: $bg-card;
 border-radius: $radius-card;
 box-shadow: $shadow-card;

 &__header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 10px;
 }

 &__title {
 font-size: 15px;
 font-weight: 600;
 color: $text-primary;
 }

 &__count {
 font-size: 12px;
 color: $text-helper;
 }

 &__grid {
 display: grid;
 grid-template-columns: repeat(3, 1fr);
 gap: 4px;
 position: relative;
 }

 &__item {
 width: 100%;
 aspect-ratio: 1;
 border-radius: 6px;
 background: $bg-page;
 cursor: pointer;

 &:active {
 opacity: 0.85;
 }
 }

 &__more {
 position: absolute;
 right: 4px;
 bottom: 4px;
 width: calc(33.33% - 4px);
 aspect-ratio: 1;
 border-radius: 6px;
 background: rgba(0, 0, 0, 0.6);
 display: flex;
 align-items: center;
 justify-content: center;
 color: #FFFFFF;
 font-size: 18px;
 font-weight: 600;
 cursor: pointer;

 &:active {
 opacity: 0.8;
 }
 }
 }

 // ===== 动态 =====
 .post-card {
 margin: 12px 12px 0;
 padding: 16px 18px;
 background: $bg-card;
 border-radius: $radius-card;
 box-shadow: $shadow-card;

 &__header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 10px;
 }

 &__title {
 font-size: 15px;
 font-weight: 600;
 color: $text-primary;
 }

 &__more {
 font-size: 12px;
 color: $primary-color;
 cursor: pointer;

 &:active {
 opacity: 0.7;
 }
 }

 &__grid {
 display: grid;
 grid-template-columns: repeat(2, 1fr);
 gap: 6px;
 }
 }

 .post-item {
 position: relative;
 aspect-ratio: 1;
 border-radius: 8px;
 overflow: hidden;
 cursor: pointer;

 &:active {
 opacity: 0.85;
 }

 &__image {
 width: 100%;
 height: 100%;
 background: $bg-page;
 }

 &__overlay {
 position: absolute;
 bottom: 0;
 left: 0;
 right: 0;
 padding: 8px 10px;
 display: flex;
 justify-content: space-between;
 align-items: center;
 background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
 }

 &__stats {
 display: flex;
 align-items: center;
 gap: 4px;
 color: #FFFFFF;
 font-size: 11px;

 .icon {
 font-size: 13px;
 }
 }

 &__badge {
 padding: 1px 8px;
 font-size: 9px;
 color: #FFFFFF;
 background: linear-gradient(90deg, #FFB74D, #FF9800);
 border-radius: 8px;
 }
 }

 // ===== 底部信息栏 =====
 .profile-footer {
 display: flex;
 align-items: center;
 justify-content: space-between;
 padding: 14px 18px;
 margin: 12px 12px 0;
 font-size: 12px;
 color: $text-helper;
 background: $bg-card;
 border-radius: $radius-card;
 box-shadow: $shadow-card;

 &__ip {
 color: $text-helper;
 }

 &__ops {
 display: flex;
 align-items: center;
 gap: 8px;
 }

 &__link {
 color: $text-helper;
 cursor: pointer;

 &:active {
 opacity: 0.7;
 }
 }

 &__split {
 color: $border-light;
 }
 }

// ===== 底部占位（给固定操作栏留出空间） =====
 .bottom-placeholder {
 height: 88px;
 }

 // ===== 名字旁关系标签 =====
 .user-info__tag {
 flex-shrink: 0;
 padding: 2px 8px;
 font-size: 10px;
 border-radius: 10px;
 line-height: 1.4;

 &--followed {
 color: $primary-dark;
 background: rgba(168, 184, 154, 0.15);
 border: 1px solid rgba(168, 184, 154, 0.4);
 }

 &--mutual {
 color: #E8446C;
 background: rgba(232, 68, 108, 0.08);
 border: 1px solid rgba(232, 68, 108, 0.25);
 }
 }

 // ===== 底部固定操作栏：与匹配页同一套视觉（单一动作位） =====
 .profile-actionbar {
 position: fixed;
 bottom: 0;
 left: 0;
 right: 0;
 z-index: 100;
 display: flex;
 align-items: center;
 padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
 background-color: rgba(255, 255, 255, 0.95);
 backdrop-filter: blur(10px);
 border-top: 1px solid $border-light;

 &__btn {
 flex: 1;
 height: 48px;
 border: none;
 border-radius: 24px;
 font-size: 15px;
 font-weight: 500;
 display: flex;
 align-items: center;
 justify-content: center;
 flex-direction: row;
 gap: 6px;
 white-space: nowrap;
 transition: transform 0.15s ease;

 &:active:not(:disabled) {
 transform: scale(0.98);
 }

 &:disabled {
 opacity: 0.75;
 }

 // 双向心动：交换微信（主色绿渐变，与全局主按钮一致）
 &--wechat {
 background: linear-gradient(90deg, $primary-color, $primary-dark);
 color: #FFFFFF;
 box-shadow: 0 4px 12px rgba(168, 184, 154, 0.4);

 .icon {
 font-size: 18px;
 }
 }

 // 心动：实心渐变主按钮（暖粉，与匹配页一致）
 &--heart {
 background: linear-gradient(90deg, #FF6B81, #E8446C);
 color: #FFFFFF;
 box-shadow: 0 4px 12px rgba(232, 68, 108, 0.35);

 .icon {
 font-size: 18px;
 }
 }

 // 关注线：常驻次级小按钮（主色绿描边），位置语义永远不变
 &--follow {
 flex: 0 0 92px;
 border-radius: 24px;
 background-color: $bg-card;
 border: 1px solid $primary-color;
 color: $primary-dark;
 font-size: 14px;

 .icon {
 font-size: 16px;
 }

 // 已关注：填充态（★）
 &.is-active {
 background-color: rgba(168, 184, 154, 0.15);
 border-color: $primary-color;
 color: $primary-dark;
 }
 }

 // 已心动 · 待回应：终态弱化，不可点击
 &--hearted {
 background-color: rgba(232, 68, 108, 0.08);
 border: 1px solid rgba(232, 68, 108, 0.25);
 color: #993556;
 font-size: 14px;

 .icon {
 font-size: 16px;
 }
 }

 // 心动额度用完：灰色弱化，只说明天（关注线不受影响）
 &--quota-out {
 background-color: $bg-page;
 border: 1px solid $border-light;
 color: $text-helper;
 font-size: 14px;

 .icon {
 font-size: 16px;
 }
 }
 }
 }

 // ===== 心动二次确认 =====
 .like-confirm {
 text-align: center;

 &__target {
 display: block;
 font-size: 14px;
 color: $text-primary;
 margin-bottom: 10px;
 }

 &__tip {
 display: block;
 font-size: 11px;
 color: $text-helper;
 }
 }
</style>