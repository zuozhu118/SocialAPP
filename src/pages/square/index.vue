<template>
    <view class="square-page">
        <!-- 导航栏 -->
        <view class="square-navbar">
            <view class="square-navbar__tabs">
                <text class="square-navbar__tab"
                      :class="{ 'square-navbar__tab--active': currentTab === 'recommend' }"
                      @click="switchTab('recommend')">推荐</text>
                <text class="square-navbar__tab"
                      :class="{ 'square-navbar__tab--active': currentTab === 'follow' }"
                      @click="switchTab('follow')">关注</text>
            </view>
        </view>

        <!-- 动态列表 -->
        <scroll-view class="square-list"
                     scroll-y
                     @scrolltolower="loadMore"
                     refresher-enabled
                     :refresher-triggered="refreshing"
                     @refresherrefresh="onRefresh">
            <view v-for="(item, index) in dynamicList"
                  :key="item.id"
                  class="square-item"
                  @click="goToDetail(item.id)">
                <!-- 用户信息 -->
                <view class="square-item__header" @click.stop>
                    <UserCard :name="item.userName"
                              :avatar="item.userAvatar"
                              :auth="item.auth"
                              :avatar-size="44"
                              :badge-size="18"
                              clickable
                              @click="goToProfile(item.userId)" />
                    <view class="square-item__header-right">
                        <text class="square-item__time">{{ item.time }}</text>
                        <view v-if="item.isQuality" class="square-item__quality">优质</view>
                    </view>
                </view>

                <!-- 动态图片 -->
                <view class="square-item__image-wrapper" @click.stop="previewImage(index, 0)">
                    <image class="square-item__image" :src="item.images[0]" mode="aspectCover" />
                    <view v-if="item.images.length > 1" class="square-item__image-count">
                        +{{ item.images.length - 1 }}
                    </view>
                </view>

                <!-- 动态内容 -->
                <view class="square-item__content">
                    <text class="square-item__text">{{ item.content }}</text>
                    <view class="square-item__location" v-if="item.location">
                        <text class="icon icon-location" />
                        {{ item.location }}
                    </view>
                </view>

                <!-- 互动栏 -->
                <view class="square-item__actions" @click.stop>
                    <view class="square-item__action" @click="handleLike(index)">
                        <text class="square-item__action-icon"
                              :class="[item.liked ? 'icon-heart-filled' : 'icon-heart']"
                              :style="{ color: item.liked ? '#E06060' : '' }" />
                        <text class="square-item__action-count">{{ item.likes }}</text>
                    </view>
                    <view class="square-item__action" @click="handleComment(index)">
                        <text class="square-item__action-icon icon icon-comment" />
                        <text class="square-item__action-count">{{ item.comments }}</text>
                    </view>
                    <view class="square-item__action" @click="handleShare(index)">
                        <text class="square-item__action-icon icon icon-share" />
                    </view>
                    <view class="square-item__action" @click="handleReport(index)">
                        <text class="square-item__action-icon icon icon-flag" />
                    </view>
                </view>
            </view>

            <!-- 加载更多 -->
            <view v-if="hasMore" class="square-loading">
                <text>加载中...</text>
            </view>
            <view v-else class="square-loading">
                <text>— 没有更多了 —</text>
            </view>
        </scroll-view>

        <!-- 发布按钮 -->
        <view class="square-publish" @click="handlePublish">
            <text class="square-publish__icon icon icon-edit" />
        </view>
    </view>
</template>

<script setup>
    import { ref } from 'vue'
    import UserCard from '@/components/common/UserCard.vue'

    const currentTab = ref('recommend')
    const refreshing = ref(false)
    const hasMore = ref(false)

    const dynamicList = ref([
        {
            id: 1,
            userId: 1,
            userName: '林小鹿',
            userAvatar: 'https://picsum.photos/100/100?random=10',
            auth: { realName: true, education: true, work: false },
            time: '2小时前',
            content: '今天的阳光真好，在咖啡馆看了一下午的书📖 有小伙伴推荐好看的书吗？',
            images: ['https://picsum.photos/600/400?random=20'],
            location: '北京·三里屯',
            likes: 23,
            liked: false,
            comments: 8,
            isQuality: true
        },
        {
            id: 2,
            userId: 2,
            userName: '陈橘子',
            userAvatar: 'https://picsum.photos/100/100?random=11',
            auth: { realName: true, education: true, work: true },
            time: '5小时前',
            content: '周末的瑜伽课，身心都得到了放松🧘‍♀️ 有没有一起练瑜伽的小伙伴？',
            images: ['https://picsum.photos/600/400?random=21', 'https://picsum.photos/600/400?random=22'],
            location: '上海·静安',
            likes: 45,
            liked: false,
            comments: 12,
            isQuality: true
        },
        {
            id: 3,
            userId: 3,
            userName: '周小白',
            userAvatar: 'https://picsum.photos/100/100?random=12',
            auth: { realName: true, education: false, work: true },
            time: '昨天',
            content: '第一次尝试做甜品，虽然卖相一般但味道不错😋 生活需要一点甜~',
            images: ['https://picsum.photos/600/400?random=23'],
            location: '深圳·南山',
            likes: 67,
            liked: true,
            comments: 15,
            isQuality: false
        },
        {
            id: 4,
            userId: 4,
            userName: '吴晴天',
            userAvatar: 'https://picsum.photos/100/100?random=13',
            auth: { realName: true, education: true, work: true },
            time: '昨天',
            content: '海边日落真的太美了🌅 希望能和喜欢的人一起来看一次',
            images: ['https://picsum.photos/600/400?random=24', 'https://picsum.photos/600/400?random=25', 'https://picsum.photos/600/400?random=26'],
            location: '杭州·西湖',
            likes: 89,
            liked: false,
            comments: 20,
            isQuality: true
        },
        {
            id: 5,
            userId: 5,
            userName: '郑小暖',
            userAvatar: 'https://picsum.photos/100/100?random=14',
            auth: { realName: true, education: false, work: false },
            time: '3天前',
            content: '最近迷上了水彩画，虽然还是新手但画得很开心🎨',
            images: ['https://picsum.photos/600/400?random=27'],
            location: '成都·锦里',
            likes: 34,
            liked: false,
            comments: 6,
            isQuality: false
        }
    ])

    const switchTab = (tab) => {
        currentTab.value = tab
        // 加载对应数据
    }

    const onRefresh = () => {
        refreshing.value = true
        setTimeout(() => {
            refreshing.value = false
            uni.showToast({ title: '刷新成功', icon: 'success' })
        }, 1000)
    }

    const goToDetail = (id) => {
        uni.navigateTo({ url: `/pages/dynamic/detail?id=${id}` })
    }

    const goToProfile = (userId) => {
        // 跳转到用户主页
    }

    const previewImage = (itemIndex, imageIndex) => {
        const item = dynamicList.value[itemIndex]
        uni.previewImage({
            current: imageIndex,
            urls: item.images
        })
    }

    const handleLike = (index) => {
        const item = dynamicList.value[index]
        if (item.liked) {
            item.likes--
            item.liked = false
        } else {
            item.likes++
            item.liked = true
            uni.showToast({ title: '已点赞 ❤️', icon: 'success' })
        }
    }

    const handleComment = (index) => {
        const item = dynamicList.value[index]
        uni.navigateTo({
            url: `/pages/dynamic/detail?id=${item.id}&focus=comment`
        })
    }

    const handleShare = (index) => {
        uni.showToast({ title: '点击右上角分享', icon: 'none' })
    }

    const handleReport = (index) => {
        uni.navigateTo({ url: '/pages/common/report' })
    }

    const handlePublish = () => {
        uni.navigateTo({ url: '/pages/dynamic/publish' })
    }

    const loadMore = () => {
        console.log('加载更多...')
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';
    @import '@/styles/mixins.scss';
    .square-page {
        min-height: 100vh;
        background-color: $bg-page;
    }

    // ----- 导航栏 -----
    .square-navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px $page-padding-x;
        background-color: rgba(255, 255, 255, 0.7);
        @include glass;
        border-bottom: 1px solid rgba($border-light, 0.5);
        position: sticky;
        top: 0;
        z-index: $z-index-sticky;

        &__tabs {
            display: flex;
            gap: $spacing-lg;
        }

        &__tab {
            font-size: $font-size-md;
            color: $text-secondary;
            font-weight: $font-weight-regular;
            cursor: pointer;
            position: relative;
            transition: all $duration-fast ease;

            &--active {
                color: $text-primary;
                font-weight: $font-weight-medium;

                &::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background-color: $primary-color;
                    border-radius: 1px;
                }
            }
        }

        &__right {
            display: flex;
            gap: $spacing-md;
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

    // ----- 动态列表 -----
    .square-list {
        height: calc(100vh - 76px);
        padding: $spacing-sm $page-padding-x 0;
    }

    // ----- 动态项 -----
    .square-item {
        background-color: $bg-card;
        border-radius: $radius-card;
        margin-bottom: $spacing-lg;
        overflow: hidden;
        box-shadow: $shadow-card;
        cursor: pointer;
        transition: all $duration-fast ease;

        &:active {
            transform: scale(0.99);
        }

        &__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: $spacing-md $spacing-md $spacing-sm;
        }

        &__header-right {
            display: flex;
            align-items: center;
            gap: $spacing-sm;
            flex-shrink: 0;
        }

        &__time {
            font-size: $font-size-xs;
            color: $text-helper;
        }

        &__quality {
            padding: 2px 12px;
            font-size: $font-size-xs;
            font-weight: $font-weight-medium;
            color: #FFFFFF;
            background-color: $primary-color;
            border-radius: 12px;
            box-shadow: 0 0 12px rgba($primary-color, 0.3);
        }

        &__image-wrapper {
            position: relative;
            margin: 0 $spacing-sm;
            border-radius: $radius-sm;
            overflow: hidden;
        }

        &__image {
            width: 100%;
            height: 220px;
            background-color: $bg-page;
        }

        &__image-count {
            position: absolute;
            bottom: $spacing-sm;
            right: $spacing-sm;
            padding: 2px 12px;
            font-size: $font-size-xs;
            color: #FFFFFF;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 12px;
        }

        &__content {
            padding: $spacing-sm $spacing-md $spacing-xs;
        }

        &__text {
            font-size: $font-size-sm;
            color: $text-secondary;
            line-height: 1.8;
            font-weight: $font-weight-light;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        &__location {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-top: $spacing-xs;
            font-size: $font-size-xs;
            color: $text-helper;

            .icon {
                font-size: 12px;
            }
        }
        // ----- 互动栏 -----
        &__actions {
            display: flex;
            align-items: center;
            padding: $spacing-sm $spacing-md $spacing-md;
            border-top: 1px solid $border-light;
            gap: $spacing-xl;
        }

        &__action {
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;

            &:active {
                opacity: 0.6;
            }
        }

        &__action-icon {
            font-size: 18px;
            color: $text-secondary;
            transition: all $duration-fast ease;
        }

        &__action-count {
            font-size: $font-size-xs;
            color: $text-helper;
        }
    }

    // ----- 加载更多 -----
    .square-loading {
        text-align: center;
        padding: $spacing-md 0 $spacing-lg;
        font-size: $font-size-xs;
        color: $text-helper;
    }

    // ----- 发布按钮 -----
    .square-publish {
        position: fixed;
        bottom: 80px;
        right: $page-padding-x;
        width: 56px;
        height: 56px;
        background-color: $primary-color;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 16px rgba($primary-color, 0.35);
        z-index: $z-index-dropdown;
        cursor: pointer;
        transition: all $duration-fast ease;

        &:active {
            transform: scale(0.92);
        }

        &__icon {
            font-size: 24px;
            color: #FFFFFF;
        }
    }
</style>