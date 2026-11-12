<template>
    <view class="match-page">
        <!-- 顶部导航栏：固定不滚动 -->
        <view class="match-navbar">
            <view class="match-navbar__title">匹配</view>
            <view class="match-navbar__right">
                <text class="match-navbar__icon icon icon-filter" @click="showFilterPanel = true"></text>
            </view>
        </view>

        <!-- 顶部双额度进度条（浏览 / 心动） -->
        <view class="match-quota-wrap">
            <QuotaBar />
        </view>

        <!-- 已匹配状态条：常驻，关闭匹配成功动效后可随时回顾 -->
        <view v-if="matchedBarUser && !matchedBarHidden" class="match-matched-bar" @click="openMatchedEntry">
            <text class="match-matched-bar__icon">💗</text>
            <view class="match-matched-bar__body">
                <text class="match-matched-bar__title">已和 {{ matchedBarUser.name }} 匹配</text>
                <text class="match-matched-bar__desc">{{ matchedBarDesc }}</text>
            </view>
            <text class="match-matched-bar__close icon icon-close" @click.stop="matchedBarHidden = true"></text>
            <text class="match-matched-bar__arrow icon icon-arrow-right"></text>
        </view>

        <!-- 快速筛选栏：固定不滚动 -->
        <view class="match-filter">
            <scroll-view scroll-x class="match-filter__scroll" show-scrollbar="false">
                <view class="match-filter__tags">
                    <view v-for="(filter, index) in filterOptions"
                          :key="index"
                          class="match-filter__tag"
                          :class="{ 'match-filter__tag--active': filter.active }"
                          @click="toggleFilter(index)">
                        {{ filter.label }}
                    </view>
                </view>
            </scroll-view>
        </view>

        <!-- 匹配主内容区：仅此处可滚动 -->
        <view class="match-main" v-if="currentMatchUser && !quotaExhausted" :key="cardKey">
            <!-- 优质推荐：金色粒子 -->
            <view v-if="isQualityCard" class="quality-particles">
                <view v-for="(particle, index) in particles" :key="index" class="quality-particle" :style="particle" />
            </view>
            <!-- 可滚动内容区 -->
            <scroll-view scroll-y class="match-scroll" show-scrollbar="false">
                <!-- 纯净头图 -->
                <view class="match-hero" :class="{ 'match-hero--quality': isQualityCard }" @click="openAlbumDrawer">
                    <image class="match-hero__image"
                           :src="currentMatchUser.avatar"
                           mode="aspectFill" />
                    <!-- 优质推荐勋章 -->
                    <view v-if="isQualityCard" class="quality-badge">
                        <text class="quality-badge__icon icon icon-medal-gold"></text>
                        <text class="quality-badge__text">优质推荐</text>
                    </view>
                    <view class="match-hero__tip">
                        <text class="icon icon-image"></text>
                        点击查看完整相册
                    </view>
                </view>

                <!-- 资料内容区 -->
                <view class="match-content">
                    <!-- 基础信息：昵称+性别+官方认证徽章 同行 -->
                    <view class="match-base">
                        <view class="match-base__header">
                            <text class="match-base__name">{{ currentMatchUser.name }}</text>
                            <!-- 性别图标改用通用字符，避免图标库缺失 -->
                            <text class="match-base__gender">♀</text>
                            <!-- 官方认证小徽章 -->
                            <view class="header-auth-badges">
                                <view class="header-auth-badge" v-if="currentMatchUser.auth.realName">
                                    <text class="icon icon-check"></text>实名
                                </view>
                                <view class="header-auth-badge" v-if="currentMatchUser.auth.education">
                                    <text class="icon icon-check"></text>学历
                                </view>
                                <view class="header-auth-badge header-auth-badge--work" v-if="currentMatchUser.auth.work">
                                    <text class="icon icon-check"></text>工作
                                </view>
                            </view>
                        </view>

                        <!-- 优质推荐气泡文案 -->
                        <view v-if="isQualityCard" class="quality-bubble">
                            精选的同城双认证优质用户，匹配度 {{ qualityScore }}%
                        </view>

                        <view class="match-base__meta">
                            {{ currentMatchUser.age }}岁 · {{ currentMatchUser.height }}cm · {{ currentMatchUser.education }} · {{ currentMatchUser.occupation }}
                        </view>

                        <!-- 趣味勋章：左对齐，消除左侧留白 -->
                        <view class="match-base__badges">
                            <view class="fun-medals">
                                <view v-for="(medal, idx) in currentMatchUser.showMedals"
                                      :key="idx"
                                      class="medal-tag"
                                      :class="'medal-tag--' + medal.type">
                                    <text class="icon" :class="medal.icon"></text>
                                    {{ medal.name }}
                                </view>
                            </view>
                        </view>

                        <view class="match-base__location">
                            <text class="icon icon-location"></text>
                            {{ currentMatchUser.district }}
                        </view>
                    </view>

                    <!-- 个人简介 -->
                    <view class="match-bio">
                        {{ currentMatchUser.bio }}
                    </view>

                    <!-- 匹配氛围感文案：仅双方都完成测试时显示 -->
                    <view class="match-slogan" v-if="canShowMatchSlogan">
                        <text class="icon icon-lightbulb"></text>
                        <text>{{ currentMatchUser.matchSlogan }}</text>
                    </view>

                    <!-- 三层标签体系 -->
                    <view class="match-tags">
                        <view class="tags-row">
                            <text class="tags-label">周末日常</text>
                            <view class="tags-list">
                                <text v-for="tag in currentMatchUser.weekendTags" :key="'w'+tag" class="tag tag--weekend">{{ tag }}</text>
                            </view>
                        </view>
                        <view class="tags-row">
                            <text class="tags-label">兴趣爱好</text>
                            <view class="tags-list">
                                <text v-for="tag in currentMatchUser.hobbyTags" :key="'h'+tag" class="tag tag--hobby">{{ tag }}</text>
                            </view>
                        </view>
                        <view class="tags-row">
                            <text class="tags-label">性格特质</text>
                            <view class="tags-list">
                                <text v-for="tag in currentMatchUser.personalityTags" :key="'p'+tag" class="tag tag--personality">{{ tag }}</text>
                            </view>
                        </view>
                    </view>

                    <!-- 个人资料 -->
                    <view class="match-section">
                        <view class="match-section__title">个人资料</view>
                        <view class="match-profile__grid">
                            <view class="match-profile__item">
                                {{ currentMatchUser.birthYear }}年 · {{ currentMatchUser.constellation }}
                            </view>
                            <view class="match-profile__item">
                                {{ currentMatchUser.height }}cm · {{ currentMatchUser.weight }}kg
                            </view>
                            <view class="match-profile__item">
                                学历：{{ currentMatchUser.education }}
                            </view>
                            <view class="match-profile__item">
                                职业：{{ currentMatchUser.career }}
                            </view>
                            <view class="match-profile__item">
                                籍贯：{{ currentMatchUser.hometown }}
                            </view>
                            <view class="match-profile__item">
                                婚况：{{ currentMatchUser.maritalStatus }}
                            </view>
                            <view class="match-profile__item">
                                年收入：{{ currentMatchUser.income }}
                            </view>
                        </view>
                        <view class="match-profile__tags">
                            <text v-for="tag in currentMatchUser.lifeTags" :key="tag" class="tag tag--life">{{ tag }}</text>
                        </view>
                    </view>

                    <!-- 人生剧本匹配体系 -->
                    <view class="match-section match-script">
                        <view class="match-section__header">
                            <view class="match-section__title">人生剧本</view>
                            <text class="match-script__entry" :class="{ 'is-disabled': !selfHasTest }" @click="checkScriptMatch">
                                {{ scriptEntryText }} <text class="icon icon-arrow-right"></text>
                            </text>
                        </view>
                        <view class="match-script__card">
                            <view class="match-script__type">
                                <text class="match-script__label">TA的剧本</text>
                                <text class="match-script__name">{{ currentMatchUser.lifeScript.name }}</text>
                            </view>
                            <text class="match-script__desc">{{ currentMatchUser.lifeScript.desc }}</text>
                            <view class="match-script__tags">
                                <text v-for="tag in currentMatchUser.lifeScript.tags" :key="tag" class="script-tag">{{ tag }}</text>
                            </view>
                        </view>
                    </view>

                    <!-- 三观态度 + 测契合度入口 -->
                    <view class="match-section match-values">
                        <view class="match-section__header">
                            <view class="match-section__title">三观态度</view>
                            <text class="match-values__entry" :class="{ 'is-disabled': !selfHasTest }" @click="testMatch">
                                {{ valuesEntryText }} <text class="icon icon-arrow-right"></text>
                            </text>
                        </view>
                        <view class="match-values__list">
                            <view class="match-values__item">
                                <text class="match-values__label">恋爱观</text>
                                <text class="match-values__text">{{ currentMatchUser.values.love }}</text>
                            </view>
                            <view class="match-values__item">
                                <text class="match-values__label">消费观</text>
                                <text class="match-values__text">{{ currentMatchUser.values.consume }}</text>
                            </view>
                            <view class="match-values__item">
                                <text class="match-values__label">生活观</text>
                                <text class="match-values__text">{{ currentMatchUser.values.life }}</text>
                            </view>
                        </view>
                    </view>

                    <!-- 期待的另一半 -->
                    <view class="match-section">
                        <view class="match-section__title">Ta期待的另一半</view>
                        <view class="match-expect__tags">
                            <text v-for="tag in currentMatchUser.expectTags" :key="tag" class="tag tag--expect">{{ tag }}</text>
                        </view>
                    </view>

                    <!-- 底部信息栏：IP属地 + 举报拉黑 -->
                    <view class="match-footer">
                        <text class="match-footer__ip">IP属地：{{ currentMatchUser.ipLocation }}</text>
                        <view class="match-footer__ops">
                            <text class="match-footer__link" @click="handleReport">举报</text>
                            <text class="match-footer__split">·</text>
                            <text class="match-footer__link" @click="handleBlock">拉黑</text>
                        </view>
                    </view>
                </view>
            </scroll-view>

            <!-- 底部固定三按钮：永久悬浮不被遮挡 -->
            <view class="match-actions">
                <button class="match-actions__btn match-actions__btn--skip" @click="handleSkip">
                    <text class="icon icon-close"></text>
                </button>
                <button class="match-actions__btn match-actions__btn--main"
                        @click="handleContact">
                    <text class="icon icon-wechat"></text>
                    交换联系方式
                </button>
                <button class="match-actions__btn match-actions__btn--like"
                        @click="handleLike">
                    <text class="icon icon-heart"></text>
                </button>
            </view>

            <!-- 未实名蒙版：游客引导注册，注册未实名引导实名 -->
            <view v-if="!isAuthenticated" class="match-mask" @click="promptAuth">
                <view class="match-mask__content">
                    <text class="match-mask__title">{{ isGuest ? '注册后查看完整资料' : '完成实名认证' }}</text>
                    <text class="match-mask__desc">{{ isGuest ? '已有大量同城用户完成实名' : '开启异性精准匹配' }}</text>
                    <button class="match-mask__btn">{{ isGuest ? '一键授权手机号注册' : '立即认证' }}</button>
                </view>
            </view>
        </view>

        <!-- 今日推荐看完 / 浏览额度耗尽 -->
        <view v-if="quotaExhausted || (isPoolEmpty && filteredPool.length > 0)" class="match-empty">
            <text class="match-empty__emoji">🌙</text>
            <text class="match-empty__title">今日缘分已尽</text>
            <text class="match-empty__desc">明天将为你刷新全新的同城异性</text>
            <view class="match-empty__hint">
                <text class="match-empty__hint-label">资料完整度</text>
                <text class="match-empty__hint-value">{{ userStore.profileCompleteness }}%</text>
                <text class="match-empty__hint-desc">完善至 80%，次日额外 +3 次浏览</text>
            </view>
            <button v-if="equity.canClaimCompletenessBonus(userStore.profileCompleteness)"
                    class="match-empty__btn"
                    @click="claimBonus">
                领取明日 +3 次浏览
            </button>
            <button v-else class="match-empty__btn" @click="goToProfileEdit">完善资料</button>
            <button class="match-empty__btn match-empty__btn--ghost" @click="goToSquare">去广场逛逛</button>
        </view>

        <!-- 筛选后无匹配 -->
        <view v-else-if="isPoolEmpty" class="match-empty">
            <image class="match-empty__image" src="/static/images/empty-match.png" mode="aspectFit" />
            <text class="match-empty__title">你的缘分还在路上</text>
            <text class="match-empty__desc">放宽筛选条件，或完善资料让 TA 更快找到你</text>
            <button class="match-empty__btn" @click="showFilterPanel = true">调整筛选条件</button>
            <button class="match-empty__btn match-empty__btn--ghost" @click="goToProfileEdit">完善资料</button>
        </view>

        <!-- 相册抽屉 -->
        <view class="album-drawer" :class="{ 'album-drawer--show': showAlbum }" @click="closeAlbumDrawer">
            <view class="album-drawer__content" @click.stop>
                <view class="album-drawer__header">
                    <text class="album-drawer__title">Ta的相册</text>
                    <text class="icon icon-close" @click="closeAlbumDrawer"></text>
                </view>
                <scroll-view scroll-y class="album-drawer__scroll" show-scrollbar="false">
                    <view class="album-grid">
                        <image v-for="(img, idx) in currentMatchUser?.album"
                               :key="idx"
                               class="album-grid__item"
                               :src="img"
                               mode="aspectFill"
                               @click="previewAlbum(idx)" />
                    </view>
                </scroll-view>
            </view>
        </view>

        <!-- 筛选面板 -->
        <FilterPanel v-model:visible="showFilterPanel" :model-value="panelFilters" @apply="applyFilter" />

        <!-- 心动二次确认 -->
        <CustomModal :visible="showLikeConfirm"
                     title="确认发送心动"
                     confirm-text="发送心动"
                     cancel-text="再想想"
                     size="small"
                     @confirm="confirmLike"
                     @cancel="showLikeConfirm = false"
                     @close="showLikeConfirm = false">
            <view class="like-confirm">
                <text class="like-confirm__target">向 {{ currentMatchUser?.name }} 发送心动</text>
                <view class="like-confirm__quota">
                    <view class="like-confirm__quota-item">
                        <text class="like-confirm__quota-num">{{ equity.remainLike }}</text>
                        <text class="like-confirm__quota-label">今日剩余</text>
                    </view>
                    <view class="like-confirm__quota-divider" />
                    <view class="like-confirm__quota-item">
                        <text class="like-confirm__quota-num">{{ equity.permanentLikes }}</text>
                        <text class="like-confirm__quota-label">永久次数</text>
                    </view>
                </view>
                <text class="like-confirm__tip">双方互相心动后即可申请交换微信</text>
            </view>
        </CustomModal>

        <!-- 心动额度耗尽 -->
        <CustomModal :visible="showLikeExhausted"
                     title="今日心动已用完"
                     :content="likeExhaustedCopy"
                     :show-cancel="false"
                     confirm-text="知道了"
                     size="small"
                     @confirm="showLikeExhausted = false"
                     @close="showLikeExhausted = false" />

        <!-- 权限引导弹窗（注册 / 实名 / 收藏心动） -->
        <PermissionModal :visible="showPermission"
                         :mode="permissionPayload.mode"
                         :title="permissionPayload.title"
                         :content="permissionPayload.content"
                         :confirm-text="permissionPayload.confirmText"
                         @confirm="handlePermissionConfirm"
                         @favorite="handlePermissionFavorite"
                         @close="showPermission = false" />

        <!-- 匹配成功全屏动效（暖粉渐变 + 头像碰撞 + 粒子，1.5s 可跳过） -->
        <MatchSuccessOverlay :visible="showMatchSuccess"
                             :me-avatar="selfAvatar"
                             :target-avatar="successTarget?.avatar || ''"
                             :target-name="successTarget?.name || ''"
                             :tags="successTags"
                             @apply="goToApply"
                             @close="closeMatchSuccess" />
    </view>
</template>

<script setup>
    import { ref, computed, onMounted, watch } from 'vue'
    import CustomModal from '@/components/common/CustomModal.vue'
    import PermissionModal from '@/components/common/PermissionModal.vue'
    import FilterPanel from './components/FilterPanel.vue'
    import QuotaBar from '@/components/common/QuotaBar.vue'
    import { useUserStore, useEquityStore, useMatchStore } from '@/store/index'
    import { usePermission } from '@/composables/usePermission'
    import MatchSuccessOverlay from '@/components/match/MatchSuccessOverlay.vue'
    import { users, findUserById, currentUserProfile } from '@/mock/users'
    import { quickFilters, defaultFilters, matchUserByFilters } from '@/mock/filters'
    import { matchSuccessTags } from '@/mock/matches'
    import { businessCopy } from '@/mock/copy'

    // ===== Store / 权限 =====
    const userStore = useUserStore()
    const equity = useEquityStore()
    const matchStore = useMatchStore()
    const { guard, isGuest, isCertified } = usePermission()

    // ===== 状态 =====
    // 是否已实名（未实名时展示引导蒙版）
    const isAuthenticated = computed(() => isCertified.value)
    const selfHasTest = ref(true)
    const showFilterPanel = ref(false)
    const showMatchSuccess = ref(false)
    const successTarget = ref(null)
    const showAlbum = ref(false)
    const selfAvatar = ref(userStore.userInfo?.avatar || 'https://picsum.photos/200/200?random=30')

    // 权限弹窗
    const showPermission = ref(false)
    const permissionPayload = ref({ mode: 'register', title: '', content: '', confirmText: '' })
    let pendingFavorite = null

    // 额度与弹窗状态
    const quotaExhausted = ref(false)
    const showLikeConfirm = ref(false)
    const showLikeExhausted = ref(false)
    const likeExhaustedCopy = ref(businessCopy.likeQuotaExhausted)

    // 顶部快捷筛选
    const filterOptions = ref(quickFilters.map((item, index) => ({ ...item, active: index === 0 })))

    // 面板筛选条件（8 组免费标签）
    const panelFilters = ref({ ...defaultFilters })

    // 匹配用户池（统一 mock 数据）
    const allUsers = users.map(item => ({ ...item }))

    // 筛选后的用户池：仅异性 + 快捷标签 + 面板条件
    const filteredPool = computed(() => {
        const selfGender = userStore.profile.gender || 'male'
        const quick = filterOptions.value.find(item => item.active)?.value || 'all'

        return allUsers.filter(user => {
            // 全平台仅展示异性
            if (user.gender === selfGender) return false

            if (quick === 'city') {
                const city = (user.ipLocation || '').replace('市', '')
                const selfCity = (userStore.profile.city || '').replace('市', '')
                if (selfCity && !city.includes(selfCity) && !user.district.includes(selfCity)) return false
            }
            if (quick === 'education' && !['本科', '硕士', '研究生'].some(level => (user.education || '').includes(level))) {
                return false
            }
            if (quick === 'auth' && !(user.auth.education || user.auth.work)) return false

            return matchUserByFilters(user, panelFilters.value)
        })
    })

    const currentIndex = ref(0)
    const currentMatchUser = computed(() => filteredPool.value[currentIndex.value] || null)
    // 当前无卡片可展示（额度耗尽 / 今日推荐看完 / 筛选无匹配）
    const isPoolEmpty = computed(() => !currentMatchUser.value)
    // 每张卡片独立渲染，用于重新触发入场动效
    const cardKey = computed(() => currentMatchUser.value ? `card-${currentMatchUser.value.id}-${currentIndex.value}` : 'empty')

    // ===== 双向匹配关系（文档 3.4）=====
    // 最近一次双向匹配：顶部状态条常驻展示，可随时点开回顾
    const matchedBarHidden = ref(false)
    const latestMatch = computed(() => {
        const list = matchStore.matches || []
        if (!list.length) return null
        return [...list].sort((a, b) => b.matchedAt - a.matchedAt)[0]
    })

    const matchedBarUser = computed(() => {
        if (!latestMatch.value) return null
        return findUserById(latestMatch.value.userId)
    })

    // 当前卡片对应的匹配记录
    const matchedRelation = computed(() => {
        const target = currentMatchUser.value
        if (!target) return null
        return matchStore.getMatch(target.id)
    })

    // 已匹配状态条副标题：按微信交换进度区分
    const matchedBarDesc = computed(() => {
        const relation = latestMatch.value
        if (!relation) return ''
        if (relation.wechatStatus === 'agreed') return '微信号已互换，点击回顾'
        if (relation.wechatStatus === 'pending') return '微信申请已发出，等待对方确认'
        return '你们互相心动了，点击申请交换微信'
    })

    // 匹配成功动效页展示的共同标签
    const successTags = computed(() => {
        const target = successTarget.value
        return target ? matchSuccessTags(target, currentUserProfile) : []
    })

    // ===== 优质惊喜推荐 =====
    // 触发门槛：双方双认证 + 标签交集 ≥3（后端判断，这里用 mock 模拟）
    const qualityId = ref(null)
    const selfTags = computed(() => {
        const profile = userStore.profile
        return new Set([
            ...(profile.hobbies || []),
            ...(profile.tags || []),
            ...(currentUserProfile.weekendTags || []),
            ...(currentUserProfile.lifeTags || [])
        ])
    })

    const tagOverlapCount = computed(() => {
        const target = currentMatchUser.value
        if (!target) return 0
        const targetTags = [
            ...(target.hobbyTags || []),
            ...(target.personalityTags || []),
            ...(target.weekendTags || []),
            ...(target.lifeTags || [])
        ]
        return [...new Set(targetTags)].filter(tag => selfTags.value.has(tag)).length
    })

    const isQualityEligible = computed(() => {
        const target = currentMatchUser.value
        if (!target) return false
        return target.auth?.education && target.auth?.work && tagOverlapCount.value >= 3
    })

    const isQualityCard = computed(() => {
        return !!currentMatchUser.value && qualityId.value === currentMatchUser.value.id
    })

    // 匹配度（后端计算的模拟值，随交集标签数量浮动）
    const qualityScore = computed(() => Math.min(96, 86 + tagOverlapCount.value * 2))

    // 金色星星粒子
    const particles = computed(() => Array.from({ length: 14 }, (_, index) => {
        const left = 8 + ((index * 37) % 84)
        const delay = (index % 7) * 0.08
        const size = 3 + (index % 3)
        return `left:${left}%; bottom:${10 + (index % 5) * 8}%; width:${size}px; height:${size}px; animation-delay:${delay}s;`
    }))

    // 卡片切换后判断是否触发优质推荐
    watch(currentMatchUser, (target) => {
        qualityId.value = null
        if (!target) return
        if (!isQualityEligible.value) return
        if (equity.qualityRemaining <= 0) return
        if (!equity.canTriggerQuality()) return

        equity.markQualityUsed()
        qualityId.value = target.id
        // 轻微短震（同微信点赞），无震动权限设备自动忽略
        try {
            uni.vibrateShort({ type: 'light' })
        } catch (e) {
            console.warn('[match] 设备不支持短震', e)
        }
    }, { immediate: true })

    // 匹配推荐语显示条件
    const canShowMatchSlogan = computed(() => {
        return selfHasTest.value && currentMatchUser.value?.hasCompletedTest && currentMatchUser.value?.matchSlogan
    })

    // 三观入口文案
    const valuesEntryText = computed(() => {
        if (!selfHasTest.value) return '完成测试查看匹配'
        if (!currentMatchUser.value?.hasCompletedTest) return '对方暂未完成测试'
        return '查看契合度详情'
    })

    // 人生剧本入口文案
    const scriptEntryText = computed(() => {
        if (!selfHasTest.value) return '完成测试查看匹配'
        if (!currentMatchUser.value?.hasCompletedTest) return '对方暂未完成测试'
        return '查看剧本匹配度'
    })

    // ===== 操作方法 =====
    // ===== 权限弹窗控制 =====
    const openPermission = (payload, onFavorite = null) => {
        permissionPayload.value = { ...payload }
        pendingFavorite = onFavorite
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

    const handlePermissionFavorite = () => {
        showPermission.value = false
        if (pendingFavorite) pendingFavorite()
    }

    // 收藏心动（未实名用户的沉没成本机制）
    const favoriteTarget = () => {
        const target = currentMatchUser.value
        if (!target) return
        const added = userStore.addFavorite(target)
        uni.showToast({ title: added ? '已收藏心动' : 'TA 已在收藏中', icon: 'none' })
        advance()
    }

    // ===== 心动：权限校验 -> 二次确认 -> 扣额度 =====
    const handleLike = () => {
        const target = currentMatchUser.value
        if (!target) return

        const { allowed, modal } = guard('likeUser')
        if (!allowed) {
            // 未实名：双选项弹窗【收藏心动】/【先去实名认证】
            if (modal.mode === 'realname') {
                openPermission({ ...modal, mode: 'favorite', content: '完成实名认证即可发送心动，也可以先收藏，等认证后再来' }, favoriteTarget)
            } else {
                openPermission(modal)
            }
            return
        }

        // 心动额度耗尽（当日 + 永久都无）
        if (equity.totalLikeAvailable <= 0) {
            likeExhaustedCopy.value = businessCopy.likeQuotaExhausted
            showLikeExhausted.value = true
            return
        }

        // 二次确认，展示剩余心动次数，防误触
        showLikeConfirm.value = true
    }

    // 二次确认后真正发送心动
    const confirmLike = () => {
        showLikeConfirm.value = false
        const target = currentMatchUser.value
        if (!target) return

        const result = equity.consumeLike()
        if (!result.ok) {
            likeExhaustedCopy.value = businessCopy.likeQuotaExhausted
            showLikeExhausted.value = true
            return
        }

        // 扣完当日额度时提示正在使用永久次数
        if (result.source === 'permanent') {
            uni.showToast({ title: `已使用永久心动，剩 ${result.remain} 次`, icon: 'none' })
        }

        // 对方也心动 → 建立双向匹配并拉起全屏动效（文档 3.4.1）
        if (Math.random() < 0.3) {
            matchStore.createMatch(target.id)
            matchStore.markSuccessShown(target.id)
            successTarget.value = target
            showMatchSuccess.value = true
        } else {
            uni.showToast({ title: '已发送心动', icon: 'success' })
        }
        advance()
    }

    const handleSkip = () => {
        advance()
    }

    // 切换到下一张卡片：普通卡片消耗 1 次浏览额度，优质推荐不占用额度
    const advance = () => {
        if (!isQualityCard.value) {
            const result = equity.consumeBrowse()
            if (!result.ok) {
                quotaExhausted.value = true
                return
            }
        }
        if (currentIndex.value < filteredPool.value.length - 1) {
            currentIndex.value++
        } else {
            currentIndex.value = -1
        }
    }

    // 额度耗尽后：资料完整度达标可领取次日 +3 浏览额度
    const claimBonus = () => {
        const ok = equity.claimCompletenessBonus(userStore.profileCompleteness)
        if (ok) {
            uni.showToast({ title: '已获得明日 +3 次浏览额度', icon: 'none' })
            quotaExhausted.value = true
            return
        }
        uni.showToast({ title: '资料完整度达 80% 才可领取', icon: 'none' })
    }

    const goToProfileEdit = () => {
        uni.navigateTo({ url: '/pages/profile/edit' })
    }

    const goToRealName = () => {
        uni.navigateTo({ url: '/pages/auth/realname' })
    }

    const handleContact = () => {
        const { allowed, modal } = guard('applyWechat')
        if (!allowed) {
            openPermission(modal)
            return
        }
        const target = currentMatchUser.value
        if (!target) return
        uni.navigateTo({ url: `/pages/match/apply?userId=${target.id}&type=apply` })
    }

    const toggleFilter = (index) => {
        filterOptions.value.forEach((item, i) => {
            item.active = i === index
        })
        currentIndex.value = 0
        quotaExhausted.value = false
    }

    // 筛选面板确认
    const applyFilter = (filters) => {
        if (filters) panelFilters.value = filters
        currentIndex.value = 0
        quotaExhausted.value = false
        const count = filteredPool.value.length
        uni.showToast({ title: count ? `为你找到 ${count} 位匹配` : '暂无符合条件的用户', icon: 'none' })
    }

    // ===== 举报与拉黑 =====
    const handleReport = () => {
        uni.showActionSheet({
            itemList: ['虚假资料', '骚扰行为', '广告营销', '其他违规'],
            success: () => {
                uni.showToast({ title: '举报已提交，我们会尽快核实', icon: 'none' })
            }
        })
    }

    const handleBlock = () => {
        uni.showModal({
            title: '确认拉黑',
            content: '拉黑后将不再收到该用户的推荐，且无法恢复',
            confirmColor: '#FF4757',
            success: (res) => {
                if (res.confirm) {
                    uni.showToast({ title: '已拉黑', icon: 'success' })
                    advance()
                }
            }
        })
    }

    // ===== 相册抽屉 =====
    const openAlbumDrawer = () => {
        showAlbum.value = true
    }

    const closeAlbumDrawer = () => {
        showAlbum.value = false
    }

    const previewAlbum = (index) => {
        uni.previewImage({
            urls: currentMatchUser.value.album,
            current: index
        })
    }

    // ===== 契合度与剧本匹配 =====
    const testMatch = () => {
        if (!selfHasTest.value) {
            uni.showToast({ title: '进入三观测试页', icon: 'none' })
        } else if (!currentMatchUser.value?.hasCompletedTest) {
            uni.showToast({ title: '对方暂未完成测试', icon: 'none' })
        } else {
            uni.showToast({ title: '进入契合度详情', icon: 'none' })
        }
    }

    const checkScriptMatch = () => {
        if (!selfHasTest.value) {
            uni.showToast({ title: '进入剧本测试页', icon: 'none' })
        } else if (!currentMatchUser.value?.hasCompletedTest) {
            uni.showToast({ title: '对方暂未完成测试', icon: 'none' })
        } else {
            uni.showToast({ title: '查看剧本匹配详情', icon: 'none' })
        }
    }

    // ===== 跳转方法 =====
    const goToSquare = () => {
        uni.switchTab({ url: '/pages/square/index' })
    }

    // 蒙版点击：按当前层级给出对应引导
    const promptAuth = () => {
        const { modal } = guard('likeUser')
        openPermission(modal)
    }

    // ===== 匹配成功后的去向（文档 3.4.1 底部双按钮）=====
    const goToApply = () => {
        const target = successTarget.value
        showMatchSuccess.value = false
        if (!target) return
        uni.navigateTo({ url: `/pages/match/apply?userId=${target.id}` })
    }

    const closeMatchSuccess = () => {
        showMatchSuccess.value = false
        matchedBarHidden.value = false
    }

    // 顶部「已匹配」状态条：直达微信交换页（不提供站内聊天）
    const openMatchedEntry = () => {
        const relation = latestMatch.value
        if (!relation) return
        uni.navigateTo({ url: `/pages/match/apply?userId=${relation.userId}` })
    }

    onMounted(() => {
        // 恢复匹配关系（3 天申请过期在这里校验）
        matchStore.restore()
    })
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';
    @import '@/styles/mixins.scss';

    /* 核心修复：外层容器禁止滚动，高度占满全屏 */
    .match-page {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: $bg-page;
        overflow: hidden; /* 彻底禁止外层滚动 */
        box-sizing: border-box;
    }

    // ----- 顶部导航栏：固定不收缩 -----
    .match-navbar {
        width: 100%;
        flex-shrink: 0; /* 禁止被压缩 */
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px $page-padding-x;
        background-color: rgba(255, 255, 255, 0.85);
        @include glass;
        border-bottom: 1px solid rgba($border-light, 0.5);
        box-sizing: border-box;

        &__title {
            font-size: 17px;
            font-weight: 500;
            color: $text-primary;
            letter-spacing: 1px;
        }

        &__right {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        &__quota {
            display: flex;
            align-items: baseline;
            gap: 2px;
        }

        &__quota-text {
            font-size: 12px;
            color: $text-helper;
        }

        &__quota-num {
            font-size: 18px;
            font-weight: $font-weight-medium;
            color: $primary-color;
            line-height: 1;
        }

        &__icon {
            font-size: 20px;
            color: $text-secondary;
            cursor: pointer;

            &:active {
                opacity: 0.6;
            }
        }
    }

    // ----- 筛选栏：固定不收缩 -----
    .match-filter {
        width: 100%;
        flex-shrink: 0; /* 禁止被压缩 */
        display: flex;
        align-items: center;
        padding: $spacing-sm $page-padding-x;
        background-color: $bg-card;
        border-bottom: 1px solid $border-light;
        box-sizing: border-box;

        &__scroll {
            flex: 1;
            white-space: nowrap;
        }

        &__tags {
            display: inline-flex;
            gap: 8px;
        }

        &__tag {
            display: inline-block;
            padding: 4px 14px;
            font-size: $font-size-xs;
            color: $text-secondary;
            background-color: $bg-page;
            border-radius: 16px;
            white-space: nowrap;
            transition: all $duration-fast ease;

            &--active {
                color: $primary-color;
                background-color: $primary-light-bg;
                border: 1px solid $primary-color;
            }
        }
    }

    // ----- 主内容区：占满剩余空间，内部滚动 -----
    .match-main {
        width: 100%;
        flex: 1; /* 占满剩余高度 */
        position: relative;
        overflow: hidden; /* 超出部分隐藏，仅内部滚动 */
        min-height: 0; /* 修复flex子元素滚动失效问题 */
    }

    .match-scroll {
        width: 100%;
        height: 100%;
    }

    // ----- 纯净头图 -----
    .match-hero {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        cursor: pointer;

        &__image {
            width: 100%;
            height: 100%;
            background-color: $bg-page;
        }

        &__tip {
            position: absolute;
            bottom: 10px;
            right: 8px;
            padding: 4px 10px;
            background-color: rgba(0, 0, 0, 0.5);
            color: #FFFFFF;
            font-size: 11px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 4px;

            .icon {
                font-size: 12px;
            }
        }
    }

    // ----- 资料内容区 -----
    .match-content {
        background-color: $bg-page;
        border-radius: 16px 16px 0 0;
        position: relative;
        z-index: 2;
        padding-bottom: 0;
    }

    // 通用模块
    .match-section {
        background-color: $bg-card;
        margin-bottom: 8px;
        padding: $spacing-md $page-padding-x;
    }

    .match-section__title {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-bottom: $spacing-sm;
    }

    .match-section__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: $spacing-sm;
    }

    .is-disabled {
        color: $text-helper !important;
        cursor: not-allowed;
    }

    // ----- 基础信息 -----
    .match-base {
        padding: $spacing-md $page-padding-x $spacing-sm;
        background-color: $bg-card;
        margin-bottom: 8px;
        border-radius: 16px 16px 0 0;

        &__header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: $spacing-xs;
            flex-wrap: nowrap;
        }

        &__name {
            font-size: 22px;
            font-weight: $font-weight-medium;
            color: $text-primary;
            flex-shrink: 0;
        }

        &__gender {
            font-size: 20px;
            color: #FF6B81;
            flex-shrink: 0;
            line-height: 1;
        }

        &__meta {
            font-size: $font-size-sm;
            color: $text-secondary;
            margin-bottom: $spacing-sm;
        }
        /* 趣味勋章：左对齐 */
        &__badges {
            display: flex;
            align-items: center;
            justify-content: flex-start; /* 左对齐消除留白 */
            margin-bottom: $spacing-sm;
        }

        &__location {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 10px;
            font-size: $font-size-xs;
            color: $text-secondary;
            border: 1px solid $border-light;
            border-radius: 12px;
        }
    }

    // 昵称行官方认证小徽章
    .header-auth-badges {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
    }

    .header-auth-badge {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 2px 6px;
        font-size: 10px;
        color: #FFFFFF;
        border-radius: 4px;
        white-space: nowrap;

        .icon {
            font-size: 9px;
        }

        background: linear-gradient(90deg, #2ED573, #1EBE60);

        &:nth-child(2) {
            background: linear-gradient(90deg, #4FACFE, #0099FF);
        }

        &--work {
            background: linear-gradient(90deg, #FFA726, #FB8C00) !important;
        }
    }

    // 趣味勋章：左对齐
    .fun-medals {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        justify-content: flex-start; /* 左对齐 */
    }

    // 趣味勋章标签
    .medal-tag {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 3px 8px;
        font-size: 11px;
        border-radius: 10px;
        white-space: nowrap;
        flex-shrink: 0;

        .icon {
            font-size: 11px;
        }

        &--gold {
            color: #B8860B;
            background-color: rgba(255, 215, 0, 0.15);
        }

        &--blue {
            color: #1976D2;
            background-color: rgba(25, 118, 210, 0.1);
        }

        &--purple {
            color: #7B1FA2;
            background-color: rgba(123, 31, 162, 0.1);
        }

        &--orange {
            color: #E65100;
            background-color: rgba(230, 81, 0, 0.1);
        }

        &--green {
            color: #2E7D32;
            background-color: rgba(46, 125, 50, 0.1);
        }
    }

    // ----- 简介 -----
    .match-bio {
        padding: 0 $page-padding-x $spacing-sm;
        background-color: $bg-card;
        font-size: $font-size-sm;
        color: $text-secondary;
        line-height: 1.6;
        margin-bottom: 8px;
    }

    // ----- 匹配氛围感文案 -----
    .match-slogan {
        margin: 0 $page-padding-x $spacing-md;
        padding: 10px 12px;
        background: linear-gradient(135deg, $primary-light-bg 0%, rgba(168, 184, 154, 0.15) 100%);
        border-radius: 10px;
        font-size: $font-size-xs;
        color: $primary-color;
        line-height: 1.5;
        display: flex;
        align-items: flex-start;
        gap: 6px;

        .icon {
            font-size: 14px;
            margin-top: 1px;
            flex-shrink: 0;
        }
    }

    // ----- 三层标签 -----
    .match-tags {
        padding: $spacing-sm $page-padding-x $spacing-md;
        background-color: $bg-card;
        margin-bottom: 8px;
    }

    .tags-row {
        display: flex;
        align-items: flex-start;
        margin-bottom: 8px;

        &:last-child {
            margin-bottom: 0;
        }
    }

    .tags-label {
        width: 60px;
        flex-shrink: 0;
        font-size: 11px;
        color: $text-helper;
        padding-top: 3px;
    }

    .tags-list {
        flex: 1;
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }

    .tag {
        padding: 2px 10px;
        font-size: 11px;
        border-radius: 10px;
        line-height: 1.4;

        &--weekend {
            color: $primary-color;
            background-color: $primary-light-bg;
        }

        &--hobby {
            color: $text-secondary;
            border: 1px solid $border-light;
            background-color: transparent;
        }

        &--personality {
            color: $text-helper;
            background-color: $bg-page;
            font-size: 10px;
        }

        &--life {
            color: $text-secondary;
            background-color: $bg-page;
            border: 1px solid $border-light;
        }

        &--expect {
            color: $text-secondary;
            background-color: #F5F1E8;
        }
    }

    // ----- 个人资料（纯文字） -----
    .match-profile__grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: $spacing-sm 0;
        margin-bottom: $spacing-md;
    }

    .match-profile__item {
        font-size: $font-size-sm;
        color: $text-secondary;
        line-height: 1.4;
    }

    .match-profile__tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    // ----- 人生剧本匹配体系 -----
    .match-script {
        &__entry {
            font-size: $font-size-xs;
            color: $primary-color;

            .icon {
                margin-left: 2px;
                font-size: 12px;
            }
        }

        &__card {
            padding: $spacing-sm;
            background: linear-gradient(135deg, rgba(168, 184, 154, 0.1) 0%, rgba(186, 168, 200, 0.1) 100%);
            border-radius: 12px;
            border: 1px solid rgba($primary-color, 0.15);
        }

        &__type {
            display: flex;
            align-items: baseline;
            gap: $spacing-xs;
            margin-bottom: 6px;
        }

        &__label {
            font-size: 11px;
            color: $text-helper;
        }

        &__name {
            font-size: $font-size-md;
            font-weight: $font-weight-medium;
            color: $primary-color;
        }

        &__desc {
            font-size: $font-size-xs;
            color: $text-secondary;
            line-height: 1.6;
            margin-bottom: $spacing-sm;
            display: block;
        }

        &__tags {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }
    }

    .script-tag {
        padding: 2px 8px;
        font-size: 10px;
        color: $primary-color;
        background-color: rgba(255, 255, 255, 0.6);
        border-radius: 8px;
    }

    // ----- 三观态度 -----
    .match-values {
        &__entry {
            font-size: $font-size-xs;
            color: $primary-color;

            .icon {
                margin-left: 2px;
                font-size: 12px;
            }
        }

        &__list {
            display: flex;
            flex-direction: column;
            gap: $spacing-sm;
        }

        &__item {
            display: flex;
            gap: $spacing-sm;
        }

        &__label {
            width: 50px;
            flex-shrink: 0;
            font-size: $font-size-sm;
            color: $text-helper;
            padding-top: 1px;
        }

        &__text {
            flex: 1;
            font-size: $font-size-sm;
            color: $text-secondary;
            line-height: 1.5;
        }
    }

    // ----- 择偶期待 -----
    .match-expect__tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    // ----- 底部信息栏：预留足够高度，不被按钮遮挡 -----
    .match-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px $page-padding-x calc(90px + env(safe-area-inset-bottom));
        font-size: 11px;
        color: $text-helper;
        background-color: $bg-card;
        margin-top: 8px;

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

    // ----- 底部操作栏：绝对固定在底部 -----
    .match-actions {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 99; /* 提高层级确保不被遮挡 */
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px $page-padding-x calc(12px + env(safe-area-inset-bottom));
        background-color: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-top: 1px solid $border-light;

        &__btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: none;
            transition: all $duration-fast ease;
            gap: 2px;

            &:active:not(:disabled) {
                transform: scale(0.92);
            }

            &:disabled {
                opacity: 0.5;
            }
            // 跳过：圆形按钮
            &--skip {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background-color: #F5F5F5;
                color: $text-secondary;
                flex-shrink: 0;

                .icon {
                    font-size: 20px;
                }
            }
            // 喜欢：圆形按钮
            &--like {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background-color: #FFF0F2;
                color: #FF4757;
                flex-shrink: 0;

                .icon {
                    font-size: 20px;
                }
            }
            // 主按钮：加宽，文字一行
            &--main {
                flex: 1;
                height: 48px;
                margin: 0 16px;
                border-radius: 24px;
                background: linear-gradient(90deg, $primary-color, #9DB48E);
                color: #FFFFFF;
                font-size: 15px;
                font-weight: $font-weight-medium;
                flex-direction: row;
                gap: 6px;
                box-shadow: 0 4px 12px rgba(168, 184, 154, 0.4);
                white-space: nowrap;

                .icon {
                    font-size: 18px;
                }
            }
        }
    }

    // ----- 蒙版 -----
    .match-mask {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20;
    }

    .match-mask__content {
        text-align: center;
        padding: $spacing-lg;
    }

    .match-mask__title {
        font-size: $font-size-lg;
        font-weight: $font-weight-medium;
        color: #FFFFFF;
        display: block;
    }

    .match-mask__desc {
        font-size: $font-size-sm;
        color: rgba(255, 255, 255, 0.8);
        display: block;
        margin-top: $spacing-xs;
    }

    .match-mask__btn {
        margin-top: $spacing-md;
        padding: 10px 40px;
        background-color: $primary-color;
        color: #FFFFFF;
        border-radius: 24px;
        font-size: $font-size-sm;
        border: none;
    }

    // ----- 相册抽屉 -----
    .album-drawer {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        visibility: hidden;
        opacity: 0;
        transition: all 0.3s ease;

        &--show {
            visibility: visible;
            opacity: 1;

            .album-drawer__content {
                transform: translateY(0);
            }
        }

        &__content {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 85vh;
            background-color: $bg-page;
            border-radius: 20px 20px 0 0;
            transform: translateY(100%);
            transition: transform 0.3s ease;
            display: flex;
            flex-direction: column;
        }

        &__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px $page-padding-x;
            border-bottom: 1px solid $border-light;
            flex-shrink: 0;
        }

        &__title {
            font-size: $font-size-lg;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__scroll {
            flex: 1;
            padding: $spacing-sm $page-padding-x 40px;
        }
    }

    .album-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;

        &__item {
            width: 100%;
            aspect-ratio: 1;
            border-radius: 8px;
            background-color: $bg-page;
        }
    }

    // ----- 匹配成功弹窗 -----
    .match-success-content {
        text-align: center;
    }

    .match-success__avatars {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $spacing-md;
        margin-bottom: $spacing-md;
    }

    .match-success__avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 2px solid $primary-color;
    }

    .match-success__divider {
        width: 20px;
        height: 1px;
        background-color: $border-light;
    }

    .match-success__names {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $text-primary;
        display: block;
    }

    .match-success__hint {
        font-size: $font-size-sm;
        color: $text-helper;
        margin-top: $spacing-xs;
        line-height: 1.5;
        display: block;
    }

    // ----- 空状态 -----
    .match-empty {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-bottom: 100px;

        &__image {
            width: 160px;
            height: 120px;
            margin-bottom: $spacing-md;
        }

        &__title {
            font-size: $font-size-lg;
            font-weight: $font-weight-medium;
            color: $text-primary;
            margin-bottom: $spacing-xs;
        }

        &__desc {
            font-size: $font-size-sm;
            color: $text-helper;
            margin-bottom: $spacing-lg;
        }

        &__btn {
            padding: 10px 40px;
            background-color: $primary-color;
            color: #FFFFFF;
            border-radius: 24px;
            font-size: $font-size-sm;
            border: none;
        }
    }

    // ===== M2：双额度条 =====
    .match-quota-wrap {
        flex-shrink: 0;
        padding: 0 $page-padding-x 8px;
        background-color: $bg-page;
        z-index: $z-index-sticky - 1;
    }

    // ===== M3：已匹配状态条（常驻，可回顾）=====
    .match-matched-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        margin: 0 $page-padding-x 8px;
        padding: 9px 12px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(255, 154, 178, 0.18), rgba(255, 196, 160, 0.12));
        border: 1px solid rgba(255, 107, 129, 0.22);

        &__icon {
            font-size: 16px;
            flex-shrink: 0;
        }

        &__body {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 1px;
        }

        &__title {
            font-size: 12px;
            font-weight: $font-weight-medium;
            color: #E8446C;
        }

        &__desc {
            font-size: 10px;
            color: $text-helper;
        }

        &__close {
            font-size: 13px;
            color: $text-helper;
            padding: 2px;
            flex-shrink: 0;
        }

        &__arrow {
            font-size: 13px;
            color: rgba(232, 68, 108, 0.6);
            flex-shrink: 0;
        }
    }

    // ===== M2：卡片入场动效 =====
    .match-main {
        animation: cardSlideIn 0.42s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    @keyframes cardSlideIn {
        from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    // ===== M2：优质惊喜推荐 =====
    .match-hero {
        position: relative;

        // 淡金色边框渐亮 + 呼吸微光
        &--quality {
            border: 2px solid rgba(226, 186, 105, 0.85);
            box-shadow: 0 0 0 1px rgba(226, 186, 105, 0.25),
                        0 6px 24px rgba(214, 168, 74, 0.28);
            animation: goldGlow 2.4s ease-in-out infinite;
        }
    }

    @keyframes goldGlow {
        0%, 100% {
            box-shadow: 0 0 0 1px rgba(226, 186, 105, 0.22),
                        0 6px 18px rgba(214, 168, 74, 0.2);
        }
        50% {
            box-shadow: 0 0 0 2px rgba(226, 186, 105, 0.45),
                        0 8px 28px rgba(214, 168, 74, 0.36);
        }
    }

    .quality-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 12px;
        border-radius: 14px;
        background: linear-gradient(135deg, rgba(255, 245, 214, 0.96), rgba(246, 219, 150, 0.96));
        border: 1px solid rgba(200, 162, 82, 0.5);
        box-shadow: 0 2px 8px rgba(200, 162, 82, 0.3);
        z-index: 3;

        &__icon {
            font-size: 12px;
            color: #B8860B;
        }

        &__text {
            font-size: 11px;
            font-weight: $font-weight-medium;
            color: #8A6A24;
        }
    }

    .quality-bubble {
        margin-top: 8px;
        padding: 6px 12px;
        font-size: 11px;
        line-height: 1.5;
        color: #8A6A24;
        background: rgba(255, 246, 220, 0.9);
        border: 1px solid rgba(226, 186, 105, 0.5);
        border-radius: 12px;
        animation: bubbleIn 0.5s ease 0.15s both;
    }

    @keyframes bubbleIn {
        from {
            opacity: 0;
            transform: translateY(-6px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .quality-particles {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        pointer-events: none;
        z-index: 4;
        overflow: hidden;
    }

    .quality-particle {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle, #FFE9A8 0%, #E2BA69 60%, rgba(226, 186, 105, 0) 100%);
        animation: particleFloat 0.8s ease-out forwards;
        opacity: 0;
    }

    @keyframes particleFloat {
        0% {
            opacity: 0;
            transform: translateY(0) scale(0.4);
        }
        30% {
            opacity: 0.95;
        }
        100% {
            opacity: 0;
            transform: translateY(-70px) scale(1.1);
        }
    }

    // ===== M2：心动二次确认 =====
    .like-confirm {
        text-align: center;

        &__target {
            display: block;
            font-size: $font-size-sm;
            color: $text-primary;
            margin-bottom: $spacing-md;
        }

        &__quota {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: $spacing-md;
            padding: 12px 0;
            background-color: $bg-page;
            border-radius: $radius-sm;
        }

        &__quota-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            min-width: 64px;
        }

        &__quota-num {
            font-size: 22px;
            font-weight: $font-weight-bold;
            color: #E06060;
        }

        &__quota-label {
            font-size: 10px;
            color: $text-helper;
        }

        &__quota-divider {
            width: 1px;
            height: 26px;
            background-color: $border-light;
        }

        &__tip {
            display: block;
            margin-top: $spacing-sm;
            font-size: 11px;
            color: $text-helper;
        }
    }

    // ===== M2：额度耗尽面板 =====
    .match-empty {
        gap: 10px;

        &__emoji {
            font-size: 40px;
            margin-bottom: $spacing-sm;
        }

        &__hint {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            margin-bottom: $spacing-lg;
            padding: 10px 20px;
            background-color: $primary-light-bg;
            border-radius: $radius-sm;
        }

        &__hint-label {
            font-size: 10px;
            color: $text-helper;
        }

        &__hint-value {
            font-size: $font-size-lg;
            font-weight: $font-weight-bold;
            color: $primary-dark;
        }

        &__hint-desc {
            font-size: 10px;
            color: $text-secondary;
        }

        &__btn--ghost {
            background-color: transparent;
            color: $text-secondary;
            border: 1px solid $border-light;
        }
    }

</style>