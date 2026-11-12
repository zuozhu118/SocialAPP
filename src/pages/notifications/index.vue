<template>
    <view class="notify-page">
        <!-- 导航栏 -->
        <view class="notify-navbar">
            <text class="notify-navbar__title">通知</text>
            <view class="notify-navbar__right">
                <text class="notify-navbar__action" @click="markAllRead" v-if="hasUnread">全部已读</text>
                <text class="notify-navbar__action" @click="clearAll" v-if="totalCount > 0">清空</text>
            </view>
        </view>
        <!-- 全页安全徽章（第 2 章硬性标准） -->
        <SafetyBadge inline />

        <!-- 分类Tab：全部 / 互动 / 系统 -->
        <view class="notify-tabs">
            <view v-for="(tab, idx) in tabs"
                  :key="idx"
                  class="notify-tabs__item"
                  :class="{ 'notify-tabs__item--active': currentTab === tab.value }"
                  @click="switchTab(tab.value)">
                {{ tab.label }}
                <text v-if="tab.count > 0" class="notify-tabs__badge">{{ tab.count }}</text>
            </view>
        </view>

        <!-- 未实名引导：服务通知能力已就绪，完成实名才能收到匹配类通知 -->
        <view v-if="needRealNameGuide" class="notify-guide" @click="goRealName">
            <text class="notify-guide__icon">🔒</text>
            <view class="notify-guide__body">
                <text class="notify-guide__title">完成实名，不漏掉每一次心动</text>
                <text class="notify-guide__desc">未实名时匹配类通知仅作提醒，不展示对方身份</text>
            </view>
            <text class="notify-guide__action">去实名</text>
        </view>

        <!-- 通知列表 -->
        <scroll-view class="notify-list" scroll-y @scrolltolower="loadMore">
            <view v-for="item in filteredList"
                  :key="item.id"
                  class="notify-item"
                  :class="{ 'notify-item--unread': !item.read }"
                  @click="handleItemClick(item)">
                <!-- 图标 -->
                <view class="notify-item__icon" :style="{ backgroundColor: item.bgColor || '#F5F5F5' }">
                    <text class="notify-item__icon-text">{{ item.icon }}</text>
                </view>

                <!-- 内容 -->
                <view class="notify-item__content">
                    <view class="notify-item__header">
                        <text class="notify-item__title">{{ item.title }}</text>
                        <text v-if="!item.read" class="notify-item__dot">●</text>
                    </view>
                    <text class="notify-item__desc">{{ item.desc }}</text>
                    <view class="notify-item__footer">
                        <text class="notify-item__time">{{ item.time }}</text>
                        <view v-if="item.actionText" class="notify-item__action" @click.stop="handleItemClick(item)">
                            {{ item.actionText }}
                            <text class="icon icon-arrow-right"></text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view v-if="filteredList.length === 0" class="notify-empty">
                <text class="notify-empty__icon">📭</text>
                <text class="notify-empty__title">暂无通知</text>
                <text class="notify-empty__desc">
                    {{ currentTab === 'all' ? '有动态时我们会通知你' : '当前分类暂无消息' }}
                </text>
            </view>

            <view v-else class="notify-loading">没有更多了</view>

            <view class="notify-bottom-placeholder"></view>
        </scroll-view>
    </view>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { onShow } from '@dcloudio/uni-app'
    import useNotifyStore from '@/store/notify'
    import useUserStore from '@/store/user'
    import SafetyBadge from '@/components/common/SafetyBadge.vue'

    const notifyStore = useNotifyStore()
    const userStore = useUserStore()

    const currentTab = ref('all')

    // ===== 数据 =====
    const tabs = computed(() => notifyStore.tabs)
    const totalCount = computed(() => notifyStore.totalCount)
    const hasUnread = computed(() => notifyStore.hasUnread)
    const filteredList = computed(() => notifyStore.listOf(currentTab.value))
    // 3.8：未实名只收到实名引导，不展示对方身份
    const needRealNameGuide = computed(() => userStore.level === 'registered')

    // ===== 生命周期 =====
    onShow(() => {
        // 3.8 男 9 点 / 20 点额度提醒（女性禁止，内部已判定）
        notifyStore.ensureQuotaReminder()
        notifyStore.syncBadge()
    })

    // ===== 方法 =====
    const switchTab = (value) => {
        currentTab.value = value
    }

    const goRealName = () => {
        uni.navigateTo({ url: '/pages/auth/realname' })
    }

    const handleItemClick = (item) => {
        // 页内仅小红点，点击即视为已读
        notifyStore.markRead(item.id)

        switch (item.actionType) {
            case 'view_profile':
                if (!item.targetId) {
                    uni.navigateTo({ url: '/pages/profile/myProfile' })
                } else {
                    uni.navigateTo({ url: `/pages/user/profile?userId=${item.targetId}` })
                }
                break
            case 'view_dynamic':
                uni.navigateTo({ url: `/pages/dynamic/detail?id=${item.targetId}` })
                break
            case 'view_like_list':
                uni.navigateTo({ url: '/pages/user/likeList?type=receive' })
                break
            case 'apply_wechat':
                uni.navigateTo({ url: `/pages/match/apply?userId=${item.targetId}` })
                break
            case 'handle_apply':
                uni.navigateTo({ url: `/pages/match/apply?userId=${item.targetId}&type=handle` })
                break
            case 'apply_result_agreed':
                uni.navigateTo({ url: `/pages/match/apply?userId=${item.targetId}&result=agreed` })
                break
            case 'apply_result_rejected':
                uni.navigateTo({ url: `/pages/match/apply?userId=${item.targetId}&result=rejected` })
                break
            case 'view_medal':
                uni.navigateTo({ url: '/pages/user/medalWall' })
                break
            case 'view_antifraud':
                uni.navigateTo({ url: '/pages/common/antiFraud' })
                break
            case 'reply_comment':
                uni.navigateTo({ url: `/pages/dynamic/detail?id=${item.targetId}&focus=comment` })
                break
            case 'realname_guide':
                goRealName()
                break
            case 'view_equity':
                uni.navigateTo({ url: '/pages/profile/equity' })
                break
            case 'view_invite':
                uni.navigateTo({ url: '/pages/invite/index' })
                break
            case 'view_reports':
                uni.navigateTo({ url: '/pages/common/myReports' })
                break
            default:
                // 无跳转，仅标记已读
                break
        }
    }

    const markAllRead = () => {
        if (!hasUnread.value) return
        uni.showModal({
            title: '全部已读',
            content: '确认将当前分类的通知全部标记为已读？',
            confirmColor: '#2ED573',
            success: (res) => {
                if (res.confirm) {
                    const changed = notifyStore.markAllRead(currentTab.value)
                    uni.showToast({
                        title: changed ? `已标记 ${changed} 条为已读` : '暂无未读通知',
                        icon: 'none'
                    })
                }
            }
        })
    }

    const clearAll = () => {
        if (!totalCount.value) return
        uni.showModal({
            title: '清空通知',
            content: '确认清空当前分类的通知记录？此操作不可恢复',
            confirmColor: '#FF4757',
            success: (res) => {
                if (res.confirm) {
                    notifyStore.clearAll(currentTab.value)
                    uni.showToast({ title: '已清空', icon: 'none' })
                }
            }
        })
    }

    // 通知不做分页，保留手势回调避免 scroll-view 报错
    const loadMore = () => {}
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';
    @import '@/styles/mixins.scss';

    .notify-page {
        min-height: 100vh;
        background-color: $bg-page;
        display: flex;
        flex-direction: column;
    }

    // ===== 导航栏 =====
    .notify-navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px $page-padding-x;
        padding-top: calc(14px + env(safe-area-inset-top));
        background-color: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid $border-light;
        flex-shrink: 0;

        &__title {
            font-size: 18px;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__right {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        &__action {
            font-size: 12px;
            color: $text-helper;
            cursor: pointer;
            transition: all $duration-fast ease;

            &:active {
                opacity: 0.6;
            }

            &:first-child {
                color: $primary-color;
            }
        }
    }

    // ===== 未实名引导 =====
    .notify-guide {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 10px $page-padding-x 0;
        padding: 10px 12px;
        background-color: $primary-light-bg;
        border-radius: $radius-sm;
        border-left: 3px solid $primary-color;

        &:active {
            opacity: 0.85;
        }

        &__icon {
            font-size: 18px;
        }

        &__body {
            flex: 1;
            min-width: 0;
        }

        &__title {
            display: block;
            font-size: $font-size-xs;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__desc {
            display: block;
            font-size: 10px;
            color: $text-helper;
            margin-top: 2px;
        }

        &__action {
            font-size: $font-size-xs;
            color: $primary-dark;
            font-weight: $font-weight-medium;
        }
    }

    // ===== Tab切换 =====
    .notify-tabs {
        display: flex;
        background-color: $bg-card;
        padding: 0 $page-padding-x;
        border-bottom: 1px solid $border-light;
        flex-shrink: 0;

        &__item {
            position: relative;
            flex: 1;
            padding: 12px 0;
            font-size: $font-size-sm;
            color: $text-helper;
            text-align: center;
            cursor: pointer;
            transition: all $duration-fast ease;
            border-bottom: 2px solid transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;

            &--active {
                color: $text-primary;
                font-weight: $font-weight-medium;
                border-bottom-color: $primary-color;
            }

            &:active {
                opacity: 0.7;
            }
        }

        &__badge {
            min-width: 18px;
            height: 18px;
            padding: 0 5px;
            font-size: 10px;
            font-weight: $font-weight-medium;
            color: #FFFFFF;
            background-color: #FF4757;
            border-radius: 9px;
            line-height: 18px;
            text-align: center;
        }
    }

    // ===== 列表 =====
    .notify-list {
        flex: 1;
        padding: 0 $page-padding-x;
    }

    .notify-item {
        display: flex;
        align-items: flex-start;
        padding: 14px 0;
        border-bottom: 1px solid $border-light;
        cursor: pointer;
        transition: all $duration-fast ease;

        &:active {
            opacity: 0.8;
        }

        &:last-child {
            border-bottom: none;
        }

        &--unread {
            background-color: rgba(46, 213, 115, 0.04);
            margin: 0 -$page-padding-x;
            padding-left: $page-padding-x;
            padding-right: $page-padding-x;
            border-radius: $radius-sm;
            border-left: 3px solid $primary-color;
        }

        &__icon {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-right: 12px;
        }

        &__icon-text {
            font-size: 20px;
        }

        &__content {
            flex: 1;
            min-width: 0;
        }

        &__header {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 2px;
        }

        &__title {
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__dot {
            color: #FF4757;
            font-size: 8px;
            animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }

            50% {
                opacity: 0.3;
            }
        }

        &__desc {
            display: block;
            font-size: $font-size-xs;
            color: $text-secondary;
            line-height: 1.5;
            margin-bottom: 4px;
        }

        &__footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        &__time {
            font-size: 10px;
            color: $text-helper;
        }

        &__action {
            display: flex;
            align-items: center;
            gap: 2px;
            font-size: 11px;
            color: $primary-color;
            cursor: pointer;

            .icon {
                font-size: 10px;
            }

            &:active {
                opacity: 0.7;
            }
        }
    }

    .notify-loading {
        text-align: center;
        padding: 12px 0;
        font-size: 12px;
        color: $text-helper;
    }

    .notify-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-top: 80px;

        &__icon {
            font-size: 48px;
            margin-bottom: 16px;
        }

        &__title {
            font-size: $font-size-lg;
            font-weight: $font-weight-medium;
            color: $text-primary;
            margin-bottom: 4px;
        }

        &__desc {
            font-size: $font-size-sm;
            color: $text-helper;
        }
    }

    .notify-bottom-placeholder {
        height: 20px;
    }
</style>
