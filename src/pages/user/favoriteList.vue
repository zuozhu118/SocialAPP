<template>
    <view class="fav-page">
        <!-- 顶部导航 -->
        <view class="fav-navbar">
            <text class="fav-navbar__back icon icon-arrow-left" @click="goBack"></text>
            <text class="fav-navbar__title">{{ actionLabels.myFollows }}</text>
            <view class="fav-navbar__placeholder"></view>
        </view>

        <!-- 未实名提示条：关注不占额度，实名后可向关注的 TA 发送心动 -->
        <view v-if="isLogin && !isCertified" class="fav-banner" @click="goToRealname">
            <text class="fav-banner__icon icon icon-info"></text>
            <text class="fav-banner__text">完成实名认证后，即可向关注的 TA 发送心动</text>
            <text class="fav-banner__link">去实名 ›</text>
        </view>

        <!-- 未登录 -->
        <view v-if="!isLogin" class="fav-empty">
            <text class="fav-empty__icon icon icon-follow"></text>
            <text class="fav-empty__title">登录后查看关注的 TA</text>
            <text class="fav-empty__desc">{{ businessCopy.followGuide }}</text>
            <button class="fav-empty__btn" @click="handleLoginGuide">去登录</button>
        </view>

        <!-- 空状态 -->
        <view v-else-if="list.length === 0" class="fav-empty">
            <text class="fav-empty__icon icon icon-follow"></text>
            <text class="fav-empty__title">还没有关注的人</text>
            <text class="fav-empty__desc">{{ emptyCopy.followEmpty }}</text>
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
                            <!-- 已向 TA 发送过心动 -->
                            <text v-if="socialStore.hasHeart(item.id)" class="fav-item__hearted">
                                {{ actionLabels.heart }}过
                            </text>
                        </view>
                        <text class="fav-item__meta">{{ item.occupation }} · {{ item.district }}</text>
                        <text class="fav-item__time">{{ actionLabels.follow }}于 {{ formatRelativeTime(item.time) }}</text>
                    </view>

                    <view class="fav-item__right">
                        <!-- 未心动：发送心动（已实名）／去实名（未实名） -->
                        <view v-if="!socialStore.hasHeart(item.id)"
                              class="fav-item__btn"
                              :class="{ 'is-ghost': !isCertified }"
                              @click.stop="handleSendLike(item)">
                            {{ isCertified ? '发送心动' : '去实名' }}
                        </view>
                        <!-- 已心动：弱化终态 -->
                        <view v-else class="fav-item__btn fav-item__btn--done">
                            已心动
                        </view>
                        <text class="fav-item__remove" @click.stop="handleUnfollow(item)">
                            {{ actionLabels.unfollow }}
                        </text>
                    </view>
                </view>
            </view>

            <view class="fav-bottom-placeholder"></view>
        </scroll-view>

        <!-- 权限弹窗（注册 / 实名） -->
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
    import { useUserStore, useEquityStore, useMatchStore, useSocialStore } from '@/store/index'
    import { usePermission } from '@/composables/usePermission'
    import { formatRelativeTime } from '@/mock/dynamics'
    import { businessCopy, emptyCopy, actionLabels } from '@/mock/copy'

    const userStore = useUserStore()
    const equity = useEquityStore()
    const matchStore = useMatchStore()
    const socialStore = useSocialStore()
    const { guard } = usePermission()

    const isLogin = computed(() => userStore.isLogin)
    const isCertified = computed(() => userStore.isCertified)
    // 我的关注（v8：follows = 0 成本收藏夹，与心动是两套数据）
    const list = computed(() => userStore.follows || [])

    const modal = ref({ visible: false, mode: 'realname', title: '', content: '', confirmText: '' })
    const closeModal = () => {
        modal.value.visible = false
    }
    const handleModalConfirm = () => {
        closeModal()
        uni.navigateTo({ url: '/pages/auth/realname' })
    }

    // 发送心动（已实名）／引导实名（未实名）；关注本身不再消耗额度
    const handleSendLike = (item) => {
        const { allowed, modal: payload } = guard('likeUser')
        if (!allowed) {
            modal.value = payload.mode === 'realname'
                ? {
                    visible: true,
                    mode: 'realname',
                    title: '实名后即可发送心动',
                    content: businessCopy.realNameGuide,
                    confirmText: '去实名认证'
                }
                : { visible: true, ...payload }
            return
        }

        const result = equity.consumeLike()
        if (!result.ok) {
            uni.showToast({ title: businessCopy.heartExhaustedGuide, icon: 'none' })
            return
        }
        socialStore.addHeart(item.id)
        // 对方也心动 -> 建立双向匹配（mock 模拟）
        if (Math.random() < 0.3) {
            socialStore.setMutual(item.id)
            matchStore.createMatch(item.id)
            uni.showToast({ title: '你们互相心动了，可以交换微信了', icon: 'none' })
            return
        }
        uni.showToast({ title: businessCopy.heartSent, icon: 'none' })
    }

    // 取消关注（随时可取消，还能再次关注）
    const handleUnfollow = (item) => {
        uni.showModal({
            title: actionLabels.unfollow,
            content: `确认取消关注「${item.name}」吗？取消后还能再次关注。`,
            confirmColor: '#8AA07B',
            success: (res) => {
                if (!res.confirm) return
                userStore.unfollow(item.id)
                uni.showToast({ title: businessCopy.unfollowSuccess, icon: 'none' })
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

    .fav-item__hearted {
        font-size: 10px;
        color: #E8446C;
        background-color: rgba(232, 68, 108, 0.08);
        border-radius: 8px;
        padding: 1px 6px;
        flex-shrink: 0;
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

        // 已心动：终态弱化
        &--done {
            color: $text-helper;
            background-color: $bg-page;
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
