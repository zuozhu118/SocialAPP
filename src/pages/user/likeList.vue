<template>
    <view class="like-list-page">
        <!-- 顶部导航 -->
        <view class="like-list-navbar">
            <text class="like-list-navbar__back icon icon-arrow-left" @click="goBack"></text>
            <text class="like-list-navbar__title">{{ pageTitle }}</text>
            <view class="like-list-navbar__placeholder"></view>
        </view>

        <!-- 统计信息 -->
        <view class="like-list-stats" v-if="listType === 'send'">
            <text class="like-list-stats__text">已喜欢 <text class="like-list-stats__num">{{ totalCount }}</text> 位用户</text>
        </view>
        <view class="like-list-stats" v-else>
            <text class="like-list-stats__text">有 <text class="like-list-stats__num">{{ totalCount }}</text> 位用户喜欢了你</text>
        </view>

        <!-- 用户列表 -->
        <scroll-view scroll-y class="like-list-scroll" show-scrollbar="false">
            <view v-if="likeList.length === 0" class="like-list-empty">
                <text class="like-list-empty__icon icon icon-heart"></text>
                <text class="like-list-empty__title">
                    {{ listType === 'send' ? '还没有喜欢的人' : '还没有人喜欢你' }}
                </text>
                <text class="like-list-empty__desc">
                    {{ listType === 'send' ? '去匹配页发现更多有趣的灵魂吧' : '完善资料提高曝光，让更多人看到你' }}
                </text>
                <button class="like-list-empty__btn" @click="goToMatch">
                    {{ listType === 'send' ? '去匹配' : '完善资料' }}
                </button>
            </view>

            <view v-else class="like-list-items">
                <view v-for="(user, idx) in likeList"
                      :key="idx"
                      class="like-list-item"
                      @click="goToUserProfile(user.id)">
                    <image class="like-list-item__avatar" :src="user.avatar" mode="aspectFill" />
                    <view class="like-list-item__info">
                        <view class="like-list-item__name-row">
                            <text class="like-list-item__name">{{ user.name }}</text>
                            <text class="like-list-item__gender" :class="user.gender === 'female' ? 'is-female' : 'is-male'">
                                {{ user.gender === 'female' ? '♀' : '♂' }}
                            </text>
                            <view class="like-list-item__auth-badges">
                                <text v-if="user.auth.realName" class="auth-badge auth-badge--real">实名</text>
                                <text v-if="user.auth.education" class="auth-badge auth-badge--edu">学历</text>
                                <text v-if="user.auth.work" class="auth-badge auth-badge--work">工作</text>
                            </view>
                        </view>
                        <text class="like-list-item__meta">{{ user.age }}岁 · {{ user.occupation }} · {{ user.district }}</text>
                        <text class="like-list-item__bio">{{ user.bio }}</text>
                    </view>
                    <view class="like-list-item__action">
                        <text class="like-list-item__time">{{ user.likeTime }}</text>
                        <view v-if="listType === 'receive'"
                              class="like-list-item__match-btn"
                              :class="{ 'is-matched': user.isMatched }"
                              @click.stop="handleMatch(user)">
                            {{ user.isMatched ? '已匹配' : '喜欢Ta' }}
                        </view>
                    </view>

                </view>
            </view>

            <view class="like-list-bottom-placeholder"></view>
        </scroll-view>
    </view>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'

    // ===== 路由参数 =====
    const listType = ref('send') // send: 我喜欢的, receive: 喜欢我的

    onMounted(() => {
        const pages = getCurrentPages()
        const currentPage = pages[pages.length - 1]
        const type = currentPage.options.type || 'send'
        listType.value = type
        loadLikeList(type)
    })

    const pageTitle = computed(() => {
        return listType.value === 'send' ? '我喜欢的' : '喜欢我的'
    })

    // ===== 数据 =====
    const totalCount = ref(0)
    const likeList = ref([])

    const loadLikeList = (type) => {
        // 模拟数据
        if (type === 'send') {
            likeList.value = [
                {
                    id: 1,
                    name: '林小鹿',
                    gender: 'female',
                    age: 24,
                    occupation: '产品经理',
                    district: '朝阳区',
                    avatar: 'https://picsum.photos/200/200?random=101',
                    bio: '慢热型，希望遇到能一起吃很多饭、聊很多天的人',
                    likeTime: '2小时前',
                    auth: { realName: true, education: true, work: false },
                    isMatched: false
                },
                {
                    id: 2,
                    name: '陈橘子',
                    gender: 'female',
                    age: 26,
                    occupation: '金融分析师',
                    district: '浦东新区',
                    avatar: 'https://picsum.photos/200/200?random=102',
                    bio: '理性与浪漫各一半，喜欢有质感的生活',
                    likeTime: '昨天',
                    auth: { realName: true, education: true, work: true },
                    isMatched: true
                },
                {
                    id: 3,
                    name: '苏小小',
                    gender: 'female',
                    age: 25,
                    occupation: '教师',
                    district: '西湖区',
                    avatar: 'https://picsum.photos/200/200?random=103',
                    bio: '热爱生活，喜欢小朋友和一切美好的事物',
                    likeTime: '3天前',
                    auth: { realName: true, education: false, work: false },
                    isMatched: false
                }
            ]
            totalCount.value = 12
        } else {
            likeList.value = [
                {
                    id: 4,
                    name: '张一晨',
                    gender: 'male',
                    age: 28,
                    occupation: '程序员',
                    district: '海淀区',
                    avatar: 'https://picsum.photos/200/200?random=104',
                    bio: '代码之外喜欢摄影和徒步，希望找到能一起看风景的人',
                    likeTime: '1小时前',
                    auth: { realName: true, education: true, work: true },
                    isMatched: false
                },
                {
                    id: 5,
                    name: '王子轩',
                    gender: 'male',
                    age: 27,
                    occupation: '建筑设计师',
                    district: '天河区',
                    avatar: 'https://picsum.photos/200/200?random=105',
                    bio: '设计是我表达的方式，生活是我创作的源泉',
                    likeTime: '5小时前',
                    auth: { realName: true, education: true, work: false },
                    isMatched: true
                },
                {
                    id: 6,
                    name: '刘一鸣',
                    gender: 'male',
                    age: 26,
                    occupation: '医生',
                    district: '锦江区',
                    avatar: 'https://picsum.photos/200/200?random=106',
                    bio: '救死扶伤是工作，热爱生活是态度',
                    likeTime: '昨天',
                    auth: { realName: true, education: true, work: true },
                    isMatched: false
                }
            ]
            totalCount.value = 8
        }
    }

    // ===== 方法 =====
    const goBack = () => {
        uni.navigateBack()
    }

    const goToUserProfile = (userId) => {
        uni.navigateTo({
            url: `/pages/user/profile?userId=${userId}`
        })
    }

    const goToMatch = () => {
        uni.switchTab({
            url: '/pages/match/index'
        })
    }

    const handleMatch = (user) => {
        if (user.isMatched) {
            uni.showToast({
                title: '你们已双向匹配',
                icon: 'none'
            })
            return
        }
        user.isMatched = true
        uni.showToast({
            title: '匹配成功，可以申请交换联系方式了',
            icon: 'success'
        })
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';
    @import '@/styles/mixins.scss';

    .like-list-page {
        min-height: 100vh;
        background-color: $bg-page;
        display: flex;
        flex-direction: column;
    }

    // 顶部导航
    .like-list-navbar {
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

    // 统计
    .like-list-stats {
        padding: 12px $page-padding-x;
        background-color: $bg-card;
        margin-bottom: 8px;
        flex-shrink: 0;

        &__text {
            font-size: $font-size-sm;
            color: $text-helper;
        }

        &__num {
            font-size: $font-size-md;
            font-weight: $font-weight-medium;
            color: $primary-color;
        }
    }

    // 列表
    .like-list-scroll {
        flex: 1;
        padding: 0 $page-padding-x;
    }

    .like-list-items {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .like-list-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background-color: $bg-card;
        border-radius: $radius-card;
        padding: 12px;
        box-shadow: $shadow-card;
        cursor: pointer;

        &:active {
            opacity: 0.85;
        }

        &__avatar {
            width: 56px;
            height: 56px;
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
            align-items: center;
            gap: 4px;
            flex-wrap: wrap;
        }

        &__meta {
            font-size: 12px;
            color: $text-helper;
            display: block;
            margin-bottom: 2px;
        }

        &__bio {
            font-size: 12px;
            color: $text-secondary;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.4;
        }

        &__action {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 6px;
            padding-top: 2px;
        }

        &__time {
            font-size: 10px;
            color: $text-helper;
        }

        &__match-btn {
            padding: 2px 12px;
            font-size: 11px;
            color: #FFFFFF;
            background: linear-gradient(90deg, $primary-color, #9DB48E);
            border-radius: 12px;
            line-height: 1.6;
            cursor: pointer;

            &:active {
                opacity: 0.8;
            }

            &.is-matched {
                background: $bg-page;
                color: $text-helper;
                border: 1px solid $border-light;
            }
        }
    }

    // 认证徽章
    .auth-badge {
        padding: 0 6px;
        font-size: 9px;
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

    // 空状态
    .like-list-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 0;

        &__icon {
            font-size: 48px;
            color: #FF6B81;
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
        }
    }

    .like-list-bottom-placeholder {
        height: 20px;
    }

    .like-list-item__match-btn {
        padding: 2px 12px;
        font-size: 11px;
        color: #FFFFFF;
        background: linear-gradient(135deg, #FF6B81, #FF4757); // 粉色渐变，和喜欢更匹配
        border-radius: 12px;
        line-height: 1.8;
        cursor: pointer;
        display: flex;
        align-items: center;

        &:active {
            opacity: 0.8;
        }

        &.is-matched {
            background: linear-gradient(135deg, $primary-color, #9DB48E);
            color: #FFFFFF;
            border: none;
        }
    }
</style>