<template>
    <view class="square-page">
        <!-- 导航栏：时段标题 + 推荐/喜欢Tab -->
        <view class="square-navbar">
            <view class="square-navbar__info">
                <text class="square-navbar__title">{{ timeTitle }}</text>
                <text class="square-navbar__sub">{{ navbarSub }}</text>
            </view>
            <view class="square-navbar__tabs">
                <text class="square-navbar__tab"
                      :class="{ 'square-navbar__tab--active': currentTab === 'recommend' }"
                      @click="switchTab('recommend')">推荐</text>
                <text class="square-navbar__tab"
                      :class="{ 'square-navbar__tab--active': currentTab === 'like' }"
                      @click="switchTab('like')">喜欢</text>
            </view>
        </view>

        <!-- 动态列表 -->
        <scroll-view class="square-list"
                     scroll-y
                     @scrolltolower="loadMore"
                     refresher-enabled
                     :refresher-triggered="refreshing"
                     @refresherrefresh="onRefresh">
            <!-- 免费可看部分 -->
            <template v-for="(item, index) in freeList" :key="item.id">
                <!-- 冷启动兜底提示：同城内容不足，开始补充跨城优质动态 -->
                <view v-if="index === fallbackTipIndex" class="square-fallback-tip">
                    <text class="square-fallback-tip__icon">🌿</text>
                    <text class="square-fallback-tip__text">{{ fallbackTip }}</text>
                </view>

                <view class="square-item"
                      :class="{ 'square-item--fade': isLastFreeItem(index) }"
                      @click="goToDetail(item.id)">
                    <!-- 用户信息头部 -->
                    <view class="square-item__header" @click.stop>
                        <view class="square-item__user">
                            <view class="square-item__avatar-wrap" @click="goToProfile(item.userId)">
                                <image class="square-item__avatar" :src="item.userAvatar" mode="aspectFill" />
                                <view class="avatar-auth-icon"
                                      :class="'auth-level-' + getAuthLevel(item.auth)"
                                      v-if="item.auth && item.auth.realName">
                                    <text class="icon icon-check"></text>
                                </view>
                            </view>
                            <view class="square-item__user-info">
                                <view class="square-item__name-row">
                                    <text class="square-item__name">{{ item.userName }}</text>
                                    <text class="square-item__gender" :class="item.gender === 'female' ? 'is-female' : 'is-male'">
                                        {{ item.gender === 'female' ? '♀' : '♂' }}
                                    </text>
                                    <view v-if="item.mine" class="mine-badge">我的</view>
                                </view>
                                <view class="square-item__user-meta">
                                    {{ item.userAge }}岁 · {{ item.occupation }} · {{ item.district }}
                                </view>
                            </view>
                        </view>

                        <view class="square-item__header-right">
                            <text class="square-item__time">{{ item.timeLabel }}</text>
                            <view class="square-item__badges">
                                <view v-if="item.pinned" class="pin-badge">置顶</view>
                                <view v-if="item.crossCity" class="cross-badge">跨城</view>
                                <view v-if="item.isQuality" class="quality-badge">
                                    <text class="icon icon-star"></text>
                                    <text>精选</text>
                                </view>
                            </view>
                        </view>
                    </view>

                    <!-- 动态正文 -->
                    <view class="square-item__content">
                        <text class="square-item__text">{{ item.content }}</text>
                        <view class="square-item__location" v-if="item.location">
                            <text class="icon icon-location" />
                            {{ item.location }}
                        </view>
                    </view>

                    <!-- 动态图片 -->
                    <view class="square-item__image-wrapper" @click.stop="previewImage(item, 0)">
                        <image class="square-item__image" :src="item.images[0]" mode="aspectCover" />
                        <view v-if="item.images.length > 1" class="square-item__image-count">
                            +{{ item.images.length - 1 }}
                        </view>
                    </view>

                    <!-- 互动栏 -->
                    <view class="square-item__actions" @click.stop>
                        <view class="square-item__action" @click="handleLike(item)">
                            <text class="square-item__action-icon"
                                  :class="[item.liked ? 'icon-heart-filled' : 'icon-heart']"
                                  :style="{ color: item.liked ? '#E06060' : '' }" />
                            <text class="square-item__action-count">{{ item.likes }}</text>
                        </view>
                        <view class="square-item__action" @click="handleComment(item)">
                            <text class="square-item__action-icon icon icon-comment" />
                            <text class="square-item__action-count">{{ item.commentCount }}</text>
                        </view>
                        <view class="square-item__action" @click="handleShare(item)">
                            <text class="square-item__action-icon icon icon-share" />
                        </view>
                        <view class="square-item__action" @click="handleReport(item)">
                            <text class="square-item__action-icon icon icon-flag" />
                        </view>
                    </view>

                    <!-- 第 5 条底部渐变遮罩 + 注册引导（仅游客） -->
                    <view v-if="isLastFreeItem(index) && isGuest" class="square-fade-mask">
                        <text class="square-fade-mask__text">已有 12,806 位同城用户完成实名，注册后解锁全部真实资料</text>
                    </view>
                </view>
            </template>

            <!-- 游客拦截区：中央注册按钮 + 模糊内容 -->
            <view v-if="isGuest && lockedList.length" class="square-locked">
                <!-- 页面中央主按钮 -->
                <view class="square-locked__cta">
                    <text class="square-locked__cta-icon">🔒</text>
                    <text class="square-locked__cta-title">注册后查看完整真实资料</text>
                    <text class="square-locked__cta-desc">已有大量同城用户完成实名认证</text>
                    <button class="square-locked__cta-btn" @click="handleGuestLocked">一键授权手机号注册</button>
                </view>

                <view class="square-locked__list">
                    <view v-for="item in lockedList"
                          :key="'lock-' + item.id"
                          class="square-item square-item--blur"
                          @click="handleGuestLocked">
                        <view class="square-item__header">
                            <view class="square-item__user">
                                <view class="square-item__avatar-wrap square-item__avatar-wrap--masked">
                                    <image class="square-item__avatar" :src="item.userAvatar" mode="aspectFill" />
                                    <view class="avatar-mask">?</view>
                                </view>
                                <view class="square-item__user-info">
                                    <view class="square-item__name-row">
                                        <text class="square-item__name">同城用户</text>
                                    </view>
                                    <view class="square-item__user-meta">注册后查看真实资料</view>
                                </view>
                            </view>
                        </view>
                        <view class="square-item__content">
                            <text class="square-item__text">{{ item.content }}</text>
                        </view>
                        <view class="square-item__image-wrapper">
                            <image class="square-item__image" :src="item.images[0]" mode="aspectCover" />
                        </view>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view v-if="!freeList.length && !isGuest" class="square-empty">
                <text class="square-empty__icon">{{ isEmptyLikeTab ? '💗' : '🌱' }}</text>
                <text class="square-empty__text">{{ emptyText }}</text>
                <text v-if="isEmptyLikeTab" class="square-empty__action" @click="switchTab('recommend')">
                    去推荐里看看 ›
                </text>
            </view>

            <view v-if="!isGuest && freeList.length" class="square-loading">
                <text>{{ hasMore ? '加载中...' : '— 没有更多了 —' }}</text>
            </view>
        </scroll-view>

        <!-- 连续无匹配安抚提示（底部弱提示，可关闭） -->
        <view v-if="showComfort" class="square-comfort">
            <text class="square-comfort__icon">🌸</text>
            <text class="square-comfort__text">{{ comfortText }}</text>
            <text class="square-comfort__close icon icon-close" @click="closeComfort"></text>
        </view>

        <!-- 发布按钮 -->
        <view class="square-publish" :class="{ 'is-disabled': !isCertified }" @click="handlePublish">
            <text class="square-publish__icon icon icon-edit" />
        </view>

        <!-- 权限引导弹窗 -->
        <PermissionModal :visible="modal.visible"
                         :mode="modal.mode"
                         :title="modal.title"
                         :content="modal.content"
                         :confirm-text="modal.confirmText"
                         @confirm="handleModalConfirm"
                         @favorite="handleModalFavorite"
                         @close="closeModal" />
    </view>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { onShow } from '@dcloudio/uni-app'
    import PermissionModal from '@/components/common/PermissionModal.vue'
    import { useUserStore, useSquareStore, useMatchStore } from '@/store/index'
    import { usePermission } from '@/composables/usePermission'
    import { emptyCopy, getTimeSlotTitle } from '@/mock/copy'

    const userStore = useUserStore()
    const square = useSquareStore()
    const matchStore = useMatchStore()
    const { isGuest, isCertified, guard } = usePermission()

    const currentTab = ref('recommend')
    const refreshing = ref(false)
    const hasMore = ref(false)
    const timeTitle = ref(getTimeSlotTitle())

    // ===== 权限弹窗 =====
    const modal = ref({
        visible: false,
        mode: 'register',
        title: '',
        content: '',
        confirmText: '',
        pendingAction: null
    })

    const openModal = (payload, pendingAction = null) => {
        modal.value = {
            visible: true,
            mode: payload.mode,
            title: payload.title,
            content: payload.content,
            confirmText: payload.confirmText,
            pendingAction
        }
    }

    const closeModal = () => {
        modal.value.visible = false
    }

    const handleModalConfirm = () => {
        const mode = modal.value.mode
        const pendingAction = modal.value.pendingAction
        closeModal()
        if (mode === 'register') {
            uni.navigateTo({ url: '/pages/auth/login' })
            return
        }
        if (mode === 'realname') {
            uni.navigateTo({ url: '/pages/auth/realname' })
            return
        }
        if (pendingAction) pendingAction()
    }

    const handleModalFavorite = () => {
        const action = modal.value.pendingAction
        closeModal()
        if (action) action()
    }

    // ===== 列表数据（同城优先 + 跨城兜底）=====
    const displayList = computed(() =>
        currentTab.value === 'recommend' ? square.recommendFeed : square.likeFeed
    )

    const freeList = computed(() => isGuest.value ? displayList.value.slice(0, 5) : displayList.value)
    const lockedList = computed(() => isGuest.value ? displayList.value.slice(5) : [])

    const isLastFreeItem = (index) => isGuest.value && index === 4

    const isEmptyLikeTab = computed(() => currentTab.value === 'like' && !displayList.value.length)

    const emptyText = computed(() =>
        currentTab.value === 'like'
            ? emptyCopy.likeFeedEmpty
            : emptyCopy.squareEmpty
    )

    // 冷启动兜底提示的位置：第一条被兜底选中的跨城动态之前
    const fallbackTipIndex = computed(() => {
        if (currentTab.value !== 'recommend') return -1
        return freeList.value.findIndex(item => item.pickedFallback)
    })

    const fallbackTip = computed(() => {
        const sameCount = square.sameCityFeed.length
        return `同城已上线 ${sameCount} 条动态，正在为你补充跨城优质内容`
    })

    const navbarSub = computed(() => {
        if (currentTab.value === 'like') return '你点赞过的动态'
        const same = square.sameCityFeed.length
        const cross = square.crossCityFeed.length
        return cross ? `同城 ${same} 条 · 跨城补给 ${cross} 条` : `同城 ${same} 条 · 真实 · 已实名`
    })

    // ===== 安抚提示：连续 3 天无匹配 =====
    const showComfort = computed(() =>
        !isGuest.value &&
        !square.comfortClosed &&
        matchStore.matchedCount === 0 &&
        square.idleDays >= 3 &&
        freeList.value.length > 0
    )

    const comfortText = computed(() =>
        `已经 ${square.idleDays} 天没有新的双向匹配了。${emptyCopy.matchEmpty}`
    )

    const closeComfort = () => {
        square.closeComfort()
    }

    const getAuthLevel = (auth) => {
        if (!auth) return 0
        let level = 0
        if (auth.realName) level = 1
        if (auth.realName && auth.education) level = 2
        if (auth.realName && auth.education && auth.work) level = 3
        return level
    }

    onShow(() => {
        timeTitle.value = getTimeSlotTitle()
        square.restore()
        square.touchFirstOpen()
        matchStore.restore()
    })

    // ===== 交互 =====
    const switchTab = (tab) => {
        currentTab.value = tab
    }

    const onRefresh = () => {
        refreshing.value = true
        setTimeout(() => {
            refreshing.value = false
            timeTitle.value = getTimeSlotTitle()
            uni.showToast({ title: '刷新成功', icon: 'success' })
        }, 800)
    }

    const goToDetail = (id) => {
        if (isGuest.value) {
            handleGuestLocked()
            return
        }
        uni.navigateTo({ url: `/pages/dynamic/detail?id=${id}` })
    }

    const goToProfile = (userId) => {
        if (isGuest.value) {
            handleGuestLocked()
            return
        }
        uni.navigateTo({ url: `/pages/user/profile?id=${userId}` })
    }

    const previewImage = (item, imageIndex) => {
        uni.previewImage({
            current: imageIndex,
            urls: item.images
        })
    }

    // 游客点击任何受限内容 → 统一注册弹窗
    const handleGuestLocked = () => {
        const { modal: payload } = guard('viewProfile')
        if (payload) openModal(payload)
    }

    // 点赞：游客拦截；未实名可点赞
    const handleLike = (item) => {
        const { allowed, modal: payload } = guard('likeDynamic')
        if (!allowed) {
            openModal(payload)
            return
        }
        const res = square.toggleLike(item.id)
        if (res.ok && res.liked) {
            uni.showToast({ title: '已点赞 ❤️', icon: 'success' })
        }
    }

    // 评论：未实名拦截
    const handleComment = (item) => {
        const { allowed, modal: payload } = guard('commentDynamic')
        if (!allowed) {
            openModal(payload)
            return
        }
        uni.navigateTo({ url: `/pages/dynamic/detail?id=${item.id}&focus=comment` })
    }

    const handleShare = () => {
        uni.showToast({ title: '点击右上角分享给好友', icon: 'none' })
    }

    const handleReport = (item) => {
        if (isGuest.value) {
            handleGuestLocked()
            return
        }
        uni.navigateTo({ url: `/pages/common/report?id=${item.id}` })
    }

    // 发布：仅实名
    const handlePublish = () => {
        const { allowed, modal: payload } = guard('publishDynamic')
        if (!allowed) {
            openModal(payload)
            return
        }
        uni.navigateTo({ url: '/pages/dynamic/publish' })
    }

    const loadMore = () => {
        if (isGuest.value) return
        hasMore.value = false
    }
</script>

<style lang="scss" scoped>
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
        padding: 12px $page-padding-x;
        background-color: rgba(255, 255, 255, 0.85);
        @include glass;
        border-bottom: 1px solid rgba($border-light, 0.5);
        position: relative;
        z-index: $z-index-sticky;

        &__info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            margin-bottom: 10px;
        }

        &__title {
            font-size: $font-size-md;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__sub {
            font-size: 10px;
            color: $text-helper;
        }

        &__tabs {
            display: flex;
            gap: $spacing-lg;
        }

        &__tab {
            font-size: $font-size-sm;
            color: $text-secondary;
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

    // ----- 冷启动兜底提示 -----
    .square-fallback-tip {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: $spacing-sm;
        padding: 8px 12px;
        background-color: $primary-light-bg;
        border-radius: $radius-xs;

        &__icon {
            font-size: 13px;
        }

        &__text {
            flex: 1;
            font-size: 11px;
            color: $primary-dark;
            line-height: 1.5;
        }
    }

    // ----- 动态项 -----
    .square-item {
        position: relative;
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

        &__avatar-wrap {
            position: relative;
            flex-shrink: 0;

            &--masked .square-item__avatar {
                filter: blur(4px);
            }
        }

        &__avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background-color: $bg-page;
            display: block;
        }

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

            &.auth-level-1 {
                background-color: transparent;
                border: 1.5px solid #81D4A0;

                .icon {
                    color: #81D4A0;
                    font-size: 8px;
                }
            }

            &.auth-level-2 {
                background-color: #2ED573;
                border: 2px solid $bg-card;
            }

            &.auth-level-3 {
                background: linear-gradient(135deg, #FFD700, #FFB74D);
                border: 2px solid $bg-card;
                box-shadow: 0 0 4px rgba(255, 183, 77, 0.4);
            }
        }

        .avatar-mask {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: #FFFFFF;
            background-color: rgba(0, 0, 0, 0.35);
            backdrop-filter: blur(2px);
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
        }

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

        &__header-right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
            flex-shrink: 0;
        }

        &__badges {
            display: flex;
            gap: 4px;
        }

        &__time {
            font-size: $font-size-xs;
            color: $text-helper;
        }

        .mine-badge {
            padding: 1px 6px;
            font-size: 10px;
            color: $primary-dark;
            background-color: $primary-light-bg;
            border-radius: 8px;
            line-height: 1.5;
        }

        .pin-badge {
            padding: 2px 8px;
            font-size: 10px;
            color: #B06A5B;
            background-color: rgba(191, 139, 139, 0.12);
            border-radius: 10px;
        }

        .cross-badge {
            padding: 2px 8px;
            font-size: 10px;
            color: $text-secondary;
            background-color: $bg-page;
            border-radius: 10px;
        }

        .quality-badge {
            display: inline-flex;
            align-items: center;
            gap: 3px;
            padding: 2px 10px;
            font-size: 10px;
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

        // 游客：第 5 条渐变遮罩
        &--fade {
            padding-bottom: 64px;
        }

        // 游客：锁定内容模糊
        &--blur {
            pointer-events: auto;

            .square-item__content,
            .square-item__image-wrapper {
                filter: blur(6px);
            }
        }
    }

    // 第 5 条底部渐变遮罩
    .square-fade-mask {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 50%;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 0 $spacing-md 14px;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.92) 55%, #FFFFFF 100%);

        &__text {
            font-size: $font-size-xs;
            color: $text-secondary;
            text-align: center;
            line-height: 1.5;
        }
    }

    // 游客拦截区
    .square-locked {
        position: relative;

        &__list {
            position: relative;
        }

        &__cta {
            margin: 0 auto 16px;
            padding: 20px $spacing-md;
            width: 100%;
            background-color: #FFFFFF;
            border-radius: $radius-card;
            box-shadow: $shadow-card;
            border: 1px solid rgba($primary-color, 0.25);
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
        }

        &__cta-icon {
            font-size: 24px;
        }

        &__cta-title {
            font-size: $font-size-md;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__cta-desc {
            font-size: $font-size-xs;
            color: $text-helper;
        }

        &__cta-btn {
            margin-top: 8px;
            width: 100%;
            height: 44px;
            line-height: 44px;
            font-size: $font-size-btn;
            font-weight: $font-weight-medium;
            color: #FFFFFF;
            background: $primary-gradient;
            border-radius: $radius-btn;
            box-shadow: $shadow-btn;
            border: none;

            &::after {
                border: none;
            }
        }
    }

    // 空状态
    .square-empty {
        padding: 80px $spacing-lg;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;

        &__icon {
            font-size: 34px;
        }

        &__text {
            font-size: $font-size-sm;
            color: $text-helper;
            text-align: center;
            line-height: 1.6;
        }

        &__action {
            margin-top: 4px;
            font-size: $font-size-sm;
            color: $primary-dark;
        }
    }

    // ----- 安抚提示（底部弱提示） -----
    .square-comfort {
        position: fixed;
        left: $page-padding-x;
        right: $page-padding-x;
        bottom: 78px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background-color: rgba(255, 255, 255, 0.96);
        border: 1px solid rgba($primary-color, 0.3);
        border-radius: $radius-sm;
        box-shadow: $shadow-card-hover;
        z-index: $z-index-dropdown;

        &__icon {
            font-size: 14px;
        }

        &__text {
            flex: 1;
            font-size: 11px;
            color: $text-secondary;
            line-height: 1.5;
        }

        &__close {
            font-size: 13px;
            color: $text-helper;
            padding: 2px 4px;
        }
    }

    // ----- 加载更多 -----
    .square-loading {
        text-align: center;
        padding: $spacing-md 0 90px;
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

        &.is-disabled {
            background-color: #D8DDD2;
            box-shadow: none;
        }

        &:active {
            transform: scale(0.92);
        }

        &__icon {
            font-size: 24px;
            color: #FFFFFF;
        }
    }
</style>
