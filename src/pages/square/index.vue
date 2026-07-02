<template>
    <view class="square-page">
        <!-- 导航栏：仅保留推荐/关注Tab -->
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
                <!-- 用户信息头部 -->
                <view class="square-item__header" @click.stop>
                    <view class="square-item__user">
                        <!-- 头像 + 认证等级对勾 -->
                        <view class="square-item__avatar-wrap" @click="goToProfile(item.userId)">
                            <image class="square-item__avatar" :src="item.userAvatar" mode="aspectFill" />
                            <view class="avatar-auth-icon" :class="'auth-level-' + getAuthLevel(item.auth)" v-if="item.auth.realName">
                                <text class="icon icon-check"></text>
                            </view>
                        </view>
                        <view class="square-item__user-info">
                            <!-- 第一行：昵称 + 性别 + 关注按钮 -->
                            <view class="square-item__name-row">
                                <text class="square-item__name" @click="goToProfile(item.userId)">{{ item.userName }}</text>
                                <!-- 性别图标 -->
                                <text class="square-item__gender" :class="item.gender === 'female' ? 'is-female' : 'is-male'">
                                    {{ item.gender === 'female' ? '♀' : '♂' }}
                                </text>
                                <!-- 关注按钮 -->
                                <button class="follow-btn"
                                        :class="{ 'follow-btn--followed': item.isFollowed }"
                                        @click="toggleFollow(index)">
                                    {{ item.isFollowed ? '已关注' : '+ 关注' }}
                                </button>
                            </view>
                            <!-- 第二行：年龄·职业·居住地 -->
                            <view class="square-item__user-meta">
                                {{ item.age }}岁 · {{ item.occupation }} · {{ item.district }}
                            </view>
                        </view>
                    </view>

                    <!-- 右侧：时间 + 精选徽标 -->
                    <view class="square-item__header-right">
                        <text class="square-item__time">{{ item.time }}</text>
                        <!-- 动态精选标签：精致化香槟金徽标 -->
                        <view v-if="item.isQuality" class="quality-badge">
                            <text class="icon icon-star"></text>
                            <text>精选</text>
                        </view>
                    </view>
                </view>

                <!-- 动态正文：放在图片上方 -->
                <view class="square-item__content">
                    <text class="square-item__text">{{ item.content }}</text>
                    <view class="square-item__location" v-if="item.location">
                        <text class="icon icon-location" />
                        {{ item.location }}
                    </view>
                </view>

                <!-- 动态图片 -->
                <view class="square-item__image-wrapper" @click.stop="previewImage(index, 0)">
                    <image class="square-item__image" :src="item.images[0]" mode="aspectCover" />
                    <view v-if="item.images.length > 1" class="square-item__image-count">
                        +{{ item.images.length - 1 }}
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

    const currentTab = ref('recommend')
    const refreshing = ref(false)
    const hasMore = ref(false)

    // 计算认证等级：1=仅实名 2=实名+学历 3=实名+学历+工作
    const getAuthLevel = (auth) => {
        let level = 0
        if (auth.realName) level = 1
        if (auth.realName && auth.education) level = 2
        if (auth.realName && auth.education && auth.work) level = 3
        return level
    }

    const dynamicList = ref([
        {
            id: 1,
            userId: 1,
            userName: '林小鹿',
            gender: 'female',
            age: 24,
            occupation: '教师',
            district: '朝阳区',
            userAvatar: 'https://picsum.photos/100/100?random=10',
            auth: { realName: true, education: true, work: false }, // 等级2
            isFollowed: false,
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
            gender: 'female',
            age: 26,
            occupation: '金融分析师',
            district: '浦东新区',
            userAvatar: 'https://picsum.photos/100/100?random=11',
            auth: { realName: true, education: true, work: true }, // 等级3
            isFollowed: true,
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
            gender: 'male',
            age: 28,
            occupation: '产品经理',
            district: '南山区',
            userAvatar: 'https://picsum.photos/100/100?random=12',
            auth: { realName: true, education: false, work: true }, // 等级1
            isFollowed: false,
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
            gender: 'female',
            age: 25,
            occupation: '设计师',
            district: '西湖区',
            userAvatar: 'https://picsum.photos/100/100?random=13',
            auth: { realName: true, education: true, work: true }, // 等级3
            isFollowed: false,
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
            gender: 'female',
            age: 23,
            occupation: '插画师',
            district: '锦江区',
            userAvatar: 'https://picsum.photos/100/100?random=14',
            auth: { realName: true, education: false, work: false }, // 等级1
            isFollowed: false,
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

    // 切换Tab
    const switchTab = (tab) => {
        currentTab.value = tab
    }

    // 下拉刷新
    const onRefresh = () => {
        refreshing.value = true
        setTimeout(() => {
            refreshing.value = false
            uni.showToast({ title: '刷新成功', icon: 'success' })
        }, 1000)
    }

    // 跳转详情
    const goToDetail = (id) => {
        uni.navigateTo({ url: `/pages/dynamic/detail?id=${id}` })
    }

    // 跳转个人主页
    const goToProfile = (userId) => {
        uni.navigateTo({ url: `/pages/user/profile?id=${userId}` })
    }

    // 图片预览
    const previewImage = (itemIndex, imageIndex) => {
        const item = dynamicList.value[itemIndex]
        uni.previewImage({
            current: imageIndex,
            urls: item.images
        })
    }

    // 关注/取消关注
    const toggleFollow = (index) => {
        const item = dynamicList.value[index]
        item.isFollowed = !item.isFollowed
        uni.showToast({
            title: item.isFollowed ? '关注成功' : '已取消关注',
            icon: 'none'
        })
    }

    // 点赞
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

    // 评论
    const handleComment = (index) => {
        const item = dynamicList.value[index]
        uni.navigateTo({
            url: `/pages/dynamic/detail?id=${item.id}&focus=comment`
        })
    }

    // 分享
    const handleShare = (index) => {
        uni.showToast({ title: '点击右上角分享', icon: 'none' })
    }

    // 举报
    const handleReport = (index) => {
        uni.navigateTo({ url: '/pages/common/report' })
    }

    // 发布动态
    const handlePublish = () => {
        uni.navigateTo({ url: '/pages/dynamic/publish' })
    }

    // 加载更多
    const loadMore = () => {
        console.log('加载更多...')
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';
    @import '@/styles/mixins.scss';

    .square-page {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        background-color: $bg-page;
        overflow: hidden;
    }

    // ----- 导航栏 -----
    .square-navbar {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px $page-padding-x;
        background-color: rgba(255, 255, 255, 0.85);
        @include glass;
        border-bottom: 1px solid rgba($border-light, 0.5);
        position: relative;
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
    }

    // ----- 动态列表 -----
    .square-list {
        flex: 1;
        padding: $spacing-sm $page-padding-x 0;
        min-height: 0;
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
        // 头部用户信息
        &__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: $spacing-md;
            gap: 12px;
        }

        &__user {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
            min-width: 0;
        }
        // 头像容器 + 认证等级对勾
        &__avatar-wrap {
            position: relative;
            flex-shrink: 0;
            cursor: pointer;
        }

        &__avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background-color: $bg-page;
            display: block;
        }
        // 认证对勾基础样式
        .avatar-auth-icon {
            position: absolute;
            right: -2px;
            bottom: -2px;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid $bg-card;

            .icon {
                font-size: 9px;
                color: #FFFFFF;
                line-height: 1;
            }
            // 等级1：仅实名 - 浅绿空心
            &.auth-level-1 {
                background-color: transparent;
                border: 1.5px solid #81D4A0;

                .icon {
                    color: #81D4A0;
                    font-size: 8px;
                }
            }
            // 等级2：实名+学历 - 深绿实心
            &.auth-level-2 {
                background-color: #2ED573;
                border: 2px solid $bg-card;
            }
            // 等级3：三重认证 - 香槟金实心
            &.auth-level-3 {
                background: linear-gradient(135deg, #FFD700, #FFB74D);
                border: 2px solid $bg-card;
                box-shadow: 0 0 4px rgba(255, 183, 77, 0.4);
            }
        }

        &__user-info {
            flex: 1;
            min-width: 0;
        }

        &__name-row {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 2px;
        }

        &__name {
            font-size: $font-size-md;
            font-weight: $font-weight-medium;
            color: $text-primary;
            line-height: 1.2;
            cursor: pointer;
        }
        // 性别图标
        &__gender {
            font-size: 16px;
            line-height: 1;

            &.is-female {
                color: #FF6B81;
            }

            &.is-male {
                color: #4FACFE;
            }
        }

        &__user-meta {
            font-size: 11px;
            color: $text-helper;
            line-height: 1.2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        // 右侧操作区
        &__header-right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
            flex-shrink: 0;
        }

        &__time {
            font-size: $font-size-xs;
            color: $text-helper;
        }
        // 精致化精选徽标
        .quality-badge {
            display: inline-flex;
            align-items: center;
            gap: 3px;
            padding: 2px 10px;
            font-size: 10px;
            font-weight: $font-weight-regular;
            color: #C8A252;
            background: linear-gradient(135deg, rgba(255, 239, 186, 0.3), rgba(255, 215, 100, 0.15));
            border: 0.5px solid rgba(200, 162, 82, 0.4);
            border-radius: 10px;
            line-height: 1.4;

            .icon {
                font-size: 10px;
                color: #D4AF61;
            }
        }
        // 正文内容
        &__content {
            padding: 0 $spacing-md $spacing-sm;
        }

        &__text {
            font-size: $font-size-sm;
            color: $text-primary;
            line-height: 1.7;
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
        // 图片区域
        &__image-wrapper {
            position: relative;
            margin: 0 $spacing-md $spacing-sm;
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
        // 互动栏
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

    // 关注按钮
    .follow-btn {
        padding: 4px 14px;
        font-size: 12px;
        color: $primary-color;
        background-color: $primary-light-bg;
        border: 1px solid $primary-color;
        border-radius: 14px;
        line-height: 1.3;
        transition: all $duration-fast ease;
        flex-shrink: 0;
        margin-left: 2px;

        &:active {
            opacity: 0.8;
        }

        &--followed {
            color: $text-helper;
            background-color: $bg-page;
            border-color: $border-light;
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