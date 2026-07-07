<!-- pages/user/medal-wall.vue -->
<template>
    <view class="medal-wall-page">
        <!-- 顶部导航 -->
        <view class="medal-wall-navbar">
            <text class="medal-wall-navbar__back icon icon-arrow-left" @click="goBack"></text>
            <text class="medal-wall-navbar__title">我的勋章</text>
            <view class="medal-wall-navbar__placeholder"></view>
        </view>

        <!-- 勋章统计 -->
        <view class="medal-wall-stats">
            <view class="medal-wall-stats__item">
                <text class="medal-wall-stats__num">{{ totalCount }}</text>
                <text class="medal-wall-stats__label">已获得</text>
            </view>
            <view class="medal-wall-stats__divider"></view>
            <view class="medal-wall-stats__item">
                <text class="medal-wall-stats__num">{{ displayCount }}</text>
                <text class="medal-wall-stats__label">展示中</text>
            </view>
            <view class="medal-wall-stats__divider"></view>
            <view class="medal-wall-stats__item">
                <text class="medal-wall-stats__num">{{ lockedCount }}</text>
                <text class="medal-wall-stats__label">未解锁</text>
            </view>
        </view>

        <!-- 筛选Tab -->
        <view class="medal-wall-tabs">
            <view v-for="(tab, idx) in tabs" 
                  :key="idx"
                  class="medal-wall-tabs__item"
                  :class="{ 'medal-wall-tabs__item--active': activeTab === idx }"
                  @click="switchTab(idx)">
                {{ tab }}
            </view>
        </view>

        <!-- 勋章列表 -->
        <scroll-view scroll-y class="medal-wall-list" show-scrollbar="false">
            <view v-if="filteredMedals.length === 0" class="medal-wall-empty">
                <text class="medal-wall-empty__icon icon icon-medal"></text>
                <text class="medal-wall-empty__title">暂无勋章</text>
                <text class="medal-wall-empty__desc">完成认证或参与活动解锁更多勋章</text>
            </view>

            <view v-else class="medal-wall-grid">
                <view v-for="(medal, idx) in filteredMedals" 
                      :key="idx"
                      class="medal-wall-card"
                      :class="{ 'medal-wall-card--locked': !medal.obtained }"
                      @click="goToMedalDetail(medal)">
                    <view class="medal-wall-card__icon-wrap">
                        <view class="medal-wall-card__icon" 
                             :class="[
                                 'medal-wall-card__icon--' + medal.type,
                                 { 'medal-wall-card__icon--dim': !medal.obtained }
                             ]">
                            <text class="icon" :class="medal.icon"></text>
                        </view>
                        <view v-if="!medal.obtained" class="medal-wall-card__lock">
                            <text class="icon icon-lock"></text>
                        </view>
                        <view v-if="medal.isDisplay" class="medal-wall-card__badge">展示中</view>
                    </view>
                    <text class="medal-wall-card__name">{{ medal.name }}</text>
                    <text class="medal-wall-card__desc">{{ medal.obtained ? medal.obtainTime : '未解锁' }}</text>
                </view>
            </view>

            <view class="medal-wall-bottom-placeholder"></view>
        </scroll-view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'

// ===== 状态 =====
const activeTab = ref(0)
const tabs = ['全部', '已获得', '未解锁']

// 勋章数据
const medals = ref([
    {
        id: 1,
        name: '学术钻研人',
        icon: 'icon-graduation',
        type: 'purple',
        obtained: true,
        isDisplay: true,
        obtainTime: '2024.05.12',
        rarity: '稀有',
        intro: '授予完成学历认证的高学历用户'
    },
    {
        id: 2,
        name: '职场精英',
        icon: 'icon-briefcase',
        type: 'blue',
        obtained: true,
        isDisplay: true,
        obtainTime: '2024.06.03',
        rarity: '稀有',
        intro: '授予完成工作认证的职场人士'
    },
    {
        id: 3,
        name: '运动达人',
        icon: 'icon-run',
        type: 'green',
        obtained: true,
        isDisplay: false,
        obtainTime: '2024.07.15',
        rarity: '普通',
        intro: '授予热爱运动的活跃用户'
    },
    {
        id: 4,
        name: '美食探店家',
        icon: 'icon-food',
        type: 'orange',
        obtained: true,
        isDisplay: true,
        obtainTime: '2024.08.01',
        rarity: '普通',
        intro: '授予热爱美食分享的用户'
    },
    {
        id: 5,
        name: '双一流守护者',
        icon: 'icon-medal-gold',
        type: 'gold',
        obtained: false,
        isDisplay: false,
        obtainTime: '',
        rarity: '传说',
        intro: '授予毕业于双一流高校的用户'
    },
    {
        id: 6,
        name: '大厂搬砖人',
        icon: 'icon-briefcase',
        type: 'blue',
        obtained: false,
        isDisplay: false,
        obtainTime: '',
        rarity: '稀有',
        intro: '授予就职于知名企业的用户'
    },
    {
        id: 7,
        name: '摄影大师',
        icon: 'icon-camera',
        type: 'orange',
        obtained: false,
        isDisplay: false,
        obtainTime: '',
        rarity: '稀有',
        intro: '授予发布优质摄影动态的用户'
    },
    {
        id: 8,
        name: '社交达人',
        icon: 'icon-users',
        type: 'green',
        obtained: false,
        isDisplay: false,
        obtainTime: '',
        rarity: '普通',
        intro: '授予邀请好友完成实名的用户'
    }
])

// ===== 计算属性 =====
const totalCount = computed(() => medals.value.filter(m => m.obtained).length)
const displayCount = computed(() => medals.value.filter(m => m.obtained && m.isDisplay).length)
const lockedCount = computed(() => medals.value.filter(m => !m.obtained).length)

const filteredMedals = computed(() => {
    if (activeTab.value === 0) return medals.value
    if (activeTab.value === 1) return medals.value.filter(m => m.obtained)
    return medals.value.filter(m => !m.obtained)
})

// ===== 方法 =====
const goBack = () => {
    uni.navigateBack()
}

const switchTab = (index) => {
    activeTab.value = index
}

const goToMedalDetail = (medal) => {
    if (!medal.obtained) {
        uni.showToast({ title: '该勋章尚未解锁', icon: 'none' })
        return
    }
    uni.navigateTo({
        url: `/pages/user/medalDetail?id=${medal.id}`
    })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.medal-wall-page {
    min-height: 100vh;
    background-color: $bg-page;
    display: flex;
    flex-direction: column;
}

// 顶部导航
.medal-wall-navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px $page-padding-x;
    padding-top: calc(14px + env(safe-area-inset-top));
    background-color: $bg-card;
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

// 统计卡
.medal-wall-stats {
    display: flex;
    align-items: center;
    background-color: $bg-card;
    margin: 12px $page-padding-x;
    border-radius: $radius-card;
    padding: 16px 0;
    box-shadow: $shadow-card;
    flex-shrink: 0;

    &__item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
    }

    &__num {
        font-size: 22px;
        font-weight: $font-weight-medium;
        color: $text-primary;
        line-height: 1.2;
    }

    &__label {
        font-size: 12px;
        color: $text-helper;
    }

    &__divider {
        width: 1px;
        height: 32px;
        background-color: $border-light;
    }
}

// Tab切换
.medal-wall-tabs {
    display: flex;
    background-color: $bg-card;
    padding: 0 $page-padding-x;
    border-bottom: 1px solid $border-light;
    flex-shrink: 0;

    &__item {
        flex: 1;
        text-align: center;
        padding: 12px 0;
        font-size: $font-size-sm;
        color: $text-helper;
        border-bottom: 2px solid transparent;
        transition: all $duration-fast ease;
        cursor: pointer;

        &--active {
            color: $primary-color;
            border-bottom-color: $primary-color;
            font-weight: $font-weight-medium;
        }
    }
}

// 勋章列表
.medal-wall-list {
    flex: 1;
    padding: 12px $page-padding-x;
}

.medal-wall-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.medal-wall-card {
    background-color: $bg-card;
    border-radius: $radius-card;
    padding: 16px 8px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: $shadow-card;
    cursor: pointer;
    transition: all $duration-fast ease;

    &:active {
        transform: scale(0.96);
    }

    &--locked {
        opacity: 0.6;

        .medal-wall-card__name {
            color: $text-helper;
        }
    }

    &__icon-wrap {
        position: relative;
        margin-bottom: 8px;
    }

    &__icon {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        .icon {
            font-size: 28px;
            color: #FFFFFF;
        }

        &--gold {
            background: linear-gradient(135deg, #FFD700, #FFB74D);
        }
        &--blue {
            background: linear-gradient(135deg, #4FACFE, #0099FF);
        }
        &--purple {
            background: linear-gradient(135deg, #9C27B0, #7B1FA2);
        }
        &--orange {
            background: linear-gradient(135deg, #FFA726, #FB8C00);
        }
        &--green {
            background: linear-gradient(135deg, #2ED573, #1EBE60);
        }
        &--red {
            background: linear-gradient(135deg, #FF6B81, #FF4757);
        }
        &--dim {
            opacity: 0.4;
            filter: grayscale(0.6);
        }
    }

    &__lock {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: $bg-card;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: $shadow-card;

        .icon {
            font-size: 12px;
            color: $text-helper;
        }
    }

    &__badge {
        position: absolute;
        top: -4px;
        right: -4px;
        padding: 1px 6px;
        font-size: 9px;
        color: #FFFFFF;
        background: linear-gradient(90deg, #FF6B81, #FF4757);
        border-radius: 8px;
        line-height: 1.4;
    }

    &__name {
        font-size: $font-size-xs;
        font-weight: $font-weight-medium;
        color: $text-primary;
        text-align: center;
        line-height: 1.3;
    }

    &__desc {
        font-size: 10px;
        color: $text-helper;
        margin-top: 2px;
    }
}

// 空状态
.medal-wall-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;

    &__icon {
        font-size: 48px;
        color: $text-helper;
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
    }
}

.medal-wall-bottom-placeholder {
    height: 20px;
}
</style>