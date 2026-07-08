<template>
    <view class="my-profile-page">
        <!-- ===== 顶部封面（完整显示，底部毛玻璃过渡） ===== -->
        <view class="cover-section">
            <image class="cover-section__image" :src="userInfo.coverImage" mode="aspectFill" />
            <!-- 毛玻璃底部过渡 -->
            <view class="cover-section__glass"></view>
        </view>

        <!-- ===== 用户信息（在图片下方） ===== -->
        <view class="user-info-section">
            <view class="user-info__avatar-wrap">
                <image class="user-info__avatar" :src="userInfo.avatar" mode="aspectFill" />
                <view class="avatar-auth-badge" v-if="userInfo.auth.realName">
                    <text class="icon icon-check"></text>
                </view>
            </view>
            <view class="user-info__detail">
                <view class="user-info__name-row">
                    <text class="user-info__name">{{ userInfo.nickname }}</text>
                    <text class="user-info__gender" :class="userInfo.gender === 'female' ? 'is-female' : 'is-male'">
                        {{ userInfo.gender === 'female' ? '♀' : '♂' }}
                    </text>
                </view>
                <view class="user-info__meta">
                    <text>{{ userInfo.age }}岁</text>
                    <text class="dot">·</text>
                    <text>{{ userInfo.city }}</text>
                    <text class="dot">·</text>
                    <text> {{ userInfo.career }}</text>
                </view>
            </view>
        </view>

        <!-- ===== 认证部分（轻量标签，仅展示） ===== -->
        <view class="auth-section">
            <view class="auth-item" :class="userInfo.auth.realName ? 'is-active' : 'is-inactive'">
                <text class="auth-item__icon">{{ userInfo.auth.realName ? '✓' : '○' }}</text>
                <text class="auth-item__label">身份认证</text>
            </view>
            <view class="auth-item" :class="userInfo.auth.education ? 'is-active' : 'is-inactive'">
                <text class="auth-item__icon">{{ userInfo.auth.education ? '✓' : '○' }}</text>
                <text class="auth-item__label">学历认证</text>
            </view>
            <view class="auth-item" :class="userInfo.auth.work ? 'is-active' : 'is-inactive'">
                <text class="auth-item__icon">{{ userInfo.auth.work ? '✓' : '○' }}</text>
                <text class="auth-item__label">单位认证</text>
            </view>
        </view>

        <!-- ===== 个人简介 ===== -->
        <view class="bio-section" v-if="userInfo.bio">
            <text class="bio-section__text">{{ userInfo.bio }}</text>
        </view>

        <!-- ===== 标签云 ===== -->
        <view class="tags-section">
            <view class="tags-group" v-if="userInfo.hobbyTags.length">
                <text class="tags-group__label">🎯 兴趣爱好</text>
                <view class="tags-group__list">
                    <text v-for="tag in userInfo.hobbyTags" :key="tag" class="tag tag--hobby">{{ tag }}</text>
                </view>
            </view>
            <view class="tags-group" v-if="userInfo.personalityTags.length">
                <text class="tags-group__label">💫 性格特质</text>
                <view class="tags-group__list">
                    <text v-for="tag in userInfo.personalityTags" :key="tag" class="tag tag--personality">{{ tag }}</text>
                </view>
            </view>
            <view class="tags-group" v-if="userInfo.weekendTags.length">
                <text class="tags-group__label">🌿 周末日常</text>
                <view class="tags-group__list">
                    <text v-for="tag in userInfo.weekendTags" :key="tag" class="tag tag--weekend">{{ tag }}</text>
                </view>
            </view>
        </view>

        <!-- ===== 详细资料卡片 ===== -->
        <view class="detail-card">
            <view class="detail-card__title">📋 详细资料</view>
            <view class="detail-card__grid">
                <view class="detail-item">
                    <text class="detail-item__label">身高</text>
                    <text class="detail-item__value">{{ userInfo.height }} cm</text>
                </view>
                <view class="detail-item">
                    <text class="detail-item__label">体重</text>
                    <text class="detail-item__value">{{ userInfo.weight }} kg</text>
                </view>
                <view class="detail-item">
                    <text class="detail-item__label">学历</text>
                    <text class="detail-item__value">{{ userInfo.education }}</text>
                </view>
                <view class="detail-item">
                    <text class="detail-item__label">职业</text>
                    <text class="detail-item__value">{{ userInfo.career }}</text>
                </view>
                <view class="detail-item">
                    <text class="detail-item__label">籍贯</text>
                    <text class="detail-item__value">{{ userInfo.hometown }}</text>
                </view>
                <view class="detail-item">
                    <text class="detail-item__label">婚姻状况</text>
                    <text class="detail-item__value">{{ userInfo.maritalStatus }}</text>
                </view>
                <view class="detail-item">
                    <text class="detail-item__label">年收入</text>
                    <text class="detail-item__value">{{ userInfo.income }}</text>
                </view>
                <view class="detail-item">
                    <text class="detail-item__label">房产</text>
                    <text class="detail-item__value">{{ userInfo.house }}</text>
                </view>
                <view class="detail-item">
                    <text class="detail-item__label">车辆</text>
                    <text class="detail-item__value">{{ userInfo.car }}</text>
                </view>
            </view>
        </view>

        <!-- ===== 人生剧本 ===== -->
        <view class="script-card" v-if="userInfo.script.hasTested">
            <view class="script-card__header">
                <text class="script-card__title">📖 人生剧本</text>
                <text class="script-card__badge" :class="'badge--' + userInfo.script.result.type">
                    {{ userInfo.script.result.name }}
                </text>
            </view>
            <text class="script-card__desc">{{ userInfo.script.result.desc }}</text>
            <view class="script-card__tags">
                <text v-for="tag in userInfo.script.result.tags" :key="tag" class="script-tag">{{ tag }}</text>
            </view>
        </view>

        <!-- ===== 三观态度 ===== -->
        <view class="values-card" v-if="userInfo.values.hasTested">
            <view class="values-card__title">💭 三观态度</view>
            <view class="values-card__list">
                <view class="value-item">
                    <text class="value-item__label">恋爱观</text>
                    <text class="value-item__text">{{ userInfo.values.result.love }}</text>
                </view>
                <view class="value-item">
                    <text class="value-item__label">消费观</text>
                    <text class="value-item__text">{{ userInfo.values.result.consume }}</text>
                </view>
                <view class="value-item">
                    <text class="value-item__label">生活观</text>
                    <text class="value-item__text">{{ userInfo.values.result.life }}</text>
                </view>
            </view>
        </view>

        <!-- ===== 期待的另一半 ===== -->
        <view class="expect-card">
            <view class="expect-card__title">💕 期待的另一半</view>
            <view class="expect-card__tags">
                <text v-for="tag in userInfo.expectTags" :key="tag" class="expect-tag">{{ tag }}</text>
            </view>
        </view>

        <!-- ===== 我的相册 ===== -->
        <view class="album-card" v-if="userInfo.album.length">
            <view class="album-card__header">
                <text class="album-card__title">🖼️ 我的相册</text>
                <text class="album-card__count">共 {{ userInfo.album.length }} 张</text>
            </view>
            <view class="album-card__grid">
                <image v-for="(img, idx) in userInfo.album.slice(0, 6)"
                       :key="idx"
                       class="album-card__item"
                       :src="img"
                       mode="aspectFill"
                       @click="previewAlbum(idx)" />
                <view v-if="userInfo.album.length > 6" class="album-card__more" @click="viewAllAlbum">
                    <text>+{{ userInfo.album.length - 6 }}</text>
                </view>
            </view>
        </view>

        <!-- ===== 我的动态（精选） ===== -->
        <view class="post-card" v-if="userPosts.length">
            <view class="post-card__header">
                <text class="post-card__title">📝 我的动态</text>
                <text class="post-card__more" @click="viewAllPosts">查看全部 ></text>
            </view>
            <view class="post-card__grid">
                <view class="post-item" v-for="post in userPosts.slice(0, 4)" :key="post.id" @click="goToPostDetail(post.id)">
                    <image class="post-item__image" :src="post.images[0]" mode="aspectFill" />
                    <view class="post-item__overlay">
                        <view class="post-item__stats">
                            <text class="icon icon-heart"></text>
                            <text>{{ post.likes }}</text>
                        </view>
                        <view v-if="post.isQuality" class="post-item__badge">精选</view>
                    </view>
                </view>
            </view>
        </view>

        <!-- ===== 底部占位 ===== -->
        <view class="bottom-placeholder"></view>

        <!-- ===== 编辑资料悬浮按钮（右下角） ===== -->
        <view class="edit-fab" @click="goToEdit">
            <text class="edit-fab__icon icon icon-edit"></text>
        </view>
    </view>
</template>

<script setup>
    import { ref } from 'vue'

    const userId = ref('10086520')

    // 用户信息
    const userInfo = ref({
        avatar: 'https://picsum.photos/200/200?random=30',
        nickname: '小鹿同学',
        gender: 'female',
        age: 26,
        city: '北京',
        coverImage: 'https://picsum.photos/800/450?random=102',
        bio: '理性与浪漫各一半，喜欢有质感的生活。周末喜欢瑜伽和探店，希望遇到同频的人。',
        height: 165,
        weight: 50,
        education: '本科',
        career: '互联网运营',
        hometown: '河北石家庄',
        maritalStatus: '未婚',
        income: '10-20W',
        house: '无房',
        car: '无车',
        auth: {
            realName: true,
            education: true,
            work: false
        },
        hobbyTags: ['瑜伽', '阅读', '咖啡探店', '音乐', '摄影', '旅行'],
        personalityTags: ['独立', '理性', '自律', '目标感强', '情绪稳定'],
        weekendTags: ['探店美食', '宅家追剧', '看书学习', '运动健身'],
        script: {
            hasTested: true,
            result: {
                type: 'career',
                name: '事业进阶型',
                desc: '处于事业上升期，看重个人成长与职业发展，希望另一半能并肩同行，彼此支持共同变好。',
                tags: ['事业上升', '共同成长', '独立自律', '眼界开阔']
            }
        },
        values: {
            hasTested: true,
            result: {
                love: '势均力敌，彼此欣赏，不依附不将就',
                consume: '注重品质，理性消费，愿意为体验投资',
                life: '工作生活平衡，保持成长节奏'
            }
        },
        expectTags: ['24-32岁', '未婚', '175cm+', '本科及以上', '上进自律', '情绪稳定', '同城优先'],
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

    // 动态列表
    const userPosts = ref([
        { id: 1, images: ['https://picsum.photos/300/300?random=21'], likes: 45, isQuality: true },
        { id: 2, images: ['https://picsum.photos/300/300?random=22'], likes: 32, isQuality: false },
        { id: 3, images: ['https://picsum.photos/300/300?random=23'], likes: 67, isQuality: true },
        { id: 4, images: ['https://picsum.photos/300/300?random=24'], likes: 28, isQuality: false }
    ])

    // 跳转编辑资料
    const goToEdit = () => {
        uni.navigateTo({ url: '/pages/profile/edit' })
    }

    // 相册预览
    const previewAlbum = (index) => {
        uni.previewImage({
            urls: userInfo.value.album,
            current: index
        })
    }

    const viewAllAlbum = () => {
        uni.showToast({ title: '查看全部相册', icon: 'none' })
    }

    // 动态
    const goToPostDetail = (id) => {
        uni.navigateTo({ url: `/pages/dynamic/detail?id=${id}` })
    }

    const viewAllPosts = () => {
        uni.showToast({ title: '查看全部动态', icon: 'none' })
    }
</script>

<style lang="scss" scoped>
    $bg-page: #F5F6FA;
    $bg-card: #FFFFFF;
    $text-primary: #1A1A2E;
    $text-secondary: #4A4A5A;
    $text-helper: #9999A8;
    $border-light: #EEEEF2;
    $primary-color: #A8B89A;
    $primary-dark: #8A9B7A;
    $primary-light: rgba(168, 184, 154, 0.15);
    $radius-card: 16px;
    $shadow-card: 0 2px 12px rgba(0, 0, 0, 0.06);

    .my-profile-page {
        min-height: 100vh;
        background-color: $bg-page;
    }

    // ===== 顶部封面（完整显示 + 毛玻璃底部过渡） =====
    .cover-section {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        background: linear-gradient(135deg, #E8ECF1, #D5DCE6);

        &__image {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
        }

        &__glass {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 16%;
            background: linear-gradient( to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.15) 25%, rgba(255, 255, 255, 0.40) 55%, rgba(245, 246, 250, 0.85) 100% );
            backdrop-filter: blur(3px);
            -webkit-backdrop-filter: blur(3px);
            pointer-events: none;
        }
    }

    // ===== 用户信息（在图片下方） =====
    .user-info-section {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 16px 14px;
        background: $bg-card;
        margin: 0 12px;
        border-radius: $radius-card $radius-card;
        box-shadow: $shadow-card;
        position: relative;
        margin-top: -6px;
        z-index: 2;
    }

    .user-info__avatar-wrap {
        position: relative;
        flex-shrink: 0;
    }

    .user-info__avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        border: 2px solid $bg-card;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        display: block;
        background: #fff;
    }

    .avatar-auth-badge {
        position: absolute;
        right: -2px;
        bottom: 0px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, #A8B89A, #8A9B7A);
        border: 2px solid $bg-card;
        display: flex;
        align-items: center;
        justify-content: center;

        .icon {
            font-size: 11px;
            color: #FFFFFF;
        }
    }

    .user-info__detail {
        flex: 1;
        min-width: 0;
    }

    .user-info__name-row {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .user-info__name {
        font-size: 20px;
        font-weight: 700;
        color: $text-primary;
    }

    .user-info__gender {
        font-size: 17px;
        line-height: 1;

        &.is-female {
            color: #FF6B81;
        }

        &.is-male {
            color: #4FACFE;
        }
    }

    .user-info__meta {
        font-size: 13px;
        color: $text-helper;
        display: flex;
        align-items: center;
        gap: 4px;

        .dot {
            color: $border-light;
        }
    }

    // ===== 认证部分（轻量标签，仅展示） =====
    .auth-section {
        display: flex;
        gap: 8px;
        padding: 10px 16px 12px;
        margin: 0 12px;
        background: $bg-card;
        border-radius: $radius-card $radius-card;
        box-shadow: $shadow-card;
        margin-top: 12px;
        z-index: 1;
        position: relative;
        border-top: 1px solid $border-light;
    }

    .auth-item {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 12px 4px 8px;
        border-radius: 14px;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.3s ease;

        &__icon {
            font-size: 12px;
            flex-shrink: 0;
            line-height: 1;
        }

        &__label {
            white-space: nowrap;
            font-size: 11px;
        }
        // 已认证 - 柔和绿色标签，与主题色协调
        &.is-active {
            background: rgba(168, 184, 154, 0.15);
            color: #6B8A5E;

            .auth-item__icon {
                color: #6B8A5E;
            }
        }
        // 未认证 - 浅灰标签
        &.is-inactive {
            background: #F0F1F3;
            color: #B0B0B8;

            .auth-item__icon {
                color: #C8C8D0;
            }
        }
    }

    // ===== 个人简介 =====
    .bio-section {
        margin: 12px 12px 0;
        padding: 16px 18px;
        background: $bg-card;
        border-radius: $radius-card;
        box-shadow: $shadow-card;

        &__text {
            font-size: 14px;
            color: $text-secondary;
            line-height: 1.8;
            letter-spacing: 0.3px;
        }
    }

    // ===== 标签云 =====
    .tags-section {
        margin: 12px 12px 0;
        padding: 16px 18px;
        background: $bg-card;
        border-radius: $radius-card;
        box-shadow: $shadow-card;
    }

    .tags-group {
        &:not(:last-child) {
            margin-bottom: 14px;
            padding-bottom: 14px;
            border-bottom: 1px solid $border-light;
        }

        &__label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: $text-primary;
            margin-bottom: 8px;
        }

        &__list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
    }

    .tag {
        padding: 4px 14px;
        font-size: 12px;
        border-radius: 14px;
        line-height: 1.4;

        &--hobby {
            color: #4A4A5A;
            background: $bg-page;
            border: 1px solid $border-light;
        }

        &--personality {
            color: #6C5B7B;
            background: rgba(108, 91, 123, 0.08);
            border: 1px solid rgba(108, 91, 123, 0.12);
        }

        &--weekend {
            color: #2D7D7D;
            background: rgba(45, 125, 125, 0.08);
            border: 1px solid rgba(45, 125, 125, 0.12);
        }
    }

    // ===== 详细资料 =====
    .detail-card {
        margin: 12px 12px 0;
        padding: 16px 18px;
        background: $bg-card;
        border-radius: $radius-card;
        box-shadow: $shadow-card;

        &__title {
            font-size: 15px;
            font-weight: 600;
            color: $text-primary;
            margin-bottom: 12px;
        }

        &__grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 16px;
        }
    }

    .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid rgba($border-light, 0.5);

        &:nth-last-child(1),
        &:nth-last-child(2) {
            border-bottom: none;
        }

        &__label {
            font-size: 13px;
            color: $text-helper;
        }

        &__value {
            font-size: 13px;
            color: $text-primary;
            font-weight: 500;
        }
    }

    // ===== 人生剧本 =====
    .script-card {
        margin: 12px 12px 0;
        padding: 16px 18px;
        background: linear-gradient(135deg, #F8F9FA, #F0F2F5);
        border-radius: $radius-card;
        border: 1px solid rgba($primary-color, 0.2);

        &__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
        }

        &__title {
            font-size: 15px;
            font-weight: 600;
            color: $text-primary;
        }

        &__badge {
            padding: 4px 14px;
            font-size: 12px;
            font-weight: 600;
            border-radius: 14px;

            &.badge--career {
                color: #1976D2;
                background: rgba(25, 118, 210, 0.1);
            }

            &.badge--stable {
                color: #2E7D32;
                background: rgba(46, 125, 50, 0.1);
            }

            &.badge--romantic {
                color: #C62828;
                background: rgba(198, 40, 40, 0.08);
            }

            &.badge--free {
                color: #6A1B9A;
                background: rgba(106, 27, 154, 0.08);
            }
        }

        &__desc {
            font-size: 13px;
            color: $text-secondary;
            line-height: 1.7;
            display: block;
            margin-bottom: 10px;
        }

        &__tags {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
    }

    .script-tag {
        padding: 2px 12px;
        font-size: 11px;
        color: $primary-color;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 10px;
    }

    // ===== 三观态度 =====
    .values-card {
        margin: 12px 12px 0;
        padding: 16px 18px;
        background: $bg-card;
        border-radius: $radius-card;
        box-shadow: $shadow-card;

        &__title {
            font-size: 15px;
            font-weight: 600;
            color: $text-primary;
            margin-bottom: 12px;
        }

        &__list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
    }

    .value-item {
        display: flex;
        gap: 12px;
        padding: 8px 0;
        border-bottom: 1px solid $border-light;

        &:last-child {
            border-bottom: none;
        }

        &__label {
            width: 48px;
            flex-shrink: 0;
            font-size: 13px;
            color: $text-helper;
            padding-top: 1px;
        }

        &__text {
            flex: 1;
            font-size: 13px;
            color: $text-secondary;
            line-height: 1.5;
        }
    }

    // ===== 期待的另一半 =====
    .expect-card {
        margin: 12px 12px 0;
        padding: 16px 18px;
        background: linear-gradient(135deg, #FFF8F0, #FFF0E8);
        border-radius: $radius-card;
        border: 1px solid rgba(255, 183, 77, 0.2);

        &__title {
            font-size: 15px;
            font-weight: 600;
            color: $text-primary;
            margin-bottom: 10px;
        }

        &__tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
    }

    .expect-tag {
        padding: 5px 14px;
        font-size: 12px;
        color: #E65100;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 14px;
        border: 1px solid rgba(255, 183, 77, 0.3);
    }

    // ===== 相册 =====
    .album-card {
        margin: 12px 12px 0;
        padding: 16px 18px;
        background: $bg-card;
        border-radius: $radius-card;
        box-shadow: $shadow-card;

        &__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        &__title {
            font-size: 15px;
            font-weight: 600;
            color: $text-primary;
        }

        &__count {
            font-size: 12px;
            color: $text-helper;
        }

        &__grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 4px;
            position: relative;
        }

        &__item {
            width: 100%;
            aspect-ratio: 1;
            border-radius: 6px;
            background: $bg-page;
            cursor: pointer;

            &:active {
                opacity: 0.85;
            }
        }

        &__more {
            position: absolute;
            right: 4px;
            bottom: 4px;
            width: calc(33.33% - 4px);
            aspect-ratio: 1;
            border-radius: 6px;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;

            &:active {
                opacity: 0.8;
            }
        }
    }

    // ===== 动态 =====
    .post-card {
        margin: 12px 12px 0;
        padding: 16px 18px;
        background: $bg-card;
        border-radius: $radius-card;
        box-shadow: $shadow-card;

        &__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        &__title {
            font-size: 15px;
            font-weight: 600;
            color: $text-primary;
        }

        &__more {
            font-size: 12px;
            color: $primary-color;
            cursor: pointer;

            &:active {
                opacity: 0.7;
            }
        }

        &__grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
        }
    }

    .post-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;

        &:active {
            opacity: 0.85;
        }

        &__image {
            width: 100%;
            height: 100%;
            background: $bg-page;
        }

        &__overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 8px 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
        }

        &__stats {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #FFFFFF;
            font-size: 11px;

            .icon {
                font-size: 13px;
            }
        }

        &__badge {
            padding: 1px 8px;
            font-size: 9px;
            color: #FFFFFF;
            background: linear-gradient(90deg, #FFB74D, #FF9800);
            border-radius: 8px;
        }
    }

    // ===== 底部占位 =====
    .bottom-placeholder {
        height: 10px;
    }

    // ===== 编辑资料悬浮按钮（右下角） =====
    .edit-fab {
        position: fixed;
        bottom: 80px;
        right: 16px;
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, $primary-color, $primary-dark);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba($primary-color, 0.45);
        z-index: 100;
        cursor: pointer;
        transition: all 0.25s ease;

        &:active {
            transform: scale(0.88);
            box-shadow: 0 2px 12px rgba($primary-color, 0.3);
        }

        &__icon {
            font-size: 26px;
            color: #FFFFFF;
            line-height: 1;
        }
    }
</style>