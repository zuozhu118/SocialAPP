<template>
    <view class="notify-page">
        <!-- 导航栏 -->
        <view class="notify-navbar">
            <text class="notify-navbar__title">通知</text>
            <view class="notify-navbar__right">
                <text class="notify-navbar__action" @click="markAllRead" v-if="hasUnread">全部已读</text>
                <text class="notify-navbar__action" @click="clearAll" v-if="notifyList.length > 0">清空</text>
            </view>
        </view>

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

        <!-- 通知列表 -->
        <scroll-view class="notify-list" scroll-y @scrolltolower="loadMore">
            <view v-for="(item, index) in filteredList"
                  :key="item.id"
                  class="notify-item"
                  :class="{ 'notify-item--unread': !item.isRead }"
                  @click="handleItemClick(item)">
                <!-- 图标 -->
                <view class="notify-item__icon" :style="{ backgroundColor: item.bgColor || '#F5F5F5' }">
                    <text class="notify-item__icon-text">{{ item.icon }}</text>
                </view>

                <!-- 内容 -->
                <view class="notify-item__content">
                    <view class="notify-item__header">
                        <text class="notify-item__title">{{ item.title }}</text>
                        <text v-if="!item.isRead" class="notify-item__dot">●</text>
                    </view>
                    <text class="notify-item__desc">{{ item.desc }}</text>
                    <view class="notify-item__footer">
                        <text class="notify-item__time">{{ item.time }}</text>
                        <view v-if="item.actionText" class="notify-item__action" @click.stop="handleAction(item)">
                            {{ item.actionText }}
                            <text class="icon icon-arrow-right"></text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 加载更多 -->
            <view v-if="hasMore" class="notify-loading">加载中...</view>

            <!-- 空状态 -->
            <view v-if="filteredList.length === 0" class="notify-empty">
                <text class="notify-empty__icon">📭</text>
                <text class="notify-empty__title">暂无通知</text>
                <text class="notify-empty__desc">
                    {{ currentTab === 'all' ? '有动态时我们会通知你' : '当前分类暂无消息' }}
                </text>
            </view>

            <view class="notify-bottom-placeholder"></view>
        </scroll-view>
    </view>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'

    // ===== 状态 =====
    const currentTab = ref('all')
    const hasMore = ref(false)
    const page = ref(1)

    const tabs = ref([
        { label: '全部', value: 'all', count: 0 },
        { label: '互动', value: 'interact', count: 0 },
        { label: '系统', value: 'system', count: 0 }
    ])

    // ===== 通知数据 =====
    const notifyList = ref([
        // ===== 互动类（匹配 + 点赞 + 评论等） =====
        {
            id: 1,
            type: 'interact',
            icon: '💕',
            bgColor: '#FFE8EC',
            title: '匹配成功',
            desc: '你和 林小鹿 双向喜欢，可以申请交换微信了',
            time: '5分钟前',
            isRead: false,
            actionText: '去申请',
            actionType: 'apply_wechat',
            targetId: 1,
            targetName: '林小鹿'
        },
        {
            id: 2,
            type: 'interact',
            icon: '❤️',
            bgColor: '#FFE8EC',
            title: '有人喜欢了你',
            desc: '陈橘子 对你表达了喜欢',
            time: '15分钟前',
            isRead: false,
            actionText: '查看',
            actionType: 'view_like_list',
            targetId: 2
        },
        {
            id: 3,
            type: 'interact',
            icon: '💬',
            bgColor: '#E8F4FD',
            title: '收到微信申请',
            desc: '王子轩 申请交换微信，是否同意？',
            time: '1小时前',
            isRead: false,
            actionText: '去处理',
            actionType: 'handle_apply',
            targetId: 3
        },
        {
            id: 4,
            type: 'interact',
            icon: '✅',
            bgColor: '#E8F5E9',
            title: '微信申请已通过',
            desc: '张一晨 同意了你的微信申请，微信号已互相展示',
            time: '3小时前',
            isRead: true,
            actionText: '查看结果',
            actionType: 'apply_result_agreed',
            targetId: 4,
            targetName: '张一晨'
        },
        {
            id: 5,
            type: 'interact',
            icon: '👍',
            bgColor: '#F3E5F5',
            title: '收到点赞',
            desc: '吴晴天 赞了你的动态',
            time: '2小时前',
            isRead: false,
            actionText: '查看动态',
            actionType: 'view_dynamic',
            targetId: 101
        },
        {
            id: 6,
            type: 'interact',
            icon: '💬',
            bgColor: '#FFF3E0',
            title: '收到评论',
            desc: '周小白 评论了你的动态：拍得真好看！📷',
            time: '5小时前',
            isRead: true,
            actionText: '回复',
            actionType: 'reply_comment',
            targetId: 102
        },
        {
            id: 7,
            type: 'interact',
            icon: '❌',
            bgColor: '#FFEBEE',
            title: '微信申请已拒绝',
            desc: '陈橘子 拒绝了你的微信申请',
            time: '30分钟前',
            isRead: false,
            actionText: '查看结果',
            actionType: 'apply_result_rejected',
            targetId: 2,
            targetName: '陈橘子'
        },

        // ===== 系统类 =====
        {
            id: 8,
            type: 'system',
            icon: '🎖️',
            bgColor: '#E8F5E9',
            title: '获得勋章',
            desc: '恭喜你获得「学术钻研人」勋章，已展示在个人主页',
            time: '昨天',
            isRead: true,
            actionText: '查看勋章',
            actionType: 'view_medal',
            targetId: 1
        },
        {
            id: 9,
            type: 'system',
            icon: '📢',
            bgColor: '#FFF8E1',
            title: '反诈提醒',
            desc: '平台提醒：请勿向任何人透露验证码、转账汇款，谨防杀猪盘诈骗',
            time: '3天前',
            isRead: true,
            actionText: '查看详情',
            actionType: 'view_antifraud',
            targetId: null
        },
        {
            id: 10,
            type: 'system',
            icon: '✨',
            bgColor: '#E3F2FD',
            title: '动态被标记为优质',
            desc: '你发布的动态被评选为优质内容，奖励 3 次微信申请次数已到账',
            time: '5天前',
            isRead: true,
            actionText: '查看动态',
            actionType: 'view_dynamic',
            targetId: 103
        },
        {
            id: 11,
            type: 'system',
            icon: '✅',
            bgColor: '#E8F5E9',
            title: '认证通过',
            desc: '你的学历认证已审核通过，个人主页已展示学历标识',
            time: '6天前',
            isRead: true,
            actionText: '查看主页',
            actionType: 'view_profile',
            targetId: 0 // 自己的主页
        }
    ])

    // ===== 计算属性 =====
    const hasUnread = computed(() => {
        return notifyList.value.some(item => !item.isRead)
    })

    const filteredList = computed(() => {
        if (currentTab.value === 'all') {
            return notifyList.value
        }
        return notifyList.value.filter(item => item.type === currentTab.value)
    })

    // 计算各分类未读数量
    const updateTabCounts = () => {
        tabs.value.forEach(tab => {
            if (tab.value === 'all') {
                tab.count = notifyList.value.filter(item => !item.isRead).length
            } else {
                tab.count = notifyList.value.filter(item => item.type === tab.value && !item.isRead).length
            }
        })
    }

    // ===== 方法 =====
    const switchTab = (value) => {
        currentTab.value = value
        page.value = 1
    }

    const handleItemClick = (item) => {
        // 标记已读
        item.isRead = true
        updateTabCounts()

        // 根据类型跳转
        switch (item.actionType) {
            case 'view_profile':
                uni.navigateTo({ url: `/pages/user/profile?userId=${item.targetId}` })
                break
            case 'view_dynamic':
                uni.navigateTo({ url: `/pages/dynamic/detail?id=${item.targetId}` })
                break
            case 'view_like_list':
                uni.navigateTo({ url: `/pages/user/likeList?type=receive` })
                break
            case 'apply_wechat':
                uni.navigateTo({ url: `/pages/match/apply?userId=${item.targetId}` })
                break
            case 'handle_apply':
                uni.navigateTo({ url: `/pages/match/apply?userId=${item.targetId}&type=handle` })
                break
            case 'apply_result_agreed':
                // 跳转到 apply 页面，直接显示已同意状态
                uni.navigateTo({ url: `/pages/match/apply?userId=${item.targetId}&result=agreed` })
                break
            case 'apply_result_rejected':
                // 跳转到 apply 页面，直接显示已拒绝状态
                uni.navigateTo({ url: `/pages/match/apply?userId=${item.targetId}&result=rejected` })
                break
            case 'view_medal':
                uni.navigateTo({ url: `/pages/user/medalWall` })
                break
            case 'view_antifraud':
                uni.navigateTo({ url: `/pages/common/antifraud` })
                break
            case 'reply_comment':
                uni.navigateTo({ url: `/pages/dynamic/detail?id=${item.targetId}&focus=comment` })
                break
            default:
                // 无跳转，仅标记已读
                break
        }
    }

    const handleAction = (item) => {
        handleItemClick(item)
    }

    const markAllRead = () => {
        if (notifyList.value.length === 0) return
        uni.showModal({
            title: '全部已读',
            content: '确认将所有通知标记为已读？',
            confirmColor: '#2ED573',
            success: (res) => {
                if (res.confirm) {
                    notifyList.value.forEach(item => {
                        item.isRead = true
                    })
                    updateTabCounts()
                    uni.showToast({ title: '已全部标记为已读', icon: 'success' })
                }
            }
        })
    }

    const clearAll = () => {
        if (notifyList.value.length === 0) return
        uni.showModal({
            title: '清空通知',
            content: '确认清空所有通知记录？此操作不可恢复',
            confirmColor: '#FF4757',
            success: (res) => {
                if (res.confirm) {
                    notifyList.value = []
                    updateTabCounts()
                    uni.showToast({ title: '已清空', icon: 'success' })
                }
            }
        })
    }

    const loadMore = () => {
        if (hasMore.value) {
            page.value++
        }
    }

    onMounted(() => {
        updateTabCounts()
    })
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