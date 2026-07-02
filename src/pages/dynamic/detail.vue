<template>
    <view class="detail-page">
        <CustomNavbar title="动态详情" :show-back="true" @back="handleBack" />

        <scroll-view class="detail-content" scroll-y>
            <!-- 用户信息 -->
            <view class="detail-user">
                <UserCard :name="detail.userName"
                          :avatar="detail.userAvatar"
                          :age="detail.userAge"
                          :auth="detail.auth"
                          :avatar-size="44"
                          :badge-size="18" />
                <view class="detail-user__right">
                    <text class="detail-user__time">{{ detail.time }}</text>
                    <view v-if="detail.isQuality" class="detail-user__quality">优质</view>
                </view>
            </view>

            <!-- 动态图片 -->
            <view class="detail-images" :class="{ 'detail-images--single': detail.images.length === 1 }">
                <image v-for="(img, index) in detail.images"
                       :key="index"
                       class="detail-images__item"
                       :src="img"
                       mode="aspectFill"
                       @click="previewImage(index)" />
            </view>

            <!-- 动态文字 -->
            <view class="detail-text">
                <text class="detail-text__content">{{ detail.content }}</text>
                <text v-if="detail.location" class="detail-text__location">
                    <text class="icon icon-location" /> {{ detail.location }}
                </text>
            </view>

            <!-- 互动栏 -->
            <view class="detail-actions">
                <view class="detail-actions__item" @click="handleLike">
                    <text class="detail-actions__icon"
                          :class="[detail.liked ? 'icon-heart-filled' : 'icon-heart']"
                          :style="{ color: detail.liked ? '#E06060' : '' }" />
                    <text class="detail-actions__count">{{ detail.likes }}</text>
                </view>
                <view class="detail-actions__item" @click="focusComment">
                    <text class="detail-actions__icon icon icon-comment" />
                    <text class="detail-actions__count">{{ detail.comments }}</text>
                </view>
                <view class="detail-actions__item" @click="handleShare">
                    <text class="detail-actions__icon icon icon-share" />
                </view>
                <view class="detail-actions__item" @click="handleReport">
                    <text class="detail-actions__icon icon icon-flag" />
                </view>
            </view>

            <!-- 评论列表 -->
            <view class="detail-comments">
                <view class="detail-comments__title">
                    全部评论 ({{ detail.comments }})
                </view>
                <view v-for="(comment, index) in comments"
                      :key="index"
                      class="detail-comments__item">
                    <UserCard :name="comment.name"
                              :avatar="comment.avatar"
                              :avatar-size="32"
                              :badge-size="14" />
                    <view class="detail-comments__body">
                        <text class="detail-comments__text">{{ comment.text }}</text>
                        <text class="detail-comments__time">{{ comment.time }}</text>
                    </view>
                </view>
            </view>
        </scroll-view>

        <!-- 评论输入 -->
        <view class="detail-input" :style="{ bottom: keyboardHeight + 'px' }">
            <input class="detail-input__field"
                   type="text"
                   placeholder="说点什么..."
                   v-model="commentText"
                   @confirm="submitComment"
                   @focus="onFocus"
                   @blur="onBlur" />
            <button class="detail-input__btn"
                    @click="submitComment"
                    :disabled="!commentText.trim()">
                发送
            </button>
        </view>
    </view>
</template>

<script setup>
    import { ref, onLoad } from 'vue'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'
    import UserCard from '@/components/common/UserCard.vue'

    const commentText = ref('')
    const keyboardHeight = ref(0)

    const detail = ref({
        id: 1,
        userName: '林小鹿',
        userAge: 24,
        userAvatar: 'https://picsum.photos/100/100?random=10',
        auth: { realName: true, education: true, work: false },
        time: '2小时前',
        content: '今天的阳光真好，在咖啡馆看了一下午的书📖 有小伙伴推荐好看的书吗？',
        images: ['https://picsum.photos/600/400?random=20', 'https://picsum.photos/600/400?random=21'],
        location: '北京·三里屯',
        likes: 23,
        liked: false,
        comments: 8,
        isQuality: true
    })

    const comments = ref([
        {
            name: '陈橘子',
            avatar: 'https://picsum.photos/100/100?random=11',
            text: '好美呀！这是哪家咖啡馆？',
            time: '1小时前'
        },
        {
            name: '周小白',
            avatar: 'https://picsum.photos/100/100?random=12',
            text: '推荐《百年孤独》！',
            time: '30分钟前'
        }
    ])

    const handleBack = () => {
        uni.navigateBack()
    }

    const previewImage = (index) => {
        uni.previewImage({
            current: index,
            urls: detail.value.images
        })
    }

    const handleLike = () => {
        if (detail.value.liked) {
            detail.value.likes--
            detail.value.liked = false
        } else {
            detail.value.likes++
            detail.value.liked = true
            uni.showToast({ title: '已点赞 ❤️', icon: 'success' })
        }
    }

    const focusComment = () => {
        // 聚焦到输入框
    }

    const handleShare = () => {
        uni.showToast({ title: '点击右上角分享', icon: 'none' })
    }

    const handleReport = () => {
        uni.navigateTo({ url: '/pages/common/report' })
    }

    const onFocus = (e) => {
        keyboardHeight.value = e.detail.height || 260
    }

    const onBlur = () => {
        keyboardHeight.value = 0
    }

    const submitComment = () => {
        if (!commentText.value.trim()) return
        comments.value.unshift({
            name: '我',
            avatar: 'https://picsum.photos/100/100?random=30',
            text: commentText.value,
            time: '刚刚'
        })
        detail.value.comments++
        commentText.value = ''
        uni.showToast({ title: '评论成功', icon: 'success' })
    }

    onLoad((options) => {
        console.log('动态ID:', options.id)
    })
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .detail-page {
        min-height: 100vh;
        background-color: $bg-page;
    }

    .detail-content {
        height: calc(100vh - 120px);
        padding: 0 $page-padding-x;
    }

    .detail-user {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: $spacing-md 0;
    }

    .detail-user__right {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        flex-shrink: 0;
    }

    .detail-user__time {
        font-size: $font-size-xs;
        color: $text-helper;
    }

    .detail-user__quality {
        padding: 2px 12px;
        font-size: $font-size-xs;
        font-weight: $font-weight-medium;
        color: #FFFFFF;
        background-color: $primary-color;
        border-radius: 12px;
    }

    .detail-images {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: $spacing-xs;
        margin-bottom: $spacing-sm;

        &--single {
            grid-template-columns: 1fr;
        }
    }

    .detail-images__item {
        width: 100%;
        height: 180px;
        border-radius: $radius-sm;
        background-color: $bg-page;
        cursor: pointer;

        &:active {
            opacity: 0.9;
        }
    }

    .detail-images--single .detail-images__item {
        height: 280px;
    }

    .detail-text {
        padding: $spacing-sm 0 $spacing-md;
    }

    .detail-text__content {
        font-size: $font-size-sm;
        color: $text-primary;
        line-height: 1.8;
    }

    .detail-text__location {
        display: block;
        font-size: $font-size-xs;
        color: $text-helper;
        margin-top: $spacing-sm;

        .icon {
            font-size: 12px;
        }
    }

    .detail-actions {
        display: flex;
        align-items: center;
        padding: $spacing-sm 0;
        border-top: 1px solid $border-light;
        border-bottom: 1px solid $border-light;
        gap: $spacing-xl;
    }

    .detail-actions__item {
        display: flex;
        align-items: center;
        gap: $spacing-xs;
        cursor: pointer;

        &:active {
            opacity: 0.6;
        }
    }

    .detail-actions__icon {
        font-size: 20px;
        color: $text-secondary;
    }

    .detail-actions__count {
        font-size: $font-size-sm;
        color: $text-secondary;
    }

    .detail-comments {
        padding: $spacing-md 0;
    }

    .detail-comments__title {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-bottom: $spacing-md;
    }

    .detail-comments__item {
        display: flex;
        align-items: flex-start;
        gap: $spacing-sm;
        padding: $spacing-sm 0;
        border-bottom: 1px solid $border-light;

        &:last-child {
            border-bottom: none;
        }
    }

    .detail-comments__body {
        flex: 1;
    }

    .detail-comments__text {
        display: block;
        font-size: $font-size-sm;
        color: $text-secondary;
    }

    .detail-comments__time {
        font-size: $font-size-xs;
        color: $text-helper;
    }

    .detail-input {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        padding: $spacing-sm $page-padding-x;
        background-color: $bg-card;
        border-top: 1px solid $border-light;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        transition: bottom $duration-fast ease;
    }

    .detail-input__field {
        flex: 1;
        height: 36px;
        padding: 0 $spacing-md;
        background-color: $bg-page;
        border-radius: 18px;
        font-size: $font-size-sm;
    }

    .detail-input__btn {
        height: 36px;
        padding: 0 $spacing-lg;
        background-color: $primary-color;
        color: #FFFFFF;
        border-radius: 18px;
        font-size: $font-size-sm;
        border: none;

        &:disabled {
            background-color: $disabled-bg;
            color: $text-helper;
        }

        &:active:not(:disabled) {
            transform: scale(0.95);
        }
    }
</style>