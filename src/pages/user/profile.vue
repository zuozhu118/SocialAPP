<template>
    <view class="profile-page" @scroll="onPageScroll">
        <!-- 顶部封面：16:9 微信朋友圈标准比例 -->
        <view class="profile-cover">
            <image class="profile-cover__img" :src="userInfo.coverImage" mode="aspectFill" />
            <view class="profile-cover__mask"></view>
        </view>

        <!-- 主内容区 -->
        <view class="profile-content">
            <!-- 用户基础信息卡片 -->
            <view class="profile-card profile-base-card">
                <view class="profile-base">
                    <!-- 头像 + 认证等级对勾 -->
                    <view class="profile-base__avatar-wrap">
                        <image class="profile-base__avatar" :src="userInfo.userAvatar" mode="aspectFill" />
                        <view class="avatar-auth-icon" :class="'auth-level-' + getAuthLevel(userInfo.auth)" v-if="userInfo.auth.realName">
                            <text class="icon icon-check"></text>
                        </view>
                    </view>

                    <view class="profile-base__info">
                        <!-- 昵称 + 性别 + 关注按钮 -->
                        <view class="profile-base__name-row">
                            <text class="profile-base__name">{{ userInfo.userName }}</text>
                            <text class="profile-base__gender" :class="userInfo.gender === 'female' ? 'is-female' : 'is-male'">
                                {{ userInfo.gender === 'female' ? '♀' : '♂' }}
                            </text>
                            <button class="follow-btn"
                                    :class="{ 'follow-btn--followed': userInfo.isFollowed }"
                                    @click="toggleFollow">
                                {{ userInfo.isFollowed ? '已关注' : '+ 关注' }}
                            </button>
                        </view>
                        <!-- 基础信息 -->
                        <view class="profile-base__meta">
                            {{ userInfo.age }}岁 · {{ userInfo.occupation }} · {{ userInfo.district }}
                        </view>
                    </view>
                </view>

                <!-- 个人简介 -->
                <view class="profile-bio">
                    {{ userInfo.bio }}
                </view>

                <!-- 认证信任标识：黄金位一行展示 -->
                <view class="auth-showcase">
                    <view class="auth-showcase__item" :class="{ 'is-active': userInfo.auth.realName }">
                        <text class="auth-showcase__icon icon icon-id-card"></text>
                        <view class="auth-showcase__text">
                            <text class="auth-showcase__label">实名</text>
                            <text class="auth-showcase__status">
                                <text class="icon icon-check"></text>
                                已认证
                            </text>
                        </view>
                    </view>

                    <view class="auth-showcase__item" :class="{ 'is-active': userInfo.auth.education }">
                        <text class="auth-showcase__icon icon icon-graduation"></text>
                        <view class="auth-showcase__text">
                            <text class="auth-showcase__label">学历</text>
                            <text class="auth-showcase__status">
                                <text class="icon icon-check"></text>
                                已认证
                            </text>
                        </view>
                    </view>

                    <view class="auth-showcase__item" :class="{ 'is-active': userInfo.auth.work }">
                        <text class="auth-showcase__icon icon icon-briefcase"></text>
                        <view class="auth-showcase__text">
                            <text class="auth-showcase__label">工作</text>
                            <text class="auth-showcase__status">
                                <text class="icon icon-check"></text>
                                已认证
                            </text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 趣味勋章 -->
            <view class="profile-card">
                <view class="profile-card__title">Ta的勋章</view>
                <view class="fun-medals">
                    <view v-for="(medal, idx) in userInfo.showMedals"
                          :key="idx"
                          class="medal-tag"
                          :class="'medal-tag--' + medal.type"
                          @click="goToMedalDetail(medal)">
                        <text class="icon" :class="medal.icon"></text>
                        <text>{{ medal.name }}</text>
                    </view>
                </view>
            </view>

            <!-- 个人资料 -->
            <view class="profile-card">
                <view class="profile-card__title">个人资料</view>
                <view class="match-profile__grid">
                    <view class="match-profile__item">
                        {{ userInfo.profile.birthYear }}年 · {{ userInfo.profile.constellation }}
                    </view>
                    <view class="match-profile__item">
                        {{ userInfo.profile.height }}cm · {{ userInfo.profile.weight }}kg
                    </view>
                    <view class="match-profile__item">
                        学历：{{ userInfo.profile.education }}
                    </view>
                    <view class="match-profile__item">
                        职业：{{ userInfo.profile.career }}
                    </view>
                    <view class="match-profile__item">
                        籍贯：{{ userInfo.profile.hometown }}
                    </view>
                    <view class="match-profile__item">
                        婚况：{{ userInfo.profile.maritalStatus }}
                    </view>
                    <view class="match-profile__item">
                        年收入：{{ userInfo.profile.income }}
                    </view>
                </view>
                <view class="match-profile__tags">
                    <text v-for="tag in userInfo.profile.lifeTags" :key="tag" class="tag tag--life">{{ tag }}</text>
                </view>
            </view>

            <!-- 个人标签 -->
            <view class="profile-card">
                <view class="profile-card__title">个人标签</view>
                <view class="profile-tags">
                    <view class="tags-row">
                        <text class="tags-label">兴趣爱好</text>
                        <view class="tags-list">
                            <text v-for="tag in userInfo.hobbyTags" :key="'h'+tag" class="tag tag--hobby">{{ tag }}</text>
                        </view>
                    </view>
                    <view class="tags-row">
                        <text class="tags-label">性格特质</text>
                        <view class="tags-list">
                            <text v-for="tag in userInfo.personalityTags" :key="'p'+tag" class="tag tag--personality">{{ tag }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 人生剧本 -->
            <view class="profile-card profile-script">
                <view class="profile-card__header">
                    <view class="profile-card__title">人生剧本</view>
                    <text class="profile-script__entry" @click="viewScriptDetail">
                        查看详情 <text class="icon icon-arrow-right"></text>
                    </text>
                </view>
                <view class="match-script__card">
                    <view class="match-script__type">
                        <text class="match-script__label">TA的剧本</text>
                        <text class="match-script__name">{{ userInfo.lifeScript.name }}</text>
                    </view>
                    <text class="match-script__desc">{{ userInfo.lifeScript.desc }}</text>
                    <view class="match-script__tags">
                        <text v-for="tag in userInfo.lifeScript.tags" :key="tag" class="script-tag">{{ tag }}</text>
                    </view>
                </view>
            </view>

            <!-- 三观态度 -->
            <view class="profile-card profile-values">
                <view class="profile-card__header">
                    <view class="profile-card__title">三观态度</view>
                    <text class="profile-values__entry" @click="viewMatchDegree">
                        测契合度 <text class="icon icon-arrow-right"></text>
                    </text>
                </view>
                <view class="match-values__list">
                    <view class="match-values__item">
                        <text class="match-values__label">恋爱观</text>
                        <text class="match-values__text">{{ userInfo.values.love }}</text>
                    </view>
                    <view class="match-values__item">
                        <text class="match-values__label">消费观</text>
                        <text class="match-values__text">{{ userInfo.values.consume }}</text>
                    </view>
                    <view class="match-values__item">
                        <text class="match-values__label">生活观</text>
                        <text class="match-values__text">{{ userInfo.values.life }}</text>
                    </view>
                </view>
            </view>

            <!-- 期待的另一半 -->
            <view class="profile-card">
                <view class="profile-card__title">Ta期待的另一半</view>
                <view class="match-expect__tags">
                    <text v-for="tag in userInfo.expectTags" :key="tag" class="tag tag--expect">{{ tag }}</text>
                </view>
            </view>

            <!-- Ta的相册：微信同款3列正方形网格 -->
            <view class="profile-card">
                <view class="profile-card__header">
                    <view class="profile-card__title">Ta的相册</view>
                    <text class="profile-card__more" @click="viewAllAlbum">
                        共{{ userInfo.album.length }}张 <text class="icon icon-arrow-right"></text>
                    </text>
                </view>
                <view class="album-grid">
                    <image v-for="(img, idx) in userInfo.album.slice(0, 6)"
                           :key="idx"
                           class="album-grid__item"
                           :src="img"
                           mode="aspectFill"
                           @click="previewAlbum(idx)" />
                </view>
            </view>

            <!-- Ta的动态 -->
            <view class="profile-card">
                <view class="profile-card__header">
                    <view class="profile-card__title">Ta的动态</view>
                    <text class="profile-card__more" @click="viewAllPosts">
                        全部 <text class="icon icon-arrow-right"></text>
                    </text>
                </view>
                <view class="post-grid">
                    <view class="post-grid__item" v-for="(post, idx) in userPosts" :key="post.id" @click="goToPostDetail(post.id)">
                        <image class="post-grid__img" :src="post.images[0]" mode="aspectFill" />
                        <view v-if="post.isQuality" class="post-grid__badge">
                            <text class="icon icon-star"></text> 精选
                        </view>
                        <view class="post-grid__info">
                            <text class="icon icon-heart"></text>
                            <text>{{ post.likes }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 底部信息栏：IP + 举报拉黑 -->
            <view class="profile-footer">
                <text class="profile-footer__ip">IP属地：{{ userInfo.ipLocation }}</text>
                <view class="profile-footer__ops">
                    <text class="profile-footer__link" @click="handleReport">举报</text>
                    <text class="profile-footer__split">·</text>
                    <text class="profile-footer__link" @click="handleBlock">拉黑</text>
                </view>
            </view>

            <!-- 底部占位 -->
            <view class="profile-bottom-placeholder"></view>
        </view>
    </view>
</template>

<script setup>
    import { ref, onMounted } from 'vue'

    const scrollTop = ref(0)

    // 认证等级计算
    const getAuthLevel = (auth) => {
        let level = 0
        if (auth.realName) level = 1
        if (auth.realName && auth.education) level = 2
        if (auth.realName && auth.education && auth.work) level = 3
        return level
    }

    // 用户详情数据
    const userInfo = ref({
        userId: 2,
        userName: '陈橘子',
        gender: 'female',
        age: 26,
        occupation: '金融分析师',
        district: '浦东新区',
        userAvatar: 'https://picsum.photos/200/200?random=11',
        coverImage: 'https://picsum.photos/800/450?random=102',
        ipLocation: '上海市',
        auth: { realName: true, education: true, work: true },
        isFollowed: true,
        bio: '理性与浪漫各一半，喜欢有质感的生活。周末喜欢瑜伽和探店，希望遇到同频的人。',

        // 个人资料
        profile: {
            birthYear: '98',
            constellation: '双子座',
            height: 168,
            weight: 50,
            education: '研究生',
            career: '金融分析师',
            hometown: '杭州',
            maritalStatus: '未婚',
            income: '20-30W',
            lifeTags: ['无车', '无房', '不吸烟', '偶尔喝酒']
        },

        // 趣味勋章
        showMedals: [
            { id: 1, name: '学术钻研人', icon: 'icon-graduation', type: 'purple' },
            { id: 2, name: '职场精英', icon: 'icon-briefcase', type: 'blue' },
            { id: 3, name: '运动达人', icon: 'icon-run', type: 'green' },
            { id: 4, name: '美食探店家', icon: 'icon-food', type: 'orange' }
        ],

        hobbyTags: ['瑜伽', '阅读', '音乐', '理财', '咖啡探店'],
        personalityTags: ['独立', '理性', '自律', '目标感强'],

        lifeScript: {
            name: '事业进阶型',
            desc: '处于事业上升期，看重个人成长与职业发展，希望另一半能并肩同行，彼此支持共同变好。',
            tags: ['事业上升', '共同成长', '独立自律', '眼界开阔']
        },
        values: {
            love: '势均力敌的爱情，彼此欣赏互相扶持，不依附不将就',
            consume: '看重品质不看数量，愿意为体验和自我提升投资',
            life: '工作时全力以赴，生活时尽情享受，保持成长节奏'
        },
        expectTags: ['24-32岁', '未婚', '175cm+', '本科及以上', '上进自律', '情绪稳定'],

        // 相册
        album: [
            'https://picsum.photos/400/400?random=31',
            'https://picsum.photos/400/400?random=32',
            'https://picsum.photos/400/400?random=33',
            'https://picsum.photos/400/400?random=34',
            'https://picsum.photos/400/400?random=35',
            'https://picsum.photos/400/400?random=36',
            'https://picsum.photos/400/400?random=37',
            'https://picsum.photos/400/400?random=38'
        ]
    })

    // 用户动态列表
    const userPosts = ref([
        { id: 1, images: ['https://picsum.photos/300/300?random=21'], likes: 45, isQuality: true },
        { id: 2, images: ['https://picsum.photos/300/300?random=22'], likes: 32, isQuality: false },
        { id: 3, images: ['https://picsum.photos/300/300?random=23'], likes: 67, isQuality: true },
        { id: 4, images: ['https://picsum.photos/300/300?random=24'], likes: 28, isQuality: false },
        { id: 5, images: ['https://picsum.photos/300/300?random=25'], likes: 89, isQuality: true },
        { id: 6, images: ['https://picsum.photos/300/300?random=26'], likes: 19, isQuality: false }
    ])

    // 页面滚动监听
    const onPageScroll = (e) => {
        scrollTop.value = e.detail.scrollTop
    }

    // 返回
    const goBack = () => {
        uni.navigateBack()
    }

    // 右上角更多操作
    const showMoreOps = () => {
        uni.showActionSheet({
            itemList: ['分享用户', '复制主页链接'],
            success: () => { }
        })
    }

    // 关注/取消关注
    const toggleFollow = () => {
        userInfo.value.isFollowed = !userInfo.value.isFollowed
        uni.showToast({
            title: userInfo.value.isFollowed ? '关注成功' : '已取消关注',
            icon: 'none'
        })
    }

    // 跳转勋章详情页
    const goToMedalDetail = (medal) => {
        uni.navigateTo({
            url: `/pages/user/medalDetail?id=${medal.id}`
        })
    }

    // 跳转动态详情
    const goToPostDetail = (id) => {
        uni.navigateTo({ url: `/pages/dynamic/detail?id=${id}` })
    }

    // 查看全部动态
    const viewAllPosts = () => {
        uni.showToast({ title: '查看全部动态', icon: 'none' })
    }

    // 查看剧本详情
    const viewScriptDetail = () => {
        uni.showToast({ title: '人生剧本详情', icon: 'none' })
    }

    // 查看契合度
    const viewMatchDegree = () => {
        uni.showToast({ title: '查看契合度', icon: 'none' })
    }

    // 相册预览
    const previewAlbum = (index) => {
        uni.previewImage({
            urls: userInfo.value.album,
            current: index
        })
    }
    const viewAllAlbum = () => {
        uni.showToast({ title: '查看完整相册', icon: 'none' })
    }

    // 举报
    const handleReport = () => {
        uni.navigateTo({ url: '/pages/common/report' })
    }

    // 拉黑
    const handleBlock = () => {
        uni.showModal({
            title: '确认拉黑',
            content: '拉黑后将不再看到该用户的动态，且无法恢复',
            confirmColor: '#FF4757',
            success: (res) => {
                if (res.confirm) {
                    uni.showToast({ title: '已拉黑', icon: 'success' })
                    setTimeout(() => uni.navigateBack(), 1000)
                }
            }
        })
    }

    onMounted(() => {
        // 接收路由参数 userId 请求用户详情
    })
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';
    @import '@/styles/mixins.scss';

    .profile-page {
        width: 100%;
        min-height: 100vh;
        background-color: $bg-page;
        position: relative;
    }



    // ----- 顶部封面：16:9标准比例 -----
    .profile-cover {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        overflow: hidden;

        &__img {
            width: 100%;
            height: 100%;
            background-color: $bg-page;
            display: block;
        }

        &__mask {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 50%;
            background: linear-gradient(to bottom, rgba(0,0,0,0), rgba($bg-page, 1));
        }
    }

    // ----- 主内容区 -----
    .profile-content {
        position: relative;
        z-index: 2;
        margin-top: -40px;
        padding: 0 $page-padding-x;
    }

    // 通用卡片样式
    .profile-card {
        background-color: $bg-card;
        border-radius: $radius-card;
        padding: $spacing-md;
        margin-bottom: 12px;
        box-shadow: $shadow-card;

        &__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: $spacing-sm;
        }

        &__title {
            font-size: $font-size-md;
            font-weight: $font-weight-medium;
            color: $text-primary;
            margin-bottom: $spacing-sm;

            &--second {
                margin-top: $spacing-md;
            }
        }

        &__more {
            font-size: $font-size-xs;
            color: $text-helper;
            display: flex;
            align-items: center;
            gap: 2px;

            .icon {
                font-size: 12px;
            }
        }
    }

    // ----- 基础信息卡片 -----
    .profile-base-card {
        padding-top: 30px;
    }

    .profile-base {
        display: flex;
        gap: 12px;
        margin-top: -50px;
        margin-bottom: $spacing-sm;
    }

    .profile-base__avatar-wrap {
        position: relative;
        flex-shrink: 0;
    }

    .profile-base__avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        border: 3px solid $bg-card;
        background-color: $bg-page;
        display: block;
    }

    // 头像认证对勾
    .avatar-auth-icon {
        position: absolute;
        right: 0;
        bottom: 2px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid $bg-card;

        .icon {
            font-size: 11px;
            color: #FFFFFF;
            line-height: 1;
        }
        // 等级1：仅实名 - 浅绿空心
        &.auth-level-1 {
            background-color: transparent;
            border: 1.5px solid #81D4A0;

            .icon {
                color: #81D4A0;
                font-size: 10px;
            }
        }
        // 等级2：实名+学历 - 深绿实心
        &.auth-level-2 {
            background-color: #2ED573;
            border: 2px solid $bg-card;
        }
        // 等级3：三重认证 - 香槟金实心
        &.auth-level-3 {
            background: linear-gradient(135deg, #FFD700, #FFB74D);
            border: 2px solid $bg-card;
            box-shadow: 0 0 6px rgba(255, 183, 77, 0.4);
        }
    }

    .profile-base__info {
        flex: 1;
        padding-top: 32px;
        min-width: 0;
    }

    .profile-base__name-row {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
        flex-wrap: wrap;
    }

    .profile-base__name {
        font-size: 20px;
        font-weight: $font-weight-medium;
        color: $text-primary;
        line-height: 1.2;
    }

    .profile-base__gender {
        font-size: 20px;
        line-height: 1;

        &.is-female {
            color: #FF6B81;
        }

        &.is-male {
            color: #4FACFE;
        }
    }

    .profile-base__meta {
        font-size: 12px;
        color: $text-helper;
        line-height: 1.3;
    }

    // 关注按钮
    .follow-btn {
        padding: 4px 14px;
        font-size: 12px;
        color: $primary-color;
        background-color: $primary-light-bg;
        border: 1px solid $primary-color;
        border-radius: 14px;
        line-height: 1.3;
        transition: all $duration-fast ease;
        flex-shrink: 0;
        margin-left: 2px;

        &:active {
            opacity: 0.8;
        }

        &--followed {
            color: $text-helper;
            background-color: $bg-page;
            border-color: $border-light;
        }
    }

    // 个人简介
    .profile-bio {
        font-size: $font-size-sm;
        color: $text-secondary;
        line-height: 1.7;
        margin-bottom: $spacing-md;
        padding-bottom: $spacing-md;
        border-bottom: 1px solid $border-light;
    }

    // ----- 认证信任标识：一行横向排列 -----
    .auth-showcase {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .auth-showcase__item {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 8px;
        border-radius: 12px;
        background-color: $bg-page;
        transition: all $duration-fast ease;

        &.is-active {
            background-color: rgba(46, 213, 115, 0.08);

            .auth-showcase__icon {
                color: #2ED573;
            }

            .auth-showcase__status {
                color: #2E7D32;

                .icon {
                    color: #2ED573;
                }
            }
        }
    }

    .auth-showcase__icon {
        flex-shrink: 0;
        font-size: 18px;
        color: $text-helper;
        line-height: 1;
    }

    .auth-showcase__text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    .auth-showcase__label {
        font-size: 13px;
        color: $text-primary;
        font-weight: $font-weight-medium;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .auth-showcase__status {
        display: flex;
        align-items: center;
        gap: 2px;
        font-size: 11px;
        color: $text-helper;
        line-height: 1;
        white-space: nowrap; 

        .icon {
            font-size: 11px;
            color: $text-helper;
            line-height: 1;
            flex-shrink: 0;
        }
    }

    // ----- 趣味勋章 -----
    .fun-medals {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .medal-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        font-size: 12px;
        border-radius: 12px;
        white-space: nowrap;
        flex-shrink: 0;
        cursor: pointer;
        transition: all $duration-fast ease;

        &:active {
            transform: scale(0.96);
        }

        .icon {
            font-size: 14px;
        }

        &--gold {
            color: #B8860B;
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(255, 183, 77, 0.15));
            box-shadow: 0 1px 3px rgba(184, 134, 11, 0.15);
        }

        &--blue {
            color: #1976D2;
            background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 153, 255, 0.1));
            box-shadow: 0 1px 3px rgba(25, 118, 210, 0.12);
        }

        &--purple {
            color: #7B1FA2;
            background: linear-gradient(135deg, rgba(156, 39, 176, 0.2), rgba(123, 31, 162, 0.1));
            box-shadow: 0 1px 3px rgba(123, 31, 162, 0.12);
        }

        &--orange {
            color: #E65100;
            background: linear-gradient(135deg, rgba(255, 167, 38, 0.2), rgba(251, 140, 0, 0.1));
            box-shadow: 0 1px 3px rgba(230, 81, 0, 0.12);
        }

        &--green {
            color: #2E7D32;
            background: linear-gradient(135deg, rgba(46, 213, 115, 0.2), rgba(30, 190, 96, 0.1));
            box-shadow: 0 1px 3px rgba(46, 125, 50, 0.12);
        }
    }

    // ----- 个人资料 -----
    .match-profile__grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: $spacing-sm 0;
        margin-bottom: $spacing-md;
    }

    .match-profile__item {
        font-size: $font-size-sm;
        color: $text-secondary;
        line-height: 1.4;
    }

    .match-profile__tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    // ----- 标签模块 -----
    .profile-tags {
        .tags-row {
            display: flex;
            align-items: flex-start;
            margin-bottom: 8px;

            &:last-child {
                margin-bottom: 0;
            }
        }

        .tags-label {
            width: 60px;
            flex-shrink: 0;
            font-size: 11px;
            color: $text-helper;
            padding-top: 3px;
        }

        .tags-list {
            flex: 1;
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }

        .tag {
            padding: 2px 10px;
            font-size: 11px;
            border-radius: 10px;
            line-height: 1.4;

            &--hobby {
                color: $text-secondary;
                border: 1px solid $border-light;
                background-color: transparent;
            }

            &--personality {
                color: $text-helper;
                background-color: $bg-page;
                font-size: 10px;
            }

            &--life {
                color: $text-secondary;
                background-color: $bg-page;
                border: 1px solid $border-light;
            }

            &--expect {
                color: $text-secondary;
                background-color: #F5F1E8;
            }
        }
    }

    // ----- 人生剧本、三观 -----
    .profile-script, .profile-values {
        &__entry {
            font-size: $font-size-xs;
            color: $primary-color;
            display: flex;
            align-items: center;

            .icon {
                margin-left: 2px;
                font-size: 12px;
            }
        }
    }

    .match-script__card {
        padding: $spacing-sm;
        background: linear-gradient(135deg, rgba(168, 184, 154, 0.1) 0%, rgba(186, 168, 200, 0.1) 100%);
        border-radius: 12px;
        border: 1px solid rgba($primary-color, 0.15);
    }

    .match-script__type {
        display: flex;
        align-items: baseline;
        gap: $spacing-xs;
        margin-bottom: 6px;
    }

    .match-script__label {
        font-size: 11px;
        color: $text-helper;
    }

    .match-script__name {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $primary-color;
    }

    .match-script__desc {
        font-size: $font-size-xs;
        color: $text-secondary;
        line-height: 1.6;
        margin-bottom: $spacing-sm;
        display: block;
    }

    .match-script__tags {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }

    .script-tag {
        padding: 2px 8px;
        font-size: 10px;
        color: $primary-color;
        background-color: rgba(255, 255, 255, 0.6);
        border-radius: 8px;
    }

    .match-values__list {
        display: flex;
        flex-direction: column;
        gap: $spacing-sm;
    }

    .match-values__item {
        display: flex;
        gap: $spacing-sm;
    }

    .match-values__label {
        width: 50px;
        flex-shrink: 0;
        font-size: $font-size-sm;
        color: $text-helper;
        padding-top: 1px;
    }

    .match-values__text {
        flex: 1;
        font-size: $font-size-sm;
        color: $text-secondary;
        line-height: 1.5;
    }

    .match-expect__tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    // ----- 相册网格：微信同款正方形 -----
    .album-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
    }

    .album-grid__item {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 4px;
        background-color: $bg-page;
        cursor: pointer;
        display: block;

        &:active {
            opacity: 0.85;
        }
    }

    // ----- Ta的动态网格 -----
    .post-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
    }

    .post-grid__item {
        position: relative;
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;

        &:active {
            opacity: 0.85;
        }
    }

    .post-grid__img {
        width: 100%;
        height: 100%;
        background-color: $bg-page;
    }

    // 精选角标
    .post-grid__badge {
        position: absolute;
        top: 4px;
        right: 4px;
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 1px 6px;
        font-size: 9px;
        color: #FFFFFF;
        background: linear-gradient(90deg, #FFB74D, #FF9800);
        border-radius: 8px;

        .icon {
            font-size: 9px;
        }
    }

    .post-grid__info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 4px 6px;
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 10px;
        color: #FFFFFF;
        background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);

        .icon {
            font-size: 12px;
        }
    }

    // ----- 底部信息栏 -----
    .profile-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px $page-padding-x;
        font-size: 11px;
        color: $text-helper;
        background-color: $bg-card;
        border-radius: $radius-card;
        margin-bottom: 12px;

        &__ip {
            color: $text-helper;
        }

        &__ops {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        &__link {
            color: $text-helper;
            cursor: pointer;

            &:active {
                opacity: 0.7;
            }
        }

        &__split {
            color: $border-light;
        }
    }

    // 底部占位
    .profile-bottom-placeholder {
        height: 20px;
    }
</style>