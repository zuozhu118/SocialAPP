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
                        <text class="debug-meta__label">收藏心动</text>
                        <text class="debug-meta__value">{{ userStore.favorites.length }} 个</text>
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
                        <text class="debug-meta__label">我喜欢的</text>
                        <text class="debug-meta__value">{{ social.myLikeCount }} 人</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">喜欢我的</text>
                        <text class="debug-meta__value">{{ social.likesMeCount }} 人</text>
                    </view>
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">待回应</text>
                        <text class="debug-meta__value">{{ social.unmetLikeCount }} 人</text>
                    </view>
                </view>
                <view class="debug-meta">
                    <view class="debug-meta__item">
                        <text class="debug-meta__label">今日关注</text>
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
                    <button class="debug-btn" @click="goLikeList">看喜欢列表</button>
                    <button class="debug-btn" @click="simulateFootprint">+1 今日关注</button>
                </view>
                <view class="debug-actions">
                    <button class="debug-btn" @click="addFavorite">+1 收藏心动</button>
                    <button class="debug-btn debug-btn--danger" @click="resetSocial">重置社交数据</button>
                </view>
                <text class="debug-card__hint">
                    今日关注口径 = 当日真实主页浏览 + 未实名暂存心动，按同城异性统计；
                    「+1 今日关注」会补一位同城异性浏览记录，用于验收 3.9 缘分足迹文案
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

            <!-- 数据管理 -->
            <view class="debug-card">
                <view class="debug-card__title">本地数据</view>
                <view class="debug-actions">
                    <button class="debug-btn debug-btn--danger" @click="clearAll">清空本地缓存</button>
                </view>
                <text class="debug-card__hint">清空后身份回到游客，额度与收藏一并重置</text>
            </view>
        </view>
    </view>
</template>

<script setup>
    import { computed } from 'vue'
    import { onShow } from '@dcloudio/uni-app'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'
    import { findUserById } from '@/mock/users'
    import { useUserStore, useEquityStore, useMatchStore, useSquareStore, useSocialStore } from '@/store/index'

    const userStore = useUserStore()
    const equity = useEquityStore()
    const matchStore = useMatchStore()
    const square = useSquareStore()
    const social = useSocialStore()

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
            content: '将清除登录状态、额度、匹配关系与收藏，确定继续吗？',
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
            title: ok ? `今日关注 +1，当前 ${social.todayFootprintCount} 位` : '同城关注已满',
            icon: 'none'
        })
    }

    const addFavorite = () => {
        const target = [13, 14, 3, 4].find(id => !userStore.isFavorited(id))
        if (!target) {
            uni.showToast({ title: '已收藏全部可选对象', icon: 'none' })
            return
        }
        const user = findUserById(target)
        userStore.addFavorite({ ...user, age: user.age, occupation: user.occupation })
        uni.showToast({ title: `已收藏 ${user.name}`, icon: 'none' })
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
