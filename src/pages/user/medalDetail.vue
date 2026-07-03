<template>
    <view class="medal-page">
        <!-- 顶部导航栏 -->
        <view class="medal-navbar">
            <text class="medal-navbar__back icon icon-arrow-left" @click="goBack"></text>
            <text class="medal-navbar__title">勋章详情</text>
            <view class="medal-navbar__placeholder"></view>
        </view>

        <!-- 勋章展示区 -->
        <view class="medal-hero">
            <view class="medal-hero__icon" :class="'medal-hero__icon--' + medalInfo.type">
                <text class="icon" :class="medalInfo.icon"></text>
            </view>
            <text class="medal-hero__name">{{ medalInfo.name }}</text>
            <view class="medal-hero__meta">
                <text class="medal-hero__rarity">{{ medalInfo.rarity }}</text>
                <text class="medal-hero__time">获得于 {{ medalInfo.obtainTime }}</text>
            </view>
        </view>

        <!-- 详情卡片区 -->
        <view class="medal-content">
            <!-- 勋章介绍 -->
            <view class="medal-card">
                <view class="medal-card__title">勋章介绍</view>
                <text class="medal-card__desc">{{ medalInfo.intro }}</text>
            </view>

            <!-- 解锁条件 -->
            <view class="medal-card">
                <view class="medal-card__title">解锁条件</view>
                <view class="condition-list">
                    <view class="condition-item" v-for="(item, idx) in medalInfo.conditions" :key="idx">
                        <text class="condition-item__dot" :class="{ 'is-done': item.done }"></text>
                        <text class="condition-item__text">{{ item.text }}</text>
                    </view>
                </view>
            </view>

            <!-- 专属权益 -->
            <view class="medal-card">
                <view class="medal-card__title">专属权益</view>
                <view class="benefit-list">
                    <view class="benefit-item" v-for="(item, idx) in medalInfo.benefits" :key="idx">
                        <text class="icon icon-check-circle"></text>
                        <text>{{ item }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 底部提示 -->
        <view class="medal-footer">
            <text>勋章是平台对优质用户的荣誉认证</text>
        </view>
    </view>
</template>

<script setup>
    import { ref, onMounted } from 'vue'

    const medalInfo = ref({
        id: 1,
        name: '学术钻研人',
        icon: 'icon-graduation',
        type: 'purple',
        rarity: '稀有勋章',
        obtainTime: '2024.05.12',
        intro: '授予完成学历认证的高学历用户，代表着优秀的教育背景与学识素养，是平台高知人群的身份标识。',
        conditions: [
            { text: '完成实名认证', done: true },
            { text: '完成学历认证且学历为本科及以上', done: true },
            { text: '学历信息审核通过', done: true }
        ],
        benefits: [
            '个人主页展示专属勋章标识',
            '匹配推荐加权优先展示',
            '解锁专属身份标签',
            '优先参与平台官方活动'
        ]
    })

    const goBack = () => {
        uni.navigateBack()
    }

    onMounted(() => {
        // 接收路由参数 medalId 获取勋章详情
        // const pages = getCurrentPages()
        // const currentPage = pages[pages.length - 1]
        // const medalId = currentPage.options.id
    })
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';
    @import '@/styles/mixins.scss';

    .medal-page {
        min-height: 100vh;
        background-color: $bg-page;
        display: flex;
        flex-direction: column;
    }

    // 顶部导航
    .medal-navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px $page-padding-x;
        padding-top: calc(14px + env(safe-area-inset-top));
        background-color: $bg-card;
        border-bottom: 1px solid $border-light;
        position: sticky;
        top: 0;
        z-index: 10;

        &__back {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
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

    // 勋章头部展示
    .medal-hero {
        background-color: $bg-card;
        padding: 40px $page-padding-x 32px;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 12px;

        &__icon {
            width: 96px;
            height: 96px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;

            .icon {
                font-size: 48px;
                color: #FFFFFF;
            }

            &--gold {
                background: linear-gradient(135deg, #FFD700, #FFB74D);
                box-shadow: 0 8px 24px rgba(255, 183, 77, 0.35);
            }

            &--blue {
                background: linear-gradient(135deg, #4FACFE, #0099FF);
                box-shadow: 0 8px 24px rgba(0, 153, 255, 0.3);
            }

            &--purple {
                background: linear-gradient(135deg, #9C27B0, #7B1FA2);
                box-shadow: 0 8px 24px rgba(123, 31, 162, 0.3);
            }

            &--orange {
                background: linear-gradient(135deg, #FFA726, #FB8C00);
                box-shadow: 0 8px 24px rgba(251, 140, 0, 0.3);
            }

            &--green {
                background: linear-gradient(135deg, #2ED573, #1EBE60);
                box-shadow: 0 8px 24px rgba(46, 213, 115, 0.3);
            }
        }

        &__name {
            font-size: 22px;
            font-weight: $font-weight-medium;
            color: $text-primary;
            margin-bottom: 8px;
        }

        &__meta {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 12px;
            color: $text-helper;
        }

        &__rarity {
            padding: 2px 8px;
            border-radius: 10px;
            background-color: rgba(123, 31, 162, 0.1);
            color: #7B1FA2;
            font-size: 11px;
        }
    }

    // 内容区卡片
    .medal-content {
        flex: 1;
        padding: 0 $page-padding-x;
    }

    .medal-card {
        background-color: $bg-card;
        border-radius: $radius-card;
        padding: $spacing-md;
        margin-bottom: 12px;
        box-shadow: $shadow-card;

        &__title {
            font-size: $font-size-md;
            font-weight: $font-weight-medium;
            color: $text-primary;
            margin-bottom: $spacing-sm;
        }

        &__desc {
            font-size: $font-size-sm;
            color: $text-secondary;
            line-height: 1.7;
        }
    }

    // 解锁条件列表
    .condition-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .condition-item {
        display: flex;
        align-items: center;
        gap: 10px;

        &__dot {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 1.5px solid $border-light;
            flex-shrink: 0;
            position: relative;

            &.is-done {
                background-color: #2ED573;
                border-color: #2ED573;

                &::after {
                    content: '';
                    position: absolute;
                    top: 3px;
                    left: 5px;
                    width: 4px;
                    height: 7px;
                    border: solid #FFFFFF;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }
            }
        }

        &__text {
            font-size: $font-size-sm;
            color: $text-secondary;
            flex: 1;
        }
    }

    // 权益列表
    .benefit-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .benefit-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: $font-size-sm;
        color: $text-secondary;

        .icon {
            font-size: 16px;
            color: #2ED573;
            flex-shrink: 0;
        }
    }

    // 底部提示
    .medal-footer {
        text-align: center;
        padding: 24px $page-padding-x 40px;
        font-size: 11px;
        color: $text-helper;
    }
</style>