<template>
    <view class="match-page">
        <!-- 顶部导航栏：固定不滚动 -->
        <view class="match-navbar">
            <view class="match-navbar__title">匹配</view>
            <view class="match-navbar__right">
                <view class="match-navbar__quota">
                    <text class="match-navbar__quota-text">今日剩余</text>
                    <text class="match-navbar__quota-num">{{ remainQuota }}</text>
                    <text class="match-navbar__quota-text">次</text>
                </view>
                <text class="match-navbar__icon icon icon-filter" @click="showFilterPanel = true"></text>
            </view>
        </view>

        <!-- 快速筛选栏：固定不滚动 -->
        <view class="match-filter">
            <scroll-view scroll-x class="match-filter__scroll" show-scrollbar="false">
                <view class="match-filter__tags">
                    <view v-for="(filter, index) in filterOptions"
                          :key="index"
                          class="match-filter__tag"
                          :class="{ 'match-filter__tag--active': filter.active }"
                          @click="toggleFilter(index)">
                        {{ filter.label }}
                    </view>
                </view>
            </scroll-view>
        </view>

        <!-- 匹配主内容区：仅此处可滚动 -->
        <view class="match-main" v-if="currentMatchUser">
            <!-- 可滚动内容区 -->
            <scroll-view scroll-y class="match-scroll" show-scrollbar="false">
                <!-- 纯净头图 -->
                <view class="match-hero" @click="openAlbumDrawer">
                    <image class="match-hero__image"
                           :src="currentMatchUser.avatar"
                           mode="aspectFill" />
                    <view class="match-hero__tip">
                        <text class="icon icon-image"></text>
                        点击查看完整相册
                    </view>
                </view>

                <!-- 资料内容区 -->
                <view class="match-content">
                    <!-- 基础信息：昵称+性别+官方认证徽章 同行 -->
                    <view class="match-base">
                        <view class="match-base__header">
                            <text class="match-base__name">{{ currentMatchUser.name }}</text>
                            <!-- 性别图标改用通用字符，避免图标库缺失 -->
                            <text class="match-base__gender">♀</text>
                            <!-- 官方认证小徽章 -->
                            <view class="header-auth-badges">
                                <view class="header-auth-badge" v-if="currentMatchUser.auth.realName">
                                    <text class="icon icon-check"></text>实名
                                </view>
                                <view class="header-auth-badge" v-if="currentMatchUser.auth.education">
                                    <text class="icon icon-check"></text>学历
                                </view>
                                <view class="header-auth-badge header-auth-badge--work" v-if="currentMatchUser.auth.work">
                                    <text class="icon icon-check"></text>工作
                                </view>
                            </view>
                        </view>

                        <view class="match-base__meta">
                            {{ currentMatchUser.age }}岁 · {{ currentMatchUser.height }}cm · {{ currentMatchUser.education }} · {{ currentMatchUser.occupation }}
                        </view>

                        <!-- 趣味勋章：左对齐，消除左侧留白 -->
                        <view class="match-base__badges">
                            <view class="fun-medals">
                                <view v-for="(medal, idx) in currentMatchUser.showMedals"
                                      :key="idx"
                                      class="medal-tag"
                                      :class="'medal-tag--' + medal.type">
                                    <text class="icon" :class="medal.icon"></text>
                                    {{ medal.name }}
                                </view>
                            </view>
                        </view>

                        <view class="match-base__location">
                            <text class="icon icon-location"></text>
                            {{ currentMatchUser.district }}
                        </view>
                    </view>

                    <!-- 个人简介 -->
                    <view class="match-bio">
                        {{ currentMatchUser.bio }}
                    </view>

                    <!-- 匹配氛围感文案：仅双方都完成测试时显示 -->
                    <view class="match-slogan" v-if="canShowMatchSlogan">
                        <text class="icon icon-lightbulb"></text>
                        <text>{{ currentMatchUser.matchSlogan }}</text>
                    </view>

                    <!-- 三层标签体系 -->
                    <view class="match-tags">
                        <view class="tags-row">
                            <text class="tags-label">周末日常</text>
                            <view class="tags-list">
                                <text v-for="tag in currentMatchUser.weekendTags" :key="'w'+tag" class="tag tag--weekend">{{ tag }}</text>
                            </view>
                        </view>
                        <view class="tags-row">
                            <text class="tags-label">兴趣爱好</text>
                            <view class="tags-list">
                                <text v-for="tag in currentMatchUser.hobbyTags" :key="'h'+tag" class="tag tag--hobby">{{ tag }}</text>
                            </view>
                        </view>
                        <view class="tags-row">
                            <text class="tags-label">性格特质</text>
                            <view class="tags-list">
                                <text v-for="tag in currentMatchUser.personalityTags" :key="'p'+tag" class="tag tag--personality">{{ tag }}</text>
                            </view>
                        </view>
                    </view>

                    <!-- 个人资料 -->
                    <view class="match-section">
                        <view class="match-section__title">个人资料</view>
                        <view class="match-profile__grid">
                            <view class="match-profile__item">
                                {{ currentMatchUser.birthYear }}年 · {{ currentMatchUser.constellation }}
                            </view>
                            <view class="match-profile__item">
                                {{ currentMatchUser.height }}cm · {{ currentMatchUser.weight }}kg
                            </view>
                            <view class="match-profile__item">
                                学历：{{ currentMatchUser.education }}
                            </view>
                            <view class="match-profile__item">
                                职业：{{ currentMatchUser.career }}
                            </view>
                            <view class="match-profile__item">
                                籍贯：{{ currentMatchUser.hometown }}
                            </view>
                            <view class="match-profile__item">
                                婚况：{{ currentMatchUser.maritalStatus }}
                            </view>
                            <view class="match-profile__item">
                                年收入：{{ currentMatchUser.income }}
                            </view>
                        </view>
                        <view class="match-profile__tags">
                            <text v-for="tag in currentMatchUser.lifeTags" :key="tag" class="tag tag--life">{{ tag }}</text>
                        </view>
                    </view>

                    <!-- 人生剧本匹配体系 -->
                    <view class="match-section match-script">
                        <view class="match-section__header">
                            <view class="match-section__title">人生剧本</view>
                            <text class="match-script__entry" :class="{ 'is-disabled': !selfHasTest }" @click="checkScriptMatch">
                                {{ scriptEntryText }} <text class="icon icon-arrow-right"></text>
                            </text>
                        </view>
                        <view class="match-script__card">
                            <view class="match-script__type">
                                <text class="match-script__label">TA的剧本</text>
                                <text class="match-script__name">{{ currentMatchUser.lifeScript.name }}</text>
                            </view>
                            <text class="match-script__desc">{{ currentMatchUser.lifeScript.desc }}</text>
                            <view class="match-script__tags">
                                <text v-for="tag in currentMatchUser.lifeScript.tags" :key="tag" class="script-tag">{{ tag }}</text>
                            </view>
                        </view>
                    </view>

                    <!-- 三观态度 + 测契合度入口 -->
                    <view class="match-section match-values">
                        <view class="match-section__header">
                            <view class="match-section__title">三观态度</view>
                            <text class="match-values__entry" :class="{ 'is-disabled': !selfHasTest }" @click="testMatch">
                                {{ valuesEntryText }} <text class="icon icon-arrow-right"></text>
                            </text>
                        </view>
                        <view class="match-values__list">
                            <view class="match-values__item">
                                <text class="match-values__label">恋爱观</text>
                                <text class="match-values__text">{{ currentMatchUser.values.love }}</text>
                            </view>
                            <view class="match-values__item">
                                <text class="match-values__label">消费观</text>
                                <text class="match-values__text">{{ currentMatchUser.values.consume }}</text>
                            </view>
                            <view class="match-values__item">
                                <text class="match-values__label">生活观</text>
                                <text class="match-values__text">{{ currentMatchUser.values.life }}</text>
                            </view>
                        </view>
                    </view>

                    <!-- 期待的另一半 -->
                    <view class="match-section">
                        <view class="match-section__title">Ta期待的另一半</view>
                        <view class="match-expect__tags">
                            <text v-for="tag in currentMatchUser.expectTags" :key="tag" class="tag tag--expect">{{ tag }}</text>
                        </view>
                    </view>

                    <!-- 底部信息栏：IP属地 + 举报拉黑 -->
                    <view class="match-footer">
                        <text class="match-footer__ip">IP属地：{{ currentMatchUser.ipLocation }}</text>
                        <view class="match-footer__ops">
                            <text class="match-footer__link" @click="handleReport">举报</text>
                            <text class="match-footer__split">·</text>
                            <text class="match-footer__link" @click="handleBlock">拉黑</text>
                        </view>
                    </view>
                </view>
            </scroll-view>

            <!-- 底部固定三按钮：永久悬浮不被遮挡 -->
            <view class="match-actions">
                <button class="match-actions__btn match-actions__btn--skip" @click="handleSkip">
                    <text class="icon icon-close"></text>
                </button>
                <button class="match-actions__btn match-actions__btn--main"
                        @click="handleContact"
                        :disabled="!isAuthenticated">
                    <text class="icon icon-wechat"></text>
                    交换联系方式
                </button>
                <button class="match-actions__btn match-actions__btn--like"
                        @click="handleLike"
                        :disabled="!isAuthenticated">
                    <text class="icon icon-heart"></text>
                </button>
            </view>

            <!-- 未实名蒙版 -->
            <view v-if="!isAuthenticated" class="match-mask" @click="showAuthModal = true">
                <view class="match-mask__content">
                    <text class="match-mask__title">完成实名认证</text>
                    <text class="match-mask__desc">开启异性精准匹配</text>
                    <button class="match-mask__btn">立即认证</button>
                </view>
            </view>
        </view>

        <!-- 空状态 -->
        <view v-if="!currentMatchUser" class="match-empty">
            <image class="match-empty__image" src="/static/images/empty-match.png" mode="aspectFit" />
            <text class="match-empty__title">今日推荐已看完</text>
            <text class="match-empty__desc">去广场逛逛，发现更多有趣的人</text>
            <button class="match-empty__btn" @click="goToSquare">去广场逛逛</button>
        </view>

        <!-- 相册抽屉 -->
        <view class="album-drawer" :class="{ 'album-drawer--show': showAlbum }" @click="closeAlbumDrawer">
            <view class="album-drawer__content" @click.stop>
                <view class="album-drawer__header">
                    <text class="album-drawer__title">Ta的相册</text>
                    <text class="icon icon-close" @click="closeAlbumDrawer"></text>
                </view>
                <scroll-view scroll-y class="album-drawer__scroll" show-scrollbar="false">
                    <view class="album-grid">
                        <image v-for="(img, idx) in currentMatchUser?.album"
                               :key="idx"
                               class="album-grid__item"
                               :src="img"
                               mode="aspectFill"
                               @click="previewAlbum(idx)" />
                    </view>
                </scroll-view>
            </view>
        </view>

        <!-- 筛选面板 -->
        <FilterPanel v-model:visible="showFilterPanel" @apply="applyFilter" />

        <!-- 认证引导弹窗 -->
        <CustomModal v-model:visible="showAuthModal"
                     title="实名认证"
                     content="完成实名认证后，才能进行匹配和互动，享受更安全的交友体验"
                     confirm-text="去认证"
                     cancel-text="稍后"
                     @confirm="goToRealName" />

        <!-- 匹配成功弹窗 -->
        <CustomModal v-model:visible="showMatchSuccess"
                     title="匹配成功"
                     confirm-text="发个招呼"
                     cancel-text="稍后再说"
                     @confirm="goToChat">
            <view class="match-success-content">
                <view class="match-success__avatars">
                    <image class="match-success__avatar" :src="selfAvatar" mode="aspectFill" />
                    <view class="match-success__divider"></view>
                    <image class="match-success__avatar" :src="currentMatchUser?.avatar" mode="aspectFill" />
                </view>
                <text class="match-success__names">我 和 {{ currentMatchUser?.name }} 配对成功</text>
                <text class="match-success__hint">{{ currentMatchUser?.matchSlogan }}</text>
            </view>
        </CustomModal>
    </view>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'
    import CustomModal from '@/components/common/CustomModal.vue'
    import FilterPanel from './components/FilterPanel.vue'

    // ===== 状态 =====
    const isAuthenticated = ref(true)
    const remainQuota = ref(10)
    const selfHasTest = ref(true)
    const showFilterPanel = ref(false)
    const showAuthModal = ref(false)
    const showMatchSuccess = ref(false)
    const showAlbum = ref(false)
    const selfAvatar = ref('https://picsum.photos/200/200?random=30')

    const filterOptions = ref([
        { label: '全部', active: true, value: 'all' },
        { label: '同城', active: false, value: 'city' },
        { label: '本科+', active: false, value: 'education' },
        { label: '认证用户', active: false, value: 'auth' },
        { label: '近期活跃', active: false, value: 'active' }
    ])

    // 匹配用户池
    const matchUsers = ref([
        {
            id: 1,
            name: '林小鹿',
            gender: 'female',
            age: 24,
            birthYear: '00',
            height: 165,
            weight: 48,
            constellation: '巨蟹座',
            education: '本科',
            career: '互联网产品经理',
            avatar: 'https://picsum.photos/800/1000?random=101',
            occupation: '教师',
            district: '朝阳区',
            hometown: '天津',
            maritalStatus: '未婚',
            income: '15-20W',
            ipLocation: '北京市',
            hasCompletedTest: true,
            bio: '慢热型，希望遇到能一起吃很多饭、聊很多天的人',
            matchSlogan: '都爱周末探店的你们，大概率能吃到一起、聊到一块',
            weekendTags: ['探店觅食', '逛展看剧', '居家观影'],
            hobbyTags: ['摄影', '旅行', '咖啡', '阅读'],
            personalityTags: ['慢热', '温柔', '细节控', '共情力强'],
            lifeTags: ['无车', '一房', '不吸烟', '不喝酒'],
            expectTags: ['22-30岁', '未婚', '175cm+', '本科及以上', '情绪稳定', '三观正', '同城'],
            showMedals: [
                { name: '双一流守护者', icon: 'icon-medal-gold', type: 'gold' },
                { name: '大厂搬砖人', icon: 'icon-briefcase', type: 'blue' }
            ],
            lifeScript: {
                name: '烟火安居型',
                desc: '追求稳定的生活节奏，看重家庭与日常的幸福感，倾向于在熟悉的城市定居发展，一步步经营自己的小日子。',
                tags: ['定居发展', '安稳踏实', '家庭优先', '细水长流']
            },
            values: {
                love: '认真奔结婚，不接受快餐式恋爱，希望感情是双向奔赴慢慢升温',
                consume: '适度消费，注重性价比，不盲目攀比，愿意为爱好和体验买单',
                life: '追求安稳的小幸福，工作之余享受生活，不卷也不躺平'
            },
            auth: { realName: true, education: true, work: false },
            album: [
                'https://picsum.photos/400/400?random=11',
                'https://picsum.photos/400/400?random=12',
                'https://picsum.photos/400/400?random=13',
                'https://picsum.photos/400/400?random=14',
                'https://picsum.photos/400/400?random=15',
                'https://picsum.photos/400/400?random=16'
            ]
        },
        {
            id: 2,
            name: '陈橘子',
            gender: 'female',
            age: 26,
            birthYear: '98',
            height: 168,
            weight: 50,
            constellation: '双子座',
            education: '研究生',
            career: '金融分析师',
            avatar: 'https://picsum.photos/800/1000?random=102',
            occupation: '财务',
            district: '浦东新区',
            hometown: '杭州',
            maritalStatus: '未婚',
            income: '20-30W',
            ipLocation: '上海市',
            hasCompletedTest: true,
            bio: '理性与浪漫各一半，喜欢有质感的生活',
            matchSlogan: '一个规划行程一个负责惊喜，你们的相处节奏会很合拍',
            weekendTags: ['健身运动', '咖啡探店', '城市漫步'],
            hobbyTags: ['瑜伽', '阅读', '音乐', '理财'],
            personalityTags: ['独立', '理性', '自律', '目标感强'],
            lifeTags: ['无车', '无房', '不吸烟', '偶尔喝酒'],
            expectTags: ['24-32岁', '未婚', '175cm+', '本科及以上', '上进自律', '情绪稳定'],
            showMedals: [
                { name: '学术钻研人', icon: 'icon-graduation', type: 'purple' },
                { name: '职场精英', icon: 'icon-briefcase', type: 'blue' }
            ],
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
            auth: { realName: true, education: true, work: true },
            album: [
                'https://picsum.photos/400/400?random=21',
                'https://picsum.photos/400/400?random=22',
                'https://picsum.photos/400/400?random=23',
                'https://picsum.photos/400/400?random=24',
                'https://picsum.photos/400/400?random=25',
                'https://picsum.photos/400/400?random=26'
            ]
        }
    ])

    const currentIndex = ref(0)
    const currentMatchUser = computed(() => matchUsers.value[currentIndex.value] || null)

    // 匹配推荐语显示条件
    const canShowMatchSlogan = computed(() => {
        return selfHasTest.value && currentMatchUser.value?.hasCompletedTest && currentMatchUser.value?.matchSlogan
    })

    // 三观入口文案
    const valuesEntryText = computed(() => {
        if (!selfHasTest.value) return '完成测试查看匹配'
        if (!currentMatchUser.value?.hasCompletedTest) return '对方暂未完成测试'
        return '查看契合度详情'
    })

    // 人生剧本入口文案
    const scriptEntryText = computed(() => {
        if (!selfHasTest.value) return '完成测试查看匹配'
        if (!currentMatchUser.value?.hasCompletedTest) return '对方暂未完成测试'
        return '查看剧本匹配度'
    })

    // ===== 操作方法 =====
    const handleLike = () => {
        if (!isAuthenticated.value) {
            showAuthModal.value = true
            return
        }
        if (Math.random() < 0.3) {
            showMatchSuccess.value = true
        } else {
            uni.showToast({ title: '已喜欢', icon: 'success' })
        }
        nextUser()
    }

    const handleSkip = () => {
        nextUser()
    }

    const handleContact = () => {
        if (!isAuthenticated.value) {
            showAuthModal.value = true
            return
        }
        uni.showToast({ title: '需双向喜欢后解锁联系方式', icon: 'none' })
    }

    const nextUser = () => {
        if (currentIndex.value < matchUsers.value.length - 1) {
            currentIndex.value++
        } else {
            currentIndex.value = -1
        }
    }

    const toggleFilter = (index) => {
        filterOptions.value.forEach((item, i) => {
            item.active = i === index
        })
        applyFilter()
    }

    const applyFilter = () => {
        currentIndex.value = 0
    }

    // ===== 举报与拉黑 =====
    const handleReport = () => {
        uni.showActionSheet({
            itemList: ['虚假资料', '骚扰行为', '广告营销', '其他违规'],
            success: () => {
                uni.showToast({ title: '举报已提交，我们会尽快核实', icon: 'none' })
            }
        })
    }

    const handleBlock = () => {
        uni.showModal({
            title: '确认拉黑',
            content: '拉黑后将不再收到该用户的推荐，且无法恢复',
            confirmColor: '#FF4757',
            success: (res) => {
                if (res.confirm) {
                    uni.showToast({ title: '已拉黑', icon: 'success' })
                    nextUser()
                }
            }
        })
    }

    // ===== 相册抽屉 =====
    const openAlbumDrawer = () => {
        showAlbum.value = true
    }

    const closeAlbumDrawer = () => {
        showAlbum.value = false
    }

    const previewAlbum = (index) => {
        uni.previewImage({
            urls: currentMatchUser.value.album,
            current: index
        })
    }

    // ===== 契合度与剧本匹配 =====
    const testMatch = () => {
        if (!selfHasTest.value) {
            uni.showToast({ title: '进入三观测试页', icon: 'none' })
        } else if (!currentMatchUser.value?.hasCompletedTest) {
            uni.showToast({ title: '对方暂未完成测试', icon: 'none' })
        } else {
            uni.showToast({ title: '进入契合度详情', icon: 'none' })
        }
    }

    const checkScriptMatch = () => {
        if (!selfHasTest.value) {
            uni.showToast({ title: '进入剧本测试页', icon: 'none' })
        } else if (!currentMatchUser.value?.hasCompletedTest) {
            uni.showToast({ title: '对方暂未完成测试', icon: 'none' })
        } else {
            uni.showToast({ title: '查看剧本匹配详情', icon: 'none' })
        }
    }

    // ===== 跳转方法 =====
    const goToSquare = () => {
        uni.switchTab({ url: '/pages/square/index' })
    }

    const goToRealName = () => {
        uni.navigateTo({ url: '/pages/auth/realname' })
    }

    const goToChat = () => {
        uni.showToast({ title: '招呼功能开发中', icon: 'none' })
    }

    onMounted(() => {
        console.log('匹配页加载完成')
    })
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';
    @import '@/styles/mixins.scss';

    /* 核心修复：外层容器禁止滚动，高度占满全屏 */
    .match-page {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: $bg-page;
        overflow: hidden; /* 彻底禁止外层滚动 */
        box-sizing: border-box;
    }

    // ----- 顶部导航栏：固定不收缩 -----
    .match-navbar {
        width: 100%;
        flex-shrink: 0; /* 禁止被压缩 */
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px $page-padding-x;
        background-color: rgba(255, 255, 255, 0.85);
        @include glass;
        border-bottom: 1px solid rgba($border-light, 0.5);
        box-sizing: border-box;

        &__title {
            font-size: 17px;
            font-weight: 500;
            color: $text-primary;
            letter-spacing: 1px;
        }

        &__right {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        &__quota {
            display: flex;
            align-items: baseline;
            gap: 2px;
        }

        &__quota-text {
            font-size: 12px;
            color: $text-helper;
        }

        &__quota-num {
            font-size: 18px;
            font-weight: $font-weight-medium;
            color: $primary-color;
            line-height: 1;
        }

        &__icon {
            font-size: 20px;
            color: $text-secondary;
            cursor: pointer;

            &:active {
                opacity: 0.6;
            }
        }
    }

    // ----- 筛选栏：固定不收缩 -----
    .match-filter {
        width: 100%;
        flex-shrink: 0; /* 禁止被压缩 */
        display: flex;
        align-items: center;
        padding: $spacing-sm $page-padding-x;
        background-color: $bg-card;
        border-bottom: 1px solid $border-light;
        box-sizing: border-box;

        &__scroll {
            flex: 1;
            white-space: nowrap;
        }

        &__tags {
            display: inline-flex;
            gap: 8px;
        }

        &__tag {
            display: inline-block;
            padding: 4px 14px;
            font-size: $font-size-xs;
            color: $text-secondary;
            background-color: $bg-page;
            border-radius: 16px;
            white-space: nowrap;
            transition: all $duration-fast ease;

            &--active {
                color: $primary-color;
                background-color: $primary-light-bg;
                border: 1px solid $primary-color;
            }
        }
    }

    // ----- 主内容区：占满剩余空间，内部滚动 -----
    .match-main {
        width: 100%;
        flex: 1; /* 占满剩余高度 */
        position: relative;
        overflow: hidden; /* 超出部分隐藏，仅内部滚动 */
        min-height: 0; /* 修复flex子元素滚动失效问题 */
    }

    .match-scroll {
        width: 100%;
        height: 100%;
    }

    // ----- 纯净头图 -----
    .match-hero {
        position: relative;
        width: 100%;
        height: 220px;
        flex-shrink: 0;
        cursor: pointer;

        &__image {
            width: 100%;
            height: 100%;
            background-color: $bg-page;
        }

        &__tip {
            position: absolute;
            bottom: 16px;
            right: 16px;
            padding: 4px 10px;
            background-color: rgba(0, 0, 0, 0.5);
            color: #FFFFFF;
            font-size: 11px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 4px;

            .icon {
                font-size: 12px;
            }
        }
    }

    // ----- 资料内容区 -----
    .match-content {
        background-color: $bg-page;
        border-radius: 16px 16px 0 0;
        margin-top: -16px;
        position: relative;
        z-index: 2;
        padding-bottom: 0;
    }

    // 通用模块
    .match-section {
        background-color: $bg-card;
        margin-bottom: 8px;
        padding: $spacing-md $page-padding-x;
    }

    .match-section__title {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $text-primary;
        margin-bottom: $spacing-sm;
    }

    .match-section__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: $spacing-sm;
    }

    .is-disabled {
        color: $text-helper !important;
        cursor: not-allowed;
    }

    // ----- 基础信息 -----
    .match-base {
        padding: $spacing-md $page-padding-x $spacing-sm;
        background-color: $bg-card;
        margin-bottom: 8px;
        border-radius: 16px 16px 0 0;

        &__header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: $spacing-xs;
            flex-wrap: nowrap;
        }

        &__name {
            font-size: 22px;
            font-weight: $font-weight-medium;
            color: $text-primary;
            flex-shrink: 0;
        }

        &__gender {
            font-size: 20px;
            color: #FF6B81;
            flex-shrink: 0;
            line-height: 1;
        }

        &__meta {
            font-size: $font-size-sm;
            color: $text-secondary;
            margin-bottom: $spacing-sm;
        }
        /* 趣味勋章：左对齐 */
        &__badges {
            display: flex;
            align-items: center;
            justify-content: flex-start; /* 左对齐消除留白 */
            margin-bottom: $spacing-sm;
        }

        &__location {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 10px;
            font-size: $font-size-xs;
            color: $text-secondary;
            border: 1px solid $border-light;
            border-radius: 12px;
        }
    }

    // 昵称行官方认证小徽章
    .header-auth-badges {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
    }

    .header-auth-badge {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 2px 6px;
        font-size: 10px;
        color: #FFFFFF;
        border-radius: 4px;
        white-space: nowrap;

        .icon {
            font-size: 9px;
        }

        background: linear-gradient(90deg, #2ED573, #1EBE60);

        &:nth-child(2) {
            background: linear-gradient(90deg, #4FACFE, #0099FF);
        }

        &--work {
            background: linear-gradient(90deg, #FFA726, #FB8C00) !important;
        }
    }

    // 趣味勋章：左对齐
    .fun-medals {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        justify-content: flex-start; /* 左对齐 */
    }

    // 趣味勋章标签
    .medal-tag {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 3px 8px;
        font-size: 11px;
        border-radius: 10px;
        white-space: nowrap;
        flex-shrink: 0;

        .icon {
            font-size: 11px;
        }

        &--gold {
            color: #B8860B;
            background-color: rgba(255, 215, 0, 0.15);
        }

        &--blue {
            color: #1976D2;
            background-color: rgba(25, 118, 210, 0.1);
        }

        &--purple {
            color: #7B1FA2;
            background-color: rgba(123, 31, 162, 0.1);
        }

        &--orange {
            color: #E65100;
            background-color: rgba(230, 81, 0, 0.1);
        }

        &--green {
            color: #2E7D32;
            background-color: rgba(46, 125, 50, 0.1);
        }
    }

    // ----- 简介 -----
    .match-bio {
        padding: 0 $page-padding-x $spacing-sm;
        background-color: $bg-card;
        font-size: $font-size-sm;
        color: $text-secondary;
        line-height: 1.6;
        margin-bottom: 8px;
    }

    // ----- 匹配氛围感文案 -----
    .match-slogan {
        margin: 0 $page-padding-x $spacing-md;
        padding: 10px 12px;
        background: linear-gradient(135deg, $primary-light-bg 0%, rgba(168, 184, 154, 0.15) 100%);
        border-radius: 10px;
        font-size: $font-size-xs;
        color: $primary-color;
        line-height: 1.5;
        display: flex;
        align-items: flex-start;
        gap: 6px;

        .icon {
            font-size: 14px;
            margin-top: 1px;
            flex-shrink: 0;
        }
    }

    // ----- 三层标签 -----
    .match-tags {
        padding: $spacing-sm $page-padding-x $spacing-md;
        background-color: $bg-card;
        margin-bottom: 8px;
    }

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

        &--weekend {
            color: $primary-color;
            background-color: $primary-light-bg;
        }

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

    // ----- 个人资料（纯文字） -----
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

    // ----- 人生剧本匹配体系 -----
    .match-script {
        &__entry {
            font-size: $font-size-xs;
            color: $primary-color;

            .icon {
                margin-left: 2px;
                font-size: 12px;
            }
        }

        &__card {
            padding: $spacing-sm;
            background: linear-gradient(135deg, rgba(168, 184, 154, 0.1) 0%, rgba(186, 168, 200, 0.1) 100%);
            border-radius: 12px;
            border: 1px solid rgba($primary-color, 0.15);
        }

        &__type {
            display: flex;
            align-items: baseline;
            gap: $spacing-xs;
            margin-bottom: 6px;
        }

        &__label {
            font-size: 11px;
            color: $text-helper;
        }

        &__name {
            font-size: $font-size-md;
            font-weight: $font-weight-medium;
            color: $primary-color;
        }

        &__desc {
            font-size: $font-size-xs;
            color: $text-secondary;
            line-height: 1.6;
            margin-bottom: $spacing-sm;
            display: block;
        }

        &__tags {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }
    }

    .script-tag {
        padding: 2px 8px;
        font-size: 10px;
        color: $primary-color;
        background-color: rgba(255, 255, 255, 0.6);
        border-radius: 8px;
    }

    // ----- 三观态度 -----
    .match-values {
        &__entry {
            font-size: $font-size-xs;
            color: $primary-color;

            .icon {
                margin-left: 2px;
                font-size: 12px;
            }
        }

        &__list {
            display: flex;
            flex-direction: column;
            gap: $spacing-sm;
        }

        &__item {
            display: flex;
            gap: $spacing-sm;
        }

        &__label {
            width: 50px;
            flex-shrink: 0;
            font-size: $font-size-sm;
            color: $text-helper;
            padding-top: 1px;
        }

        &__text {
            flex: 1;
            font-size: $font-size-sm;
            color: $text-secondary;
            line-height: 1.5;
        }
    }

    // ----- 择偶期待 -----
    .match-expect__tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    // ----- 底部信息栏：预留足够高度，不被按钮遮挡 -----
    .match-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px $page-padding-x calc(90px + env(safe-area-inset-bottom));
        font-size: 11px;
        color: $text-helper;
        background-color: $bg-card;
        margin-top: 8px;

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

    // ----- 底部操作栏：绝对固定在底部 -----
    .match-actions {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 99; /* 提高层级确保不被遮挡 */
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px $page-padding-x calc(12px + env(safe-area-inset-bottom));
        background-color: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-top: 1px solid $border-light;

        &__btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: none;
            transition: all $duration-fast ease;
            gap: 2px;

            &:active:not(:disabled) {
                transform: scale(0.92);
            }

            &:disabled {
                opacity: 0.5;
            }
            // 跳过：圆形按钮
            &--skip {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background-color: #F5F5F5;
                color: $text-secondary;
                flex-shrink: 0;

                .icon {
                    font-size: 20px;
                }
            }
            // 喜欢：圆形按钮
            &--like {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background-color: #FFF0F2;
                color: #FF4757;
                flex-shrink: 0;

                .icon {
                    font-size: 20px;
                }
            }
            // 主按钮：加宽，文字一行
            &--main {
                flex: 1;
                height: 48px;
                margin: 0 16px;
                border-radius: 24px;
                background: linear-gradient(90deg, $primary-color, #9DB48E);
                color: #FFFFFF;
                font-size: 15px;
                font-weight: $font-weight-medium;
                flex-direction: row;
                gap: 6px;
                box-shadow: 0 4px 12px rgba(168, 184, 154, 0.4);
                white-space: nowrap;

                .icon {
                    font-size: 18px;
                }
            }
        }
    }

    // ----- 蒙版 -----
    .match-mask {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20;
    }

    .match-mask__content {
        text-align: center;
        padding: $spacing-lg;
    }

    .match-mask__title {
        font-size: $font-size-lg;
        font-weight: $font-weight-medium;
        color: #FFFFFF;
        display: block;
    }

    .match-mask__desc {
        font-size: $font-size-sm;
        color: rgba(255, 255, 255, 0.8);
        display: block;
        margin-top: $spacing-xs;
    }

    .match-mask__btn {
        margin-top: $spacing-md;
        padding: 10px 40px;
        background-color: $primary-color;
        color: #FFFFFF;
        border-radius: 24px;
        font-size: $font-size-sm;
        border: none;
    }

    // ----- 相册抽屉 -----
    .album-drawer {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        visibility: hidden;
        opacity: 0;
        transition: all 0.3s ease;

        &--show {
            visibility: visible;
            opacity: 1;

            .album-drawer__content {
                transform: translateY(0);
            }
        }

        &__content {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 85vh;
            background-color: $bg-page;
            border-radius: 20px 20px 0 0;
            transform: translateY(100%);
            transition: transform 0.3s ease;
            display: flex;
            flex-direction: column;
        }

        &__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px $page-padding-x;
            border-bottom: 1px solid $border-light;
            flex-shrink: 0;
        }

        &__title {
            font-size: $font-size-lg;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__scroll {
            flex: 1;
            padding: $spacing-sm $page-padding-x 40px;
        }
    }

    .album-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;

        &__item {
            width: 100%;
            aspect-ratio: 1;
            border-radius: 8px;
            background-color: $bg-page;
        }
    }

    // ----- 匹配成功弹窗 -----
    .match-success-content {
        text-align: center;
    }

    .match-success__avatars {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $spacing-md;
        margin-bottom: $spacing-md;
    }

    .match-success__avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 2px solid $primary-color;
    }

    .match-success__divider {
        width: 20px;
        height: 1px;
        background-color: $border-light;
    }

    .match-success__names {
        font-size: $font-size-md;
        font-weight: $font-weight-medium;
        color: $text-primary;
        display: block;
    }

    .match-success__hint {
        font-size: $font-size-sm;
        color: $text-helper;
        margin-top: $spacing-xs;
        line-height: 1.5;
        display: block;
    }

    // ----- 空状态 -----
    .match-empty {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-bottom: 100px;

        &__image {
            width: 160px;
            height: 120px;
            margin-bottom: $spacing-md;
        }

        &__title {
            font-size: $font-size-lg;
            font-weight: $font-weight-medium;
            color: $text-primary;
            margin-bottom: $spacing-xs;
        }

        &__desc {
            font-size: $font-size-sm;
            color: $text-helper;
            margin-bottom: $spacing-lg;
        }

        &__btn {
            padding: 10px 40px;
            background-color: $primary-color;
            color: #FFFFFF;
            border-radius: 24px;
            font-size: $font-size-sm;
            border: none;
        }
    }
</style>