<template>
    <view class="like-page">
        <!-- 顶部导航 -->
        <view class="like-navbar">
            <text class="like-navbar__back icon icon-arrow-left" @click="goBack"></text>
            <text class="like-navbar__title">{{ pageTitle }}</text>
            <view class="like-navbar__placeholder"></view>
        </view>

        <!-- 统计 / 说明条 -->
        <view class="like-tip">
            <text class="like-tip__text">{{ tipText }}</text>
        </view>

        <!-- 未登录 -->
        <view v-if="!isLogin" class="like-empty">
            <text class="like-empty__icon icon icon-user"></text>
            <text class="like-empty__title">登录后查看</text>
            <text class="like-empty__desc">登录即可查看你的心动关系</text>
            <button class="like-empty__btn" @click="handleLoginGuide">去登录</button>
        </view>

        <!-- 空状态 -->
        <view v-else-if="list.length === 0" class="like-empty">
            <text class="like-empty__icon icon icon-heart"></text>
            <text class="like-empty__title">{{ emptyTitle }}</text>
            <text class="like-empty__desc">{{ emptyDesc }}</text>
            <button class="like-empty__btn" @click="emptyAction">{{ emptyActionText }}</button>
        </view>

        <!-- 列表 -->
        <scroll-view v-else scroll-y class="like-scroll" show-scrollbar="false">
            <view class="like-items">
                <view v-for="user in list"
                      :key="user.id"
                      class="like-item"
                      @click="goToProfile(user)">
                    <image class="like-item__avatar" :src="user.avatar" mode="aspectFill" />

                    <view class="like-item__info">
                        <view class="like-item__name-row">
                            <text class="like-item__name">{{ user.name }}</text>
                            <text class="like-item__gender" :class="user.gender === 'female' ? 'is-female' : 'is-male'">
                                {{ user.gender === 'female' ? '♀' : '♂' }}
                            </text>
                            <text class="like-item__age">{{ user.age }}岁</text>
                            <text v-if="user.sameCity" class="like-item__same">同城</text>
                        </view>

                        <view class="like-item__badges">
                            <text v-if="user.auth.realName" class="auth-badge auth-badge--real">实名</text>
                            <text v-if="user.auth.education" class="auth-badge auth-badge--edu">学历</text>
                            <text v-if="user.auth.work" class="auth-badge auth-badge--work">工作</text>
                        </view>

                        <text class="like-item__meta">{{ user.occupation }} · {{ user.district }}</text>
                        <text class="like-item__bio">{{ user.bio }}</text>
                    </view>

                    <view class="like-item__right">
                        <text class="like-item__time">{{ formatRelativeTime(user.likedAt) }}</text>

                        <!-- 喜欢我的：可回心动；已双向匹配则显示已匹配 -->
                        <template v-if="listType === 'receive'">
                            <view class="like-item__btn"
                                  :class="{ 'is-done': user.mutual }"
                                  @click.stop="handleLikeBack(user)">
                                {{ user.mutual ? '已匹配' : '喜欢 TA' }}
                            </view>
                            <text v-if="user.stored" class="like-item__stored">暂存心动</text>
                        </template>

                        <!-- 我喜欢的：只展示状态 -->
                        <template v-else>
                            <text class="like-item__state" :class="{ 'is-matched': user.mutual }">
                                {{ user.mutual ? '已匹配' : '待回应' }}
                            </text>
                        </template>
                    </view>
                </view>
            </view>

            <view class="like-bottom-placeholder"></view>
        </scroll-view>

        <!-- 未实名：双选项弹窗（先收藏心动 / 去实名认证） -->
        <PermissionModal :visible="modal.visible"
                         :mode="modal.mode"
                         :title="modal.title"
                         :content="modal.content"
                         :confirm-text="modal.confirmText"
                         @confirm="handleModalConfirm"
                         @favorite="handleModalFavorite"
                         @cancel="closeModal"
                         @close="closeModal" />
    </view>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { onLoad, onShow } from '@dcloudio/uni-app'
    import PermissionModal from '@/components/common/PermissionModal.vue'
    import { useUserStore, useSocialStore, useMatchStore, useEquityStore } from '@/store/index'
    import { usePermission } from '@/composables/usePermission'
    import { formatRelativeTime } from '@/mock/dynamics'
    import { businessCopy } from '@/mock/copy'

    const userStore = useUserStore()
    const socialStore = useSocialStore()
    const matchStore = useMatchStore()
    const equity = useEquityStore()
    const { guard } = usePermission()

    // send: 我喜欢的 / receive: 喜欢我的
    const listType = ref('send')

    onLoad((options = {}) => {
        listType.value = options.type === 'receive' ? 'receive' : 'send'
        if (!socialStore.seeded) socialStore.restore()
        if (!matchStore.seeded) matchStore.restore()
    })

    onShow(() => {
        if (!socialStore.seeded) socialStore.restore()
        equity.ensureToday()
    })

    const isLogin = computed(() => userStore.isLogin)
    const pageTitle = computed(() => (listType.value === 'send' ? '我喜欢的' : '喜欢我的'))

    const list = computed(() =>
        listType.value === 'send' ? socialStore.myLikeList : socialStore.likesMeList
    )

    const tipText = computed(() => {
        if (!isLogin.value) return '登录后可查看心动关系'
        if (listType.value === 'send') {
            const total = socialStore.myLikeCount
            const mutual = socialStore.mutualCount
            return mutual > 0
                ? `已心动 ${total} 位 · 其中 ${mutual} 位已双向匹配`
                : `已心动 ${total} 位，等待 TA 的回应`
        }
        const unmet = socialStore.unmetLikeCount
        return unmet > 0
            ? `共 ${socialStore.likesMeCount} 位喜欢你 · ${unmet} 位还没回应`
            : `共 ${socialStore.likesMeCount} 位喜欢你，全部已处理`
    })

    const emptyTitle = computed(() => (listType.value === 'send' ? '还没有喜欢的人' : '还没有人喜欢你'))
    const emptyDesc = computed(() =>
        listType.value === 'send'
            ? '去匹配页发现更多有趣的灵魂吧'
            : '完善资料提高曝光，让更多人看到你'
    )
    const emptyActionText = computed(() => (listType.value === 'send' ? '去匹配' : '完善资料'))

    const emptyAction = () => {
        if (listType.value === 'send') {
            uni.switchTab({ url: '/pages/match/index' })
            return
        }
        uni.navigateTo({ url: '/pages/profile/edit' })
    }

    // ===== 弹窗状态 =====
    const modal = ref({ visible: false, mode: 'realname', title: '', content: '', confirmText: '' })
    const pendingUser = ref(null)

    const closeModal = () => {
        modal.value.visible = false
        pendingUser.value = null
    }

    const handleModalConfirm = () => {
        closeModal()
        uni.navigateTo({ url: '/pages/auth/realname' })
    }

    // 3.1 未实名：可先收藏心动
    const handleModalFavorite = () => {
        const user = pendingUser.value
        if (user) {
            const added = userStore.addFavorite(user)
            uni.showToast({
                title: added ? '已收藏，实名后可发送心动' : '已在收藏列表中',
                icon: 'none'
            })
        }
        closeModal()
    }

    // ===== 回心动 =====
    const handleLikeBack = (user) => {
        if (user.mutual) {
            uni.showToast({ title: '你们已双向匹配', icon: 'none' })
            return
        }

        const { allowed, modal: payload } = guard('likeUser')
        if (!allowed) {
            pendingUser.value = user
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

        socialStore.addLike(user.id)
        socialStore.setMutual(user.id)
        matchStore.createMatch(user.id)
        uni.showToast({ title: '已回心动，双向匹配成功', icon: 'none' })
    }

    // ===== 跳转 =====
    const goBack = () => {
        uni.navigateBack()
    }

    const handleLoginGuide = () => {
        uni.navigateTo({ url: '/pages/auth/login' })
    }

    const goToProfile = (user) => {
        if (!userStore.isLogin) {
            handleLoginGuide()
            return
        }
        uni.navigateTo({ url: `/pages/user/profile?id=${user.id}` })
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .like-page {
        min-height: 100vh;
        background-color: $bg-page;
        display: flex;
        flex-direction: column;
    }

    // ----- 导航栏 -----
    .like-navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px $page-padding-x;
        background-color: $bg-card;
    }

    .like-navbar__back {
        font-size: 16px;
        color: $text-primary;
        width: 24px;
    }

    .like-navbar__title {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $text-primary;
    }

    .like-navbar__placeholder {
        width: 24px;
    }

    // ----- 说明条 -----
    .like-tip {
        padding: 8px $page-padding-x;
        background-color: $bg-card;
        border-top: 1px solid $border-light;
    }

    .like-tip__text {
        font-size: 11px;
        color: $text-helper;
    }

    // ----- 空状态 -----
    .like-empty {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px $spacing-lg;
        gap: 8px;
    }

    .like-empty__icon {
        font-size: 40px;
        color: rgba(168, 184, 154, 0.5);
        margin-bottom: 4px;
    }

    .like-empty__title {
        font-size: $font-size-sm;
        color: $text-primary;
        font-weight: $font-weight-medium;
    }

    .like-empty__desc {
        font-size: $font-size-xs;
        color: $text-helper;
        text-align: center;
        line-height: 1.6;
    }

    .like-empty__btn {
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
    .like-scroll {
        flex: 1;
        height: 0;
    }

    .like-items {
        padding: $spacing-sm $page-padding-x 0;
    }

    .like-item {
        display: flex;
        align-items: flex-start;
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

    .like-item__avatar {
        width: 56px;
        height: 56px;
        border-radius: $radius-sm;
        background-color: $bg-page;
        flex-shrink: 0;
    }

    .like-item__info {
        flex: 1;
        min-width: 0;
    }

    .like-item__name-row {
        display: flex;
        align-items: center;
        gap: 5px;
        flex-wrap: wrap;
    }

    .like-item__name {
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        color: $text-primary;
    }

    .like-item__gender {
        font-size: 11px;

        &.is-female {
            color: #E88AA0;
        }

        &.is-male {
            color: #7FA8D4;
        }
    }

    .like-item__age {
        font-size: 11px;
        color: $text-secondary;
    }

    .like-item__same {
        font-size: 9px;
        color: $primary-dark;
        background-color: $primary-light-bg;
        border-radius: 8px;
        padding: 0 5px;
        line-height: 1.6;
    }

    .like-item__badges {
        display: flex;
        gap: 4px;
        margin: 3px 0;
    }

    .auth-badge {
        font-size: 9px;
        border-radius: 8px;
        padding: 0 5px;
        line-height: 1.6;

        &--real {
            color: #4E8F5C;
            background-color: #EEF7EF;
        }

        &--edu {
            color: #6B7FB0;
            background-color: #EFF3FA;
        }

        &--work {
            color: #9A7B4F;
            background-color: #FAF4EA;
        }
    }

    .like-item__meta {
        display: block;
        font-size: 11px;
        color: $text-secondary;
        line-height: 1.5;
    }

    .like-item__bio {
        font-size: 11px;
        color: $text-helper;
        line-height: 1.5;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .like-item__right {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
    }

    .like-item__time {
        font-size: 10px;
        color: $text-helper;
    }

    .like-item__btn {
        font-size: 11px;
        color: #FFFFFF;
        background-color: $primary-color;
        border-radius: $radius-btn;
        padding: 4px 12px;
        white-space: nowrap;

        &:active {
            opacity: 0.8;
        }

        &.is-done {
            color: $text-helper;
            background-color: $disabled-bg;
        }
    }

    .like-item__stored {
        font-size: 9px;
        color: #B9A26A;
    }

    .like-item__state {
        font-size: 11px;
        color: $text-helper;

        &.is-matched {
            color: $primary-dark;
        }
    }

    .like-bottom-placeholder {
        height: 24px;
    }
</style>
