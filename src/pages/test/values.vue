<template>
    <view class="test-page">
        <!-- 导航栏 -->
        <view class="test-navbar">
            <text class="test-navbar__back icon icon-arrow-left" @click="goBack"></text>
            <text class="test-navbar__title">三观态度测试</text>
            <text class="test-navbar__step">{{ currentQuestion + 1 }} / {{ questions.length }}</text>
        </view>

        <!-- 进度条 -->
        <view class="test-progress">
            <view class="test-progress__bar" :style="{ width: progressPercent + '%' }"></view>
        </view>

        <!-- 题目区（可滚动） -->
        <scroll-view class="test-content" scroll-y v-if="!isCompleted">
            <view class="test-question">
                <text class="test-question__number">Q{{ currentQuestion + 1 }}</text>
                <text class="test-question__text">{{ questions[currentQuestion].text }}</text>
            </view>

            <view class="test-options">
                <view v-for="(option, idx) in questions[currentQuestion].options"
                      :key="idx"
                      class="test-option"
                      :class="{ 'test-option--selected': selectedOption === idx }"
                      @click="selectOption(idx)">
                    <view class="test-option__radio">
                        <view v-if="selectedOption === idx" class="test-option__radio-inner"></view>
                    </view>
                    <text class="test-option__text">{{ option }}</text>
                </view>
            </view>
        </scroll-view>

        <!-- 结果页 -->
        <scroll-view class="test-result-scroll" scroll-y v-else>
            <view class="test-result">
                <view class="test-result__icon">🌟</view>
                <text class="test-result__title">测试完成！</text>
                <text class="test-result__subtitle">你的三观态度画像已生成</text>

                <view class="test-result__card">
                    <view class="test-result__items">
                        <view class="result-item">
                            <text class="result-item__label">恋爱观</text>
                            <text class="result-item__value">{{ result.love }}</text>
                        </view>
                        <view class="result-item">
                            <text class="result-item__label">消费观</text>
                            <text class="result-item__value">{{ result.consume }}</text>
                        </view>
                        <view class="result-item">
                            <text class="result-item__label">生活观</text>
                            <text class="result-item__value">{{ result.life }}</text>
                        </view>
                    </view>
                </view>

                <view class="test-result__actions">
                    <button class="test-result__btn test-result__btn--primary" @click="handleConfirm">确认并保存</button>
                    <button class="test-result__btn test-result__btn--secondary" @click="handleRetest">重新测试</button>
                </view>

                <view class="test-result__tip">
                    <text class="icon icon-lock"></text>
                    <text>测试结果仅用于匹配推荐，不会对外公开</text>
                </view>
            </view>
        </scroll-view>

        <!-- 底部固定按钮 -->
        <view class="test-footer" v-if="!isCompleted">
            <view class="test-actions">
                <button class="test-actions__btn test-actions__btn--prev"
                        v-if="currentQuestion > 0"
                        @click="prevQuestion">
                    上一题
                </button>
                <button class="test-actions__btn test-actions__btn--next"
                        :disabled="selectedOption === null"
                        @click="nextQuestion">
                    {{ currentQuestion === questions.length - 1 ? '查看结果' : '下一题' }}
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
    import { ref, computed } from 'vue'

    const currentQuestion = ref(0)
    const selectedOption = ref(null)
    const answers = ref([])
    const isCompleted = ref(false)

    const questions = ref([
        {
            text: '你如何看待恋爱中的「物质基础」？',
            options: [
                '物质是爱情的基础，没有经济支撑很难长久',
                '够用就好，更看重两个人的感情和默契',
                '双方都要有独立的经济能力，互不依附',
                '不太在意，爱能战胜一切'
            ]
        },
        {
            text: '周末约会你会选择？',
            options: [
                '去高档餐厅，精致打扮，仪式感拉满',
                '找一家有特色的咖啡馆，安静待一下午',
                '一起去超市买菜，回家做饭',
                '户外活动，散步或骑行'
            ]
        },
        {
            text: '看到喜欢但价格不菲的物品，你会？',
            options: [
                '如果真的很喜欢，会买下来犒劳自己',
                '先放进购物车，等打折或促销再下手',
                '理性评估是否真的需要，不需要就不买',
                '看价格，太贵就不考虑了'
            ]
        },
        {
            text: '你更倾向于什么样的生活节奏？',
            options: [
                '朝九晚五，稳定有规律',
                '自由职业，自己安排时间',
                '拼搏奋斗，趁年轻多赚点钱',
                '随性而为，享受当下'
            ]
        },
        {
            text: '你如何看待「异地恋」？',
            options: [
                '可以接受，只要两个人的心在一起',
                '短期可以，长期不行',
                '完全不能接受，需要朝夕相处',
                '看情况，如果感情够深可以考虑'
            ]
        },
        {
            text: '你认为婚姻中最重要的东西是什么？',
            options: [
                '信任和忠诚',
                '沟通和理解',
                '经济稳定和安全感',
                '共同的兴趣爱好'
            ]
        },
        {
            text: '你如何处理与伴侣的矛盾？',
            options: [
                '冷静下来后主动沟通解决',
                '需要对方先低头，自己不太主动',
                '冷处理，让时间冲淡一切',
                '找朋友倾诉，寻求建议'
            ]
        },
        {
            text: '你希望伴侣如何表达爱意？',
            options: [
                '用行动证明，比如照顾、陪伴',
                '直白地表达，经常说我爱你',
                '送礼物、制造惊喜',
                '尊重和理解我的每一个选择'
            ]
        },
        {
            text: '你对未来的生活品质要求是？',
            options: [
                '要有一定的物质保障，生活体面',
                '精神富足比物质更重要',
                '平衡最好，两者都要兼顾',
                '顺其自然，不刻意追求'
            ]
        },
        {
            text: '你如何看待「门当户对」？',
            options: [
                '有一定道理，家庭背景相似更容易相处',
                '不重要，关键是两个人的三观是否一致',
                '可以参考，但不是决定性因素',
                '完全过时的观念，不认同'
            ]
        },
        {
            text: '如果伴侣和你的消费观念不同，你会？',
            options: [
                '尝试沟通，找到双方都能接受的平衡点',
                '尊重对方，各自管理自己的财务',
                '试图改变对方，让ta认同自己的观点',
                '回避这个问题，不想因此产生矛盾'
            ]
        },
        {
            text: '你理想中的晚年生活是？',
            options: [
                '和老伴一起，过着简单平静的生活',
                '到处旅行，看遍世界美景',
                '和子女住在一起，享受天伦之乐',
                '住在养老社区，和同龄人一起活动'
            ]
        }
    ])

    const progressPercent = computed(() => {
        return ((currentQuestion.value + 1) / questions.value.length) * 100
    })

    const result = ref({
        love: '势均力敌，彼此欣赏',
        consume: '注重品质，理性消费',
        life: '工作生活平衡，保持成长'
    })

    const selectOption = (index) => {
        selectedOption.value = index
    }

    const nextQuestion = () => {
        if (selectedOption.value === null) return

        answers.value.push(selectedOption.value)
        selectedOption.value = null

        if (currentQuestion.value === questions.value.length - 1) {
            calculateResult()
            isCompleted.value = true
        } else {
            currentQuestion.value++
        }
    }

    const prevQuestion = () => {
        if (currentQuestion.value > 0) {
            currentQuestion.value--
            const prevAnswer = answers.value.pop()
            selectedOption.value = prevAnswer !== undefined ? prevAnswer : null
        }
    }

    const calculateResult = () => {
        const loveOptions = ['势均力敌，彼此欣赏', '温柔陪伴，细水长流', '各自独立，互相尊重', '浪漫热烈，充满仪式感']
        const consumeOptions = ['注重品质，理性消费', '精打细算，节俭持家', '及时行乐，享受当下', '投资自己，看重长期价值']
        const lifeOptions = ['工作生活平衡，保持成长', '事业优先，全力拼搏', '生活优先，享受慢节奏', '随遇而安，顺其自然']

        result.value = {
            love: loveOptions[Math.floor(Math.random() * loveOptions.length)],
            consume: consumeOptions[Math.floor(Math.random() * consumeOptions.length)],
            life: lifeOptions[Math.floor(Math.random() * lifeOptions.length)]
        }
    }

    const goBack = () => {
        if (!isCompleted.value && answers.value.length > 0) {
            uni.showModal({
                title: '提示',
                content: '确定要退出吗？测试进度将丢失',
                success: (res) => {
                    if (res.confirm) uni.navigateBack()
                }
            })
        } else {
            uni.navigateBack()
        }
    }

    const handleConfirm = () => {
        uni.showLoading({ title: '保存中...' })
        setTimeout(() => {
            uni.hideLoading()
            uni.showToast({ title: '保存成功', icon: 'success' })
            setTimeout(() => {
                uni.navigateBack()
            }, 500)
        }, 800)
    }

    const handleRetest = () => {
        uni.showModal({
            title: '重新测试',
            content: '重新测试将覆盖当前结果，确定要继续吗？',
            success: (res) => {
                if (res.confirm) {
                    currentQuestion.value = 0
                    selectedOption.value = null
                    answers.value = []
                    isCompleted.value = false
                }
            }
        })
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';

    .test-page {
        min-height: 100vh;
        background: linear-gradient(180deg, #F6F7F5 0%, #FFFFFF 100%);
        display: flex;
        flex-direction: column;
    }

    .test-navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px $page-padding-x;
        padding-top: calc(14px + env(safe-area-inset-top));
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(10px);
        position: sticky;
        top: 0;
        z-index: 10;
        flex-shrink: 0;

        &__back {
            font-size: 20px;
            color: $text-primary;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 50%;

            &:active {
                background: rgba(0, 0, 0, 0.05);
            }
        }

        &__title {
            font-size: 17px;
            font-weight: 600;
            color: $text-primary;
        }

        &__step {
            font-size: 13px;
            color: $text-helper;
            font-weight: 500;
        }
    }

    .test-progress {
        padding: 0 $page-padding-x;
        margin: 4px 0 16px;
        flex-shrink: 0;

        &__bar {
            height: 3px;
            border-radius: 2px;
            background: linear-gradient(90deg, $primary-color, #9DB48E);
            transition: width 0.5s ease;
        }
    }

    .test-content {
        padding: 0 $page-padding-x;
        flex: 1;
        padding-bottom: 80px;
    }

    .test-question {
        &__number {
            display: inline-block;
            font-size: 12px;
            font-weight: 600;
            color: $primary-color;
            background: $primary-light-bg;
            padding: 2px 12px;
            border-radius: 12px;
            margin-bottom: 12px;
        }

        &__text {
            font-size: 18px;
            font-weight: 500;
            color: $text-primary;
            line-height: 1.6;
        }

        &__meta {
            display: block;
            text-align: right;
            font-size: 12px;
            color: $text-helper;
            margin-top: 6px;
            font-weight: 400;
        }
    }

    .test-options {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 20px;
    }

    .test-option {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px 18px;
        background: #FFFFFF;
        border: 1.5px solid $border-light;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.25s ease;

        &:active {
            transform: scale(0.98);
        }

        &--selected {
            border-color: $primary-color;
            background: $primary-light-bg;
            box-shadow: 0 2px 12px rgba(168, 184, 154, 0.15);
        }

        &__radio {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid $border-light;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: all 0.25s ease;
        }

        &--selected &__radio {
            border-color: $primary-color;
            background: $primary-color;
        }

        &__radio-inner {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #FFFFFF;
        }

        &__text {
            font-size: 15px;
            color: $text-secondary;
            line-height: 1.5;
        }

        &--selected &__text {
            color: $text-primary;
            font-weight: 500;
        }
    }

    .test-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 12px $page-padding-x calc(12px + env(safe-area-inset-bottom));
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-top: 0.5px solid rgba(0, 0, 0, 0.04);
        z-index: 10;
        flex-shrink: 0;
    }

    .test-actions {
        display: flex;
        gap: 12px;

        &__btn {
            flex: 1;
            height: 48px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 500;
            border: none;

            &--prev {
                background: $bg-page;
                color: $text-secondary;
                flex: 0.5;

                &:active {
                    background: $border-light;
                }
            }

            &--next {
                background: $primary-color;
                color: #FFFFFF;
                box-shadow: 0 2px 12px rgba(168, 184, 154, 0.3);

                &:active {
                    transform: scale(0.97);
                }

                &:disabled {
                    background: $disabled-bg;
                    color: $text-helper;
                    box-shadow: none;
                }
            }
        }
    }

    .test-result-scroll {
        flex: 1;
        padding: 0 $page-padding-x 30px;
    }

    .test-result {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px 0 10px;

        &__icon {
            font-size: 56px;
            margin-bottom: 12px;
        }

        &__title {
            font-size: 24px;
            font-weight: 600;
            color: $text-primary;
            margin-bottom: 4px;
        }

        &__subtitle {
            font-size: 14px;
            color: $text-helper;
            margin-bottom: 28px;
        }

        &__card {
            width: 100%;
            background: #FFFFFF;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
            margin-bottom: 28px;
        }

        &__items {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        &__actions {
            width: 100%;
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
        }

        &__btn {
            flex: 1;
            height: 48px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 500;
            border: none;

            &--primary {
                background: $primary-color;
                color: #FFFFFF;
                box-shadow: 0 2px 12px rgba(168, 184, 154, 0.3);

                &:active {
                    transform: scale(0.97);
                }
            }

            &--secondary {
                background: $bg-page;
                color: $text-secondary;

                &:active {
                    background: $border-light;
                }
            }
        }

        &__tip {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: $text-helper;

            .icon {
                font-size: 14px;
            }
        }
    }

    .result-item {
        display: flex;
        gap: 12px;
        font-size: 14px;
        padding: 8px 0;

        &:not(:last-child) {
            border-bottom: 1px solid $border-light;
        }

        &__label {
            width: 56px;
            flex-shrink: 0;
            color: $text-helper;
            font-weight: 500;
        }

        &__value {
            flex: 1;
            color: $text-primary;
        }
    }
</style>