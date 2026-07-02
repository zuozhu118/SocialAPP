<template>
    <view class="notify-page">
        <!-- 导航栏 -->
        <CustomNavbar title="通知" />

        <!-- 通知列表 -->
        <scroll-view class="notify-list" scroll-y>
            <view v-for="(item, index) in notifyList"
                  :key="item.id"
                  class="notify-item"
                  :class="{ 'notify-item--unread': !item.isRead }"
                  @click="handleRead(index)">
                <view class="notify-item__icon">
                    <text class="notify-item__icon-text">{{ item.icon }}</text>
                </view>
                <view class="notify-item__content">
                    <view class="notify-item__header">
                        <text class="notify-item__title">{{ item.title }}</text>
                        <text v-if="!item.isRead" class="notify-item__dot">●</text>
                    </view>
                    <text class="notify-item__desc">{{ item.desc }}</text>
                    <text class="notify-item__time">{{ item.time }}</text>
                </view>
            </view>

            <!-- 空状态 -->
            <view v-if="notifyList.length === 0" class="notify-empty">
                <image class="notify-empty__image" src="/static/images/empty-notify.png" mode="aspectFit" />
                <text class="notify-empty__title">暂无通知</text>
                <text class="notify-empty__desc">有动态时我们会通知你</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
    import { ref } from 'vue'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'

    const notifyList = ref([
        {
            id: 1,
            icon: '❤️',
            title: '有人喜欢了你',
            desc: '林小鹿 喜欢了你的动态',
            time: '10分钟前',
            isRead: false
        },
        {
            id: 2,
            icon: '💬',
            title: '收到评论',
            desc: '陈橘子 评论了你的动态：好美呀！',
            time: '1小时前',
            isRead: false
        },
        {
            id: 3,
            icon: '✅',
            title: '认证通过',
            desc: '你的学历认证已审核通过',
            time: '3小时前',
            isRead: true
        },
        {
            id: 4,
            icon: '📢',
            title: '系统公告',
            desc: '平台反诈提醒：请勿向任何人转账汇款',
            time: '昨天',
            isRead: true
        },
        {
            id: 5,
            icon: '👤',
            title: '关注提醒',
            desc: '周小白 关注了你',
            time: '2天前',
            isRead: true
        }
    ])

    const handleRead = (index) => {
        notifyList.value[index].isRead = true
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .notify-page {
        min-height: 100vh;
        background-color: $bg-page;
    }

    .notify-list {
        padding: 0 $page-padding-x;
        height: calc(100vh - 76px);
    }

    .notify-item {
        display: flex;
        align-items: flex-start;
        padding: $spacing-md 0;
        border-bottom: 1px solid $border-light;
        cursor: pointer;
        transition: background-color $duration-fast ease;

        &:active {
            opacity: 0.7;
        }
    }

    .notify-item--unread {
        background-color: $primary-light-bg;
        margin: 0 -$page-padding-x;
        padding-left: $page-padding-x;
        padding-right: $page-padding-x;
        border-radius: $radius-sm;
    }

    .notify-item:last-child {
        border-bottom: none;
    }

    .notify-item__icon {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background-color: $bg-page;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-right: $spacing-sm;
    }

    .notify-item__icon-text {
        font-size: 20px;
    }

    .notify-item__content {
        flex: 1;
        min-width: 0;
    }

    .notify-item__header {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
    }

    .notify-item__title {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $text-primary;
    }

    .notify-item__dot {
        color: $color-warning;
        font-size: 10px;
    }

    .notify-item__desc {
        display: block;
        font-size: $font-size-sm;
        color: $text-secondary;
        margin: 2px 0 4px;
    }

    .notify-item__time {
        font-size: $font-size-xs;
        color: $text-helper;
    }

    .notify-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-top: 80px;
    }

    .notify-empty__image {
        width: 160px;
        height: 120px;
        margin-bottom: $spacing-md;
    }

    .notify-empty__title {
        font-size: $font-size-lg;
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-bottom: $spacing-xs;
    }

    .notify-empty__desc {
        font-size: $font-size-sm;
        color: $text-helper;
    }
</style>