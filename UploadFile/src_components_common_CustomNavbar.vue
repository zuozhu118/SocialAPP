<template>
    <view class="custom-navbar"
          :style="{
      paddingTop: statusBarHeight + 'px',
      backgroundColor: transparent ? 'transparent' : undefined
    }"
          :class="{ 'custom-navbar--transparent': transparent }">
        <view class="custom-navbar__inner">
            <!-- 左侧返回按钮 -->
            <view v-if="showBack" class="custom-navbar__left" @click="handleBack">
                <text class="custom-navbar__back-icon">‹</text>
            </view>
            <view v-else-if="$slots.left" class="custom-navbar__left">
                <slot name="left" />
            </view>
            <view v-else class="custom-navbar__left" />

            <!-- 标题 -->
            <view class="custom-navbar__title">
                <slot name="title">
                    <text class="custom-navbar__title-text">{{ title }}</text>
                </slot>
            </view>

            <!-- 右侧 -->
            <view class="custom-navbar__right">
                <slot name="right" />
            </view>
        </view>
    </view>
</template>

<script setup>
    import { ref, onMounted } from 'vue'

    const props = defineProps({
        title: {
            type: String,
            default: ''
        },
        showBack: {
            type: Boolean,
            default: false
        },
        transparent: {
            type: Boolean,
            default: false
        }
    })

    const emit = defineEmits(['back'])
    const statusBarHeight = ref(0)

    onMounted(() => {
        try {
            const systemInfo = uni.getSystemInfoSync()
            statusBarHeight.value = systemInfo.statusBarHeight || 20
        } catch (e) {
            statusBarHeight.value = 20
        }
    })

    const handleBack = () => {
        emit('back')
        uni.navigateBack()
    }
</script>

<style lang="scss" scoped>
    @import '@/styles/variables.scss';
    @import '@/styles/mixins.scss';

    .custom-navbar {
        position: sticky;
        top: 0;
        z-index: $z-index-sticky;
        background-color: $bg-card;
        border-bottom: 1px solid $border-light;
        transition: all $duration-fast ease;

        &--transparent {
            background-color: rgba(255, 255, 255, 0.7);
            @include glass;
            border-bottom-color: transparent;
        }

        &__inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 44px;
            padding: 0 $page-padding-x;
            position: relative;
        }

        &__left {
            width: 60px;
            flex-shrink: 0;
        }

        &__back-icon {
            font-size: 32px;
            color: $text-primary;
            font-weight: $font-weight-light;
            line-height: 1;
            cursor: pointer;

            &:active {
                opacity: 0.6;
            }
        }

        &__title {
            flex: 1;
            text-align: center;
        }

        &__title-text {
            font-size: $font-size-lg;
            font-weight: $font-weight-medium;
            color: $text-primary;
        }

        &__right {
            width: 60px;
            flex-shrink: 0;
            text-align: right;
        }
    }
</style>