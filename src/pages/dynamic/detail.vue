<template>
    <view class="detail-page">
        <CustomNavbar title="动态详情" :show-back="true" @back="handleBack" />

        <scroll-view class="detail-content" scroll-y>
            <view v-if="!detail" class="detail-missing">
                <text class="detail-missing__icon">🌿</text>
                <text class="detail-missing__text">这条动态已被删除</text>
            </view>

            <template v-else>
                <!-- 用户信息 -->
                <view class="detail-user">
                    <UserCard :name="detail.userName"
                              :avatar="detail.userAvatar"
                              :age="detail.userAge"
                              :auth="detail.auth"
                              :avatar-size="44"
                              :badge-size="18" />
                    <view class="detail-user__right">
                        <text class="detail-user__time">{{ detail.timeLabel }}</text>
                        <view class="detail-user__badges">
                            <view v-if="detail.crossCity" class="detail-user__badge detail-user__badge--cross">跨城</view>
                            <view v-if="detail.isQuality" class="detail-user__badge detail-user__badge--quality">精选</view>
                        </view>
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
                        <text class="detail-actions__count">{{ detail.commentCount }}</text>
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
                        全部评论 ({{ comments.length }})
                    </view>

                    <view v-if="!comments.length" class="detail-comments__empty">
                        <text>{{ commentsEmptyText }}</text>
                    </view>

                    <view v-for="comment in comments"
                          :key="comment.id"
                          class="detail-comments__item">
                        <UserCard :name="comment.name"
                                  :avatar="comment.avatar"
                                  :avatar-size="32"
                                  :badge-size="14" />
                        <view class="detail-comments__body">
                            <view class="detail-comments__meta" @click="openCommentActions(comment)">
                                <text class="detail-comments__name">{{ comment.name }}</text>
                                <text v-if="comment.userId === myId" class="detail-comments__mine">我</text>
                                <text class="detail-comments__more icon icon-more"></text>
                            </view>
                            <text class="detail-comments__text">{{ comment.text }}</text>
                            <text class="detail-comments__time">{{ comment.timeLabel }}</text>
                        </view>
                    </view>
                </view>
            </template>
        </scroll-view>

        <!-- 评论输入（三级权限分层） -->
        <view class="detail-input" :style="{ bottom: keyboardHeight + 'px' }">
            <view v-if="!canComment" class="detail-input__locked" @click="handleLockedInput">
                <text class="detail-input__locked-text">{{ lockedInputText }}</text>
            </view>
            <template v-else>
                <textarea class="detail-input__field"
                          placeholder="说点什么..."
                          maxlength="60"
                          :show-confirm-bar="false"
                          v-model="commentText"
                          @focus="onFocus"
                          @blur="onBlur" />
                <button class="detail-input__btn"
                        @click="submitComment"
                        :disabled="!commentText.trim()">
                    发送
                </button>
            </template>
        </view>

        <!-- 权限引导弹窗 -->
        <PermissionModal :visible="showPermission"
                         :mode="permissionPayload.mode"
                         :title="permissionPayload.title"
                         :content="permissionPayload.content"
                         :confirm-text="permissionPayload.confirmText"
                         @confirm="handlePermissionConfirm"
                         @close="showPermission = false" />
    </view>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { onLoad } from '@dcloudio/uni-app'
    import CustomNavbar from '@/components/common/CustomNavbar.vue'
    import UserCard from '@/components/common/UserCard.vue'
    import PermissionModal from '@/components/common/PermissionModal.vue'
    import { usePermission } from '@/composables/usePermission'
    import { useSquareStore } from '@/store/index'
    import { detectContact } from '@/store/match'
    import { currentUserProfile } from '@/mock/users'
    import { businessCopy } from '@/mock/copy'

    const square = useSquareStore()
    const { guard, isGuest, isCertified } = usePermission()

    const myId = currentUserProfile.id

    const dynamicId = ref(null)
    const commentText = ref('')
    const keyboardHeight = ref(0)
    const focusAfterLoad = ref(false)

    // 权限引导弹窗
    const showPermission = ref(false)
    const permissionPayload = ref({ mode: 'register', title: '', content: '', confirmText: '' })

    const openPermission = (payload) => {
        permissionPayload.value = { ...payload }
        showPermission.value = true
    }

    const handlePermissionConfirm = () => {
        const mode = permissionPayload.value.mode
        showPermission.value = false
        uni.navigateTo({ url: mode === 'register' ? '/pages/auth/login' : '/pages/auth/realname' })
    }

    // ===== 数据 =====
    const detail = computed(() => dynamicId.value ? square.detailOf(dynamicId.value) : null)

    // 评论：被拉黑用户的评论在前端过滤
    const comments = computed(() => dynamicId.value ? square.commentsOf(dynamicId.value) : [])

    const commentsEmptyText = computed(() => '还没有人评论，来说点什么吧')

    // 评论分层：游客 → 注册；注册未实名 → 实名；已实名 → 放行
    const canComment = computed(() => isCertified.value)

    const lockedInputText = computed(() =>
        isGuest.value ? '注册后可评论' : '完成实名认证后可评论'
    )

    // ===== 生命周期 =====
    onLoad((options) => {
        square.restore()
        if (options?.id) {
            dynamicId.value = Number.isFinite(Number(options.id)) ? Number(options.id) : options.id
        }
        if (options?.focus === 'comment') focusAfterLoad.value = true
    })

    const handleBack = () => {
        uni.navigateBack()
    }

    // ===== 交互 =====
    const previewImage = (index) => {
        if (!detail.value) return
        uni.previewImage({
            current: index,
            urls: detail.value.images
        })
    }

    const handleLike = () => {
        const { allowed, modal } = guard('likeDynamic')
        if (!allowed) {
            openPermission(modal)
            return
        }
        const res = square.toggleLike(dynamicId.value)
        if (res.ok && res.liked) {
            uni.showToast({ title: '已点赞 ❤️', icon: 'success' })
        }
    }

    const handleLockedInput = () => {
        const { modal } = guard('commentDynamic')
        if (modal) openPermission(modal)
    }

    const focusComment = () => {
        if (!canComment.value) {
            handleLockedInput()
            return
        }
        focusAfterLoad.value = true
        uni.showToast({ title: '在下方输入框评论', icon: 'none' })
    }

    const handleShare = () => {
        uni.showToast({ title: '点击右上角分享', icon: 'none' })
    }

    const handleReport = () => {
        if (isGuest.value) {
            const { modal } = guard('viewProfile')
            if (modal) openPermission(modal)
            return
        }
        uni.navigateTo({ url: `/pages/common/report?id=${dynamicId.value}` })
    }

    // 点评论作者 → 屏蔽 / 举报（拉黑完整能力在 M8，这里先打通过滤链路）
    const openCommentActions = (comment) => {
        if (isGuest.value) return
        if (comment.userId === myId) {
            uni.showActionSheet({
                itemList: ['删除我的评论'],
                success: (res) => {
                    if (res.tapIndex === 0) {
                        square.removeComment(dynamicId.value, comment.id)
                        uni.showToast({ title: '已删除', icon: 'none' })
                    }
                }
            })
            return
        }
        const blocked = square.isBlocked(comment.userId)
        uni.showActionSheet({
            itemList: [blocked ? '取消屏蔽此人' : '屏蔽此人的评论', '举报此评论'],
            success: (res) => {
                if (res.tapIndex === 0) {
                    const r = square.toggleBlockUser(comment.userId)
                    uni.showToast({
                        title: r.blocked ? `已屏蔽 ${comment.name} 的评论` : '已取消屏蔽',
                        icon: 'none'
                    })
                } else if (res.tapIndex === 1) {
                    uni.navigateTo({ url: `/pages/common/report?id=${dynamicId.value}` })
                }
            }
        })
    }

    const onFocus = (e) => {
        keyboardHeight.value = e.detail?.height || 0
    }

    const onBlur = () => {
        keyboardHeight.value = 0
    }

    const submitComment = () => {
        const { allowed, modal } = guard('commentDynamic')
        if (!allowed) {
            openPermission(modal)
            return
        }
        const text = commentText.value.trim()
        if (!text) return
        // 评论区同样拦截联系方式
        if (detectContact(text)) {
            uni.showToast({ title: businessCopy.contactInGreeting, icon: 'none' })
            return
        }
        const res = square.addComment(dynamicId.value, text)
        if (res.ok) {
            commentText.value = ''
            uni.showToast({ title: '评论成功', icon: 'success' })
        } else {
            uni.showToast({ title: '这条动态已被删除', icon: 'none' })
        }
    }
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

    .detail-missing {
        padding: 120px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;

        &__icon {
            font-size: 32px;
        }

        &__text {
            font-size: $font-size-sm;
            color: $text-helper;
        }
    }

    .detail-user {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: $spacing-md 0;
    }

    .detail-user__right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
        flex-shrink: 0;
    }

    .detail-user__time {
        font-size: $font-size-xs;
        color: $text-helper;
    }

    .detail-user__badges {
        display: flex;
        gap: 4px;
    }

    .detail-user__badge {
        padding: 1px 8px;
        font-size: 10px;
        border-radius: 8px;
        line-height: 1.5;

        &--cross {
            color: $text-secondary;
            background-color: $bg-card;
        }

        &--quality {
            color: #C8A252;
            background: linear-gradient(135deg, rgba(255, 239, 186, 0.4), rgba(255, 215, 100, 0.2));
        }
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
        padding: $spacing-md 0 40px;
    }

    .detail-comments__title {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-bottom: $spacing-md;
    }

    .detail-comments__empty {
        padding: 24px 0 32px;
        text-align: center;
        font-size: $font-size-xs;
        color: $text-helper;
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
        min-width: 0;
    }

    .detail-comments__meta {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 2px;
    }

    .detail-comments__name {
        font-size: $font-size-xs;
        color: $text-secondary;
        font-weight: $font-weight-medium;
    }

    .detail-comments__mine {
        padding: 0 5px;
        font-size: 9px;
        color: $primary-dark;
        background-color: $primary-light-bg;
        border-radius: 6px;
    }

    .detail-comments__more {
        font-size: 12px;
        color: $text-helper;
        padding: 0 2px;
    }

    .detail-comments__text {
        display: block;
        font-size: $font-size-sm;
        color: $text-primary;
        line-height: 1.6;
    }

    .detail-comments__time {
        font-size: 10px;
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
        padding: 9px $spacing-md;
        background-color: $bg-page;
        border-radius: 18px;
        font-size: $font-size-sm;
        line-height: 1.4;
        box-sizing: border-box;
    }

    .detail-input__locked {
        flex: 1;
        height: 36px;
        display: flex;
        align-items: center;
        padding: 0 $spacing-md;
        background-color: $bg-page;
        border-radius: 18px;
    }

    .detail-input__locked-text {
        font-size: $font-size-sm;
        color: $text-helper;
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
