<template>
    <view class="fav-page">
        <!-- 顶部导航 -->
        <view class="fav-navbar">
            <text class="fav-navbar__back icon icon-arrow-left" @click="goBack"></text>
            <text class="fav-navbar__title">我的收藏</text>
            <view class="fav-navbar__placeholder"></view>
        </view>

        <!-- 未实名提示条（3.1 收藏心动机制） -->
        <view v-if="isLogin && !isCertified" class="fav-banner" @click="goToRealname">
            <text class="fav-banner__icon icon icon-info"></text>
            <text class="fav-banner__text">完成实名认证后，收藏的心动可一键发送</text>
            <text class="fav-banner__link">去实名 ›</text>
        </view>

        <!-- 未登录 -->
        <view v-if="!isLogin" class="fav-empty">
            <text class="fav-empty__icon icon icon-heart"></text>
            <text class="fav-empty__title">登录后查看收藏</text>
            <text class="fav-empty__desc">注册未实名时，可先收藏心动，实名后一键发送</text>
            <button class="fav-empty__btn" @click="handleLoginGuide">去登录</button>
        </view>

        <!-- 空状态 -->
        <view v-else-if="list.length === 0" class="fav-empty">
            <text class="fav-empty__icon icon icon-heart-filled"></text>
            <text class="fav-empty__title">还没有收藏的心动</text>
            <text class="fav-empty__desc">在匹配页遇到合眼缘的 TA，可以先收藏起来</text>
            <button class="fav-empty__btn" @click="goToMatch">去匹配</button>
        </view>

        <!-- 列表 -->
        <scroll-view v-else scroll-y class="fav-scroll" show-scrollbar="false">
            <view class="fav-items">
                <view v-for="item in list" :key="item.id" class="fav-item" @click="goToProfile(item)">
                    <image class="fav-item__avatar" :src="item.avatar" mode="aspectFill" />

                    <view class="fav-item__info">
                        <view class="fav-item__name-row">
                            <text class="fav-item__name">{{ item.name }}</text>
                            <text class="fav-item__age">{{ item.age }}岁</text>
                        </view>
                        <text class="fav-item__meta">{{ item.occupation }} · {{ item.district }}</text>
                        <text class="fav-item__time">收藏于 {{ formatRelativeTime(item.time) }}</text>
                    </view>

                    <view class="fav-item__right">
                        <view class="fav-item__btn"
                              :class="{ 'is-ghost': !isCertified }"
                              @click.stop="handleSendLike(item)">
                            {{ isCertified ? '发送心动' : '去实名' }}
                        </view>
                        <text class="fav-item__remove" @click.stop="handleRemove(item)">移除</text>
                    </view>
                </view>
            </view>

            <view class="fav-bottom-placeholder"></view>
        </scroll-view>

        <!-- 未实名：双选项弹窗 -->
        <PermissionModal :visible="modal.visible"
                         :mode="modal.mode"
                         :title="modal.title"
                         :content="modal.content"
                         :confirm-text="modal.confirmText"
                         @confirm="handleModalConfirm"
                         @cancel="closeModal"
                         @close="closeModal" />
    </view>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { onShow } from '@dcloudio/uni-app'
    import PermissionModal from '@/components/common/PermissionModal.vue'
    import { useUserStore, useEquityStore, useSocialStore } from '@/store/index'
    import { usePermission } from '@/composables/usePermission'
    import { formatRelativeTime } from '@/mock/dynamics'
    import { businessCopy } from '@/mock/copy'

    const userStore = useUserStore()
    const equity = useEquityStore()
    const socialStore = useSocialStore()
    const { guard } = usePermission()

    const isLogin = computed(() => userStore.isLogin)
    const isCertified = computed(() => userStore.isCertified)
    const list = computed(() => userStore.favorites || [])

    const modal = ref({ visible: false, mode: 'realname', title: '', content: '', confirmText: '' })
    const closeModal = () => {
        modal.value.visible = false
    }
    const handleModalConfirm = () => {
        closeModal()
        uni.navigateTo({ url: '/pages/auth/realname' })
    }

    // 发送心动（已实名）／引导实名（未实名）
    const handleSendLike = (item) => {
        const { allowed, modal: payload } = guard('likeUser')
        if (!allowed) {
            modal.value = payload.mode === 'realname'
                ? {
                    visible: true,
                    mode: 'favorite',
                    title: '实名后即可发送心动',
                    content: businessCopy.realNameGuide,
                    confirmText: '去实名认证'
                }
                : { visible: true, ...payload }
            return
        }

        const result = equity.consumeLike()
        if (!result.ok) {
            uni.showToast({ title: businessCopy.likeQuotaExhausted, icon: 'none' })
            return
        }
        socialStore.addLike(item.id)
        uni.showToast({ title: '心动已送达', icon: 'none' })
    }

    const handleRemove = (item) => {
        uni.showModal({
            title: '移除收藏',
            content: `确认把「${item.name}」从收藏中移除吗？`,
            confirmColor: '#8AA07B',
            success: (res) => {
                if (!res.confirm) return
                userStore.removeFavorite(item.id)
                uni.showToast({ title: '已移除', icon: 'none' })
            }
        })
    }

    // ===== 跳转 =====
    const goBack = () => {
        uni.navigateBack()
    }
    const handleLoginGuide = () => {
        uni.navigateTo({ url: '/pages/auth/login' })
    }
    const goToRealname = () => {
        uni.navigateTo({ url: '/pages/auth/realname' })
    }
    const goToMatch = () => {
        uni.switchTab({ url: '/pages/match/index' })
    }
    const goToProfile = (item) => {
        uni.navigateTo({ url: `/pages/user/profile?id=${item.id}` })
    }

    onShow(() => {
        if (!socialStore.seeded) socialStore.restore()
        equity.ensureToday()
    })
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .fav-page {
        min-height: 100vh;
        background-color: $bg-page;
        display: flex;
        flex-direction: column;
    }

    .fav-navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px $page-padding-x;
        background-color: $bg-card;
    }

    .fav-navbar__back {
        font-size: 16px;
        color: $text-primary;
        width: 24px;
    }

    .fav-navbar__title {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $text-primary;
    }

    .fav-navbar__placeholder {
        width: 24px;
    }

    // ----- 未实名提示条 -----
    .fav-banner {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: $spacing-sm $page-padding-x 0;
        padding: 9px 12px;
        border-radius: $radius-sm;
        background-color: $primary-light-bg;
        cursor: pointer;

        &:active {
            opacity: 0.8;
        }
    }

    .fav-banner__icon {
        font-size: 12px;
        color: $primary-dark;
    }

    .fav-banner__text {
        flex: 1;
        font-size: 11px;
        color: $primary-dark;
        line-height: 1.5;
    }

    .fav-banner__link {
        font-size: 11px;
        color: $primary-color;
        font-weight: $font-weight-medium;
        flex-shrink: 0;
    }

    // ----- 空状态 -----
    .fav-empty {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px $spacing-lg;
        gap: 8px;
    }

    .fav-empty__icon {
        font-size: 40px;
        color: rgba(168, 184, 154, 0.5);
        margin-bottom: 4px;
    }

    .fav-empty__title {
        font-size: $font-size-sm;
        color: $text-primary;
        font-weight: $font-weight-medium;
    }

    .fav-empty__desc {
        font-size: $font-size-xs;
        color: $text-helper;
        text-align: center;
        line-height: 1.6;
    }

    .fav-empty__btn {
        margin-top: 8px;
        height: 36px;
        line-height: 36px;
        padding: 0 28px;
        font-size: $font-size-xs;
        color: #FFFFFF;
        background-color: $primary-color;
        border-radius: $radius-btn;
        border: none;

        &::after {
            border: none;
        }
    }

    // ----- 列表 -----
    .fav-scroll {
        flex: 1;
        height: 0;
        margin-top: $spacing-sm;
    }

    .fav-items {
        padding: 0 $page-padding-x;
    }

    .fav-item {
        display: flex;
        align-items: center;
        gap: 10px;
        background-color: $bg-card;
        border-radius: $radius-card;
        padding: 12px;
        margin-bottom: $spacing-sm;
        box-shadow: $shadow-card;
        cursor: pointer;

        &:active {
            opacity: 0.9;
        }
    }

    .fav-item__avatar {
        width: 54px;
        height: 54px;
        border-radius: $radius-sm;
        background-color: $bg-page;
        flex-shrink: 0;
    }

    .fav-item__info {
        flex: 1;
        min-width: 0;
    }

    .fav-item__name-row {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .fav-item__name {
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $text-primary;
    }

    .fav-item__age {
        font-size: 11px;
        color: $text-secondary;
    }

    .fav-item__meta {
        display: block;
        font-size: 11px;
        color: $text-secondary;
        line-height: 1.6;
    }

    .fav-item__time {
        display: block;
        font-size: 10px;
        color: $text-helper;
        line-height: 1.6;
    }

    .fav-item__right {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
    }

    .fav-item__btn {
        font-size: 11px;
        color: #FFFFFF;
        background-color: $primary-color;
        border-radius: $radius-btn;
        padding: 4px 12px;
        white-space: nowrap;

        &:active {
            opacity: 0.8;
        }

        &.is-ghost {
            color: $primary-dark;
            background-color: $primary-light-bg;
        }
    }

    .fav-item__remove {
        font-size: 10px;
        color: $text-helper;

        &:active {
            opacity: 0.7;
        }
    }

    .fav-bottom-placeholder {
        height: 24px;
    }
</style>
