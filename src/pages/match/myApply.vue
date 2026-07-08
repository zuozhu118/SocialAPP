<template>
    <view class="my-apply-page">
        <!-- 导航栏 -->
        <view class="my-apply-navbar">
            <text class="my-apply-navbar__back icon icon-arrow-left" @click="goBack"></text>
            <text class="my-apply-navbar__title">我的申请</text>
            <view class="my-apply-navbar__placeholder"></view>
        </view>

        <!-- Tab切换 -->
        <view class="my-apply-tabs">
            <view class="my-apply-tabs__item"
                  :class="{ 'my-apply-tabs__item--active': currentTab === 'sent' }"
                  @click="switchTab('sent')">
                我发出的
                <text v-if="sentPendingCount > 0" class="my-apply-tabs__badge">{{ sentPendingCount }}</text>
            </view>
            <view class="my-apply-tabs__item"
                  :class="{ 'my-apply-tabs__item--active': currentTab === 'received' }"
                  @click="switchTab('received')">
                收到的
                <text v-if="receivedPendingCount > 0" class="my-apply-tabs__badge">{{ receivedPendingCount }}</text>
            </view>
        </view>

        <!-- 列表 -->
        <scroll-view class="my-apply-list" scroll-y @scrolltolower="loadMore">
            <!-- ====== 我发出的 ====== -->
            <template v-if="currentTab === 'sent'">
                <view v-if="sentList.length === 0" class="my-apply-empty">
                    <text class="my-apply-empty__icon">📤</text>
                    <text class="my-apply-empty__title">暂无发出的申请</text>
                    <text class="my-apply-empty__desc">去匹配页寻找心仪的人吧</text>
                    <button class="my-apply-empty__btn" @click="goToMatch">去匹配</button>
                </view>

                <view v-else class="my-apply-items">
                    <view v-for="(item, idx) in sentList" :key="idx" class="apply-item">
                        <!-- 用户信息 - 点击跳转个人主页 -->
                        <view class="apply-item__header" @click="goToProfile(item.targetUserId)">
                            <image class="apply-item__avatar" :src="item.avatar" mode="aspectFill" />
                            <view class="apply-item__info">
                                <view class="apply-item__name-row">
                                    <text class="apply-item__name">{{ item.targetName }}</text>
                                    <text class="apply-item__gender" :class="item.gender === 'female' ? 'is-female' : 'is-male'">
                                        {{ item.gender === 'female' ? '♀' : '♂' }}
                                    </text>
                                    <view class="apply-item__auth-badges">
                                        <text v-if="item.auth?.realName" class="auth-badge auth-badge--real">实名</text>
                                        <text v-if="item.auth?.education" class="auth-badge auth-badge--edu">学历</text>
                                        <text v-if="item.auth?.work" class="auth-badge auth-badge--work">工作</text>
                                    </view>
                                </view>
                                <text class="apply-item__meta">{{ item.age }}岁 · {{ item.occupation }} · {{ item.district }}</text>
                                <text class="apply-item__greeting" >
                                    {{ item.greeting }}
                                </text>
                            </view>
                        </view>

                        <!-- 状态 -->
                        <view class="apply-item__footer">
                            <view class="apply-item__status" :class="'apply-item__status--' + item.status">
                                <text class="apply-item__status-icon">{{ statusIconMap[item.status] }}</text>
                                <text>{{ statusTextMap[item.status] }}</text>
                            </view>
                            <view class="apply-item__time">{{ item.applyTime }}</view>
                        </view>

                        <!-- 已同意时展示微信号 -->
                        <view v-if="item.status === 'agreed' && item.wechat" class="apply-item__wechat">
                            <text class="apply-item__wechat-label">微信号：</text>
                            <text class="apply-item__wechat-value">{{ item.wechat }}</text>
                            <button class="apply-item__wechat-copy" @click.stop="copyWechat(item.wechat)">复制</button>
                        </view>
                    </view>
                </view>
            </template>

            <!-- ====== 收到的 ====== -->
            <template v-if="currentTab === 'received'">
                <view v-if="receivedList.length === 0" class="my-apply-empty">
                    <text class="my-apply-empty__icon">📥</text>
                    <text class="my-apply-empty__title">暂无收到的申请</text>
                    <text class="my-apply-empty__desc">完善资料提高曝光，让更多人看到你</text>
                    <button class="my-apply-empty__btn" @click="goToEditProfile">完善资料</button>
                </view>

                <view v-else class="my-apply-items">
                    <view v-for="(item, idx) in receivedList" :key="idx" class="apply-item">
                        <!-- 用户信息 - 点击跳转个人主页 -->
                        <view class="apply-item__header" @click="goToProfile(item.sourceUserId)">
                            <image class="apply-item__avatar" :src="item.avatar" mode="aspectFill" />
                            <view class="apply-item__info">
                                <view class="apply-item__name-row">
                                    <text class="apply-item__name">{{ item.sourceName }}</text>
                                    <text class="apply-item__gender" :class="item.gender === 'female' ? 'is-female' : 'is-male'">
                                        {{ item.gender === 'female' ? '♀' : '♂' }}
                                    </text>
                                    <view class="apply-item__auth-badges">
                                        <text v-if="item.auth?.realName" class="auth-badge auth-badge--real">实名</text>
                                        <text v-if="item.auth?.education" class="auth-badge auth-badge--edu">学历</text>
                                        <text v-if="item.auth?.work" class="auth-badge auth-badge--work">工作</text>
                                    </view>
                                </view>
                                <text class="apply-item__meta">{{ item.age }}岁 · {{ item.occupation }} · {{ item.district }}</text>
                                <!-- 申请语 - 点击进入详情 -->
                                <text class="apply-item__greeting">
                                    {{ item.greeting }}
                                </text>
                            </view>
                        </view>

                        <!-- 状态 + 操作 -->
                        <view class="apply-item__footer">
                            <view class="apply-item__status" :class="'apply-item__status--' + item.status">
                                <text class="apply-item__status-icon">{{ statusIconMap[item.status] }}</text>
                                <text>
                                    <!-- 待处理：显示「待处理」 -->
                                    <template v-if="item.status === 'pending'">
                                        待处理
                                    </template>
                                    <!-- 已同意/已拒绝：显示对应文案 -->
                                    <template v-else>
                                        {{ statusTextMap[item.status] }}
                                    </template>
                                </text>
                            </view>

                            <!-- 待处理：显示操作按钮 -->
                            <view v-if="item.status === 'pending'" class="apply-item__actions">
                                <button class="apply-item__btn apply-item__btn--reject" @click.stop="handleReject(item)">拒绝</button>
                                <button class="apply-item__btn apply-item__btn--agree" @click.stop="handleAgree(item)">同意</button>
                            </view>

                            <!-- 已同意：显示微信号 -->
                            <view v-if="item.status === 'agreed' && item.wechat" class="apply-item__wechat">
                                <text class="apply-item__wechat-label">微信号：</text>
                                <text class="apply-item__wechat-value">{{ item.wechat }}</text>
                                <button class="apply-item__wechat-copy" @click.stop="copyWechat(item.wechat)">复制</button>
                            </view>

                            <text v-if="item.status !== 'pending'" class="apply-item__time">{{ item.handleTime || item.applyTime }}</text>
                        </view>
                    </view>
                </view>
            </template>

            <!-- 加载更多 -->
            <view v-if="hasMore" class="apply-loading">加载中...</view>

            <view class="apply-bottom-placeholder"></view>
        </scroll-view>

        <!-- 风险确认弹框 -->
        <RiskModal v-model:visible="showRiskModal" @confirm="doAgree" />

        <!-- 加载状态 -->
        <view v-if="loading" class="apply-loading-mask">
            <text class="apply-loading-mask__text">处理中...</text>
        </view>


    </view>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'
    import RiskModal from '@/components/common/RiskModal.vue'

    // ===== 状态 =====
    const currentTab = ref('received')
    const loading = ref(false)
    const hasMore = ref(false)
    const showRiskModal = ref(false)
    const showDetailModal = ref(false)
    const currentHandlingItem = ref(null)
    const detailData = ref(null)

    // ===== Tab 未读数量 =====
    const sentPendingCount = ref(0)
    const receivedPendingCount = ref(2)

    // ===== 状态映射 =====
    const statusIconMap = {
        pending: '⏳',
        agreed: '✅',
        rejected: '❌'
    }

    const statusTextMap = {
        pending: '等待对方处理',
        agreed: '已同意',
        rejected: '已拒绝'
    }

    // ===== 模拟数据：我发出的 =====
    const sentList = ref([
        {
            id: 1,
            targetUserId: 1,
            targetName: '林小鹿',
            gender: 'female',
            age: 24,
            occupation: '产品经理',
            district: '朝阳区',
            avatar: 'https://picsum.photos/200/200?random=101',
            auth: { realName: true, education: true, work: false },
            greeting: '你好呀，觉得我们很合适，想进一步了解你',
            status: 'pending',
            applyTime: '2小时前',
            wechat: null
        },
        {
            id: 2,
            targetUserId: 2,
            targetName: '陈橘子',
            gender: 'female',
            age: 26,
            occupation: '金融分析师',
            district: '浦东新区',
            avatar: 'https://picsum.photos/200/200?random=102',
            auth: { realName: true, education: true, work: true },
            greeting: '看了你的主页，感觉我们是同频的人',
            status: 'agreed',
            applyTime: '昨天',
            wechat: 'chenjuzi_2024'
        },
        {
            id: 3,
            targetUserId: 3,
            targetName: '王子轩',
            gender: 'male',
            age: 27,
            occupation: '建筑设计师',
            district: '天河区',
            avatar: 'https://picsum.photos/200/200?random=105',
            auth: { realName: true, education: true, work: false },
            greeting: '你的动态很有趣，希望能认识你',
            status: 'rejected',
            applyTime: '3天前',
            wechat: null
        }
    ])

    // ===== 模拟数据：收到的 =====
    const receivedList = ref([
        {
            id: 101,
            sourceUserId: 4,
            sourceName: '张一晨',
            gender: 'male',
            age: 28,
            occupation: '程序员',
            district: '海淀区',
            avatar: 'https://picsum.photos/200/200?random=104',
            auth: { realName: true, education: true, work: true },
            greeting: '你的气质很吸引我，可以认识一下吗？',
            status: 'pending',
            applyTime: '1小时前',
            handleTime: null,
            wechat: null
        },
        {
            id: 102,
            sourceUserId: 5,
            sourceName: '周小白',
            gender: 'male',
            age: 28,
            occupation: '产品经理',
            district: '南山区',
            avatar: 'https://picsum.photos/200/200?random=106',
            auth: { realName: true, education: false, work: true },
            greeting: '想和你分享生活的点滴',
            status: 'pending',
            applyTime: '3小时前',
            handleTime: null,
            wechat: null
        },
        {
            id: 103,
            sourceUserId: 6,
            sourceName: '刘一鸣',
            gender: 'male',
            age: 26,
            occupation: '医生',
            district: '锦江区',
            avatar: 'https://picsum.photos/200/200?random=107',
            auth: { realName: true, education: true, work: true },
            greeting: '希望能有机会了解你',
            status: 'agreed',
            applyTime: '昨天',
            handleTime: '昨天',
            wechat: 'liuyiming_2024'
        },
        {
            id: 104,
            sourceUserId: 7,
            sourceName: '吴晴天',
            gender: 'female',
            age: 25,
            occupation: '设计师',
            district: '西湖区',
            avatar: 'https://picsum.photos/200/200?random=108',
            auth: { realName: true, education: true, work: true },
            greeting: '你的生活状态是我向往的',
            status: 'rejected',
            applyTime: '3天前',
            handleTime: '3天前',
            wechat: null
        }
    ])

    // ===== 计算未读数量 =====
    const updatePendingCounts = () => {
        sentPendingCount.value = sentList.value.filter(item => item.status === 'pending').length
        receivedPendingCount.value = receivedList.value.filter(item => item.status === 'pending').length
    }

    // ===== Tab切换 =====
    const switchTab = (tab) => {
        currentTab.value = tab
    }

    // ===== 跳转 =====
    const goBack = () => {
        uni.navigateBack()
    }

    const goToProfile = (userId) => {
        uni.navigateTo({ url: `/pages/user/profile?userId=${userId}` })
    }

    const goToMatch = () => {
        uni.switchTab({ url: '/pages/match/index' })
    }

    const goToEditProfile = () => {
        uni.navigateTo({ url: '/pages/profile/edit' })
    }

    // ===== 复制微信号 =====
    const copyWechat = (wechat) => {
        uni.setClipboardData({
            data: wechat,
            success: () => {
                uni.showToast({ title: '已复制微信号', icon: 'success' })
            }
        })
    }


    // ===== 处理收到的申请 =====
    const handleAgree = (item) => {
        currentHandlingItem.value = item
        showRiskModal.value = true
    }

    const doAgree = () => {
        const item = currentHandlingItem.value
        if (!item) return

        loading.value = true
        setTimeout(() => {
            item.status = 'agreed'
            item.handleTime = '刚刚'
            item.wechat = 'my_wechat_' + Date.now().toString().slice(-6)
            loading.value = false
            updatePendingCounts()
            uni.showToast({ title: '已同意，微信号已互相展示', icon: 'success' })
            currentHandlingItem.value = null
            // 关闭详情弹窗
            showDetailModal.value = false
        }, 800)
    }

    // ===== 详情弹窗中的操作 =====
    const handleDetailAgree = () => {
        if (detailData.value && detailData.value._source) {
            handleAgree(detailData.value._source)
        }
    }

    const handleDetailReject = (item) => {
        if (detailData.value && detailData.value._source) {
            handleReject(detailData.value._source)
        }
    }

    const handleReject = (item) => {
        uni.showModal({
            title: '拒绝申请',
            content: `确认拒绝「${item.sourceName}」的微信申请吗？`,
            confirmText: '确认拒绝',
            confirmColor: '#FF4757',
            success: (res) => {
                if (res.confirm) {
                    loading.value = true
                    setTimeout(() => {
                        item.status = 'rejected'
                        item.handleTime = '刚刚'
                        loading.value = false
                        updatePendingCounts()
                        uni.showToast({ title: '已拒绝', icon: 'none' })
                        showDetailModal.value = false
                    }, 500)
                }
            }
        })
    }

    // ===== 刷新列表 =====
    const refreshList = () => {
        updatePendingCounts()
    }

    // ===== 加载更多 =====
    const loadMore = () => {
        if (hasMore.value) {
            // 实际项目中加载更多数据
        }
    }

    // ===== 生命周期 =====
    onMounted(() => {
        // 读取路由参数，默认切换到对应Tab
        const pages = getCurrentPages()
        const currentPage = pages[pages.length - 1]
        const tab = currentPage.options?.tab || 'received'
        currentTab.value = tab
        updatePendingCounts()
    })
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';
    @import '@/styles/mixins.scss';

    .my-apply-page {
        min-height: 100vh;
        background-color: $bg-page;
        display: flex;
        flex-direction: column;
    }

    // ===== 导航栏 =====
    .my-apply-navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px $page-padding-x;
        padding-top: calc(14px + env(safe-area-inset-top));
        background-color: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid $border-light;
        flex-shrink: 0;

        &__back {
            width: 32px;
            font-size: 20px;
            color: $text-primary;
            cursor: pointer;
        }

        &__title {
            font-size: 17px;
            font-weight: 500;
            color: $text-primary;
        }

        &__placeholder {
            width: 32px;
        }
    }

    // ===== Tab切换 =====
    .my-apply-tabs {
        display: flex;
        background-color: $bg-card;
        border-bottom: 1px solid $border-light;
        flex-shrink: 0;

        &__item {
            flex: 1;
            position: relative;
            padding: 14px 0;
            font-size: $font-size-sm;
            color: $text-helper;
            text-align: center;
            cursor: pointer;
            transition: all $duration-fast ease;
            border-bottom: 2px solid transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;

            &--active {
                color: $text-primary;
                font-weight: $font-weight-medium;
                border-bottom-color: $primary-color;
            }

            &:active {
                opacity: 0.7;
            }
        }

        &__badge {
            min-width: 18px;
            height: 18px;
            padding: 0 5px;
            font-size: 10px;
            font-weight: $font-weight-medium;
            color: #FFFFFF;
            background-color: #FF4757;
            border-radius: 9px;
            line-height: 18px;
            text-align: center;
        }
    }

    // ===== 列表 =====
    .my-apply-list {
        flex: 1;
        padding: 12px $page-padding-x;
    }

    .my-apply-items {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    // ===== 申请卡片 =====
    .apply-item {
        background-color: $bg-card;
        border-radius: $radius-card;
        padding: $spacing-md;
        box-shadow: $shadow-card;

        &__header {
            display: flex;
            gap: 12px;
            cursor: pointer;

            &:active {
                opacity: 0.8;
            }
        }

        &__avatar {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            flex-shrink: 0;
            background-color: $bg-page;
        }

        &__info {
            flex: 1;
            min-width: 0;
        }

        &__name-row {
            display: flex;
            align-items: center;
            gap: 4px;
            flex-wrap: wrap;
            margin-bottom: 2px;
        }

        &__name {
            font-size: $font-size-md;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__gender {
            font-size: 14px;
            line-height: 1;

            &.is-female {
                color: #FF6B81;
            }

            &.is-male {
                color: #4FACFE;
            }
        }

        &__auth-badges {
            display: flex;
            gap: 3px;
            flex-wrap: wrap;
        }

        &__meta {
            font-size: 12px;
            color: $text-helper;
            display: block;
        }

        &__greeting {
            display: block;
            margin-top: 4px;
            font-size: 13px;
            color: $text-secondary;
            background-color: $bg-page;
            padding: 4px 10px;
            border-radius: 6px;
            line-height: 1.5;
            cursor: pointer;
            transition: background-color 0.2s;

            &:active {
                background-color: $border-light;
            }
        }

        &__footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid $border-light;
            flex-wrap: wrap;
            gap: 8px;
        }

        &__status {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            padding: 2px 10px;
            border-radius: 10px;

            &-icon {
                font-size: 14px;
            }

            &--pending {
                color: #E65100;
                background-color: #FFF3E0;
            }

            &--agreed {
                color: #2E7D32;
                background-color: #E8F5E9;
            }

            &--rejected {
                color: #C62828;
                background-color: #FFEBEE;
            }
        }

        &__time {
            font-size: 11px;
            color: $text-helper;
        }

        &__actions {
            display: flex;
            gap: 8px;
        }

        &__btn {
            padding: 4px 16px;
            font-size: 12px;
            border-radius: 14px;
            border: none;
            line-height: 1.8;

            &--agree {
                color: #FFFFFF;
                background: linear-gradient(90deg, $primary-color, #9DB48E);
            }

            &--reject {
                color: $text-secondary;
                background-color: $bg-page;
                border: 1px solid $border-light;
            }

            &:active {
                opacity: 0.8;
            }
        }

        &__wechat {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 8px;
            padding: 6px 12px;
            background-color: #E8F5E9;
            border-radius: 8px;
            flex-wrap: wrap;
            width: 100%;

            &-label {
                font-size: 12px;
                color: $text-helper;
            }

            &-value {
                font-size: 14px;
                font-weight: $font-weight-medium;
                color: $text-primary;
                flex: 1;
            }

            &-copy {
                padding: 0 12px;
                font-size: 11px;
                color: $primary-color;
                background-color: $primary-light-bg;
                border: none;
                border-radius: 12px;
                line-height: 1.8;

                &:active {
                    opacity: 0.7;
                }
            }
        }
    }

    // ===== 认证徽章 =====
    .auth-badge {
        padding: 0 6px;
        font-size: 8px;
        color: #FFFFFF;
        border-radius: 3px;
        line-height: 1.6;

        &--real {
            background: linear-gradient(90deg, #2ED573, #1EBE60);
        }

        &--edu {
            background: linear-gradient(90deg, #4FACFE, #0099FF);
        }

        &--work {
            background: linear-gradient(90deg, #FFA726, #FB8C00);
        }
    }

    // ===== 空状态 =====
    .my-apply-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 0;

        &__icon {
            font-size: 48px;
            margin-bottom: 16px;
        }

        &__title {
            font-size: $font-size-md;
            color: $text-primary;
            margin-bottom: 4px;
        }

        &__desc {
            font-size: $font-size-sm;
            color: $text-helper;
            margin-bottom: $spacing-md;
        }

        &__btn {
            padding: 8px 32px;
            background-color: $primary-color;
            color: #FFFFFF;
            border-radius: 20px;
            font-size: $font-size-sm;
            border: none;

            &:active {
                opacity: 0.8;
            }
        }
    }

    // ===== 加载 =====
    .apply-loading {
        text-align: center;
        padding: 12px 0;
        font-size: 12px;
        color: $text-helper;
    }

    .apply-loading-mask {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(255, 255, 255, 0.7);
        z-index: 999;

        &__text {
            font-size: $font-size-sm;
            color: $text-helper;
        }
    }

    .apply-bottom-placeholder {
        height: 20px;
    }
</style>