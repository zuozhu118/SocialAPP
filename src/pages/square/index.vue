<template>
    <view class="square-page">
        <!-- 导航栏 -->
        <view class="square-navbar">
            <text class="square-navbar__title">动态广场</text>
            <view class="square-navbar__right">
                <text class="square-navbar__icon" @click="handlePublish">📷</text>
            </view>
        </view>

        <!-- 动态列表 -->
        <scroll-view class="square-list"
                     scroll-y
                     @scrolltolower="loadMore">
            <view v-for="(item, index) in dynamicList"
                  :key="item.id"
                  class="square-item"
                  @click="goToDetail(item.id)">
                <!-- 用户信息 -->
                <view class="square-item__header" @click.stop>
                    <image class="square-item__avatar" :src="item.userAvatar" mode="aspectFill" />
                    <view class="square-item__user">
                        <view class="square-item__name">
                            {{ item.userName }}
                            <view v-if="item.auth.realName" class="square-item__auth-badge">✓ 已实名</view>
                        </view>
                        <text class="square-item__time">{{ item.time }}</text>
                    </view>
                    <view v-if="item.isQuality" class="square-item__quality">优质</view>
                </view>

                <!-- 动态图片 -->
                <view class="square-item__image-wrapper" @click.stop="previewImage(index, 0)">
                    <image class="square-item__image"
                           :src="item.images[0]"
                           mode="aspectFill" />
                    <view v-if="item.images.length > 1" class="square-item__image-count">
                        +{{ item.images.length - 1 }}
                    </view>
                </view>

                <!-- 动态内容 -->
                <view class="square-item__content">
                    <text class="square-item__text">{{ item.content }}</text>
                    <view class="square-item__location" v-if="item.location">
                        📍 {{ item.location }}
                    </view>
                </view>

                <!-- 互动栏 -->
                <view class="square-item__actions" @click.stop>
                    <view class="square-item__action" @click="handleLike(index)">
                        <text class="square-item__action-icon">❤️</text>
                        <text class="square-item__action-count">{{ item.likes }}</text>
                    </view>
                    <view class="square-item__action" @click="handleComment(index)">
                        <text class="square-item__action-icon">💬</text>
                        <text class="square-item__action-count">{{ item.comments }}</text>
                    </view>
                    <view class="square-item__action" @click="handleShare(index)">
                        <text class="square-item__action-icon">🔗</text>
                    </view>
                    <view class="square-item__action" @click="handleReport(index)">
                        <text class="square-item__action-icon">🚩</text>
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
            <text class="square-publish__icon">✏️</text>
        </view>
    </view>
</template>

<script setup>
    import { ref } from 'vue'

    // ===== 假数据 =====
    const dynamicList = ref([
        {
            id: 1,
            userName: '林小鹿',
            userAvatar: 'https://picsum.photos/100/100?random=10',
            auth: { realName: true },
            time: '2小时前',
            content: '今天的阳光真好，在咖啡馆看了一下午的书📖 有小伙伴推荐好看的书吗？',
            images: ['https://picsum.photos/400/300?random=20'],
            location: '北京·三里屯',
            likes: 23,
            comments: 8,
            isQuality: true
        },
        {
            id: 2,
            userName: '陈橘子',
            userAvatar: 'https://picsum.photos/100/100?random=11',
            auth: { realName: true },
            time: '5小时前',
            content: '周末的瑜伽课，身心都得到了放松🧘‍♀️ 有没有一起练瑜伽的小伙伴？',
            images: ['https://picsum.photos/400/300?random=21', 'https://picsum.photos/400/300?random=22'],
            location: '上海·静安',
            likes: 45,
            comments: 12,
            isQuality: true
        },
        {
            id: 3,
            userName: '周小白',
            userAvatar: 'https://picsum.photos/100/100?random=12',
            auth: { realName: true },
            time: '昨天',
            content: '第一次尝试做甜品，虽然卖相一般但味道不错😋 生活需要一点甜~',
            images: ['https://picsum.photos/400/300?random=23'],
            location: '深圳·南山',
            likes: 67,
            comments: 15,
            isQuality: false
        },
        {
            id: 4,
            userName: '吴晴天',
            userAvatar: 'https://picsum.photos/100/100?random=13',
            auth: { realName: true },
            time: '昨天',
            content: '海边日落真的太美了🌅 希望能和喜欢的人一起来看一次',
            images: ['https://picsum.photos/400/300?random=24', 'https://picsum.photos/400/300?random=25', 'https://picsum.photos/400/300?random=26'],
            location: '杭州·西湖',
            likes: 89,
            comments: 20,
            isQuality: true
        },
        {
            id: 5,
            userName: '郑小暖',
            userAvatar: 'https://picsum.photos/100/100?random=14',
            auth: { realName: true },
            time: '3天前',
            content: '最近迷上了水彩画，虽然还是新手但画得很开心🎨',
            images: ['https://picsum.photos/400/300?random=27'],
            location: '成都·锦里',
            likes: 34,
            comments: 6,
            isQuality: false
        }
    ])

    const hasMore = ref(false)

    // ===== 跳转方法 =====
    const goToDetail = (id) => {
        uni.navigateTo({
            url: `/pages/dynamic/detail?id=${id}`
        })
    }

    const goToPublish = () => {
        uni.navigateTo({
            url: '/pages/dynamic/publish'
        })
    }

    // ===== 图片预览 =====
    const previewImage = (itemIndex, imageIndex) => {
        const item = dynamicList.value[itemIndex]
        uni.previewImage({
            current: imageIndex,
            urls: item.images
        })
    }

    // ===== 操作方法 =====
    const handleLike = (index) => {
        const item = dynamicList.value[index]
        item.likes++
        uni.showToast({
            title: '已点赞 ❤️',
            icon: 'success'
        })
    }

    const handleComment = (index) => {
        const item = dynamicList.value[index]
        // 跳转到详情页并定位到评论
        uni.navigateTo({
            url: `/pages/dynamic/detail?id=${item.id}&focus=comment`
        })
    }

    const handleShare = (index) => {
        const item = dynamicList.value[index]
        uni.showShareMenu({
            success: () => {
                // 分享成功
            }
        })
        // 或者使用自定义分享
        uni.showToast({
            title: '点击右上角分享',
            icon: 'none'
        })
    }

    const handleReport = (index) => {
        uni.navigateTo({
            url: '/pages/common/report'
        })
    }

    const handlePublish = () => {
        uni.navigateTo({
            url: '/pages/dynamic/publish'
        })
    }

    const loadMore = () => {
        console.log('加载更多...')
        // 模拟加载更多
        // hasMore.value = false
    }
</script>

<style lang="scss" scoped>
    .square-page {
        min-height: 100vh;
        background-color: #FAFAFA;
    }

    // ----- 导航栏 -----
    .square-navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 24px;
        background-color: #FFFFFF;
        border-bottom: 1px solid #E5E5E5;
        position: sticky;
        top: 0;
        z-index: 10;
    }

    .square-navbar__title {
        font-size: 20px;
        font-weight: 500;
        color: #333333;
    }

    .square-navbar__right {
        display: flex;
        gap: 16px;
    }

    .square-navbar__icon {
        font-size: 20px;
        cursor: pointer;
    }

    .square-navbar__icon:active {
        opacity: 0.6;
    }

    // ----- 动态列表 -----
    .square-list {
        height: calc(100vh - 76px);
        padding: 0 24px;
    }

    // ----- 动态项 -----
    .square-item {
        background-color: #FFFFFF;
        border-radius: 20px;
        margin-bottom: 16px;
        overflow: hidden;
        cursor: pointer;
    }

    .square-item:active {
        opacity: 0.95;
    }

    .square-item__header {
        display: flex;
        align-items: center;
        padding: 14px 16px 10px;
    }

    .square-item__avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        flex-shrink: 0;
        background-color: #FAFAFA;
    }

    .square-item__user {
        flex: 1;
        margin-left: 12px;
    }

    .square-item__name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 500;
        color: #333333;
    }

    .square-item__auth-badge {
        font-size: 11px;
        font-weight: 400;
        color: #A8B89A;
        background-color: #F2F5EF;
        padding: 1px 8px;
        border-radius: 10px;
    }

    .square-item__time {
        font-size: 12px;
        color: #999999;
    }

    .square-item__quality {
        padding: 2px 12px;
        font-size: 11px;
        font-weight: 500;
        color: #FFFFFF;
        background-color: #A8B89A;
        border-radius: 10px;
    }

    .square-item__image-wrapper {
        position: relative;
        margin: 0 16px;
        border-radius: 12px;
        overflow: hidden;
    }

    .square-item__image {
        width: 100%;
        height: 200px;
        background-color: #FAFAFA;
    }

    .square-item__image-count {
        position: absolute;
        bottom: 8px;
        right: 8px;
        padding: 2px 10px;
        font-size: 12px;
        color: #FFFFFF;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 12px;
    }

    .square-item__content {
        padding: 12px 16px 8px;
    }

    .square-item__text {
        font-size: 14px;
        color: #666666;
        line-height: 1.8;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .square-item__location {
        margin-top: 6px;
        font-size: 12px;
        color: #999999;
    }

    // ----- 互动栏 -----
    .square-item__actions {
        display: flex;
        align-items: center;
        padding: 10px 16px 14px;
        border-top: 1px solid #E5E5E5;
        gap: 24px;
    }

    .square-item__action {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
    }

    .square-item__action:active {
        opacity: 0.6;
    }

    .square-item__action-icon {
        font-size: 16px;
    }

    .square-item__action-count {
        font-size: 12px;
        color: #999999;
    }

    // ----- 加载更多 -----
    .square-loading {
        text-align: center;
        padding: 16px 0 24px;
        font-size: 12px;
        color: #999999;
    }

    // ----- 发布按钮 -----
    .square-publish {
        position: fixed;
        bottom: 100px;
        right: 24px;
        width: 56px;
        height: 56px;
        background-color: #A8B89A;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 16px rgba(168, 184, 154, 0.4);
        z-index: 20;
    }

    .square-publish:active {
        transform: scale(0.92);
    }

    .square-publish__icon {
        font-size: 24px;
    }
</style>