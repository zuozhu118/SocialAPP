<template>
    <view class="debug-page">
        <CustomNavbar title="开发者调试" :show-back="true" @back="handleBack" />

        <view class="debug-body">
            <!-- 当前身份 -->
            <view class="debug-card">
                <view class="debug-card__title">当前身份</view>
                <view class="debug-identity">
                    <image class="debug-identity__avatar" :src="userStore.userInfo?.avatar || ''" mode="aspectFill" />
                    <view class="debug-identity__info">
                        <text class="debug-identity__name">{{ userStore.displayName }}</text>
                        <text class="debug-identity__level" :class="'is-' + userStore.level">{{ levelLabel }}</text>
                    </view>
                </view>
                <view class="debug-meta">
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">性别</text>
                        <text class="debug-meta__value">{{ userStore.gender === 'female' ? '女' : '男' }}</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">资料完整度</text>
                        <text class="debug-meta__value">{{ userStore.profileCompleteness }}%</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">我的关注</text>
                        <text class="debug-meta__value">{{ userStore.follows.length }} 个</text>
                    </view>
                </view>
            </view>

            <!-- 三级权限切换 -->
            <view class="debug-card">
                <view class="debug-card__title">切换权限层级</view>
                <view class="debug-card__desc">用于验收三级权限下的页面表现</view>
                <view class="debug-segments">
                    <view v-for="item in levels"
                          :key="item.value"
                          class="debug-segments__item"
                          :class="{ 'is-active': userStore.level === item.value }"
                          @click="switchLevel(item.value)">
                        {{ item.label }}
                    </view>
                </view>
            </view>

            <!-- 性别切换 -->
            <view class="debug-card">
                <view class="debug-card__title">切换性别</view>
                <view class="debug-card__desc">影响每日心动额度（男 3 次 / 女 5 次）</view>
                <view class="debug-segments">
                    <view class="debug-segments__item"
                          :class="{ 'is-active': userStore.gender === 'male' }"
                          @click="switchGender('male')">
                        男
                    </view>
                    <view class="debug-segments__item"
                          :class="{ 'is-active': userStore.gender === 'female' }"
                          @click="switchGender('female')">
                        女
                    </view>
                </view>
            </view>

            <!-- 额度状态 -->
            <view class="debug-card">
                <view class="debug-card__title">额度状态</view>
                <view class="debug-meta">
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">今日浏览</text>
                        <text class="debug-meta__value">{{ equity.remainBrowse }}/{{ equity.browseTotal }}</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">今日心动</text>
                        <text class="debug-meta__value">{{ equity.remainLike }}/{{ equity.likeTotal }}</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">永久心动</text>
                        <text class="debug-meta__value">{{ equity.permanentLikes }} 次</text>
                    </view>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="resetQuota">重置额度</button>
                    <button class="debug-btn" @click="addPermanent">+5 永久心动</button>
                </view>
            </view>

            <!-- 匹配关系（M3） -->
            <view class="debug-card">
                <view class="debug-card__title">匹配与微信交换</view>
                <view class="debug-meta">
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">双向匹配</text>
                        <text class="debug-meta__value">{{ matchStore.matchedCount }} 人</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">待我处理</text>
                        <text class="debug-meta__value">{{ matchStore.receivedPendingCount }} 条</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">已换微信</text>
                        <text class="debug-meta__value">{{ matchStore.wechatExchanged.length }} 人</text>
                    </view>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="simulateMatch">模拟双向匹配</button>
                    <button class="debug-btn" @click="goApply">看申请页</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="goMyApply">看申请列表</button>
                    <button class="debug-btn debug-btn--danger" @click="resetMatch">重置匹配数据</button>
                </view>
                <text class="debug-card__hint">
                    模拟会与「陈橘子」建立双向匹配并置顶到匹配页；重置后恢复 4 条预置关系
                </text>
            </view>

            <!-- 动态广场（M4） -->
            <view class="debug-card">
                <view class="debug-card__title">动态广场</view>
                <view class="debug-meta">
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">同城 / 跨城</text>
                        <text class="debug-meta__value">{{ square.sameCityFeed.length }} / {{ square.crossCityFeed.length }}</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">我发布的</text>
                        <text class="debug-meta__value">{{ square.myDynamics.length }} 条</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">已点赞</text>
                        <text class="debug-meta__value">{{ square.likedIds.length }} 条</text>
                    </view>
                </view>
                <view class="debug-meta">
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">当前城市</text>
                        <text class="debug-meta__value">{{ square.city }}</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">取消匹配天数</text>
                        <text class="debug-meta__value">{{ square.idleDays }} 天</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">已屏蔽</text>
                        <text class="debug-meta__value">{{ square.blockedUserIds.length }} 人</text>
                    </view>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="goSquare">看广场</button>
                    <button class="debug-btn" @click="toggleCity">切换城市</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="markQuality">标记优质动态</button>
                    <button class="debug-btn" @click="simulateIdle">模拟 4 天无匹配</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="blockFirstCommenter">屏蔽首位评论者</button>
                    <button class="debug-btn debug-btn--danger" @click="resetSquare">重置动态数据</button>
                </view>
                <text class="debug-card__hint">
                    标记优质会给作者发放 3 次永久心动（本人动态可在权益中心看到记录）；
                    切换城市用于验收「同城不足补跨城」冷启动兜底
                </text>
            </view>

            <!-- 个人中心 / 权益中心（M5） -->
            <view class="debug-card">
                <view class="debug-card__title">个人中心与权益</view>
                <view class="debug-meta">
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">我的心动</text>
                        <text class="debug-meta__value">{{ social.myHeartCount }} 人</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">心动我的</text>
                        <text class="debug-meta__value">{{ social.heartsMeCount }} 人</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">待回应</text>
                        <text class="debug-meta__value">{{ social.unmetHeartCount }} 人</text>
                    </view>
                </view>
                <view class="debug-meta">
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">关注我的</text>
                        <text class="debug-meta__value">{{ social.followerCount }} 人</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">今日来访</text>
                        <text class="debug-meta__value">{{ social.todayFootprintCount }} 位</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">足迹提示</text>
                        <text class="debug-meta__value">{{ social.footprintVisible ? '展示中' : '已关闭' }}</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">权益记录</text>
                        <text class="debug-meta__value">{{ equity.records.length }} 条</text>
                    </view>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="goProfile">看个人中心</button>
                    <button class="debug-btn" @click="goEquity">看权益中心</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="goLikeList">看心动关系</button>
                    <button class="debug-btn" @click="simulateFootprint">+1 今日来访</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="addFollow">+1 关注</button>
                    <button class="debug-btn debug-btn--danger" @click="resetSocial">重置社交数据</button>
                </view>
                <text class="debug-card__hint">
                    今日来访口径 = 当日真实主页浏览 + 未实名暂存心动，按同城异性统计；
                    「+1 今日来访」会补一位同城异性浏览记录，用于验收 3.9 缘分足迹文案
                </text>
            </view>

            <!-- 学历/工作认证（M6） -->
            <view class="debug-card">
                <view class="debug-card__title">学历 / 工作认证</view>
                <view class="debug-meta">
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">实名认证</text>
                        <text class="debug-meta__value">{{ userStore.certificationOf('realName') === 'success' ? '已认证' : '未认证' }}</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">学历认证</text>
                        <text class="debug-meta__value">{{ certLabel('education') }}</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">工作认证</text>
                        <text class="debug-meta__value">{{ certLabel('work') }}</text>
                    </view>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="goEducation">学历认证页</button>
                    <button class="debug-btn" @click="goWork">工作认证页</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="approveAll">一键双认证</button>
                    <button class="debug-btn" @click="rejectEducation">模拟驳回学历</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn debug-btn--danger" @click="resetCerts">重置认证数据</button>
                </view>
                <text class="debug-card__hint">
                    双认证是优质惊喜推荐门槛；首次学历/工作认证各 +5 次永久心动（权益记录可查）
                </text>
            </view>

            <!-- 通知与裂变（M7） -->
            <view class="debug-card">
                <view class="debug-card__title">通知与裂变</view>
                <view class="debug-meta">
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">通知总数</text>
                        <text class="debug-meta__value">{{ notify.totalCount }}</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">未读</text>
                        <text class="debug-meta__value">{{ notify.unreadCount }}</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">今日额度提醒</text>
                        <text class="debug-meta__value">{{ quotaPushedText }}</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">已邀请好友</text>
                        <text class="debug-meta__value">{{ invite.inviteCount }} 人</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">邀请获得心动</text>
                        <text class="debug-meta__value">{{ invite.rewardLikes }} 次</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">我的邀请码</text>
                        <text class="debug-meta__value">{{ invite.code || '——' }}</text>
                    </view>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="goNotifyPage">看通知页</button>
                    <button class="debug-btn" @click="goInvitePage">看邀请页</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="simulateHeartMe">模拟收到心动</button>
                    <button class="debug-btn" @click="simulateMatchM7">模拟匹配成功</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="simulateApplyReceive">模拟收到申请</button>
                    <button class="debug-btn" @click="simulateLikeDynamic">模拟收到点赞</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="simulateComment">模拟收到评论</button>
                    <button class="debug-btn" @click="pushQuota9">9 点额度提醒</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="pushQuota20">20 点额度提醒</button>
                    <button class="debug-btn" @click="markAllNotifyRead">通知全部已读</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="simulateInviteJoin">模拟好友加入</button>
                    <button class="debug-btn" @click="simulateInviteReward">模拟好友实名</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="goLandingPage">游客落地页</button>
                    <button class="debug-btn debug-btn--danger" @click="resetNotifyInvite">重置通知与邀请</button>
                </view>
                <text class="debug-card__hint">
                    游客不推匹配类通知；未实名推送实名引导；额度提醒仅男性 9/20 点推送。邀请奖励双方各 +5 次永久心动，无现金奖励
                </text>
            </view>

            <!-- 隐私与风控（M8） -->
            <view class="debug-card">
                <view class="debug-card__title">隐私与风控</view>
                <view class="debug-meta">
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">动态可见范围</text>
                        <text class="debug-meta__value">{{ privacy.dynamicScope === 'all' ? '全部' : privacy.dynamicScope === 'matched' ? '仅匹配' : '仅自己' }}</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">自动拒绝</text>
                        <text class="debug-meta__value">{{ autoRejectText }}</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">黑名单</text>
                        <text class="debug-meta__value">{{ privacy.blacklistCount }} 人</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">我的举报</text>
                        <text class="debug-meta__value">{{ risk.reportCount }} 条</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">处理中</text>
                        <text class="debug-meta__value">{{ risk.pendingReports }} 条</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">风控分</text>
                        <text class="debug-meta__value">{{ risk.riskScore }}</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">账号状态</text>
                        <text class="debug-meta__value">{{ risk.accountStatus === 'normal' ? '正常' : risk.accountStatus === 'banned' ? '已封禁' : risk.penaltyLabel }}</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">注销状态</text>
                        <text class="debug-meta__value">{{ risk.deactivated ? '已注销' : '正常' }}</text>
                    </view>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="goPrivacyPage">看隐私设置</button>
                    <button class="debug-btn" @click="goBlacklistPage">看黑名单</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="goReportPage">看举报页</button>
                    <button class="debug-btn" @click="goMyReportsPage">看我的举报</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="goAccountPage">看账号与安全</button>
                    <button class="debug-btn" @click="simulateBlock">拉黑一个用户</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="simulateReport">模拟提交骚扰举报</button>
                    <button class="debug-btn" @click="simulateApply24h">模拟 24h 未处理申请</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="advanceAudit">推进审核到出结果</button>
                    <button class="debug-btn" @click="triggerRiskEvent">触发风控扣分</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="applyPenalty">下发禁发 7 天</button>
                    <button class="debug-btn" @click="reviveAccount">恢复账号正常</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn debug-btn--danger" @click="resetPrivacyRisk">重置隐私与风控</button>
                </view>
                <text class="debug-card__hint">
                    女性骚扰/诈骗/色情举报 12h 置顶；普通举报 24h；AI 初审 5 分钟。风控分低于 60 自动降权，不向女性推送
                </text>
            </view>

            <!-- 全局收口（M9） -->
            <view class="debug-card">
                <view class="debug-card__title">城市生效与全局文案</view>
                <view class="debug-meta">
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">生效城市</text>
                        <text class="debug-meta__value">{{ userStore.matchCity || '——' }}</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">待生效切换</text>
                        <text class="debug-meta__value">{{ cityPendingText }}</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">时段标题</text>
                        <text class="debug-meta__value">{{ timeTitleText }}</text>
                    </view>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="simulateChangeCity">改为上海（24h 生效）</button>
                    <button class="debug-btn" @click="advanceCity">拨快 24 小时</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="clearCityChange">清除切换记录</button>
                    <button class="debug-btn" @click="showWeakNetworkToast">弱网提示文案</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="showSystemErrorToast">系统异常文案</button>
                    <button class="debug-btn" @click="showComfortCopy">3 天无匹配安抚文案</button>
                </view>
                <text class="debug-card__hint">
                    第 6 章：仅手动填写常住城市，改城市 24 小时生效；生效前匹配/广场仍按旧城市推荐
                </text>
            </view>

            <!-- 数据管理 -->
            <view class="debug-card">
                <view class="debug-card__title">本地数据</view>
                <view class="debug-actions">
                    <button class="debug-btn debug-btn--danger" @click="clearAll">清空本地缓存</button>
                </view>
                <text class="debug-card__hint">清空后身份回到游客，额度与关注一并重置</text>
            </view>
        </view>
    </view>
</template>

<script setup>
    import { computed } from 'vue'
    import { onShow } from '@dcloudio/uni-app'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'
    import { findUserById } from '@/mock/users'
    import { businessCopy, emptyCopy, getTimeSlotTitle } from '@/mock/copy'
    import {
        useUserStore,
        useEquityStore,
        useMatchStore,
        useSquareStore,
        useSocialStore,
        useNotifyStore,
        useInviteStore,
        usePrivacyStore,
        useRiskStore
    } from '@/store/index'

    const userStore = useUserStore()
    const equity = useEquityStore()
    const matchStore = useMatchStore()
    const square = useSquareStore()
    const social = useSocialStore()
    const notify = useNotifyStore()
    const invite = useInviteStore()
    const privacy = usePrivacyStore()
    const risk = useRiskStore()

    const quotaPushedText = computed(() => {
        const list = notify.quotaPushedToday
        return list.length ? list.map(h => `${h}点`).join(' / ') : '未推送'
    })

    const levels = [
        { label: '游客', value: 'guest' },
        { label: '注册未实名', value: 'registered' },
        { label: '已实名', value: 'certified' }
    ]

    const levelLabel = computed(() => {
        const map = { guest: '游客', registered: '注册未实名', certified: '已实名' }
        return map[userStore.level]
    })

    onShow(() => {
        equity.init(userStore.gender)
        matchStore.restore()
        square.restore()
        social.restore()
        notify.restore()
        invite.restore()
        privacy.restore()
        risk.restore()
        notify.syncBadge()
    })

    const handleBack = () => uni.navigateBack()

    const switchLevel = (level) => {
        userStore.switchLevel(level)
        equity.init(userStore.gender)
        uni.showToast({ title: `已切换为${levelLabel.value}`, icon: 'none' })
    }

    const switchGender = (gender) => {
        userStore.updateProfile({ gender })
        equity.init(gender)
        uni.showToast({ title: `已切换为${gender === 'female' ? '女性' : '男性'}视角`, icon: 'none' })
    }

    const resetQuota = () => {
        equity.resetAll()
        uni.showToast({ title: '额度已重置', icon: 'none' })
    }

    const addPermanent = () => {
        equity.addPermanentLikes(5, '调试发放')
        uni.showToast({ title: '已发放 5 次永久心动', icon: 'none' })
    }

    const clearAll = () => {
        uni.showModal({
            title: '清空本地缓存',
            content: '将清除登录状态、额度、匹配关系与关注，确定继续吗？',
            success: (res) => {
                if (!res.confirm) return
                try {
                    uni.clearStorageSync()
                } catch (e) {
                    console.warn(e)
                }
                userStore.logout()
                equity.resetAll()
                matchStore.resetAll()
                square.resetAll()
                social.resetAll()
                notify.resetAll()
                invite.resetAll()
                privacy.resetAll()
                risk.resetAll()
                uni.showToast({ title: '已恢复初始状态', icon: 'none' })
            }
        })
    }

    // ===== M3：匹配关系调试 =====
    const simulateMatch = () => {
        const record = matchStore.createMatch(2)
        uni.showToast({ title: '已与陈橘子双向匹配', icon: 'none' })
        setTimeout(() => uni.switchTab({ url: '/pages/match/index' }), 600)
        return record
    }

    const goApply = () => {
        const target = matchStore.matches[0]
        if (!target) {
            uni.showToast({ title: '暂无匹配关系', icon: 'none' })
            return
        }
        uni.navigateTo({ url: `/pages/match/apply?userId=${target.userId}` })
    }

    const goMyApply = () => {
        uni.navigateTo({ url: '/pages/match/myApply' })
    }

    const resetMatch = () => {
        matchStore.resetAll()
        uni.showToast({ title: '匹配数据已重置', icon: 'none' })
    }

    // ===== M4：动态广场调试 =====
    const goSquare = () => {
        uni.switchTab({ url: '/pages/square/index' })
    }

    const toggleCity = () => {
        const next = square.city === '北京市' ? '天津市' : '北京市'
        square.setCity(next)
        const need = Math.max(0, 5 - square.sameCityFeed.length)
        uni.showToast({
            title: need > 0 ? `${next}：补 ${need} 条跨城` : `${next}：同城充足`,
            icon: 'none'
        })
    }

    const markQuality = () => {
        const target = square.myDynamics[0] || square.dynamics[0]
        if (!target) {
            uni.showToast({ title: '暂无动态', icon: 'none' })
            return
        }
        const res = square.markQuality(target.id)
        if (res.already) {
            uni.showToast({ title: '已是优质动态', icon: 'none' })
            return
        }
        uni.showToast({
            title: res.rewarded ? `已标记优质，+${res.rewarded} 永久心动` : '已标记优质',
            icon: 'none'
        })
    }

    const simulateIdle = () => {
        const d = new Date()
        d.setDate(d.getDate() - 4)
        const pad = (n) => String(n).padStart(2, '0')
        square.firstOpenDay = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
        square.comfortClosed = false
        square.persist()
        uni.showToast({ title: '已模拟 4 天无匹配，去广场看提示', icon: 'none' })
    }

    const blockFirstCommenter = () => {
        const target = square.dynamics.find(d => (d.commentList || []).length > 0)
        const comment = target?.commentList?.[0]
        if (!comment) {
            uni.showToast({ title: '暂无可屏蔽的评论', icon: 'none' })
            return
        }
        square.toggleBlockUser(comment.userId)
        uni.showToast({ title: `已屏蔽 ${comment.name} 的评论`, icon: 'none' })
    }

    const resetSquare = () => {
        square.resetAll()
        uni.showToast({ title: '动态数据已重置', icon: 'none' })
    }

    // ===== M5：个人中心与权益中心调试 =====
    const goProfile = () => {
        uni.switchTab({ url: '/pages/profile/index' })
    }

    const goEquity = () => {
        uni.navigateTo({ url: '/pages/profile/equity' })
    }

    const goLikeList = () => {
        uni.navigateTo({ url: '/pages/user/likeList?type=receive' })
    }

    const simulateFootprint = () => {
        const ok = social.simulateFootprint()
        uni.showToast({
            title: ok ? `今日来访 +1，当前 ${social.todayFootprintCount} 位` : '同城来访记录已满',
            icon: 'none'
        })
    }

    const addFollow = () => {
        const target = [13, 14, 3, 4].find(id => !userStore.isFollowing(id))
        if (!target) {
            uni.showToast({ title: '已关注全部可选对象', icon: 'none' })
            return
        }
        const user = findUserById(target)
        userStore.follow({ ...user, age: user.age, occupation: user.occupation })
        uni.showToast({ title: `已关注 ${user.name}`, icon: 'none' })
    }

    const resetSocial = () => {
        social.resetAll()
        uni.showToast({ title: '社交数据已重置', icon: 'none' })
    }

    // ===== M6：学历 / 工作认证调试 =====
    const certLabel = (type) => {
        const map = { idle: '未认证', pending: '审核中', success: '已认证', failed: '已驳回' }
        return map[userStore.certificationOf(type)]
    }

    const goEducation = () => {
        uni.navigateTo({ url: '/pages/auth/education' })
    }

    const goWork = () => {
        uni.navigateTo({ url: '/pages/auth/work' })
    }

    const approveAll = () => {
        userStore.approveCertification('education')
        userStore.approveCertification('work')
        uni.showToast({ title: '双认证已点亮，+10 次永久心动', icon: 'none' })
    }

    const rejectEducation = () => {
        userStore.rejectCertification('education', '凭证截图模糊，无法核对院校信息')
        uni.showToast({ title: '学历认证已置为驳回', icon: 'none' })
    }

    const resetCerts = () => {
        userStore.resetCertifications()
        uni.showToast({ title: '认证数据已重置', icon: 'none' })
    }

    // ===== M7 通知与裂变 =====
    const goNotifyPage = () => {
        uni.switchTab({ url: '/pages/notifications/index' })
    }

    const goInvitePage = () => {
        uni.navigateTo({ url: '/pages/invite/index' })
    }

    const goLandingPage = () => {
        const target = encodeURIComponent('/pages/dynamic/detail?id=1')
        uni.navigateTo({
            url: `/pages/common/landing?invite=FY88888&target=${target}&title=${encodeURIComponent('一条同城动态')}`
        })
    }

    const simulateHeartMe = () => {
        const res = social.simulateHeartMe(11)
        uni.showToast({
            title: res.ok ? `已模拟 ${findUserById(11)?.name || ''} 心动你` : '该用户已在心动我的列表',
            icon: 'none'
        })
    }

    const simulateMatchM7 = () => {
        matchStore.createMatch(6)
        uni.showToast({ title: '已模拟双向匹配', icon: 'none' })
    }

    const simulateApplyReceive = () => {
        notify.pushApplyReceive(8)
        uni.showToast({ title: '已模拟收到微信申请', icon: 'none' })
    }

    const simulateLikeDynamic = () => {
        notify.pushDynamicInteract('like_dynamic', { name: '沈星野', dynamicId: 1 })
        uni.showToast({ title: '已模拟收到点赞', icon: 'none' })
    }

    const simulateComment = () => {
        notify.pushDynamicInteract('comment_dynamic', {
            name: '江小满',
            dynamicId: 1,
            text: '这张照片拍得真有感觉'
        })
        uni.showToast({ title: '已模拟收到评论', icon: 'none' })
    }

    const reportQuotaResult = (res) => {
        const map = {
            female_forbidden: '女性禁止推送额度提醒',
            not_certified: '未实名用户不推额度提醒',
            before_slot: '当前未到 9 点，暂不推送',
            already: '该时段已推送过',
            no_quota: '额度已用完，无需提醒'
        }
        uni.showToast({
            title: res.pushed ? `已推送 ${res.slot} 点额度提醒` : (map[res.reason] || '未推送'),
            icon: 'none'
        })
    }

    const pushQuota9 = () => reportQuotaResult(notify.ensureQuotaReminder(9))
    const pushQuota20 = () => reportQuotaResult(notify.ensureQuotaReminder(20))

    const markAllNotifyRead = () => {
        const changed = notify.markAllRead('all')
        uni.showToast({ title: `已读 ${changed} 条`, icon: 'none' })
    }

    const simulateInviteJoin = () => {
        const record = invite.simulateFriendJoin('测试好友')
        uni.showToast({ title: `${record.name} 已加入`, icon: 'none' })
    }

    const simulateInviteReward = () => {
        const res = invite.simulateFriendRealname()
        uni.showToast({
            title: res.ok ? `${res.name} 已实名，+${res.likes} 次永久心动` : '没有待实名好友',
            icon: 'none'
        })
    }

    const resetNotifyInvite = () => {
        notify.resetAll()
        invite.resetAll()
        uni.showToast({ title: '通知与邀请已重置', icon: 'none' })
    }

    // ===== M8 隐私与风控 =====
    const autoRejectText = computed(() => {
        if (!privacy.autoRejectEnabled) return '关闭'
        return `${privacy.autoRejectHours}h`
    })

    const goPrivacyPage = () => uni.navigateTo({ url: '/pages/profile/privacy' })
    const goBlacklistPage = () => uni.navigateTo({ url: '/pages/profile/blacklist' })
    const goReportPage = () => uni.navigateTo({ url: '/pages/common/report?userId=9&name=%E6%B2%88%E6%98%9F%E9%87%8E' })
    const goMyReportsPage = () => uni.navigateTo({ url: '/pages/common/myReports' })
    const goAccountPage = () => uni.navigateTo({ url: '/pages/profile/account' })

    // 拉黑：优先拉黑还没在黑名单里的北京用户
    const simulateBlock = () => {
        const candidates = [4, 8, 9, 12, 13]
        const targetId = candidates.find(id => !privacy.blacklistIds.includes(id))
        if (!targetId) {
            uni.showToast({ title: '候选用户都已拉黑', icon: 'none' })
            return
        }
        const target = findUserById(targetId)
        privacy.blockUser(target, '调试拉黑')
        uni.showToast({ title: `已拉黑 ${target.name}`, icon: 'none' })
    }

    const simulateReport = () => {
        const res = risk.submitReport({
            targetId: 9,
            targetName: '沈星野',
            reason: 'harassment',
            desc: '调试：评论区多次骚扰'
        })
        if (!res.ok) {
            uni.showToast({ title: '提交失败', icon: 'none' })
            return
        }
        const hours = Math.round((res.sla || 0) / (60 * 60 * 1000))
        uni.showToast({
            title: `已提交，${hours}h 时效${res.report.priority === 'female' ? '（女性通道）' : ''}`,
            icon: 'none'
        })
    }

    // 造一条超时 24h 的待处理申请，验证自动拒绝
    const simulateApply24h = () => {
        const now = Date.now()
        const target = findUserById(8)
        let item = matchStore.applications.find(a => a.direction === 'in' && a.fromUserId === 8)
        if (!item) {
            item = {
                id: `app_${now}`,
                fromUserId: 8,
                toUserId: userStore.userInfo?.id || 10000,
                direction: 'in',
                status: 'pending',
                createdAt: now,
                handledAt: 0,
                expireAt: now + 72 * 60 * 60 * 1000,
                message: ''
            }
            matchStore.applications.unshift(item)
        }
        item.status = 'pending'
        item.createdAt = now - 25 * 60 * 60 * 1000
        item.handledAt = 0
        matchStore.persist()
        const changed = matchStore.autoRejectCheck()
        uni.showToast({
            title: changed ? `已自动拒绝 ${changed} 条（来自 ${target.name}）` : '无超时申请',
            icon: 'none'
        })
    }

    const advanceAudit = () => {
        const future = Date.now() + 25 * 60 * 60 * 1000
        risk.advanceReports(future)
        uni.showToast({ title: '审核已推进到我设置的时间点', icon: 'none' })
    }

    const triggerRiskEvent = () => {
        const res = risk.applyRiskEvent('high_frequency_like')
        if (!res.ok) {
            uni.showToast({ title: '事件无效', icon: 'none' })
            return
        }
        uni.showToast({
            title: `风控分 ${res.score}${res.deprioritized ? '，已降权' : ''}`,
            icon: 'none'
        })
    }

    const applyPenalty = () => {
        risk.handleReport(risk.sortedReports.find(r => r.status !== 'done')?.id || 'rep_2', {
            penalty: 'ban_post',
            result: 'punished'
        })
        risk.penalties = {
            code: 'ban_post',
            level: 2,
            until: Date.now() + 7 * 24 * 60 * 60 * 1000,
            reason: '调试：恶意骚扰（禁发 7 天）'
        }
        risk.persist()
        uni.showToast({ title: '已下发禁发 7 天', icon: 'none' })
    }

    const reviveAccount = () => {
        risk.reviveAccount()
        risk.deactivation = {
            status: 'none',
            requestedAt: 0,
            effectiveAt: 0,
            phoneReleasedAt: 0,
            realnamePurgeAt: 0,
            idLockUntil: 0
        }
        risk.persist()
        uni.showToast({ title: '账号已恢复正常', icon: 'none' })
    }

    const resetPrivacyRisk = () => {
        privacy.resetAll()
        risk.resetAll()
        uni.showToast({ title: '隐私与风控已重置', icon: 'none' })
    }

    // ===== M9 全局收口 =====
    const cityPendingText = computed(() => {
        const pending = userStore.cityPending
        if (!pending) return '无'
        return `→ ${pending.to}（${pending.hours}h）`
    })

    const timeTitleText = computed(() => getTimeSlotTitle())

    const simulateChangeCity = () => {
        const res = userStore.changeCity('上海')
        if (!res.ok) {
            uni.showToast({ title: '城市未变化', icon: 'none' })
            return
        }
        uni.showToast({
            title: res.changed ? `已提交，24 小时后按上海推荐` : '城市未变化',
            icon: 'none'
        })
    }

    const advanceCity = () => {
        const ok = userStore.advanceCityChange()
        uni.showToast({ title: ok ? '已拨快 24 小时，新城市生效' : '没有待生效的城市切换', icon: 'none' })
    }

    const clearCityChange = () => {
        userStore.cityChange = { from: '', to: '', at: 0 }
        userStore.persist()
        uni.showToast({ title: '切换记录已清除', icon: 'none' })
    }

    // 文案库复用自检：弱网 / 系统异常 / 安抚提示
    const showWeakNetworkToast = () => uni.showToast({ title: businessCopy.weakNetwork, icon: 'none' })
    const showSystemErrorToast = () => uni.showToast({ title: businessCopy.systemError, icon: 'none' })
    const showComfortCopy = () => uni.showModal({
        title: '连续 3 天无匹配',
        content: `慢慢来，契合的缘分值得等待。${emptyCopy.matchEmpty}`,
        showCancel: false
    })
</script>

<style lang="scss" scoped>
    .debug-page {
        min-height: 100vh;
        background-color: $bg-page;
    }

    .debug-body {
        padding: $spacing-md $page-padding-x 40px;
    }

    .debug-card {
        padding: $spacing-md;
        margin-bottom: $spacing-md;
        background-color: $bg-card;
        border-radius: $radius-card;
        box-shadow: $shadow-card;

        &__title {
            font-size: $font-size-md;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__desc {
            margin-top: 4px;
            font-size: $font-size-xs;
            color: $text-helper;
        }

        &__hint {
            display: block;
            margin-top: $spacing-sm;
            font-size: 11px;
            color: $text-helper;
            line-height: 1.5;
        }
    }

    .debug-identity {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: $spacing-md;

        &__avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background-color: $bg-page;
        }

        &__info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        &__name {
            font-size: $font-size-md;
            color: $text-primary;
            font-weight: $font-weight-medium;
        }

        &__level {
            align-self: flex-start;
            padding: 2px 10px;
            font-size: 11px;
            border-radius: 10px;
            color: $text-secondary;
            background-color: $bg-page;

            &.is-guest {
                color: #9A9A9A;
                background-color: #F2F2F2;
            }

            &.is-registered {
                color: #C8A252;
                background-color: rgba(200, 162, 82, 0.12);
            }

            &.is-certified {
                color: $color-success;
                background-color: $primary-light-bg;
            }
        }
    }

    .debug-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: $spacing-md;

        &__item {
            flex: 1;
            min-width: 90px;
            padding: 8px 10px;
            background-color: $bg-page;
            border-radius: $radius-xs;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        &__label {
            font-size: 10px;
            color: $text-helper;
        }

        &__value {
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }
    }

    .debug-segments {
        display: flex;
        gap: $spacing-sm;
        margin-top: $spacing-md;

        &__item {
            flex: 1;
            height: 38px;
            line-height: 38px;
            text-align: center;
            font-size: $font-size-sm;
            color: $text-secondary;
            background-color: $bg-page;
            border-radius: $radius-xs;
            border: 1px solid transparent;
            transition: all $duration-fast ease;

            &.is-active {
                color: $primary-color;
                background-color: $primary-light-bg;
                border-color: $primary-color;
                font-weight: $font-weight-medium;
            }
        }
    }

    .debug-actions {
        display: flex;
        gap: $spacing-sm;
        margin-top: $spacing-md;
    }

    .debug-btn {
        flex: 1;
        height: 40px;
        line-height: 40px;
        font-size: $font-size-sm;
        color: $text-secondary;
        background-color: $bg-page;
        border-radius: $radius-xs;
        border: 1px solid $border-light;

        &--danger {
            color: $color-danger;
            border-color: rgba($color-danger, 0.3);
            background-color: rgba($color-danger, 0.05);
        }

        &::after {
            border: none;
        }
    }
</style>
