<template>
    <view class="profile-page">
        <!-- 全页安全徽章（第 2 章硬性标准） -->
        <SafetyBadge />
        <!-- ========================================== -->
        <!-- 1. 顶部 Header (未登录 / 已登录) -->
        <!-- ========================================== -->
        <view class="profile-header">
            <!-- 已登录状态 Header -->
            <view v-if="isLogin" class="profile-header__main">
                <view class="profile-header__avatar-wrap" @click="goToMyProfile">
                    <image class="profile-header__avatar" :src="userInfo.avatar" mode="aspectFill" />
                    <view class="avatar-auth-icon" :class="'auth-level-' + authLevel" v-if="authStatus.realName">
                        <text class="icon icon-check"></text>
                    </view>
                </view>

                <view class="profile-header__info" @click="goToMyProfile">
                    <view class="profile-header__name-row">
                        <text class="profile-header__name">{{ displayName }}</text>
                        <text class="profile-header__hint">主页 ></text>
                    </view>
                    <view class="profile-header__meta">
                        <text class="profile-header__id">ID：{{ userInfo.id }}</text>
                        <text class="profile-header__level">{{ levelText }}</text>
                    </view>
                </view>
            </view>

            <!-- 未登录状态 Header -->
            <view v-else class="profile-header__unlogin" @click="handleLoginGuide">
                <view class="unlogin-avatar-wrap">
                    <view class="unlogin-avatar-placeholder">
                        <text class="icon icon-user"></text>
                    </view>
                </view>

                <view class="unlogin-info">
                    <view class="unlogin-title-row">
                        <text class="unlogin-title">登录</text>
                    </view>
                    <text class="unlogin-subtitle">遇见真诚同频的另一半</text>
                </view>

                <view class="unlogin-arrow">
                    <text class="icon icon-arrow-right"></text>
                </view>
            </view>

            <!-- 认证状态区（三格联动真实认证状态） -->
            <view class="auth-status-card">
                <view class="auth-status__item"
                      :class="{ 'is-active': isLogin && authStatus.realName }"
                      @click="checkAuthAndExecute(goToRealNameAuth)">
                    <text class="auth-status__icon icon icon-id-card" :class="{ 'is-active': isLogin && authStatus.realName }"></text>
                    <view class="auth-status__info">
                        <text class="auth-status__label">身份</text>
                        <text class="auth-status__status" :class="(isLogin && authStatus.realName) ? 'is-done' : 'is-pending'">
                            {{ (isLogin && authStatus.realName) ? '已认证' : '去认证' }}
                        </text>
                    </view>
                    <text class="auth-status__arrow icon icon-arrow-right" v-if="!isLogin || !authStatus.realName"></text>
                </view>

                <view class="auth-status__item"
                      :class="{ 'is-active': isLogin && authStatus.education }"
                      @click="checkAuthAndExecute(goToEducationAuth)">
                    <text class="auth-status__icon icon icon-graduation" :class="{ 'is-active': isLogin && authStatus.education }"></text>
                    <view class="auth-status__info">
                        <text class="auth-status__label">学历</text>
                        <text class="auth-status__status" :class="(isLogin && authStatus.education) ? 'is-done' : 'is-pending'">
                            {{ (isLogin && authStatus.education) ? '已认证' : '去认证' }}
                        </text>
                    </view>
                    <text class="auth-status__arrow icon icon-arrow-right" v-if="!isLogin || !authStatus.education"></text>
                </view>

                <view class="auth-status__item"
                      :class="{ 'is-active': isLogin && authStatus.work }"
                      @click="checkAuthAndExecute(goToWorkAuth)">
                    <text class="auth-status__icon icon icon-briefcase" :class="{ 'is-active': isLogin && authStatus.work }"></text>
                    <view class="auth-status__info">
                        <text class="auth-status__label">单位</text>
                        <text class="auth-status__status" :class="(isLogin && authStatus.work) ? 'is-done' : 'is-pending'">
                            {{ (isLogin && authStatus.work) ? '已认证' : '去认证' }}
                        </text>
                    </view>
                    <text class="auth-status__arrow icon icon-arrow-right" v-if="!isLogin || !authStatus.work"></text>
                </view>
            </view>
        </view>

        <!-- ========================================== -->
        <!-- 2. 资料完成度（3.2 主页资料进度条 + 3.3 额度激励） -->
        <!-- ========================================== -->
        <view v-if="isLogin" class="completeness-card" :class="{ 'is-full': isCompletenessFull }">
            <view class="completeness-card__head">
                <view class="completeness-card__title-row">
                    <text class="completeness-card__title">资料完成度</text>
                    <text class="completeness-card__percent">{{ completeness }}%</text>
                </view>
                <text class="completeness-card__link" @click="goToEditProfile">
                    {{ isCompletenessFull ? '查看资料 ›' : '去完善 ›' }}
                </text>
            </view>

            <view class="completeness-bar">
                <view class="completeness-bar__fill" :style="{ width: completeness + '%' }"></view>
                <view class="completeness-bar__mark"></view>
            </view>

            <view class="completeness-card__foot">
                <text class="completeness-card__tip">{{ completenessTip }}</text>
                <text v-if="canClaimBonus"
                      class="completeness-card__claim"
                      @click="handleClaimBonus">领取次日 +{{ bonusAmount }} 次浏览</text>
            </view>
        </view>

        <!-- ========================================== -->
        <!-- 3. 核心数据统计卡（我的关注 / 我的心动 / 心动我的 / 今日来访） -->
        <!-- ========================================== -->
        <view class="stats-card">
            <view class="stats-card__item" @click="checkAuthAndExecute(goToFavoriteList)">
                <text class="stats-card__num">{{ isLogin ? userStore.followCount : '-' }}</text>
                <text class="stats-card__label">{{ actionLabels.myFollows }}</text>
            </view>
            <view class="stats-card__divider"></view>
            <view class="stats-card__item" @click="checkAuthAndExecute(() => goToLikeList('send'))">
                <text class="stats-card__num">{{ isLogin ? socialStore.myHeartCount : '-' }}</text>
                <text class="stats-card__label">{{ actionLabels.myHearts }}</text>
            </view>
            <view class="stats-card__divider"></view>
            <view class="stats-card__item" @click="checkAuthAndExecute(() => goToLikeList('receive'))">
                <text class="stats-card__num">
                    {{ isLogin ? socialStore.heartsMeCount : '-' }}
                    <text v-if="isLogin && socialStore.unmetHeartCount > 0" class="stats-card__dot"></text>
                </text>
                <text class="stats-card__label">{{ actionLabels.heartsMe }}</text>
            </view>
            <view class="stats-card__divider"></view>
            <view class="stats-card__item" @click="handleFootprintTap">
                <text class="stats-card__num">{{ isLogin ? socialStore.todayFootprintCount : '-' }}</text>
                <text class="stats-card__label">今日来访</text>
            </view>
        </view>

        <!-- ========================================== -->
        <!-- 4. 缘分足迹（3.9 好奇心钩子：仅数字，不泄露访客信息） -->
        <!-- ========================================== -->
        <view v-if="isLogin && socialStore.footprintVisible" class="footprint-card">
            <view class="footprint-card__close" @click="closeFootprint">
                <text class="icon icon-close"></text>
            </view>
            <view class="footprint-card__body" @click="handleFootprintTap">
                <view class="footprint-card__icon-wrap">
                    <text class="icon icon-location"></text>
                </view>
                <view class="footprint-card__info">
                    <text class="footprint-card__title">{{ footprintTitle }}</text>
                    <text class="footprint-card__sub">{{ footprintSub }}</text>
                </view>
                <text class="footprint-card__arrow icon icon-arrow-right"></text>
            </view>
        </view>

        <!-- ========================================== -->
        <!-- 5. 关系入口（我的申请 / 我的关注 / 关注我的） -->
        <!-- ========================================== -->
        <view class="entry-card">
            <view class="entry-card__item" @click="checkAuthAndExecute(goToMyApply)">
                <view class="entry-card__icon entry-card__icon--blue">
                    <text class="icon icon-comment"></text>
                </view>
                <view class="entry-card__info">
                    <text class="entry-card__title">我的申请</text>
                    <text class="entry-card__sub">{{ applySubText }}</text>
                </view>
                <text v-if="applyPendingCount > 0" class="entry-card__badge">{{ applyPendingCount }}</text>
                <text class="entry-card__arrow icon icon-arrow-right"></text>
            </view>

            <view class="entry-card__item" @click="checkAuthAndExecute(goToFavoriteList)">
                <view class="entry-card__icon entry-card__icon--star">
                    <text class="icon icon-follow-filled"></text>
                </view>
                <view class="entry-card__info">
                    <text class="entry-card__title">{{ actionLabels.myFollows }}</text>
                    <text class="entry-card__sub">{{ followSubText }}</text>
                </view>
                <text class="entry-card__arrow icon icon-arrow-right"></text>
            </view>

            <view class="entry-card__item" @click="checkAuthAndExecute(() => goToLikeList('follower'))">
                <view class="entry-card__icon entry-card__icon--pink">
                    <text class="icon icon-user"></text>
                </view>
                <view class="entry-card__info">
                    <text class="entry-card__title">{{ actionLabels.followers }}</text>
                    <text class="entry-card__sub">{{ followerSubText }}</text>
                </view>
                <text class="entry-card__arrow icon icon-arrow-right"></text>
            </view>
        </view>

        <!-- ========================================== -->
        <!-- 6. 权益摘要（点击进入权益中心） -->
        <!-- ========================================== -->
        <view class="equity-card" @click="checkAuthAndExecute(goToEquity)">
            <view class="equity-card__head">
                <view class="equity-card__title-row">
                    <text class="equity-card__icon icon icon-gift"></text>
                    <text class="equity-card__title">我的权益</text>
                </view>
                <text class="equity-card__more">
                    权益中心 <text class="icon icon-arrow-right"></text>
                </text>
            </view>

            <view class="equity-card__grid">
                <view class="equity-card__cell">
                    <text class="equity-card__num">{{ isLogin ? `${equity.remainBrowse}/${equity.browseTotal}` : '-' }}</text>
                    <text class="equity-card__label">今日浏览</text>
                </view>
                <view class="equity-card__cell">
                    <text class="equity-card__num">{{ isLogin ? `${equity.remainLike}/${equity.likeTotal}` : '-' }}</text>
                    <text class="equity-card__label">今日心动</text>
                </view>
                <view class="equity-card__cell">
                    <text class="equity-card__num">{{ isLogin ? equity.permanentLikes : '-' }}</text>
                    <text class="equity-card__label">永久心动</text>
                </view>
                <view class="equity-card__cell">
                    <text class="equity-card__num">{{ isLogin ? equity.exposureCards : '-' }}</text>
                    <text class="equity-card__label">同城曝光卡</text>
                </view>
            </view>
        </view>

        <!-- ========================================== -->
        <!-- 7. 工具菜单 -->
        <!-- ========================================== -->
        <view class="menu-card">
            <!-- 3.8 裂变邀请入口 -->
            <view class="menu-card__item" @click="goToInvite">
                <text class="menu-card__icon icon icon-share" style="color: #8AA07B;" />
                <text class="menu-card__label">邀请好友</text>
                <text class="menu-card__tip">好友实名后双方各得 {{ inviteRewardLikes }} 次心动</text>
                <text class="menu-card__arrow icon icon-arrow-right"></text>
            </view>
            <view class="menu-card__item" @click="checkAuthAndExecute(goToPrivacy)">
                <text class="menu-card__icon icon icon-lock" />
                <text class="menu-card__label">隐私设置</text>
                <text class="menu-card__arrow icon icon-arrow-right"></text>
            </view>
            <view class="menu-card__item" @click="goToAccount">
                <text class="menu-card__icon icon icon-shield" style="color: #FF9800;" />
                <text class="menu-card__label">账号与安全</text>
                <!-- 3.7 风控状态外显：处罚 / 降权 -->
                <text class="menu-card__tip" :class="{ 'menu-card__tip--warn': securityWarn }">
                    {{ securityText }}
                </text>
                <text class="menu-card__arrow icon icon-arrow-right"></text>
            </view>
            <view class="menu-card__item" @click="goToMyReports">
                <text class="menu-card__icon icon icon-flag" style="color: #C0392B;" />
                <text class="menu-card__label">我的举报</text>
                <text v-if="risk.pendingReports" class="menu-card__tip">{{ risk.pendingReports }} 条处理中</text>
                <text class="menu-card__arrow icon icon-arrow-right"></text>
            </view>
            <view class="menu-card__item" @click="goToAntiFraud">
                <text class="menu-card__icon icon icon-flag" />
                <text class="menu-card__label">反诈专区</text>
                <text class="menu-card__arrow icon icon-arrow-right"></text>
            </view>
            <view class="menu-card__item" @click="handleFeedback">
                <text class="menu-card__icon icon icon-edit" />
                <text class="menu-card__label">意见反馈</text>
                <text class="menu-card__arrow icon icon-arrow-right"></text>
            </view>
            <view class="menu-card__item" @click="goToSettings">
                <text class="menu-card__icon icon icon-settings" />
                <text class="menu-card__label">设置</text>
                <text class="menu-card__arrow icon icon-arrow-right"></text>
            </view>
        </view>

        <view class="page-bottom-placeholder"></view>

        <!-- 实名引导弹窗（3.1 弹窗统一规范：主按钮【去实名认证】+ 左上角取消） -->
        <PermissionModal :visible="realnameVisible"
                         mode="realname"
                         title="完成实名认证，解锁完整缘分"
                         :content="realnameContent"
                         confirm-text="去实名认证"
                         hint="实名信息全程加密，仅用于身份核验"
                         @confirm="goToRealNameAuth"
                         @cancel="realnameVisible = false"
                         @close="realnameVisible = false" />
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import PermissionModal from '@/components/common/PermissionModal.vue'
import SafetyBadge from '@/components/common/SafetyBadge.vue'
import { useUserStore, useEquityStore, useMatchStore, useSocialStore, useRiskStore } from '@/store/index'
import { COMPLETENESS_THRESHOLD, COMPLETENESS_BONUS } from '@/store/equity'
import { INVITE_REWARD_LIKES } from '@/mock/invite'
import { actionLabels } from '@/mock/copy'

const inviteRewardLikes = INVITE_REWARD_LIKES

const userStore = useUserStore()
const equity = useEquityStore()
const matchStore = useMatchStore()
const socialStore = useSocialStore()
const risk = useRiskStore()

// 3.7 风控状态外显：封禁 > 处罚 > 降权 > 正常
const securityText = computed(() => {
    if (risk.accountStatus === 'banned') return '已封禁'
    if (risk.accountStatus === 'restricted') return risk.penaltyLabel
    if (risk.deprioritized) return '已降权'
    return ''
})

const securityWarn = computed(() => risk.penaltyActive || risk.deprioritized)

// ===== 1. 登录态与用户信息（全部由 store 推导，不再本地造假） =====
const isLogin = computed(() => userStore.isLogin)
const userInfo = computed(() => userStore.userInfo || {})
const displayName = computed(() => userStore.displayName)
const authStatus = computed(() => userStore.authStatus)

const levelText = computed(() => {
    if (userStore.isCertified) return '已实名'
    return '待实名'
})

// 认证标识层级：1 仅实名 / 2 实名+学历 / 3 三认证
const authLevel = computed(() => {
    const auth = authStatus.value
    if (!auth.realName) return 0
    if (auth.education && auth.work) return 3
    if (auth.education) return 2
    return 1
})

// ===== 2. 资料完成度（3.2 / 3.3 额度激励） =====
const completeness = computed(() => userStore.profileCompleteness)
const isCompletenessFull = computed(() => completeness.value >= 100)
const isBonusReached = computed(() => completeness.value >= COMPLETENESS_THRESHOLD)
const bonusAmount = COMPLETENESS_BONUS

const canClaimBonus = computed(() => {
    if (!isLogin.value || !isBonusReached.value) return false
    return equity.canClaimCompletenessBonus(completeness.value)
})

const completenessTip = computed(() => {
    if (isCompletenessFull.value) {
        return equity.bonusClaimedDay
            ? '资料已完善，今日奖励已领取'
            : `资料已完善，可领取次日 +${COMPLETENESS_BONUS} 次浏览额度`
    }
    if (isBonusReached.value) {
        return equity.bonusClaimedDay
            ? '今日已领取「次日 +3 次浏览」奖励'
            : `已达标，可领取次日 +${COMPLETENESS_BONUS} 次浏览额度`
    }
    const gap = COMPLETENESS_THRESHOLD - completeness.value
    return `再完善 ${gap}% 即可解锁次日 +${COMPLETENESS_BONUS} 次浏览额度`
})

// ===== 3. 缘分足迹（3.9） =====
const footprintTitle = computed(() => socialStore.footprintText)
const footprintSub = computed(() => {
    if (userStore.isRegistered) return '完成实名认证后即可看见同城 TA'
    return '仅展示数量，不公开任何访客信息'
})

const realnameVisible = ref(false)
const realnameContent = computed(
    () => `${socialStore.footprintText}，完成实名认证后可继续查看并回应 TA 们。`
)

// ===== 4. 关系入口 =====
const applyPendingCount = computed(() => matchStore.receivedPendingCount)
const applySubText = computed(() => {
    if (!isLogin.value) return '登录查看交换微信申请进度'
    if (applyPendingCount.value > 0) return `${applyPendingCount.value} 条申请待你处理`
    return '查看交换微信申请进度'
})

const followSubText = computed(() => {
    if (!isLogin.value) return '登录后可关注合眼缘的 TA'
    const count = userStore.followCount
    return count > 0 ? `已关注 ${count} 位 TA，心动不占额度` : '关注是免费收藏夹，先存起来慢慢看'
})

const followerSubText = computed(() => {
    if (!isLogin.value) return '登录后查看谁关注了你'
    const count = socialStore.followerCount
    return count > 0 ? `${count} 位同城 TA 关注了你` : '完善资料，让更多同城 TA 找到你'
})

// ===== 5. 鉴权统一拦截器 =====
const checkAuthAndExecute = (action) => {
    if (!isLogin.value) {
        handleLoginGuide()
        return
    }
    if (typeof action === 'function') action()
}

const handleLoginGuide = () => {
    uni.navigateTo({ url: '/pages/auth/login' })
}

// ===== 6. 业务跳转 =====
const goToMyProfile = () => {
    if (!isLogin.value) return handleLoginGuide()
    uni.navigateTo({ url: '/pages/profile/myProfile' })
}
const goToEditProfile = () => {
    uni.navigateTo({ url: '/pages/profile/edit' })
}
const goToRealNameAuth = () => {
    realnameVisible.value = false
    uni.navigateTo({ url: '/pages/auth/realname' })
}
const goToEducationAuth = () => {
    if (!userStore.authStatus.realName) {
        realnameVisible.value = true
        return
    }
    uni.navigateTo({ url: '/pages/auth/education' })
}
const goToWorkAuth = () => {
    if (!userStore.authStatus.realName) {
        realnameVisible.value = true
        return
    }
    uni.navigateTo({ url: '/pages/auth/work' })
}
const goToLikeList = (type) => {
    uni.navigateTo({ url: `/pages/user/likeList?type=${type}` })
}
const goToFavoriteList = () => {
    uni.navigateTo({ url: '/pages/user/favoriteList' })
}
const goToMyApply = () => {
    uni.navigateTo({ url: '/pages/match/myApply' })
}
const goToEquity = () => {
    uni.navigateTo({ url: '/pages/profile/equity' })
}
const goToPrivacy = () => {
    uni.navigateTo({ url: '/pages/profile/privacy' })
}
const goToAntiFraud = () => {
    uni.navigateTo({ url: '/pages/common/antiFraud' })
}
const goToAccount = () => {
    uni.navigateTo({ url: '/pages/profile/account' })
}
const goToMyReports = () => {
    uni.navigateTo({ url: '/pages/common/myReports' })
}
const handleFeedback = () => {
    uni.navigateTo({ url: '/pages/common/feedback' })
}
const goToSettings = () => {
    uni.navigateTo({ url: '/pages/profile/settings' })
}
// 3.8 裂变邀请
const goToInvite = () => {
    if (!isLogin.value) return handleLoginGuide()
    uni.navigateTo({ url: '/pages/invite/index' })
}

// ===== 7. 交互 =====
// 3.9 分层交互：未实名 → 实名引导弹窗；已实名 → 轻提示完善资料
const handleFootprintTap = () => {
    if (!isLogin.value) return handleLoginGuide()
    if (userStore.isRegistered) {
        realnameVisible.value = true
        return
    }
    if (!socialStore.hasFootprint) {
        uni.showToast({ title: '发条动态，让更多同城 TA 看到你', icon: 'none' })
        return
    }
    goToEditProfile()
}

const closeFootprint = () => {
    socialStore.closeFootprint()
}

const handleClaimBonus = () => {
    if (equity.claimCompletenessBonus(completeness.value)) {
        uni.showToast({ title: `已领取，次日 +${COMPLETENESS_BONUS} 次浏览`, icon: 'none' })
        return
    }
    uni.showToast({ title: `资料完成度需达到 ${COMPLETENESS_THRESHOLD}%`, icon: 'none' })
}

// ===== 8. 页面展示同步（跨天重置 / 兜底初始化） =====
onShow(() => {
    if (!matchStore.seeded) matchStore.restore()
    if (!socialStore.seeded) socialStore.restore()
    equity.ensureToday()
    socialStore.ensureToday()
    // 3.7 举报时效推进（AI 初审 5 分钟 → 人工审核 → 到期出结果）
    risk.restore()
})
</script>

<style lang="scss" scoped>
    // 变量统一定义
    $bg-page: #FAFAFA;
    $bg-card: #FFFFFF;
    $text-primary: #333333;
    $text-secondary: #666666;
    $text-helper: #999999;
    $border-light: #E5E5E5;
    $primary-color: #A8B89A;
    $primary-dark: #8AA07B;
    $primary-light-bg: #F2F5EF;
    $radius-card: 20px;
    $shadow-card: 0 2px 12px rgba(0, 0, 0, 0.04);

    .profile-page {
        min-height: 100vh;
        background-color: $bg-page;
        padding-top: 12px;
    }

    // ----- 1. 个人信息头部 -----
    .profile-header {
        background-color: $bg-card;
        padding: 24px 16px 16px;
        margin-bottom: 12px;
    }

    .profile-header__main {
        display: flex;
        gap: 14px;
        align-items: center;
        margin-bottom: 16px;
    }

    .profile-header__avatar-wrap {
        position: relative;
        flex-shrink: 0;
        cursor: pointer;
    }

    .profile-header__avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background-color: $bg-page;
        border: 2px solid $bg-card;
        box-shadow: $shadow-card;
        display: block;
    }

    .avatar-auth-icon {
        position: absolute;
        right: 0;
        bottom: 2px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid $bg-card;

        .icon {
            font-size: 10px;
            color: #FFFFFF;
            line-height: 1;
        }

        &.auth-level-1 {
            background-color: transparent;
            border: 1.5px solid #81D4A0;

            .icon {
                color: #81D4A0;
                font-size: 9px;
            }
        }

        &.auth-level-2 {
            background-color: #2ED573;
            border: 2px solid $bg-card;
        }

        &.auth-level-3 {
            background: linear-gradient(135deg, #FFD700, #FFB74D);
            border: 2px solid $bg-card;
            box-shadow: 0 0 6px rgba(255, 183, 77, 0.4);
        }
    }

    .profile-header__info {
        flex: 1;
        min-width: 0;
        cursor: pointer;
    }

    .profile-header__name-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2px;
    }

    .profile-header__name {
        font-size: 19px;
        font-weight: 600;
        color: $text-primary;
        line-height: 1.2;
    }

    .profile-header__hint {
        font-size: 12px;
        color: $primary-color;
        font-weight: 500;
        flex-shrink: 0;

        &:active {
            opacity: 0.7;
        }
    }

    .profile-header__meta {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .profile-header__id {
        font-size: 12px;
        color: $text-helper;
        line-height: 2;
    }

    .profile-header__level {
        font-size: 10px;
        color: $primary-dark;
        background-color: $primary-light-bg;
        padding: 1px 8px;
        border-radius: 10px;
        line-height: 1.6;
    }

    // 未登录 Header 样式
    .profile-header__unlogin {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
        cursor: pointer;
        padding: 4px 0;

        &:active {
            opacity: 0.85;
        }
    }

    .unlogin-avatar-wrap {
        position: relative;
        flex-shrink: 0;
    }

    .unlogin-avatar-placeholder {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background-color: $primary-light-bg;
        display: flex;
        align-items: center;
        justify-content: center;

        .icon {
            font-size: 28px;
            color: $primary-color;
        }
    }

    .unlogin-info {
        flex: 1;
        min-width: 0;
    }

    .unlogin-title-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
    }

    .unlogin-title {
        font-size: 18px;
        font-weight: 600;
        color: $text-primary;
    }

    .unlogin-subtitle {
        font-size: 12px;
        color: $text-helper;
    }

    .unlogin-arrow {
        color: $text-helper;
        font-size: 14px;
    }

    // 认证状态卡
    .auth-status-card {
        display: flex;
        gap: 8px;
    }

    .auth-status__item {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border-radius: 12px;
        background-color: $bg-page;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 0;
        position: relative;

        &:active {
            transform: scale(0.97);
        }

        &.is-active {
            background: rgba(168, 184, 154, 0.12);
            border: 1px solid rgba(168, 184, 154, 0.25);
            box-shadow: 0 1px 4px rgba(168, 184, 154, 0.08);

            .auth-status__icon {
                color: $primary-dark;
            }

            .auth-status__label {
                color: $text-primary;
            }

            .auth-status__status.is-done {
                color: $primary-dark;
            }
        }

        &:not(.is-active) {
            .auth-status__icon {
                color: $text-helper;
            }

            .auth-status__status.is-pending {
                color: $primary-color;
                font-weight: 500;
            }

            .auth-status__arrow {
                animation: arrowPulse 2s ease-in-out infinite;
            }
        }
    }

    .auth-status__icon {
        font-size: 18px;
        flex-shrink: 0;
        transition: all 0.3s ease;
        width: 16px;
        text-align: center;
    }

    .auth-status__info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .auth-status__label {
        font-size: 12px;
        color: $text-helper;
        line-height: 1.3;
        letter-spacing: 0.3px;
    }

    .auth-status__status {
        font-size: 12px;
        line-height: 1.3;

        &.is-done {
            color: $text-helper;
        }

        &.is-pending {
            color: $primary-color;
        }
    }

    .auth-status__arrow {
        font-size: 12px;
        color: $primary-color;
        flex-shrink: 0;
        margin-left: 2px;
    }

    @keyframes arrowPulse {
        0%, 100% {
            transform: translateX(0);
            opacity: 0.7;
        }

        50% {
            transform: translateX(3px);
            opacity: 1;
        }
    }

    // ----- 2. 资料完成度 -----
    .completeness-card {
        background-color: $bg-card;
        margin: 0 16px 12px;
        border-radius: $radius-card;
        padding: 14px 16px;
        box-shadow: $shadow-card;

        &.is-full {
            .completeness-bar__fill {
                background: linear-gradient(90deg, #A8D5A2, #6FBF73);
            }
        }
    }

    .completeness-card__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    .completeness-card__title-row {
        display: flex;
        align-items: baseline;
        gap: 6px;
    }

    .completeness-card__title {
        font-size: 14px;
        font-weight: 500;
        color: $text-primary;
    }

    .completeness-card__percent {
        font-size: 15px;
        font-weight: 600;
        color: $primary-dark;
    }

    .completeness-card__link {
        font-size: 12px;
        color: $primary-color;

        &:active {
            opacity: 0.7;
        }
    }

    .completeness-bar {
        position: relative;
        height: 8px;
        border-radius: 4px;
        background-color: $primary-light-bg;
        overflow: hidden;
    }

    .completeness-bar__fill {
        height: 100%;
        border-radius: 4px;
        background: linear-gradient(90deg, #C6D5B8, $primary-color);
        transition: width 0.4s ease;
    }

    // 80% 达标刻度线
    .completeness-bar__mark {
        position: absolute;
        top: 0;
        left: 80%;
        width: 1px;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.9);
    }

    .completeness-card__foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 8px;
        gap: 8px;
    }

    .completeness-card__tip {
        flex: 1;
        font-size: 11px;
        color: $text-helper;
        line-height: 1.5;
    }

    .completeness-card__claim {
        flex-shrink: 0;
        font-size: 11px;
        color: #FFFFFF;
        background-color: $primary-color;
        padding: 3px 10px;
        border-radius: 12px;

        &:active {
            opacity: 0.8;
        }
    }

    // ----- 3. 核心统计卡 -----
    .stats-card {
        display: flex;
        align-items: center;
        background-color: $bg-card;
        margin: 0 16px 12px;
        border-radius: $radius-card;
        padding: 16px 0;
        box-shadow: $shadow-card;
    }

    .stats-card__item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        cursor: pointer;

        &:active {
            opacity: 0.7;
        }
    }

    .stats-card__num {
        position: relative;
        font-size: 20px;
        font-weight: 600;
        color: $text-primary;
        line-height: 1.2;
    }

    .stats-card__dot {
        position: absolute;
        top: 1px;
        right: -7px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #FF6B6B;
    }

    .stats-card__label {
        font-size: 12px;
        color: $text-helper;
    }

    .stats-card__divider {
        width: 1px;
        height: 28px;
        background-color: $border-light;
    }

    // ----- 4. 缘分足迹 -----
    .footprint-card {
        position: relative;
        margin: 0 16px 12px;
        border-radius: $radius-card;
        background: linear-gradient(135deg, #FDF6EC, #F5F0E6);
        border: 1px solid rgba(214, 190, 150, 0.35);
        box-shadow: 0 2px 12px rgba(196, 168, 122, 0.12);
    }

    .footprint-card__close {
        position: absolute;
        top: 6px;
        right: 8px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(150, 130, 100, 0.6);

        .icon {
            font-size: 11px;
        }
    }

    .footprint-card__body {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 32px 14px 14px;
        cursor: pointer;

        &:active {
            opacity: 0.85;
        }
    }

    .footprint-card__icon-wrap {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .icon {
            font-size: 16px;
            color: #C9A227;
        }
    }

    .footprint-card__info {
        flex: 1;
        min-width: 0;
    }

    .footprint-card__title {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: #8A6D2F;
        line-height: 1.5;
    }

    .footprint-card__sub {
        display: block;
        font-size: 11px;
        color: #A08850;
        line-height: 1.5;
    }

    .footprint-card__arrow {
        font-size: 12px;
        color: #C0A970;
        flex-shrink: 0;
    }

    // ----- 5. 关系入口 -----
    .entry-card {
        background-color: $bg-card;
        margin: 0 16px 12px;
        border-radius: $radius-card;
        overflow: hidden;
        box-shadow: $shadow-card;

        &__item {
            display: flex;
            align-items: center;
            padding: 14px 16px;
            cursor: pointer;

            &:not(:last-child) {
                border-bottom: 1px solid $border-light;
            }

            &:active {
                background-color: $bg-page;
            }
        }

        &__icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;

            .icon {
                font-size: 18px;
                color: #FFFFFF;
            }

            &--pink {
                background: linear-gradient(135deg, #FF9A9E, #F76B8A);
            }

            &--blue {
                background: linear-gradient(135deg, #4FACFE, #0099FF);
            }

            // 关注：主色绿渐变（与心动的暖粉形成视觉分工）
            &--star {
                background: linear-gradient(135deg, #A8B89A, #8A9B7A);
            }
        }

        &__info {
            flex: 1;
            min-width: 0;
        }

        &__title {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: $text-primary;
        }

        &__sub {
            display: block;
            font-size: 11px;
            color: $text-helper;
        }

        &__badge {
            min-width: 18px;
            height: 18px;
            padding: 0 5px;
            border-radius: 9px;
            background-color: #FF6B6B;
            color: #FFFFFF;
            font-size: 11px;
            text-align: center;
            line-height: 18px;
            margin-right: 6px;
        }

        &__arrow {
            font-size: 12px;
            color: $text-helper;
        }
    }

    // ----- 6. 权益摘要 -----
    .equity-card {
        background-color: $bg-card;
        margin: 0 16px 12px;
        border-radius: $radius-card;
        padding: 14px 16px;
        box-shadow: $shadow-card;
        cursor: pointer;

        &:active {
            opacity: 0.9;
        }
    }

    .equity-card__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
    }

    .equity-card__title-row {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .equity-card__icon {
        font-size: 15px;
        color: $primary-color;
    }

    .equity-card__title {
        font-size: 14px;
        font-weight: 500;
        color: $text-primary;
    }

    .equity-card__more {
        font-size: 12px;
        color: $text-helper;

        .icon {
            font-size: 10px;
        }
    }

    .equity-card__grid {
        display: flex;
        align-items: center;
    }

    .equity-card__cell {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
    }

    .equity-card__num {
        font-size: 16px;
        font-weight: 600;
        color: $primary-dark;
        line-height: 1.2;
    }

    .equity-card__label {
        font-size: 11px;
        color: $text-helper;
    }

    // ----- 7. 工具菜单 -----
    .menu-card {
        background-color: $bg-card;
        margin: 0 16px 12px;
        border-radius: $radius-card;
        overflow: hidden;
        box-shadow: $shadow-card;
    }

    .menu-card__item {
        display: flex;
        align-items: center;
        padding: 14px 16px;
        border-bottom: 1px solid $border-light;
        cursor: pointer;

        &:last-child {
            border-bottom: none;
        }

        &:active {
            background-color: $bg-page;
        }
    }

    .menu-card__icon {
        font-size: 18px;
        color: $text-secondary;
        margin-right: 12px;
    }

    .menu-card__label {
        flex: 1;
        font-size: 14px;
        color: $text-primary;
    }

    .menu-card__tip {
        font-size: 10px;
        color: $primary-dark;
        margin-right: 6px;

        &--warn {
            color: #C0392B;
        }
    }

    .menu-card__arrow {
        font-size: 12px;
        color: $text-helper;
    }

    .page-bottom-placeholder {
        height: 24px;
    }
</style>
